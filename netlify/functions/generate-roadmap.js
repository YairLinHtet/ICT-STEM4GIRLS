// netlify/functions/generate-roadmap.js

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { systemInstruction, userPrompt } = JSON.parse(event.body);
    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://stemforgirls.netlify.app/",
          "X-Title": "STEM4Girls Roadmap",
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free", // 💡 အသုံးပြုမည့် Google Gemma 4 Model သစ်
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
        body: JSON.stringify({ error: "OPENROUTER_API_ERROR" }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "INTERNAL_SERVER_ERROR",
        details: error.toString(),
      }),
    };
  }
};
