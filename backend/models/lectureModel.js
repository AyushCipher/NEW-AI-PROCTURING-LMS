import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureTitle:{
        type:String,
        required:true
    },
    videoUrl:{
        type:String
    },
    isPreviewFree:{
        type:Boolean
    },
    assignmentUrl:{
        type:String
    },
    assignmentName:{
        type:String
    },
    // Multi-resolution transcoding (Phase 3): videoUrl above always holds the
    // original source upload so playback still works immediately and as a
    // fallback if transcoding fails; renditions holds the generated quality
    // ladder once processing finishes.
    processingStatus:{
        type:String,
        enum:['processing','ready','failed'],
        default:'ready' // existing lectures (pre-dating this feature) are already playable
    },
    renditions:[{
        resolution:{ type:String },   // e.g. "480p"
        height:{ type:Number },
        url:{ type:String }
    }],

},{timestamps:true})

const Lecture = mongoose.model("Lecture" , lectureSchema)

export default Lecture