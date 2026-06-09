// netlify/functions/generate-schedule.js

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { systemInstruction, userPrompt } = JSON.parse(event.body);

    // OpenRouter API ကို လှမ်းခေါ်ခြင်း
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://stemforgirls.netlify.app",
          "X-Title": "STEM4GIRLS Schedule", // Schedule အတွက် ခေါင်းစဉ် ပြောင်းထားပါသည်
        },
        body: JSON.stringify({
          model: "openrouter/owl-alpha", // ပိုမိုမြန်ဆန် တည်ငြိမ်သော မော်ဒယ်
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `OpenRouter API Error: ${response.status}`,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
