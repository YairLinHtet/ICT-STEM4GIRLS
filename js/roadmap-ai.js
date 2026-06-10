document.addEventListener("DOMContentLoaded", () => {
  const roadmapForm = document.getElementById("roadmap-form");
  if (roadmapForm) {
    roadmapForm.addEventListener("submit", handleFormSubmit);
  }
});

/**
 * NOTICE : Change flase in Production
 */
const TEST_MODE = true;

// TODO : Move to script

function checkRoadmapLimit() {
  if (TEST_MODE) return true;

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

  // 👩‍💻 AI Model အတွက် အထူးသီးသန့် စနစ်ညွှန်ကြားချက်
  const systemInstruction =
    "You are an inspiring STEM academic mentor dedicated to empowering girls and young women in technology. Your style is highly structured, deeply encouraging, and builds core technical confidence step-by-step. You must respond ONLY in a valid JSON object format. No conversation, no markdown blocks.";

  // 📺 Prompt အသေးစိတ် ညွှန်ကြားချက်
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
      if (response.status === 429) {
        showUserFriendlyError(
          "⏳ လောလောဆယ် အသုံးပြုသူများပြားနေသဖြင့် စနစ်မှာ ခေတ္တပိတ်ဆို့နေပါသည်။ (၁) မိနစ်ခန့် စောင့်ဆိုင်းပြီးမှ 'Generate Roadmap' ကို ပြန်လည်နှိပ်ပေးပါဗျာ။",
        );
      } else {
        showUserFriendlyError(
          `⚠️ AI Server တွင် ချိတ်ဆက်မှု အဆင်မပြေဖြစ်နေပါသည်။ (Error Code: ${response.status}) ခေတ္တစောင့်ဆိုင်းပြီးမှ ပြန်လည်စမ်းသပ်ပေးပါ။`,
        );
      }
      return;
    }

    const data = await response.json();

    // OpenRouter မှ ပြန်လာသော Data အား ရယူခြင်း
    const aiResponseText = data.choices[0].message.content;
    const roadmapData = JSON.parse(aiResponseText);

    localStorage.setItem("stem_roadmap_done", "true");
    displayRoadmapResult(roadmapData);
  } catch (error) {
    console.error("Error:", error);
    showUserFriendlyError(
      "ကွန်ရက်ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်။ သို့မဟုတ် AI ဘက်မှ JSON ပုံစံမမှန်ကန်ပါ။ ပြန်လည်ကြိုးစားပေးပါ။",
    );
  } finally {
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
  }
}

/**
 * Add Html AI reponse
 */
function displayRoadmapResult(roadmap) {
  const resultSection = document.querySelector(".ai-response");
  if (!resultSection) return;

  resultSection.innerHTML = "";

  let htmlContent = `
    <div class="roadmap-result-container" id="pdf-content" style="padding: 20px; background-color: #fff;">
      <h2 class="result-title">AI Generated Roadmap for ${roadmap.subject}</h2>
      <p class="result-duration">Total Duration: ${roadmap.duration}</p>
      <div class="timeline">
  `;

  roadmap.schedule.forEach((item) => {
    htmlContent += `
      <div class="timeline-card-roadmap" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="color: #2c3e50;">${item.phase}</h3>
        <h4 style="margin-top: 10px;">Core Topics to Cover:</h4>
        <ul>${item.topics.map((t) => `<li>${t}</li>`).join("")}</ul>
        <h4 style="margin-top: 10px;">Empowering Activities:</h4>
        <p>${item.activities.join(", ")}</p>
        <h4 style="margin-top: 10px;">Recommended Channels & Resources:</h4>
        <p><strong>${item.resources.join(", ")}</strong></p>
      </div>
    `;
  });

  htmlContent += `
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <button id="download-pdf-btn" style="padding: 12px 24px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        📥 Download Roadmap as PDF
      </button>
    </div>
  `;

  resultSection.innerHTML = htmlContent;

  document
    .getElementById("download-pdf-btn")
    .addEventListener("click", downloadRoadmapPDF);
  resultSection.scrollIntoView({ behavior: "smooth" });
}

/**
 * HTML TO PDF File
 *  TODO: Need to Fix a PDF File
 */
/**
 * HTML TO PDF File
 * 💡 ပိုမိုတည်ငြိမ်ပြီး Blank မဖြစ်စေရန် ပြင်ဆင်ထားပါသည်
 */
function downloadRoadmapPDF() {
  const element = document.getElementById("pdf-content");
  const downloadBtn = document.getElementById("download-pdf-btn");

  if (!element || element.innerHTML.trim() === "") {
    alert("Roadmap Content မရှိသေးသဖြင့် PDF ထုတ်ယူ၍ မရနိုင်သေးပါဗျာ။");
    return;
  }

  // ဒေါင်းလုဒ်ဆွဲနေစဉ် ခလုတ်ကို ခေတ္တပိတ်ထားပါမည်
  if (downloadBtn) {
    downloadBtn.innerText = "⏳ Preparing PDF...";
    downloadBtn.disabled = true;
  }

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5], // အပေါ်၊ အောက်၊ ဘယ်၊ ညာ margin ပေးခြင်း
    filename: "STEM_Learning_Roadmap.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2, // 💡 စာသားများ ပိုမိုကြည်လင်ပြတ်သားပြီး နေရာမှန်ပေါ်စေရန် scale တိုးထားပါသည်
      useCORS: true,
      logging: false,
      letterRendering: true,
      backgroundColor: "#ffffff", // 💡 Canvas နောက်ခံကို အဖြူရောင်အဖြစ် အတင်းသတ်မှတ်ခြင်း
    },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // 💡 စာသားအရောင် အဖြူဖြစ်နေပါက PDF ပေါ်တွင် မြင်ရစေရန် ကာကွယ်သည့်စနစ် (Temporary Style Inject)
  // ပြန်ထုတ်မည့် element ထဲသို့ စာသားအရောင် အမည်းရောင် (#111111) ကို အတင်းထည့်ပေးခြင်း ဖြစ်ပါတယ်
  const originalColor = element.style.color;
  element.style.color = "#111111";

  // 💡 ပိုမိုသန့်ရှင်းပြီး တရားဝင် standard ဖြစ်သော ခေါ်ယူမှုပုံစံသို့ ပြောင်းလဲထားပါသည်
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      // PDF ထွက်ပြီးပါက ကုဒ်များကို မူလအတိုင်း ပြန်ပြောင်းပေးပါမည်
      element.style.color = originalColor;
      if (downloadBtn) {
        downloadBtn.innerText = "📥 Download Roadmap as PDF";
        downloadBtn.disabled = false;
      }
    })
    .catch((err) => {
      console.error("PDF Generation Error:", err);
      if (downloadBtn) {
        downloadBtn.innerText = "❌ Error Downloading";
        downloadBtn.disabled = false;
      }
    });
}
/**
 * Error Show div for user
 * Need to relocate
 */
function showUserFriendlyError(message) {
  const resultSection = document.querySelector(".ai-response");
  if (!resultSection) return;

  resultSection.innerHTML = `
    <div class="error-card" style="padding: 20px; background-color: #ffebee; border: 1px solid #ffcdd2; border-radius: 8px; color: #c62828;">
      <h3 style="margin-top: 0;">⚠️ စနစ်အတွင်း အချက်ပြမှု</h3>
      <p>${message}</p>
    </div>
  `;
  resultSection.scrollIntoView({ behavior: "smooth" });
}
