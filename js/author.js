import { saveCap, loadCap, loadIndex, saveIndex } from "./storage.js";

// Escape HTML to prevent injection
function escapeHtml(s = "") {
    return String(s).replace(/[&<>"']/g, (c) =>
    ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[c])
    );
}

// Render the Author/Editor form for creating or editing a capsule
export function renderAuthorForm(id = null, existingData = null) {
    let author = document.getElementById("author");
    author.replaceWith(author.cloneNode(false));
    author = document.getElementById("author");

    // Load existing capsule or create new
    const cap =
        existingData ||
        (id ? loadCap(id) || {} : {
            id: Date.now().toString(),
            meta: { title: "", subject: "", level: "Beginner", description: "" },
            notes: [],
            flashcards: [],
            quiz: [],
        });

    if (id && !cap.id) cap.id = id;

    // Render main form HTML (meta, notes, flashcards, quiz)
    author.innerHTML = `
  <div class="container p-3 mb-2 border border-secondary capsule">
    <div class="align-items-center mb-3">
      <h3 class='text-light'>${id ? "Edit Capsule" : "Author Capsule"}</h3>
      <p class="text-light">Draft notes, flashcards, and quizzes. Auto-saves locally.</p>
      <div class="justify-content-end gap-2 mb-3 d-flex">
        <button id="saveBtn" aria-label="Save capsule" class="btn btn-outline-secondary text-light">💾 Save</button>
        <button id="backBtn" aria-label="Go back to library" class="btn btn-outline-secondary text-light">↩️ Back</button>
      </div>
    </div>

    <!-- Meta + Notes -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card p-3 mb-3 bg-dark text-light shadow rounded-4">
          <h4 class="mb-3">Meta</h4>
          <label for="meta-title" class="form-label">Title</label>
          <input id="meta-title" placeholder="e.g. Introduction to DOM"
                 class="form-control mb-2 bg-dark text-light border-secondary"
                 value="${escapeHtml(cap.meta?.title || "")}">

          <label for="meta-subject" class="form-label">Subject</label>
          <input id="meta-subject" placeholder="e.g. Web Development"
                 class="form-control mb-2 bg-dark text-light border-secondary"
                 value="${escapeHtml(cap.meta?.subject || "")}">

          <label class="form-label">Level</label>
          <select id="meta-level" class="form-select bg-dark text-light border-secondary mb-2">
            <option value="Beginner" ${cap.meta?.level === "Beginner" ? "selected" : ""}>Beginner</option>
            <option value="Intermediate" ${cap.meta?.level === "Intermediate" ? "selected" : ""}>Intermediate</option>
            <option value="Advanced" ${cap.meta?.level === "Advanced" ? "selected" : ""}>Advanced</option>
          </select>

          <label class="form-label">Description</label>
          <textarea id="meta-desc" placeholder="Short summary about this capsule..."
                    class="form-control mb-2 bg-dark text-light border-secondary">${escapeHtml(cap.meta?.description || "")}</textarea>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card p-3 mb-3 bg-dark text-light shadow rounded-4">
          <h4 class="mb-2">Notes</h4>
          <label>Write one note per line</label>
          <textarea id="notes" placeholder="Each line will be treated as one note..."
                    class="form-control bg-dark text-light border-secondary" rows="8">${(cap.notes || []).join("\n")}</textarea>
        </div>
      </div>
    </div>

    <!-- Flashcards + Quiz -->
    <div class="row g-3">
      <!-- Flashcards -->
      <div class="col-md-6">
        <div class="card bg-dark text-light p-3 shadow rounded-4 h-100">
          <h4 class="mb-3">Flashcards</h4>
          <div id="flashcardsList">
            ${(cap.flashcards || [])
            .map(
                (fc, i) => `
              <div class="row g-2 mb-2 flashcard-row" data-index="${i}">
                <div class="col">
                  <input class="form-control bg-dark text-light border-secondary" placeholder="Front" value="${escapeHtml(fc.front || "")}">
                </div>
                <div class="col">
                  <input class="form-control bg-dark text-light border-secondary" placeholder="Back" value="${escapeHtml(fc.back || "")}">
                </div>
                <div class="col-auto">
                  <button aria-label="Remove flashcard" class="btn btn-outline-danger remove-flashcard">✖</button>
                </div>
              </div>
            `
            )
            .join("")}
          </div>
          <button id="addFlashcardBtn" aria-label="Add new flashcard" class="btn btn-outline-secondary text-light mt-2">➕ Add Flashcard</button>
        </div>
      </div>

      <!-- Quiz -->
      <div class="col-md-6">
        <div class="card bg-dark text-light p-3 shadow rounded-4 h-100">
          <h4 class="mb-3">Quiz</h4>
          <div id="quizList">
            ${(cap.quiz || [])
            .map(
                (q, i) => `
              <div class="border border-secondary rounded-3 p-3 mb-3 quiz-row" data-index="${i}">
                <label class="form-label">Question</label>
                <input class="form-control bg-dark text-light border-secondary mb-2" placeholder="Question" value="${escapeHtml(q.question || "")}">
                <div class="row g-2 mb-2">
                  ${["A", "B", "C", "D"]
                        .map(
                            (opt, j) => `
                    <div class="col-md-6">
                      <input class="form-control bg-dark text-light border-secondary" placeholder="Choice ${opt}" value="${escapeHtml(q.choices?.[j] || "")}">
                    </div>
                  `
                        )
                        .join("")}
                </div>
                <div class="row g-2 mb-2">
                  <div class="col-md-3">
                    <input class="form-control bg-dark text-light border-secondary" placeholder="Correct (0–3)" value="${q.correct ?? ""}">
                  </div>
                  <div class="col">
                    <input class="form-control bg-dark text-light border-secondary" placeholder="Explanation (optional)" value="${escapeHtml(q.explanation || "")}">
                  </div>
                </div>
                <button aria-label="Remove this quiz question" class="btn btn-outline-danger remove-quiz">✖ Remove</button>
              </div>
            `
            )
            .join("")}
          </div>
          <button id="addQuizBtn" class="btn btn-outline-secondary text-light mt-2">➕ Add Quiz</button>
        </div>
      </div>
    </div>
  </div>
  `;

    // Back to library button 
    document.getElementById("backBtn").addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("navigate", { detail: { section: "library" } }));
        setTimeout(() => {
            import("./library.js").then((m) => m.renderLibrary());
        }, 300);
    });

    // save capsule
    document.getElementById("saveBtn").addEventListener("click", () => {
        const capsule = collectCurrentData();

        //  Keep existing ID if editing
        capsule.id = id || cap.id || capsule.id || Date.now().toString();

        if (!capsule.meta.title) return alert("❗ Title is required");

        try {
            saveCap(capsule);

            let index = loadIndex() || [];

            const entry = {
                id: capsule.id,
                title: capsule.meta.title,
                subject: capsule.meta.subject,
                level: capsule.meta.level,
                updatedAt: new Date().toISOString(),
            };

            const existing = index.findIndex(i => i.id === capsule.id);
            if (existing >= 0) index[existing] = entry;
            else index.push(entry);

            saveIndex(index);

            alert("✅ Saved successfully!");

            window.dispatchEvent(new CustomEvent("navigate", { detail: { section: "library" } }));
            setTimeout(() => import("./library.js").then(m => m.renderLibrary()), 100);

        } catch (err) {
            console.error("❌ Save failed:", err);
            alert("Save failed: " + err.message);
        }
    });


    // Event delegation for Add/Remove flashcards and quiz
    author.addEventListener("click", (e) => {
        // Add new flashcard
        if (e.target.id === "addFlashcardBtn") {
            const data = collectCurrentData();
            data.flashcards.push({ front: "", back: "" });
            renderAuthorForm(id, data);
        }
        // Remove flashcard
        if (e.target.classList.contains("remove-flashcard")) {
            const data = collectCurrentData();
            const i = e.target.closest(".flashcard-row").dataset.index;
            data.flashcards.splice(i, 1);
            renderAuthorForm(id, data);
        }
        // Add new quiz question
        if (e.target.id === "addQuizBtn") {
            const data = collectCurrentData();
            data.quiz.push({ question: "", choices: ["", "", "", ""], correct: 0, explanation: "" });
            renderAuthorForm(id, data);
        }
        // Remove quiz question
        if (e.target.classList.contains("remove-quiz")) {
            const data = collectCurrentData();
            const i = e.target.closest(".quiz-row").dataset.index;
            data.quiz.splice(i, 1);
            renderAuthorForm(id, data);
        }
    });

    // Collect current form data for saving
    function collectCurrentData() {
        return {
            meta: {
                title: document.getElementById("meta-title").value.trim(),
                subject: document.getElementById("meta-subject").value.trim(),
                level: document.getElementById("meta-level").value.trim(),
                description: document.getElementById("meta-desc").value.trim(),
            },
            notes: document
                .getElementById("notes")
                .value.split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            flashcards: Array.from(document.querySelectorAll(".flashcard-row")).map((row) => {
                const inputs = row.querySelectorAll("input");
                return { front: inputs[0].value.trim(), back: inputs[1].value.trim() };
            }),
            quiz: Array.from(document.querySelectorAll(".quiz-row")).map((row) => {
                const inputs = row.querySelectorAll("input");
                return {
                    question: inputs[0].value.trim(),
                    choices: [inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value].map((x) => x.trim()),
                    correct: parseInt(inputs[5].value) || 0,
                    explanation: inputs[6].value.trim(),
                };
            }),
        };
    }
}

