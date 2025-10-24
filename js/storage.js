export const IDX_KEY = 'pc_capsules_index';
export const CAP_KEY = id => `pc_capsule_${id}`;
export const PROG_KEY = id => `pc_progress_${id}`;

export const loadIndex = () => {
    try {
        return JSON.parse(localStorage.getItem(IDX_KEY) || '[]');
    } catch (err) {
        console.error("❌ Error loading index:", err);
        return [];
    }
};

export const loadCap = (id) => {
    try {
        return JSON.parse(localStorage.getItem(CAP_KEY(id)) || 'null');
    } catch (err) {
        console.error(`❌ Error loading capsule ${id}:`, err);
        return null;
    }
};

// Load capsule progress with default values
export function loadProg(id) {
    const data = localStorage.getItem("pc_progress_" + id);
    if (!data) return { bestScore: 0, knownFlashcards: [] };
    try {
        const parsed = JSON.parse(data);
        return {
            bestScore: typeof parsed.bestScore === "number" ? parsed.bestScore : 0,
            knownFlashcards: parsed.knownFlashcards || []
        };
    } catch {
        return { bestScore: 0, knownFlashcards: [] };
    }
};

// Save the capsules index 
export const saveIndex = (idx) => {
    try {
        localStorage.setItem(IDX_KEY, JSON.stringify(idx));
    } catch (err) {
        console.error("❌ Error saving index:", err);
    }
};

// Save/update a capsule and maintain index
export function saveCap(cap) {
    if (!cap.id) cap.id = Date.now().toString();
    localStorage.setItem("pc_capsule_" + cap.id, JSON.stringify(cap));


    let index = loadIndex();
    if (!Array.isArray(index)) index = [];

    const entry = {
        id: cap.id,
        title: cap.meta?.title || "",
        subject: cap.meta?.subject || "",
        level: cap.meta?.level || "",
        updatedAt: new Date().toISOString()
    };

    // Update or add to index
    const pos = index.findIndex(i => i.id === cap.id);
    if (pos >= 0) index[pos] = entry;
    else index.push(entry);

    saveIndex(index);
}

// Save capsule progress safely
export const saveProg = (id, p) => {
    try {
        localStorage.setItem(PROG_KEY(id), JSON.stringify(p));
    } catch (err) {
        console.error(`❌ Error saving progress for ${id}:`, err);
    }
};
