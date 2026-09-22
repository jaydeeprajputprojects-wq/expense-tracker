import { populateSelect } from "./accounts.js";

function getActiveCategories(categories = []) {
  return categories.filter((category) => category && (category.status === undefined || category.status === "ACTIVE"));
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

function setFieldVisibility(type) {
  const fields = {
    date: document.getElementById("field-date"),
    amount: document.getElementById("field-amount"),
    category: document.getElementById("field-category"),
    paymentMethod: document.getElementById("field-paymentMethod"),
    paidFrom: document.getElementById("field-paidFrom"),
    receivedInto: document.getElementById("field-receivedInto"),
    transferFrom: document.getElementById("field-transferFrom"),
    transferTo: document.getElementById("field-transferTo"),
    notes: document.getElementById("field-notes")
  };

  const hasDate = true;
  const showCommon = [fields.date, fields.amount, fields.category, fields.notes];

  showCommon.forEach((field) => {
    if (field) {
      field.classList.remove("hidden");
    }
  });

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

  if (fields.category) {
    const categoryLabel = document.getElementById("categoryLabel");
    if (categoryLabel) {
      categoryLabel.textContent = isExpense ? "Category" : isIncome ? "Category" : "Category";
    }
  }

  if (fields.paidFrom) {
    const label = document.getElementById("paidFromLabel");
    if (label) {
      label.textContent = "Paid From";
    }
  }

  if (fields.receivedInto) {
    const label = document.getElementById("receivedIntoLabel");
    if (label) {
      label.textContent = "Received Into";
    }
  }

  if (fields.transferFrom) {
    const label = document.getElementById("transferFromLabel");
    if (label) {
      label.textContent = "From";
    }
  }

  if (fields.transferTo) {
    const label = document.getElementById("transferToLabel");
    if (label) {
      label.textContent = "To";
    }
  }

  return hasDate;
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

export function initializeTransactions(state = { categories: [], accounts: [] }) {
  const categorySelect = document.getElementById("categorySelect");
  const categoryCount = document.getElementById("categoryCount");
  const typeSelect = document.getElementById("transactionType");
  const paymentMethodSelect = document.getElementById("paymentMethodSelect");

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
      option.value = category.categoryId || "";
      option.textContent = category.categoryName || category.categoryId || "Unnamed";
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
    const syncForm = () => {
      setFieldVisibility(typeSelect.value || "EXPENSE");
      refreshAccountDropdowns(state);
    };

    typeSelect.addEventListener("change", syncForm);
    syncForm();
  }

  refreshAccountDropdowns(state);
  console.log("Transaction module initialized.", state);
}
