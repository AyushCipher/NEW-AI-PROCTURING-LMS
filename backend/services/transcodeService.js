import fs from "fs";
import os from "os";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import ffmpeg from "../configs/ffmpeg.js";
import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import { emitLectureProcessingUpdate } from "../socket.js";

// Ladder is capped at source resolution in processLectureVideo - never upscale.
const RESOLUTION_LADDER = [
  { resolution: "144p", height: 144 },
  { resolution: "240p", height: 240 },
  { resolution: "360p", height: 360 },
  { resolution: "480p", height: 480 },
  { resolution: "720p", height: 720 },
  { resolution: "1080p", height: 1080 },
];

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const probeSourceHeight = (sourceUrl) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(sourceUrl, (err, data) => {
      if (err) return reject(err);
      const videoStream = data.streams?.find((s) => s.codec_type === "video");
      if (!videoStream?.height) return reject(new Error("No video stream found in source"));
      resolve(videoStream.height);
    });
  });

const transcodeRendition = (sourceUrl, height, outputPath) =>
  new Promise((resolve, reject) => {
    ffmpeg(sourceUrl)
      // -2 keeps width even and preserves aspect ratio while scaling to `height`
      .videoFilters(`scale=-2:${height}`)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-preset veryfast", "-crf 23", "-movflags +faststart"])
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject);
  });

const uploadRenditionToCloudinary = async (filePath, lectureId, resolution) => {
  configureCloudinary();
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "lecture_renditions",
    public_id: `${lectureId}_${resolution}_${Date.now()}`,
  });
  return result.secure_url;
};

// Transcodes the source video (already on Cloudinary, so this survives a
// server restart mid-job - see resumeStuckLectureProcessing in index.js) into
// every rendition at or below its native resolution. Never rejects - always
// resolves after updating the lecture's processingStatus, so callers can
// fire-and-forget this without an unhandled rejection.
export async function processLectureVideo(lectureId, courseId, sourceUrl) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "transcode-"));
  try {
    const sourceHeight = await probeSourceHeight(sourceUrl);
    const rungs = RESOLUTION_LADDER.filter((r) => r.height <= sourceHeight);
    if (rungs.length === 0) rungs.push(RESOLUTION_LADDER[0]); // source smaller than 144p - still produce one rendition

    const renditions = [];
    for (const rung of rungs) {
      const outputPath = path.join(tmpDir, `${rung.resolution}.mp4`);
      await transcodeRendition(sourceUrl, rung.height, outputPath);
      const url = await uploadRenditionToCloudinary(outputPath, lectureId, rung.resolution);
      renditions.push({ resolution: rung.resolution, height: rung.height, url });
      fs.unlinkSync(outputPath);
    }

    await Lecture.findByIdAndUpdate(lectureId, { renditions, processingStatus: "ready" });
    emitLectureProcessingUpdate(courseId, lectureId, "ready");
    return { success: true };
  } catch (error) {
    console.error(`[transcode] Failed for lecture ${lectureId}:`, error);
    await Lecture.findByIdAndUpdate(lectureId, { processingStatus: "failed" });
    emitLectureProcessingUpdate(courseId, lectureId, "failed");
    return { success: false, error };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// Called once on server startup. If the process crashed or redeployed while a
// lecture was mid-transcode, its status is stuck at "processing" forever with
// nothing left running - re-kick those jobs. Safe to re-run: the source video
// lives on Cloudinary (not local disk), so nothing was lost, worst case is a
// rendition gets re-generated.
export async function resumeStuckLectureProcessing() {
  const stuckLectures = await Lecture.find({ processingStatus: "processing" });
  if (stuckLectures.length === 0) return;

  console.log(`[transcode] Resuming ${stuckLectures.length} lecture(s) stuck in "processing" after restart`);

  for (const lecture of stuckLectures) {
    const owningCourse = await Course.findOne({ lectures: lecture._id }).select("_id");
    if (!owningCourse) {
      // Orphaned lecture (course was deleted) - nothing to resume for
      await Lecture.findByIdAndUpdate(lecture._id, { processingStatus: "failed" });
      continue;
    }
    processLectureVideo(lecture._id, owningCourse._id, lecture.videoUrl)
      .catch((err) => console.error(`[transcode] Resume failed for lecture ${lecture._id}:`, err));
  }
}
