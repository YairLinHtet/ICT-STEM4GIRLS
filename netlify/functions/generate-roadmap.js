// netlify/functions/generate-roadmap.js

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
          "HTTP-Referer": "https://stemforgirls.netlify.app", // သင့်ဝက်ဘ်ဆိုက်လင့်ခ်
          "X-Title": "STEM4GIRLS Roadmap",
        },
        body: JSON.stringify({
          // Llama 3 Free မော်ဒယ်သို့ ပြောင်းလဲထားပါသည် (ပိုမြန်ပြီး တည်ငြိမ်သည်)
          model: "meta-llama/llama-3.2-3b-instruct:free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          // JSON format အတိအကျရစေရန် တောင်းဆိုခြင်း
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      // 429 အပါအဝင် အခြားသော Error များကို Frontend သို့ ပြန်ပို့ပေးမည်
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
