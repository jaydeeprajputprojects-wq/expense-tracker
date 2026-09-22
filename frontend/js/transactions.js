export function initializeTransactions(state = { categories: [] }) {
  const categorySelect = document.getElementById("categorySelect");
  const categoryCount = document.getElementById("categoryCount");
  const typeSelect = document.getElementById("transactionType");

  if (categorySelect) {
    const categories = Array.isArray(state.categories) ? state.categories : [];
    const optionList = categories.filter((category) => category && (category.status === undefined || category.status === "ACTIVE"));

    categorySelect.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select a category";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    categorySelect.appendChild(placeholderOption);

    optionList.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.categoryId || "";
      option.textContent = category.categoryName || category.categoryId || "Unnamed";
      categorySelect.appendChild(option);
    });
  }

  if (categoryCount) {
    categoryCount.textContent = String(Array.isArray(state.categories) ? state.categories.length : 0);
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      const selectedType = typeSelect.value;
      const label = selectedType === "EXPENSE" ? "Expense category" : selectedType === "INCOME" ? "Income category" : "Transfer category";
      const categoryLabel = document.getElementById("categoryLabel");

      if (categoryLabel) {
        categoryLabel.textContent = label;
      }
    });
  }

  console.log("Transaction module initialized.", state.categories);
}
