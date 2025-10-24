import { loadIndex, loadProg } from "./storage.js";
import { renderAuthorForm } from "./author.js";

export function renderLibrary() {

  const library = document.getElementById("library");
  library.innerHTML = `
    <div id="capsule" class="p-3 mb-2 border border-secondary capsule">
      <h2 class="text-light">Your Capsules</h2>
      <p>Create, import, export, and manage learning capsules. All data stays in your browser.</p> 
      <div class="d-flex justify-content-end gap-2 mb-3">
        <button id="newCapsuleBtn" class="btn btn-outline-secondary text-light">➕ New Capsule</button>
        <button id="importBtn" class="btn btn-outline-secondary text-light">⬆️ Import JSON</button>
      </div>

      <div id="capsuleList" class="row gy-3"></div>

      <p id="emptyMsg" class="text-light text-center mt-4 d-none">
        No capsules yet. Click <b>New Capsule</b> to create one!
      </p>
    </div>
  `;
  
  // load index safely and filter invalid entries
  let capsules = [];
  try {
    capsules = (loadIndex() || []).filter(c => c && c.id);
  } catch (err) {
    console.error("Error loading index:", err);
  }

  const list = document.getElementById("capsuleList");
  const emptyMsg = document.getElementById("emptyMsg");

  if (!capsules || capsules.length === 0) {
    emptyMsg.classList.remove("d-none");
    return;
  } else {
    emptyMsg.classList.add("d-none");
  }
  
  capsules.forEach(capsule => {
    const progress = loadProg(capsule.id) || { bestScore: 0, knownFlashcards: [] };
    const card = document.createElement("div");
    card.className = "col-md-4";

    card.innerHTML = `
      <div class="card shadow-sm h-100 bg-dark text-light border border-secondary">
        <div class="card-body">
          <h5 class="card-title">${capsule.title}</h5>
          <span class="badge bg-info">${capsule.subject || ''}</span>
          <span class="badge bg-secondary">${capsule.level || ''}</span>
          <p class="small text-light mt-2">Updated: ${capsule.updatedAt || ''}</p>


          <div class="progress mb-2">
            <div class="progress-bar" role="progressbar"
              style="width:${progress.bestScore}%"
              aria-valuenow="${progress.bestScore}"
              aria-valuemin="0" aria-valuemax="100">
            </div>
          </div>

          <p class="small text-light">Known cards: ${progress.knownFlashcards?.length || 0}</p>

          <div class="d-flex flex-wrap gap-1 mt-2">
            <button class="btn btn-outline-primary learn-btn" data-id="${capsule.id}">Learn</button>
            <button class="btn btn-outline-warning edit-btn" data-id="${capsule.id}">Edit</button>
            <button class="btn btn-outline-success export-btn" data-id="${capsule.id}">Export</button>
            <button class="btn btn-outline-danger delete-btn" data-id="${capsule.id}">Delete</button>
          </div>
        </div>
      </div>
      `;
