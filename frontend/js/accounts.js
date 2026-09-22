export function populateSelect(selectElement, records, { valueKey, labelKey, placeholder = "Select an option", filterFn } = {}) {
  if (!selectElement) {
    return;
  }

  const items = Array.isArray(records) ? records : [];
  const activeRecords = items.filter((record) => {
    if (!record) {
      return false;
    }

    const isActive = record.status === undefined || record.status === "ACTIVE";
    return isActive && (!filterFn || filterFn(record));
  });

  selectElement.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  selectElement.appendChild(placeholderOption);

  activeRecords.forEach((record) => {
    const option = document.createElement("option");
    option.value = record[valueKey] || "";
    option.textContent = record[labelKey] || record[valueKey] || "Unnamed";
    selectElement.appendChild(option);
  });
}

export function initializeAccounts(state = { accounts: [] }) {
  const accountSelect = document.getElementById("accountSelect");
  const accountCount = document.getElementById("accountCount");

  populateSelect(accountSelect, state.accounts, {
    valueKey: "accountId",
    labelKey: "accountName",
    placeholder: "Select an account"
  });

  if (accountCount) {
    accountCount.textContent = String(Array.isArray(state.accounts) ? state.accounts.length : 0);
  }

  console.log("Account module initialized.", state.accounts);
}
