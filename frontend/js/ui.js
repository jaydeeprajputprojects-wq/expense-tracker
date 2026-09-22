import { getMasterData, getTransactions, getBalances, getTransaction, deleteTransaction } from "./api.js";
import { initializeAccounts } from "./accounts.js";
import { initializeTransactions, populateFormWithTransaction } from "./transactions.js";
import { formatCurrency } from "./utils.js";

export const appState = {
  accounts: [],
  categories: [],
  configuration: [],
  transactions: [],
  balances: [],
  isLoading: false,
  error: null
};

export async function loadMasterData() {
  const masterData = await getMasterData();

  const normalizedAccounts = (Array.isArray(masterData.accounts) ? masterData.accounts : []).map((account) => ({
    ...account,
    accountId: account.accountId || account.Account_ID || "",
    accountName: account.accountName || account.Account_Name || "",
    accountType: account.accountType || account.Account_Type || "",
    status: account.status || account.Status || "ACTIVE"
  }));

  const normalizedCategories = (Array.isArray(masterData.categories) ? masterData.categories : []).map((category) => {
    const categoryId = category.categoryId || category.Category_ID || category.category || category.id || "";
    const categoryName = category.categoryName || category.Category_Name || category.name || category.Category || categoryId || "";

    return {
      ...category,
      categoryId,
      categoryName,
      status: category.status || category.Status || "ACTIVE"
    };
  });

  return {
    accounts: normalizedAccounts,
    categories: normalizedCategories,
    configuration: Array.isArray(masterData.configuration) ? masterData.configuration : []
  };
}

export async function loadTransactions() {
  const result = await getTransactions();
  return Array.isArray(result.transactions) ? result.transactions : [];
}

export async function loadBalances() {
  const result = await getBalances();
  return Array.isArray(result.balances) ? result.balances : [];
}

function hideStatusMessage() {
  const statusElement = document.getElementById("appStatus");

  if (!statusElement) {
    return;
  }

  statusElement.classList.add("hidden", "opacity-0", "-translate-y-1");
  statusElement.classList.remove("opacity-100", "translate-y-0");
}

function updateStatus(message, type = "info") {
  const statusElement = document.getElementById("appStatus");
  const statusText = document.getElementById("appStatusText");
  const dismissButton = document.getElementById("appStatusDismiss");

  if (!statusElement || !statusText) {
    return;
  }

  statusElement.classList.remove("hidden");
  statusElement.classList.remove("opacity-0", "-translate-y-1");
  statusElement.classList.add("opacity-100", "translate-y-0");

  statusText.textContent = message;
  statusElement.className = "mt-4 rounded-md border px-3 py-2 text-sm transition-all duration-300 ease-out opacity-100 translate-y-0";

  if (type === "success") {
    statusElement.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-700");
  } else if (type === "error") {
    statusElement.classList.add("border-red-200", "bg-red-50", "text-red-700");
  } else {
    statusElement.classList.add("border-blue-200", "bg-blue-50", "text-blue-700");
  }

  if (dismissButton) {
    dismissButton.classList.remove("hidden");
    dismissButton.onclick = hideStatusMessage;
  }
}

window.setStatusMessage = function(message, type = "info") {
  updateStatus(message, type);
};

window.hideStatusMessage = hideStatusMessage;

function renderBalanceSummary() {
  const totalBalance = appState.balances.reduce((sum, balance) => sum + Number(balance.currentBalance || 0), 0);
  const totalIncome = appState.transactions.filter((transaction) => transaction.transactionType === "INCOME").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalExpense = appState.transactions.filter((transaction) => transaction.transactionType === "EXPENSE").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const balanceValue = document.getElementById("balanceValue");
  const incomeValue = document.getElementById("incomeValue");
  const expenseValue = document.getElementById("expenseValue");

  if (balanceValue) {
    balanceValue.textContent = formatCurrency(totalBalance);
  }

  if (incomeValue) {
    incomeValue.textContent = formatCurrency(totalIncome);
  }

  if (expenseValue) {
    expenseValue.textContent = formatCurrency(totalExpense);
  }
}

function renderTransactionTable() {
  const tableBody = document.getElementById("transactionTableBody");

  if (!tableBody) {
    return;
  }

  if (!appState.transactions.length) {
    tableBody.innerHTML = '<tr><td colspan="10" class="px-4 py-6 text-center text-sm text-gray-500">No transactions yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = appState.transactions.map((transaction) => {
    const paymentMethod = transaction.paymentMethod || "-";
    const fromValue = transaction.paidFromAccountName || transaction.fromAccountName || "-";
    const toValue = transaction.receivedIntoAccountName || transaction.toAccountName || "-";
    const amount = formatCurrency(Number(transaction.amount || 0));

    return `
      <tr class="border-t border-gray-200 text-sm">
        <td class="px-4 py-3">${transaction.transactionDate || "-"}</td>
        <td class="px-4 py-3">${transaction.transactionType || "-"}</td>
        <td class="px-4 py-3">${transaction.categoryName || transaction.categoryId || "-"}</td>
        <td class="px-4 py-3">${paymentMethod}</td>
        <td class="px-4 py-3">${fromValue}</td>
        <td class="px-4 py-3">${toValue}</td>
        <td class="px-4 py-3 font-medium">${amount}</td>
        <td class="px-4 py-3">${transaction.notes || "-"}</td>
        <td class="px-4 py-3">
          <div class="flex gap-2">
            <button type="button" data-action="edit" data-transaction-id="${transaction.transactionId || ""}" class="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">Edit</button>
            <button type="button" data-action="delete" data-transaction-id="${transaction.transactionId || ""}" class="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tableBody.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const action = event.currentTarget.dataset.action;
      const transactionId = event.currentTarget.dataset.transactionId;

      if (!transactionId) {
        return;
      }

      if (action === "edit") {
        try {
          const result = await getTransaction(transactionId);
          const transaction = result && result.transaction ? result.transaction : null;

          if (transaction) {
            populateFormWithTransaction(transaction);
            updateStatus(`Editing transaction ${transactionId}.`, "info");
          }
        } catch (error) {
          updateStatus(error.message || "Unable to load transaction.", "error");
        }
      }

      if (action === "delete") {
        const shouldDelete = window.confirm("Delete this transaction?");

        if (!shouldDelete) {
          return;
        }

        try {
          await deleteTransaction(transactionId);
          await initializeUI();
        } catch (error) {
          updateStatus(error.message || "Unable to delete transaction.", "error");
        }
      }
    });
  });
}

export async function initializeUI() {
  if (appState.isLoading) {
    return;
  }

  console.log("Finance Tracker UI initialized.");

  if (window.lucide) {
    window.lucide.createIcons();
  }

  window.financeAppRefresh = async () => {
    if (!appState.isLoading) {
      await initializeUI();
    }
  };

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

    appState.transactions = await loadTransactions();
    appState.balances = await loadBalances();
    renderBalanceSummary();
    renderTransactionTable();

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
