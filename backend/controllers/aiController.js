import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import { groqGenerateContent } from "../configs/groq.js";

dotenv.config();

export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const prompt = `
You are an intelligent assistant for an LMS platform.
A user will type any query about what they want to learn.

Your task is to understand the intent and return ONE most relevant keyword
from the following list ONLY:

- App Development
- AI/ML
- AI Tools
- Data Science
- Data Analytics
- Ethical Hacking
- UI UX Designing
- Web Development
- Others
- Beginner
- Intermediate
- Advanced

Rules:
- Return ONLY ONE keyword
- No explanation
- No extra words

Query: ${input}
`;

    const aiResponse = await groqGenerateContent(prompt);
    let keyword = aiResponse?.trim() || "Others";

    // 1️⃣ FIRST SEARCH → Direct user input
    let courses = await Course.find({
      isPublished: true,
      $or: [
        { title: { $regex: input, $options: "i" } },
        { subTitle: { $regex: input, $options: "i" } },
        { description: { $regex: input, $options: "i" } },
        { category: { $regex: input, $options: "i" } },
        { level: { $regex: input, $options: "i" } },
      ],
    });

    if (courses.length > 0) {
      return res.status(200).json(courses);
    }

    // 2️⃣ SECOND SEARCH → AI keyword fallback
    courses = await Course.find({
      isPublished: true,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { subTitle: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { level: { $regex: keyword, $options: "i" } },
      ],
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Search AI Error:", error);
    return res.status(500).json({ message: "AI Search Error" });
  }
};

// Generate lecture summary using Groq
export const generateLectureSummary = async (req, res) => {
  try {
    const { lectureTitle, courseTitle, category } = req.body;

    if (!lectureTitle) {
      return res.status(400).json({ message: "Lecture title is required" });
    }

    const prompt = `
You are an expert educational content creator. Generate a comprehensive yet concise summary for a lecture titled "${lectureTitle}" which is part of a course called "${courseTitle || 'Online Course'}" in the "${category || 'General'}" category.

Format the response EXACTLY like this (no horizontal lines, no pipes):

# Lecture Summary: ${lectureTitle}

**Course:** ${courseTitle || 'Online Course'}
**Category:** ${category || 'General'}

## 1. Overview

Write a brief 2-3 sentence introduction about what this lecture covers.

## 2. Key Concepts

- First key concept
- Second key concept
- Third key concept
- Fourth key concept
- Fifth key concept

## 3. Learning Outcomes

After completing this lecture, students will be able to:
- First learning outcome
- Second learning outcome
- Third learning outcome
- Fourth learning outcome

## 4. Prerequisites

- Any prerequisite knowledge needed

IMPORTANT: Do NOT use horizontal lines (---), do NOT use pipe characters (|), keep each field on its own line.
`;

    const summary = (await groqGenerateContent(prompt)) || "Summary could not be generated.";

    return res.status(200).json({ summary });
  } catch (error) {
    console.error("Generate Summary Error:", error);
    return res.status(500).json({ message: "Failed to generate summary" });
  }
};

// Generate quiz questions based on lecture title
export const generateQuiz = async (req, res) => {
  try {
    const { lectureTitle, courseTitle, category } = req.body;

    if (!lectureTitle) {
      return res.status(400).json({ message: "Lecture title is required" });
    }

    const prompt = `
You are an expert quiz creator for educational platforms. Create a quiz with exactly 5 multiple-choice questions based on a lecture titled "${lectureTitle}" from a course called "${courseTitle || 'Online Course'}" in the "${category || 'General'}" category.

Each question should:
- Test understanding of key concepts from the lecture topic
- Have 4 options (A, B, C, D)
- Have exactly one correct answer
- Be of medium difficulty

Return the response as a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no additional text. The "questions" array must contain exactly 5 items.
`;

    let quizText = (await groqGenerateContent(prompt, { jsonMode: true })) || '{"questions":[]}';

    // Cleanup just in case (safety net)
    quizText = quizText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(quizText);
      const quiz = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      return res.status(200).json({ quiz });
    } catch (parseError) {
      console.error("Quiz Parse Error:", parseError);
      console.error("Raw quiz text:", quizText);
      return res.status(500).json({ message: "Failed to parse quiz data" });
    }
  } catch (error) {
    console.error("Generate Quiz Error:", error);
    return res.status(500).json({ message: "Failed to generate quiz" });
  }
};
