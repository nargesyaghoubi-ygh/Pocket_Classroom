import { loadIndex, loadCap, loadProg, saveProg } from "./storage.js";

// Always listen for navigation to a capsule
window.addEventListener("navigate", (e) => {
    if (e.detail.section === "learn" && e.detail.id) {
        setTimeout(() => {
            const select = document.getElementById("capsuleSelect");
            if (select) {
                select.value = e.detail.id;
                // Trigger change to load capsule
                const event = new Event("change");
                select.dispatchEvent(event);
            }
        }, 50);
    }
});

// Render the Learn page  
export function renderLearn() {
    const learn = document.getElementById("learn");
    learn.innerHTML = `
    <div class="p-3 mb-2 border border-secondary capsule">
      <div class="card bg-dark text-light shadow-lg rounded-4 p-4">
        <h2 class="text-light mb-3">Learn</h2>
        <p class="mb-4 text-secondary">Study your saved capsules using Notes, Flashcards, or Quiz mode.</p>

        <!-- Capsule Selector + Export -->
        <div class="d-flex justify-content-between align-items-center mb-3 gap-2">
          <select id="capsuleSelect" class="form-select w-auto bg-dark text-light border-secondary">
            <option value="">Select a capsule...</option>
          </select>
          <button id="exportBtn" class="btn btn-outline-success text-light" disabled>⬇️ Export</button>
        </div>

        <!-- Tabs -->
        <div class="btn-group w-100 mb-4" role="group">
          <button id="tabNotes" aria-label="Notes tab" class="btn btn-outline-secondary text-light w-33">🗒️ Notes</button>
          <button id="tabFlash" aria-label="Flashcards tab" class="btn btn-outline-secondary text-light w-33">🃏 Flashcards</button>
          <button id="tabQuiz" aria-label="Quiz tab" class="btn btn-outline-secondary text-light w-33">🧩 Quiz</button>
        </div>

        <!-- Content -->
        <div id="learnContent" class="border border-secondary rounded-4 p-4 text-light text-center">
          <p class="text-secondary">Select a capsule to start learning.</p>
        </div>
      </div>
    </div>
  `;
    // Keyboard shortcuts: [ / ] to switch tabs
    document.addEventListener("keydown", (e) => {
    const tabs = ["notes", "flash", "quiz"];
    const active = document.querySelector(".btn-group .active");
    if (!active) return;
  
    let currentIndex = tabs.findIndex(tab => 
      active.id.toLowerCase().includes(tab)
    );
  
    if (e.key === "]") {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % tabs.length;
      switchTab(tabs[currentIndex]);
    } else if (e.key === "[") {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      switchTab(tabs[currentIndex]);
    }
    });
  
    // Page elements
    const capsuleSelect = document.getElementById("capsuleSelect");
    const content = document.getElementById("learnContent");
    const exportBtn = document.getElementById("exportBtn");

    let currentCap = null;

    // Load capsules into selector
    const index = loadIndex() || [];
    index.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.title;
        capsuleSelect.appendChild(opt);
    });

    // Handle capsule selection
    capsuleSelect.addEventListener("change", e => {
        loadCapsule(e.target.value);
    });

    // Load selected capsule
    function loadCapsule(id) {
        if (!id) {
            exportBtn.disabled = true;
            content.innerHTML = `<p class="text-secondary">Select a capsule to start learning.</p>`;
            return;
        }

        const cap = loadCap(id);
        if (!cap) {
            content.innerHTML = `<p class="text-danger">❌ Capsule not found.</p>`;
            return;
        }

        currentCap = cap;
        exportBtn.disabled = false;

        // Export capsule button
        exportBtn.onclick = () => {
            const blob = new Blob([JSON.stringify(cap, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${(cap.meta?.title || "capsule").replace(/\s+/g, "_")}.json`;
            a.click();
        };

        switchTab("notes");
    }

    // Tab buttons
    document.getElementById("tabNotes").addEventListener("click", () => switchTab("notes"));
    document.getElementById("tabFlash").addEventListener("click", () => switchTab("flash"));
    document.getElementById("tabQuiz").addEventListener("click", () => switchTab("quiz"));

    // Switch content tab
    function switchTab(tab) {
        // Activate selected tab
        document.querySelectorAll(".btn-group button").forEach(b => b.classList.remove("active"));
        document.getElementById("tab" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");

        const id = capsuleSelect.value;
        if (!id) {
            content.innerHTML = `<p class="text-secondary">Select a capsule first.</p>`;
            return;
        }

        const cap = loadCap(currentCap.id);
        if (!cap) return;

        if (tab === "notes") renderNotes(cap);
        if (tab === "flash") renderFlashcards(cap);
        if (tab === "quiz") renderQuiz(cap);
    }
    // Render Notes tab

    function renderNotes(cap) {
        const notes = cap.notes || [];
        if (!notes.length) {
            content.innerHTML = `<p class="text-secondary">No notes available.</p>`;
            return;
        }
    
        content.innerHTML = `
            <h4>${cap.meta.title}</h4>
            <p>${cap.meta.subject} • ${cap.meta.level}</p>
    
            <input id="noteSearch" placeholder="Search notes..." 
                   class="form-control mb-3 bg-dark text-light">
    
            <ol id="noteList" class="list-group list-group-flush text-start">
                ${notes.map(n => `
                    <li class="list-group-item bg-transparent text-light border-secondary">${n}</li>
                `).join('')}
            </ol>
        `;
    
        const searchInput = document.getElementById("noteSearch");
        const list = document.getElementById("noteList");
    
        searchInput.addEventListener("input", () => {
            const term = searchInput.value.toLowerCase();
            const filtered = notes.filter(n => n.toLowerCase().includes(term));
            list.innerHTML = filtered.map(n =>
                `<li class="list-group-item bg-transparent text-light border-secondary">${n}</li>`
            ).join('');
        });
    }
    

    function renderFlashcards(cap) {
        const prog = loadProg(cap.id) || { knownFlashcards: [] };
        let index = 0;
        const total = cap.flashcards.length;
    
        if (total === 0) {
            content.innerHTML = `<p class="text-secondary">No flashcards available.</p>`;
            return;
        }
    
        content.innerHTML = `
            <p id="flashInfo">${index + 1} / ${total}</p>
            <div id="flashBox">
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back"></div>
                </div>
            </div>
    
            <div class="mt-3 d-flex justify-content-center gap-3">
                <button id="prevFlash"  class="btn btn-outline-info">◀</button>
                <button id="markUnknown" class="btn btn-outline-warning">Unknown</button>
                <button id="markKnown" class="btn btn-outline-success">Known</button>
                <button id="nextFlash" class="btn btn-outline-info">▶</button>
            </div>
        `;
    
        const flashBox = document.querySelector("#flashBox .card-inner");
        const front = flashBox.querySelector(".card-front");
        const back = flashBox.querySelector(".card-back");
        const info = document.getElementById("flashInfo");
    
        function updateCard() {
            const card = cap.flashcards[index];
            front.textContent = card.front;
            back.textContent = card.back;
            flashBox.classList.remove("flipped");
    
            info.textContent = `${index + 1} / ${total}`;
        }
    
        updateCard();
    
        // Flip card
        function flip() {
            flashBox.classList.toggle("flipped");
        }
    
        flashBox.onclick = flip;
        document.onkeydown = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                flip();
            }
        };
    
        // Nav
        document.getElementById("prevFlash").onclick = () => {
            if (index > 0) index--;
            updateCard();
        };
    
        document.getElementById("nextFlash").onclick = () => {
            if (index < total - 1) index++;
            updateCard();
        };
    
        // Known tracking
        document.getElementById("markKnown").onclick = () => {
            if (!prog.knownFlashcards.includes(index)) {
                prog.knownFlashcards.push(index);
                saveProg(cap.id, prog);
            }
        };
    
        document.getElementById("markUnknown").onclick = () => {
            prog.knownFlashcards = prog.knownFlashcards.filter(i => i !== index);
            saveProg(cap.id, prog);
        };
    }
    
    // Quiz function
    function renderQuiz(cap) {
        const container = content;
        const questions = cap.quiz || [];
        // If no quiz questions are found
        if (!questions.length) {
            container.innerHTML = `<p class="text-secondary">No quiz questions found.</p>`;
            return;
        }

        let index = 0;  // Current question index
        let score = 0;   // Count of correct answers
        let penalties = 0;    // Count of wrong answers



        // Display one question at a time
        function showQuestion() {
            const q = questions[index];
            container.innerHTML = `
            <p class="text-info fw-bold">Question ${index + 1} / ${questions.length}</p>
            <h5 class="mb-3 text-light">${q.question}</h5>
            <div class="choices"></div>
          `;

            const choicesDiv = container.querySelector(".choices");
            q.choices.forEach((choice, idx) => {
                const btn = document.createElement("button");
                btn.className = "btn btn-outline-info d-block w-100 mb-2 choice-btn";
                btn.textContent = choice;
                btn.onclick = () => handleAnswer(idx, btn);
                choicesDiv.appendChild(btn);
            });
        }
        // Handle user answer
        function handleAnswer(selected, btn) {
            const q = questions[index];
            const correct = Number(q.correct);
            const allBtns = container.querySelectorAll(".choice-btn");
            allBtns.forEach(b => (b.disabled = true));

            // Correct answer: increase score
            if (selected === correct) {
                btn.classList.replace("btn-outline-info", "btn-success");
                score++;
                setTimeout(nextQuestion, 800);
            } else {
                // Wrong answer: increase penalty count
                btn.classList.replace("btn-outline-info", "btn-danger");
                penalties++;

                // Add retry button for practice (does not affect score)
                const retryBtn = document.createElement("button");
                retryBtn.textContent = "🔁 Retry this question (no score)";
                retryBtn.className = "btn btn-outline-warning mt-3";
                retryBtn.onclick = () => {
                    showQuestion(); // Show same question again for retry
                };
                container.appendChild(retryBtn);
            }
        }
        // Go to the next question
        function nextQuestion() {
            index++;
            if (index < questions.length) {
                showQuestion();
            } else {
                finishQuiz();
            }
        }
        // Calculate and display final quiz score
        function finishQuiz() {
            // Base score: percentage of correct answers
            const rawPercent = (score / questions.length) * 100;
            const penaltyPercent = penalties * 5; // Each mistake subtracts 5%
            // Final score (cannot go below 0)
            const finalPercent = Math.max(0, Math.round(rawPercent - penaltyPercent));

            // Save progress in localStorage
            const prog = loadProg(cap.id) || { bestScore: 0, knownFlashcards: [] };
            prog.bestScore = Math.max(finalPercent, prog.bestScore);
            saveProg(cap.id, prog);

            // Display results
            container.innerHTML = `
            <h3 class="text-${finalPercent >= 70 ? "success" : "warning"} mb-3">
              ${finalPercent >= 70 ? "✅ Great Job!" : "⚡ Keep Practicing"}
            </h3>
            <p class="text-light fs-5">Correct: ${score} / ${questions.length}</p>
            <p class="text-secondary">Mistakes: ${penalties}</p>
            <p class="text-info fs-5">Final Score: ${finalPercent}%</p>
            <div class="mt-3">
              <button id="retryAllBtn" class="btn btn-outline-info">🔁 Retry Quiz</button>
            </div>
          `;
            // Restart the entire quiz
            document.getElementById("retryAllBtn").onclick = () => {
                index = 0;
                score = 0;
                penalties = 0;
                showQuestion();
            };
        }

        showQuestion();
    }

}

