export const IDX_KEY = 'pc_capsules_index';
export const CAP_KEY = id => `pc_capsule_${id}`;
export const PROG_KEY = id => `pc_progress_${id}`;

export const loadIndex = () => JSON.parse(localStorage.getItem(IDX_KEY) || '[]');
export const saveIndex = (idx) => localStorage.setItem(IDX_KEY, JSON.stringify(idx));

export const loadCap = (id) => JSON.parse(localStorage.getItem(CAP_KEY(id)) || 'null');
export const saveCap = (cap) => localStorage.setItem(CAP_KEY(cap.id), JSON.stringify(cap));

export const loadProg = (id) => JSON.parse(localStorage.getItem(PROG_KEY(id)) || '{}');
export const saveProg = (id, p) => localStorage.setItem(PROG_KEY(id), JSON.stringify(p));
