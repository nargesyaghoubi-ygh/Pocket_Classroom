import { renderLibrary } from "./library.js";
import { renderAuthorForm } from "./author.js";
import { renderLearn } from "./learn.js";

// Main function to show a section and hide others
function showSection(id, extra = {}) {
    const sections = document.querySelectorAll("section");
    sections.forEach(sec => {
        sec.style.display = (sec.id === id) ? "block" : "none";
    });

    // Update navbar radio buttons
    document.querySelectorAll(".btn-check").forEach(input => {
        input.checked = (input.id === `btn-${id}`);
    });

    // Render content based on active section
    if (id === "library") renderLibrary();
    if (id === "author") renderAuthorForm(extra.id || null);
    if (id === "learn") renderLearn(window._currentCapsuleId);
}
// On page load
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("label[data-section]").forEach(label => {  // Handle navbar clicks
        label.addEventListener("click", () => {
            const section = label.dataset.section;
            showSection(section);
        });
    });

    // show library -> default
    showSection("library");
});

// Handle navigation from other parts of app
window.addEventListener("navigate", (e) => {
    const { section, id } = e.detail;
    showSection(section, { id });
});
