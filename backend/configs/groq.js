import axios from "axios";

// Groq exposes an OpenAI-compatible chat-completions endpoint - no special SDK needed.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Generates text from a single prompt. Pass jsonMode: true to force a valid
// JSON object back (the model must be told in the prompt to return JSON -
// Groq/OpenAI's json_object mode only guarantees valid JSON syntax, not that
// the caller's exact shape was followed).
export async function groqGenerateContent(prompt, { jsonMode = false, timeout = 15000 } = {}) {
  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout,
    }
  );
  return response.data.choices[0].message.content;
}

export default groqGenerateContent;
