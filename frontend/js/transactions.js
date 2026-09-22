import { populateSelect } from "./accounts.js";
import { createTransaction, updateTransaction } from "./api.js";

function getActiveCategories(categories = []) {
  return categories.filter((category) => {
    if (!category) {
      return false;
    }

    const status = category.status ?? category.Status ?? "ACTIVE";
    return status === undefined || status === "ACTIVE";
  });
}

function getAccountTypeForPaymentMethod(paymentMethod) {
  const normalized = String(paymentMethod || "").trim().toUpperCase();

  if (normalized === "BANK") {
    return "BANK";
  }

  if (normalized === "CREDIT_CARD") {
    return "CREDIT_CARD";
  }

  if (normalized === "GIFT_CARD") {
    return "GIFT_CARD";
  }

  return "";
}

function formatDateForApi(dateValue) {
  if (!dateValue) {
    return "";
  }

  const normalized = String(dateValue).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-");
    return `${day}-${month}-${year}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
    return normalized;
  }

  return normalized;
}

function formatDateForInput(dateValue) {
  if (!dateValue) {
    return "";
  }

  const normalized = String(dateValue).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split("-");
    return `${year}-${month}-${day}`;
  }

  return normalized;
}

export function setFieldVisibility(type) {
  const fields = {
    paymentMethod: document.getElementById("field-paymentMethod"),
    paidFrom: document.getElementById("field-paidFrom"),
    receivedInto: document.getElementById("field-receivedInto"),
    transferFrom: document.getElementById("field-transferFrom"),
    transferTo: document.getElementById("field-transferTo")
  };

  const isExpense = type === "EXPENSE";
  const isIncome = type === "INCOME";
  const isTransfer = type === "TRANSFER";

  if (fields.paymentMethod) {
    fields.paymentMethod.classList.toggle("hidden", !isExpense);
  }

  if (fields.paidFrom) {
    fields.paidFrom.classList.toggle("hidden", !isExpense);
  }

  if (fields.receivedInto) {
    fields.receivedInto.classList.toggle("hidden", !isIncome);
  }

  if (fields.transferFrom) {
    fields.transferFrom.classList.toggle("hidden", !isTransfer);
  }

  if (fields.transferTo) {
    fields.transferTo.classList.toggle("hidden", !isTransfer);
  }
}

export function populateFormWithTransaction(transaction = {}) {
  const form = document.getElementById("transactionForm");
  const typeSelect = document.getElementById("transactionType");
  const dateInput = document.getElementById("transactionDate");
  const amountInput = document.getElementById("amountInput");
  const categorySelect = document.getElementById("categorySelect");
  const paymentMethodSelect = document.getElementById("paymentMethodSelect");
  const paidFromAccount = document.getElementById("paidFromAccount");
  const receivedIntoAccount = document.getElementById("receivedIntoAccount");
  const transferFromAccount = document.getElementById("transferFromAccount");
  const transferToAccount = document.getElementById("transferToAccount");
  const notesInput = document.getElementById("notesInput");
  const submitButton = document.getElementById("submitTransactionBtn");
  const cancelButton = document.getElementById("cancelEditBtn");

  if (!form) {
    return;
  }

  const transactionType = String(transaction.transactionType || "EXPENSE").trim().toUpperCase();
  form.dataset.mode = transaction.transactionId ? "edit" : "create";
  form.dataset.transactionId = transaction.transactionId || "";

  if (typeSelect) {
    typeSelect.value = transactionType;
  }

  if (dateInput) {
    const dateValue = transaction.transactionDate || "";
    dateInput.value = formatDateForInput(dateValue);
  }

  if (amountInput) {
    amountInput.value = transaction.amount ?? "";
  }

  if (categorySelect) {
    categorySelect.value = transaction.categoryId || "";
  }

  if (paymentMethodSelect) {
    paymentMethodSelect.value = transaction.paymentMethod || "BANK";
  }

  if (paidFromAccount) {
    paidFromAccount.value = transaction.paidFromAccountId || "";
  }

  if (receivedIntoAccount) {
    receivedIntoAccount.value = transaction.receivedIntoAccountId || "";
  }

  if (transferFromAccount) {
    transferFromAccount.value = transaction.fromAccountId || "";
  }

  if (transferToAccount) {
    transferToAccount.value = transaction.toAccountId || "";
  }

  if (notesInput) {
    notesInput.value = transaction.notes || "";
  }

  setFieldVisibility(transactionType);

  if (submitButton) {
    submitButton.textContent = transaction.transactionId ? "Update transaction" : "Save transaction";
  }

  if (cancelButton) {
    cancelButton.classList.toggle("hidden", !transaction.transactionId);
  }
}

export function resetTransactionForm() {
  const form = document.getElementById("transactionForm");
  const typeSelect = document.getElementById("transactionType");
  const dateInput = document.getElementById("transactionDate");
  const amountInput = document.getElementById("amountInput");
  const categorySelect = document.getElementById("categorySelect");
  const paymentMethodSelect = document.getElementById("paymentMethodSelect");
  const notesInput = document.getElementById("notesInput");
  const submitButton = document.getElementById("submitTransactionBtn");
  const cancelButton = document.getElementById("cancelEditBtn");

  if (form) {
    form.dataset.mode = "create";
    form.dataset.transactionId = "";
  }

  if (typeSelect) {
    typeSelect.value = "EXPENSE";
  }

  if (dateInput) {
    dateInput.value = "";
  }

  if (amountInput) {
    amountInput.value = "";
  }

  if (categorySelect) {
    categorySelect.value = "";
  }

  if (paymentMethodSelect) {
    paymentMethodSelect.value = "BANK";
  }

  if (notesInput) {
    notesInput.value = "";
  }

  if (submitButton) {
    submitButton.textContent = "Save transaction";
  }

  if (cancelButton) {
    cancelButton.classList.add("hidden");
  }

  setFieldVisibility("EXPENSE");
}

export function buildTransactionPayloadFromForm() {
  const form = document.getElementById("transactionForm");
  const typeSelect = document.getElementById("transactionType");
  const dateInput = document.getElementById("transactionDate");
  const amountInput = document.getElementById("amountInput");
  const categorySelect = document.getElementById("categorySelect");
  const paymentMethodSelect = document.getElementById("paymentMethodSelect");
  const paidFromAccount = document.getElementById("paidFromAccount");
  const receivedIntoAccount = document.getElementById("receivedIntoAccount");
  const transferFromAccount = document.getElementById("transferFromAccount");
  const transferToAccount = document.getElementById("transferToAccount");
  const notesInput = document.getElementById("notesInput");

  const transactionType = typeSelect ? typeSelect.value : "EXPENSE";
  const payload = {
    transactionType,
    transactionDate: formatDateForApi(dateInput ? dateInput.value : ""),
    amount: Number(amountInput ? amountInput.value : 0),
    categoryId: categorySelect ? categorySelect.value : "",
    notes: notesInput ? notesInput.value : ""
  };

  if (transactionType === "EXPENSE") {
    payload.paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : "";
    payload.paidFromAccountId = paidFromAccount ? paidFromAccount.value : "";
  } else if (transactionType === "INCOME") {
    payload.receivedIntoAccountId = receivedIntoAccount ? receivedIntoAccount.value : "";
  } else if (transactionType === "TRANSFER") {
    payload.fromAccountId = transferFromAccount ? transferFromAccount.value : "";
    payload.toAccountId = transferToAccount ? transferToAccount.value : "";
  }

  if (form && form.dataset.transactionId) {
    payload.transactionId = form.dataset.transactionId;
  }

  return payload;
}

function validateTransactionPayload(payload) {
  if (!payload.transactionDate) {
    throw new Error("Transaction date is required.");
  }

  if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (!payload.categoryId) {
    throw new Error("Category is required.");
  }

  if (payload.transactionType === "EXPENSE") {
    if (!payload.paymentMethod) {
      throw new Error("Payment method is required.");
    }

    if (!payload.paidFromAccountId) {
      throw new Error("Paid from account is required.");
    }
  }

  if (payload.transactionType === "INCOME") {
    if (!payload.receivedIntoAccountId) {
      throw new Error("Receiving account is required.");
    }
  }

  if (payload.transactionType === "TRANSFER") {
    if (!payload.fromAccountId) {
      throw new Error("From account is required.");
    }

    if (!payload.toAccountId) {
      throw new Error("To account is required.");
    }

    if (payload.fromAccountId === payload.toAccountId) {
      throw new Error("From and To accounts cannot be the same.");
    }
  }
}

function refreshAccountDropdowns(state) {
  const accounts = Array.isArray(state.accounts) ? state.accounts : [];
  const paymentMethodSelect = document.getElementById("paymentMethodSelect");
  const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : "";
  const expectedType = getAccountTypeForPaymentMethod(paymentMethod);

  populateSelect(document.getElementById("paidFromAccount"), accounts, {
    valueKey: "accountId",
    labelKey: "accountName",
    placeholder: "Select an account",
    filterFn: (account) => !expectedType || account.accountType === expectedType
  });

  populateSelect(document.getElementById("receivedIntoAccount"), accounts, {
    valueKey: "accountId",
    labelKey: "accountName",
    placeholder: "Select a receiving account"
  });

  populateSelect(document.getElementById("transferFromAccount"), accounts, {
    valueKey: "accountId",
    labelKey: "accountName",
    placeholder: "Select source account"
  });

  populateSelect(document.getElementById("transferToAccount"), accounts, {
    valueKey: "accountId",
    labelKey: "accountName",
    placeholder: "Select destination account"
  });
}

function waitForStatusDisplay(ms = 5000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function initializeTransactions(state = { categories: [], accounts: [] }) {
  const categorySelect = document.getElementById("categorySelect");
  const categoryCount = document.getElementById("categoryCount");
  const typeSelect = document.getElementById("transactionType");
  const paymentMethodSelect = document.getElementById("paymentMethodSelect");
  const form = document.getElementById("transactionForm");

  if (categorySelect) {
    const categories = getActiveCategories(Array.isArray(state.categories) ? state.categories : []);
    categorySelect.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select a category";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    categorySelect.appendChild(placeholderOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      const categoryId = category.categoryId || category.Category_ID || category.category || category.id || "";
      const categoryName = category.categoryName || category.Category_Name || category.name || category.Category || categoryId || "Unnamed";

      option.value = categoryId;
      option.textContent = categoryName;
      categorySelect.appendChild(option);
    });
  }

  if (categoryCount) {
    categoryCount.textContent = String(Array.isArray(state.categories) ? state.categories.length : 0);
  }

  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener("change", () => {
      refreshAccountDropdowns(state);
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      setFieldVisibility(typeSelect.value || "EXPENSE");
      refreshAccountDropdowns(state);
    });
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = buildTransactionPayloadFromForm();
      const mode = form.dataset.mode || "create";

      try {
        validateTransactionPayload(payload);

        if (mode === "edit") {
          await updateTransaction(payload.transactionId, payload);
          if (window.setStatusMessage) {
            window.setStatusMessage("Transaction updated successfully.", "success");
          }
        } else {
          await createTransaction(payload);
          if (window.setStatusMessage) {
            window.setStatusMessage("Transaction created successfully.", "success");
          }
        }

        await waitForStatusDisplay(5000);
        resetTransactionForm();

        if (window.financeAppRefresh) {
          window.financeAppRefresh();
        }
      } catch (error) {
        console.error("Transaction save failed:", error);
        if (window.setStatusMessage) {
          window.setStatusMessage(error.message || "Unable to save transaction.", "error");
        }
      }
    });
  }

  const cancelButton = document.getElementById("cancelEditBtn");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      resetTransactionForm();
    });
  }

  const refreshButton = document.getElementById("refreshTransactionsBtn");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      if (window.financeAppRefresh) {
        window.financeAppRefresh();
      }
    });
  }

  resetTransactionForm();
  refreshAccountDropdowns(state);
  setFieldVisibility("EXPENSE");
  console.log("Transaction module initialized.", state);
}
