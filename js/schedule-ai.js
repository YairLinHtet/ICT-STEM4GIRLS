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