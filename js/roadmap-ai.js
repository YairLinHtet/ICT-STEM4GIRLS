// js/roadmap-ai.js

document.addEventListener("DOMContentLoaded", () => {
  const roadmapForm = document.getElementById("roadmap-form");
  if (roadmapForm) {
    roadmapForm.addEventListener("submit", handleFormSubmit);
  }
});

/**
 * နေ့စဉ်အသုံးပြုမှု ကန့်သတ်ချက် စစ်ဆေးခြင်း
 */
function checkRoadmapLimit() {
  const today = new Date().toDateString();
  let savedDate = localStorage.getItem("stem_app_date");
  let roadmapDone = localStorage.getItem("stem_roadmap_done") === "true";

  if (savedDate !== today) {
    localStorage.setItem("stem_app_date", today);
    localStorage.setItem("stem_roadmap_done", "false");
    roadmapDone = false;
  }

  if (roadmapDone) {
    showUserFriendlyError(
      "ယနေ့အတွက် Roadmap ဖန်တီးခွင့် (၁) ကြိမ် အသုံးပြုပြီး ဖြစ်ပါသည်။ မနက်ဖြန်တွင် ပြန်လည်စမ်းသပ်နိုင်ပါသည်တန်။",
    );
    return false;
  }
  return true;
}

/**
 * Form Submit လုပ်ဆောင်ချက်
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  if (!checkRoadmapLimit()) return;

  // HTML Element များမှ တန်ဖိုးများ ရယူခြင်း
  const subject = document.getElementById("learning-subject").value;
  const timeCommitment = document.getElementById("time-commitment").value;
  const experience = document.getElementById("current-experience").value;
  const goal = document.getElementById("primary-goal").value;
  const duration = document.getElementById("learning-duration").value;
  const resource = document.getElementById("preferred-resource").value;
  const submitBtn = document.getElementById("submit-btn");

  const originalBtnText = submitBtn.innerText;
  submitBtn.innerText = "Generating Roadmap...";
  submitBtn.disabled = true;

  // 👩‍💻 Gemma Model အတွက် အထူးသီးသန့် စနစ်ညွှန်ကြားချက်
  const systemInstruction =
    "You are an inspiring STEM academic mentor dedicated to empowering girls and young women in technology. Your style is highly structured, deeply encouraging, and builds core technical confidence step-by-step. You must respond ONLY in a valid JSON object format. No conversation, no markdown blocks.";

  // 📺 YouTube Channel တိုက်ရိုက်ညွှန်းရန် တင်းကြပ်ထားသော Prompt
  const userPrompt = `Create a customized ${duration} learning roadmap for studying "${subject}" tailored for a young woman breaking into STEM.
  - Current Experience Level: ${experience}
  - Daily Time Commitment: ${timeCommitment}
  - Target Goal: ${goal}
  - User's Preferred Resources: ${resource}
  
  STRICT RESOURCE CONFIGURATION: If the user specified "YouTube" or "youtube" or "video" as a resource, you MUST NOT output a generic "YouTube" string. Instead, you are required to target and recommend 2 to 3 specific world-class YouTube Channels (such as FreeCodeCamp, Traversy Media, The Net Ninja, SuperSimpleDev, Kevin Powell, or CS Dojo) that perfectly match the topic of "${subject}".
  
  Output the response exactly in this JSON structure:
  {
    "subject": "${subject}",
    "duration": "${duration}",
    "schedule": [
      {
        "phase": "Phase or Week Title",
        "topics": ["Topic 1", "Topic 2"],
        "activities": ["Confidence-building hands-on assignment or project"],
        "resources": ["Specific Channel/Resource Name 1", "Specific Channel/Resource Name 2"]
      }
    ]
  }`;

  try {
    const response = await fetch("/.netlify/functions/generate-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction, userPrompt }),
    });

    if (!response.ok) {
      showUserFriendlyError(
        "AI Server တွင် ချိတ်ဆက်မှု အဆင်မပြေဖြစ်နေပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ပြန်လည်စမ်းသပ်ပေးပါ။",
      );
      return;
    }

    const data = await response.json();
    const aiResponseText = data.choices[0].message.content;
    const roadmapData = JSON.parse(aiResponseText);

    localStorage.setItem("stem_roadmap_done", "true");
    displayRoadmapResult(roadmapData);
  } catch (error) {
    console.error("Error:", error);
    showUserFriendlyError(
      "ကွန်ရက်ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်။ အင်တာနက်လိုင်း ပြန်လည်စစ်ဆေးပြီး ပြန်ကြိုးစားပေးပါ။",
    );
  } finally {
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
  }
}

/**
 * ရလဒ်အား HTML `.ai-response` နေရာတွင် သပ်ရပ်စွာ ပုံဖော်ပေးခြင်း
 */
function displayRoadmapResult(roadmap) {
  const resultSection = document.querySelector(".ai-response");
  if (!resultSection) return;

  resultSection.innerHTML = "";

  let htmlContent = `
    <div class="roadmap-result-container">
      <h2 class="result-title">AI Generated Roadmap for ${roadmap.subject}</h2>
      <p class="result-duration">Total Duration: ${roadmap.duration}</p>
      <div class="timeline">
  `;

  roadmap.schedule.forEach((item) => {
    htmlContent += `
      <div class="timeline-card">
        <h3>${item.phase}</h3>
        <h4>Core Topics to Cover:</h4>
        <ul>${item.topics.map((t) => `<li>${t}</li>`).join("")}</ul>
        <h4>Empowering Activities:</h4>
        <p>${item.activities.join(", ")}</p>
        <h4>Recommended Channels & Resources:</h4>
        <p><strong>${item.resources.join(", ")}</strong></p>
      </div>
    `;
  });

  htmlContent += `</div></div>`;
  resultSection.innerHTML = htmlContent;
  resultSection.scrollIntoView({ behavior: "smooth" });
}

function showUserFriendlyError(message) {
  const resultSection = document.querySelector(".ai-response");
  if (!resultSection) return;

  resultSection.innerHTML = `
    <div class="error-card">
      <h3>⚠️ စနစ်အတွင်း အချက်ပြမှု</h3>
      <p>${message}</p>
    </div>
  `;
  resultSection.scrollIntoView({ behavior: "smooth" });
}
