document.addEventListener("DOMContentLoaded", () => {
  const roadmapForm = document.getElementById("roadmap-form");
  if (roadmapForm) {
    roadmapForm.addEventListener("submit", handleFormSubmit);
  }
});

/**
 * NOTICE : Change flase in Production
 */
const TEST_MODE = false;

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

  //  AI Model Instruction
  const systemInstruction =
    "You are an inspiring STEM academic mentor dedicated to empowering girls and young women in technology. Your style is highly structured, deeply encouraging, and builds core technical confidence step-by-step. You must respond ONLY in a valid JSON object format. No conversation, no markdown blocks.";

  //  Prompt
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
/**
 * HTML TO PDF File
 * 💡 CSS Layout နှင့် ID အမှားများကြောင့် Blank ဖြစ်ခြင်းကို ရာနှုန်းပြည့် ကာကွယ်ထားပါသည်
 */
function downloadRoadmapPDF() {
  // ၁။ တကယ့် Content ရှိနေမည့် Element ကို ရှာပါမယ်
  // #pdf-content ကို ရှာလို့မတွေ့ပါက ရလဒ်ပြသပေးသည့် resultSection ကြီးတစ်ခုလုံးကို Fallback အနေဖြင့် ဖတ်ပါမည်
  let originalElement = document.getElementById("pdf-content");

  if (!originalElement) {
    // အကယ်၍ ID မတွေ့ပါက Class နာမည် သို့မဟုတ် result နေရာကို လိုက်ရှာခြင်း
    originalElement =
      document.querySelector(".markdown-body") ||
      document.getElementById("roadmap-output");
  }

  // အပေါ်က ဘာမှရှာမတွေ့သေးရင် ခလုတ်ရှိနေတဲ့ အပြင်ဘက်ဆုံး သေတ္တာကြီးကို ယူပါမယ်
  if (!originalElement) {
    const btn = document.getElementById("download-pdf-btn");
    if (btn && btn.parentElement) {
      originalElement = btn.parentElement.parentElement;
    }
  }

  const downloadBtn = document.getElementById("download-pdf-btn");

  // တကယ်လို့ အထဲမှာ စာသား လုံးဝမရှိရင် သတိပေးချက်ပြမည်
  if (!originalElement || originalElement.innerHTML.trim() === "") {
    alert(
      "Roadmap Content ကို ရှာမတွေ့သေးပါဗျာ။ ခေတ္တစောင့်ပြီးမှ ပြန်လည်စမ်းသပ်ပေးပါ။",
    );
    return;
  }

  if (downloadBtn) {
    downloadBtn.innerText = "⏳ Preparing PDF...";
    downloadBtn.disabled = true;
  }

  // ၂။ 💡 ဝက်ဘ်ဆိုက် CSS ကြောင့် Blank ဖြစ်ခြင်းမှ ကာကွယ်ရန် ယာယီ ကွန်တိန်နာ (Clone) တစ်ခု ဆောက်ပါမည်
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = originalElement.innerHTML;

  // PDF ထဲမှာ ဒေါင်းလုဒ်ခလုတ်ကြီး ထပ်ပါမလာစေရန် Clone ထဲက ခလုတ်ကို ရှာပြီး ဖျက်ထုတ်ခြင်း
  const btnInClone =
    tempContainer.querySelector("#download-pdf-btn") ||
    tempContainer.querySelector("button");
  if (btnInClone && btnInClone.parentElement) {
    btnInClone.parentElement.remove();
  }

  // ၃။ CSS Layout Collapse မဖြစ်စေရန် Standard Print Styles များကို ဇွတ်အတင်း သတ်မှတ်ခြင်း
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px"; // စခရင်ပေါ်မှာ လာမရှုပ်အောင် ဘေးသို့ ပို့ထားခြင်း
  tempContainer.style.top = "0";
  tempContainer.style.width = "750px"; // Standard A4 Layout အကျယ်
  tempContainer.style.background = "#ffffff";
  tempContainer.style.padding = "40px";
  tempContainer.style.boxSizing = "border-box";
  tempContainer.style.display = "block";
  tempContainer.style.height = "auto";

  // အထဲက AI စာသားအရောင်တွေ အဖြူဖြစ်နေရင် PDF ပေါ်မှာ မြင်ရအောင် အမည်းရောင်သို့ အားလုံး ပြောင်းပစ်ခြင်း
  const allChildElements = tempContainer.querySelectorAll("*");
  allChildElements.forEach((el) => {
    el.style.color = "#111111";
    el.style.backgroundColor = "transparent";
  });

  // ၎င်းယာယီ သေတ္တာကို HTML Body ထဲသို့ ခေတ္တ ချိတ်ဆက်လိုက်ပါမည်
  document.body.appendChild(tempContainer);

  // ၄။ html2pdf Configuration Settings
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: "STEM_Learning_Roadmap.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2, // စာလုံးများ အလွန်ကြည်လင်ပြတ်သားစေရန်
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff", // နောက်ခံကို အဖြူရောင် သတ်မှတ်ခြင်း
    },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // ၅။ PDF အဖြစ် ပြောင်းလဲထုတ်ယူခြင်း
  html2pdf()
    .set(opt)
    .from(tempContainer)
    .save()
    .then(() => {
      // အလုပ်ပြီးသွားပါက ယာယီဆောက်ထားသော ကွန်တိန်နာကို ပြန်လည် ဖျက်ပစ်ပါမည်
      document.body.removeChild(tempContainer);
      if (downloadBtn) {
        downloadBtn.innerText = "📥 Download Roadmap as PDF";
        downloadBtn.disabled = false;
      }
    })
    .catch((err) => {
      console.error("PDF Generation Error:", err);
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
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
