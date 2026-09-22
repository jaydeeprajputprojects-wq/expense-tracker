import { initializeUI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Startup sequence: Open website -> API -> Google Sheets -> Master data loaded -> Dropdowns populated");
  initializeUI();
});
