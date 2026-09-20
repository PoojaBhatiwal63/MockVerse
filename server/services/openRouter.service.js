import axios from "axios"

export const askAi = async (messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }
        const apiKey = process.env.OPENROUTER_API_KEY?.trim();

        if (!apiKey) {
            throw new Error("OpenRouter API key is missing. Please set OPENROUTER_API_KEY in your environment.");
        }

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: messages

            },
            {
            headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            // Optional but recommended by OpenRouter for identification
            // Replace these with your actual app URL and name
            // "HTTP-Referer": "http://localhost:3000",
            // "X-Title": "MockVerse",
        },});

        const content = response?.data?.choices?.[0]?.message?.content;

        if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }

    return content
    } catch (error) {
            console.error("OpenRouter Error:", error.response?.data || error.message);
    throw new Error(error?.message || "OpenRouter API Error");

    }
}