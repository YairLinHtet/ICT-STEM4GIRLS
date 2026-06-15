function addSubjectRow() {
  const subjectContainer = document.getElementById("subject-container");
  const subjectAdd = document.createElement("div");
  subjectAdd.className = "subject-row";
  subjectAdd.innerHTML = `
               <input
                  type="text"
                  name="subject"
                  id="subject-input"
                  placeholder="eg., Coding Frontend"
                  required
                />
                <select
                  name="priority-select"
                  id="priority-select"
                  class="priority-select"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  type="button"
                  class="icon-btn"
                  onclick="this.parentElement.remove()"
                >
                  -
                </button>

        `;
  subjectContainer.appendChild(subjectAdd);
}

//function code for AI api
// js/schedule-ai.js

document.addEventListener("DOMContentLoaded", () => {
  const scheduleForm = document.getElementById("schedule-form");
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", handleScheduleSubmit);
  }
});

// စမ်းသပ်ရလွယ်ကူစေရန် (Production တွင် false ပြောင်းပါ)
const TEST_MODE = false;

/**
 * Form Submit လုပ်ချိန်တွင် အလုပ်လုပ်မည့် စနစ်
 */
async function handleScheduleSubmit(event) {
  event.preventDefault();

  // js/script.js ထဲက ဘုံ Function ကို လှမ်းသုံးပြီး Limit စစ်ခြင်း
  const canProceed = checkSharedDailyLimit(
    "stem_schedule_done",
    "#ai-schedule-result-section",
    "ယနေ့အတွက် အချိန်ဇယားဖန်တီးခွင့် (၁) ကြိမ် ပြည့်သွားပါပြီ။ မနက်ဖြန်မှ ပြန်လည်စမ်းသပ်ပေးပါဗျာ။",
    TEST_MODE,
  );

  if (!canProceed) return;

  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;
  const breakTime = document.getElementById("break-time").value;
  const generateBtn = document.getElementById("generate-btn");

  // Dynamic Dynamic Rows များထဲမှ Data များကို စုဆောင်းခြင်း
  const subjectRows = document.querySelectorAll(".subject-row");
  const selectedSubjects = [];

  subjectRows.forEach((row) => {
    const subjectInput = row.querySelector('input[name="subject"]').value;
    const prioritySelect = row.querySelector(
      'select[name="priority-select"]',
    ).value;
    if (subjectInput) {
      selectedSubjects.push({
        subject: subjectInput,
        priority: prioritySelect,
      });
    }
  });

  const originalText = generateBtn.innerText;
  generateBtn.innerText = "Generating Schedule...";
  generateBtn.disabled = true;

  const systemInstruction =
    "You are an expert academic time-management coach. You optimize daily learning structures using techniques like time-blocking based on user's available hours and strict break rules. You must respond ONLY in a valid JSON object format.";

  const userPrompt = `Create a strict, time-blocked study schedule based on these constraints:
  - Total Available Window: From ${startTime} to ${endTime}
  - Designated Break Duration: ${breakTime} between study blocks
  - Subjects & Priorities to accommodate: ${JSON.stringify(selectedSubjects)}
  
  Allocate more time blocks or earlier slots to 'High' priority subjects. Include the breaks dynamically.
  Output the response exactly in this JSON structure:
  {
    "timeManagementFramework": "Framework Name (e.g., Time-Blocking Matrix)",
    "overallStrategy": "Brief summary of how the priorities were managed",
    "scheduleSlots": [
      {
        "time": "HH:MM AM/PM - HH:MM AM/PM",
        "activity": "Study: [Subject Name] / Break Time / Review",
        "priorityTag": "High / Medium / Low / None",
        "tasks": ["Task details or subtopics to cover"]
      }
    ]
  }`;

  try {
    const response = await fetch("/.netlify/functions/generate-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction, userPrompt }),
    });

    if (!response.ok) {
      showSharedSystemError(
        "#ai-schedule-result-section",
        "အချိန်ဇယား ဖန်တီးပေးသည့် Server ချိတ်ဆက်မှု အဆင်မပြေဖြစ်နေပါသည်။",
      );
      return;
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;
    const scheduleData = JSON.parse(aiText);

    localStorage.setItem("stem_schedule_done", "true");
    displayScheduleResult(scheduleData);
  } catch (error) {
    console.error("Error:", error);
    showSharedSystemError(
      "#ai-schedule-result-section",
      "ကွန်ရက်ချိတ်ဆက်မှု ချို့ယွင်းနေပါသည်။ အင်တာနက်လိုင်း ပြန်လည်စစ်ဆေးပေးပါ။",
    );
  } finally {
    generateBtn.innerText = originalText;
    generateBtn.disabled = false;
  }
}

/**
 * AI Result Response
 */
function displayScheduleResult(data) {
  let mainElement = document.querySelector("main");
  let resultSection = document.getElementById("ai-schedule-result-section");

  // If no AI reponse HTML TAG create a new tag
  if (!resultSection) {
    resultSection = document.createElement("section");
    resultSection.id = "ai-schedule-result-section";
    mainElement.appendChild(resultSection);
  }

  resultSection.innerHTML = "";

  let htmlContent = `
    <div class="schedule-output-wrapper">
      <div class="schedule-output-header">
        <h3 class="output-title">🎯 AI Generated Smart Schedule</h3>
        <p class="output-framework"><strong>Framework:</strong> ${data.timeManagementFramework}</p>
        <p class="output-strategy"><strong>Strategy:</strong> ${data.overallStrategy}</p>
      </div>
      <div class="timeline-container">
  `;

  data.scheduleSlots.forEach((slot) => {
    const isBreak = slot.activity.toLowerCase().includes("break");
    const cardClass = isBreak
      ? "timeline-card break-card"
      : "timeline-card study-card";
    const priorityBadge =
      !isBreak && slot.priorityTag !== "None"
        ? `<span class="badge badge-${slot.priorityTag.toLowerCase()}">${slot.priorityTag} Priority</span>`
        : "";

    htmlContent += `
      <div class="${cardClass}">
        <div class="timeline-time-box">
          <span class="time-text">⏰ ${slot.time}</span>
        </div>
        <div class="timeline-body-box">
          <div class="timeline-title-row">
            <h4>${slot.activity}</h4>
            ${priorityBadge}
          </div>
          ${slot.tasks && slot.tasks.length > 0 ? `<ul>${slot.tasks.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
    `;
  });

  htmlContent += `</div></div>`;
  resultSection.innerHTML = htmlContent;
  resultSection.scrollIntoView({ behavior: "smooth" });
}
