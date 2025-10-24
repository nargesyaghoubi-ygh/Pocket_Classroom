// js/library.js
import { loadIndex, loadProg } from "./storage.js";

// Render the main library view
export function renderLibrary() {
    const library = document.getElementById("library");
    if (!library) return;

    // Library
    library.innerHTML = `
    <div class="p-3 mb-2 border border-secondary capsule">
      <h2 class="text-light">Your Capsules</h2>
      <p class="text-light">Create, import, export, and manage learning capsules. All data stays in your browser.</p> 
      
      <div class="d-flex justify-content-end gap-2 mb-3">
        <button id="newCapsuleBtn" aria-label="Create new capsule" class="btn btn-outline-secondary text-light">➕ New Capsule</button>
        <button id="importBtn" aria-label="Import capsule from JSON file" class="btn btn-outline-secondary text-light">⬆️ Import JSON</button>
      </div>

      <div id="capsuleList" class="row gy-3"></div>

      <p id="emptyMsg" class="text-light text-center mt-4 d-none">
        No capsules yet. Click <b>New Capsule</b> to create one!
      </p>
    </div>
  `;

    // load Index
    let capsules = [];
    try {
        capsules = (loadIndex() || []).filter(c => c && c.id);
    } catch (err) {
        console.error("Error loading index:", err);
    }

    const list = document.getElementById("capsuleList");
    const emptyMsg = document.getElementById("emptyMsg");

    // Show empty message if no capsules
    if (!capsules.length) {
        emptyMsg.classList.remove("d-none");
        return;
    }

    // Create and append capsule cards
    capsules.forEach(capsule => {
        const prog = loadProg(capsule.id) || {};
        const bestScore = Number(prog.bestScore ?? 0);
        const knownCount = Array.isArray(prog.knownFlashcards) ? prog.knownFlashcards.length : 0;


        const card = document.createElement("div");
        card.className = "col-md-4";

        // Card content including progress and actions
        card.innerHTML = `
                <div class="card shadow-sm h-100 bg-dark text-light border border-secondary">
                  <div class="card-body">
                    <h5 class="card-title mb-1">${capsule.title}</h5>
                    <div class="mb-2">
                      <span class="badge bg-info">${capsule.subject || ""}</span>
                      <span class="badge bg-secondary">${capsule.level || ""}</span>
                    </div>
                    <p class="small text-light mb-2">Updated: ${capsule.updatedAt ? new Date(capsule.updatedAt).toLocaleString() : ""}</p>
        
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small text-light">Quiz best</span>
                      <span class="small text-light">${bestScore}%</span>
                    </div>
                    <div class="progress mb-2 border border-secondary" style="height: 10px; background-color:#262325">
                      <div class="progress-bar" 
                           role="progressbar"
                           style="width: ${bestScore}%; transition: width 0.6s ease;"
                           aria-valuenow="${bestScore}" aria-valuemin="0" aria-valuemax="100">
                      </div>
                    </div>
        
                    <p class="small text-light mb-2">Known cards <b>${knownCount}</b></p>
        
                    <div class="d-flex flex-wrap gap-1 mt-2">
                      <button class="btn btn-sm btn-outline-primary learn-btn" data-id="${capsule.id}">▶ Learn</button>
                      <button class="btn btn-sm btn-outline-warning edit-btn" data-id="${capsule.id}">✏ Edit</button>
                      <button class="btn btn-sm btn-outline-success export-btn" data-id="${capsule.id}">⬇ Export</button>
                      <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${capsule.id}">🗑 Delete</button>
                    </div>
                  </div>
                </div>
              `;


        list.appendChild(card);
    });
}

// Manage All Library Buttons
document.addEventListener("click", async (e) => {
    const t = e.target;

    // New Capsule
    if (t.id === "newCapsuleBtn") {
        window.dispatchEvent(new CustomEvent("navigate", { detail: { section: "author" } }));
        return;
    }

    // Import JSON

    if (t.id === "importBtn") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";

        input.onchange = async (ev) => {
            const file = ev.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validation
                if (!data.meta?.title || typeof data.meta.title !== "string")
                    return alert("❌ Invalid capsule: Missing title");

                if (
                    (!data.notes || data.notes.length === 0) &&
                    (!data.flashcards || data.flashcards.length === 0) &&
                    (!data.quiz || data.quiz.length === 0)
                ) {
                    return alert("❌ Capsule should contain notes OR flashcards OR quiz");
                }

                // Avoid existing ID collisions
                const newId = Date.now().toString();
                data.id = newId;

                // Save capsule itself
                localStorage.setItem("pc_capsule_" + newId, JSON.stringify(data));

                // Update index
                let index = loadIndex() || [];
                index.push({
                    id: newId,
                    title: data.meta.title,
                    subject: data.meta.subject,
                    level: data.meta.level,
                    updatedAt: new Date().toISOString(),
                });
                localStorage.setItem("pc_capsules_index", JSON.stringify(index));

                alert("✅ Capsule imported successfully!");
                renderLibrary();

            } catch (err) {
                alert("❌ Import failed: " + err.message);
            }
        };

        input.click();
        return;
    }

    // Edit
    if (t.classList.contains("edit-btn")) {
        const id = t.dataset.id;
        if (!id) return alert("Invalid capsule id");
        window.dispatchEvent(new CustomEvent("navigate", { detail: { section: "author", id } }));
        return;
    }

    // Export
    if (t.classList.contains("export-btn")) {
        const id = t.dataset.id;
        const cap = JSON.parse(localStorage.getItem("pc_capsule_" + id));
        if (!cap) return alert("Cannot find capsule");
        const blob = new Blob([JSON.stringify(cap, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${(cap.meta?.title || "capsule").replace(/\s+/g, "_")}.json`;
        a.click();
        return;
    }

    // Delete
    if (t.classList.contains("delete-btn")) {
        const id = t.dataset.id;
        if (!confirm("❗ Delete this capsule?")) return;
        localStorage.removeItem("pc_capsule_" + id);
        let index = loadIndex().filter(i => i.id !== id);
        localStorage.setItem("pc_capsules_index", JSON.stringify(index));
        alert("🗑️ Capsule deleted!");
        renderLibrary();
        return;
    }

    // Learn
    if (t.classList.contains("learn-btn")) {
        const id = t.dataset.id;
        window._currentCapsuleId = id;
        window.dispatchEvent(new CustomEvent("navigate", { detail: { section: "learn", id } }));
    }
});
