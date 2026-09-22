import { getMasterData } from "./api.js";
import { initializeAccounts } from "./accounts.js";
import { initializeTransactions } from "./transactions.js";

export const appState = {
  accounts: [],
  categories: [],
  configuration: [],
  isLoading: false,
  error: null
};

export async function loadMasterData() {
  const masterData = await getMasterData();

  return {
    accounts: Array.isArray(masterData.accounts) ? masterData.accounts : [],
    categories: Array.isArray(masterData.categories) ? masterData.categories : [],
    configuration: Array.isArray(masterData.configuration) ? masterData.configuration : []
  };
}

function updateStatus(message, type = "info") {
  const statusElement = document.getElementById("appStatus");

  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.className = "mt-4 rounded-md border px-3 py-2 text-sm";

  if (type === "success") {
    statusElement.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-700");
  } else if (type === "error") {
    statusElement.classList.add("border-red-200", "bg-red-50", "text-red-700");
  } else {
    statusElement.classList.add("border-blue-200", "bg-blue-50", "text-blue-700");
  }
}

export async function initializeUI() {
  console.log("Finance Tracker UI initialized.");

  if (window.lucide) {
    window.lucide.createIcons();
  }

  appState.isLoading = true;
  updateStatus("Loading master data from Google Apps Script...", "info");

  try {
    const masterData = await loadMasterData();

    appState.accounts = masterData.accounts;
    appState.categories = masterData.categories;
    appState.configuration = masterData.configuration;
    appState.error = null;

    initializeAccounts(appState);
    initializeTransactions(appState);

    const configCount = document.getElementById("configCount");
    if (configCount) {
      configCount.textContent = String(appState.configuration.length);
    }

    updateStatus("Master data loaded successfully. Transaction dropdowns are ready.", "success");
    console.log("Master data loaded successfully.", appState);
  } catch (error) {
    appState.error = error.message;
    updateStatus(error.message, "error");
    console.error("Master data load failed:", error);
  } finally {
    appState.isLoading = false;
  }
}
