# US-049 — Implement Frontend Application Initialization

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 8 — Frontend Transaction Application  
**User Story:** US-049  
**Estimated Effort:** 3 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to initialize correctly on load, so that the dashboard, master-data dropdowns, balances, and transaction list are ready for use without manual setup or broken UI state.

### Acceptance Criteria

1. The frontend loads when the page is opened.
2. The initialization sequence loads master data from the Apps Script backend.
3. Accounts, categories, and configuration values are stored in app state.
4. The key UI elements are rendered before the transaction form becomes interactive.
5. The balance summary and transaction list are refreshed after initialization.
6. Errors are visible in the app status bar when the backend request fails.
7. The app can be refreshed without reloading the page.

---

## 2. Business Rule

The frontend is a thin client over the Apps Script API layer. During startup, it must establish the shared state required by all transaction operations before any user interaction begins.

The required startup sequence is:

```text
Open page
   |
   v
Load master data
   |
   v
Populate accounts, categories, and config
   |
   v
Load transactions
   |
   v
Load balances
   |
   v
Render summary cards and table
   |
   v
Set app status message
```

This ensures that the user never sees empty or invalid dropdowns, and that summary cards reflect the latest backend state on first render.

---

## 3. Technical Responsibility

The frontend application shell is responsible for orchestrating the startup lifecycle. The implementation should keep state management centralized and separate the concerns of:

- API access
- master-data loading
- transaction loading
- balance rendering
- form initialization
- UI status messaging

The expected structure is:

```javascript
export const appState = {
  accounts: [],
  categories: [],
  configuration: [],
  transactions: [],
  balances: [],
  isLoading: false,
  error: null
};

export async function initializeUI() {
  appState.isLoading = true;
  updateStatus('Loading master data...', 'info');

  const masterData = await loadMasterData();
  appState.accounts = masterData.accounts;
  appState.categories = masterData.categories;
  appState.configuration = masterData.configuration;

  initializeAccounts(appState);
  initializeTransactions(appState);

  appState.transactions = await loadTransactions();
  appState.balances = await loadBalances();

  renderBalanceSummary();
  renderTransactionTable();
}
```

This preserves a clear one-way data flow: API -> app state -> rendering.

---

## 4. Startup Data Contract

The frontend relies on the backend action contract for master data and list retrieval.

### Required backend actions

- `GET_MASTER_DATA`
- `GET_TRANSACTIONS`
- `GET_BALANCES`

### Expected response shape

```json
{
  "success": true,
  "message": "Master data loaded successfully",
  "data": {
    "accounts": [],
    "categories": [],
    "configuration": []
  }
}
```

The UI must treat missing or malformed arrays as safe empty collections rather than crashing the app.

---

## 5. UI Requirements

### 5.1 Summary cards

The initialization routine should populate the dashboard summary cards:

- total balance
- total income
- total expense

### 5.2 Transaction list

The page should render a transaction table immediately after successful load. If no transactions exist, the UI should show a friendly empty-state row.

### 5.3 Status messaging

A visible status element must inform the user about loading and success/error outcomes.

Example:

```text
Loading master data from Google Apps Script...
```

and later:

```text
Master data loaded successfully. Transaction dropdowns are ready.
```

---

## 6. Error Handling

The app should gracefully handle the following startup failures:

- backend not deployed or temporarily unavailable
- malformed JSON response
- missing data arrays
- network rejection or HTTP error

Behavior:

```javascript
try {
  const masterData = await loadMasterData();
} catch (error) {
  appState.error = error.message;
  updateStatus(error.message, 'error');
}
```

The app should continue safely without throwing unhandled exceptions that break the page.

---

## 7. Refresh Pattern

To avoid hard page reloads, the app must expose a refresh method that re-initializes the UI.

Example:

```javascript
window.financeAppRefresh = () => initializeUI();
```

This allows the form and list to refresh after save, update, or delete flows without leaving the page.

---

## 8. Definition of Done

The story is complete when:

1. the page boots without console errors
2. master data loads and populates dropdowns
3. balance cards render correctly
4. the transaction table renders from backend data
5. the app status bar provides informative feedback
6. page refresh logic works without reloading the entire browser page

---

## 9. Example UI Flow

```text
Page opens
   |
   v
initializeUI()
   |
   v
fetch GET_MASTER_DATA
   |
   v
populate account/category config
   |
   v
fetch GET_TRANSACTIONS and GET_BALANCES
   |
   v
render summary + ledger
   |
   v
user can transact
```

This startup sequence is the foundation for all later frontend transaction workflows.
