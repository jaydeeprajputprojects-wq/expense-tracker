# US-051 — Implement Frontend Transaction CRUD

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 10 — Frontend Transaction CRUD  
**User Story:** US-051  
**Estimated Effort:** 5 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want to create, view, edit, and delete transactions from the frontend, so that I can manage my personal ledger directly in the application and keep the balance sheet current.

### Acceptance Criteria

1. The user can create a new transaction from the form.
2. The user can list all active transactions in the ledger table.
3. The user can edit an existing transaction from the list.
4. The user can delete a transaction after confirmation.
5. The UI refreshes automatically after save or delete operations.
6. Success and error messages are shown in the app status element.
7. Backend responses are checked before refreshing the UI.
8. The form resets properly after create or update actions.

---

## 2. Business Rule

The frontend is the command layer for the transaction lifecycle. Every save, edit, or delete action must map to the backend API contract and reflect the latest ledger state in the UI. The user experience should feel instant without requiring a page refresh.

The core lifecycle is:

```text
User enters transaction
   |
   v
Frontend validates request
   |
   v
POST/PUT/DELETE API call
   |
   v
Backend processes and returns response
   |
   v
UI refreshes transaction table and balances
   |
   v
Status message shown to user
```

The UI must never show stale data after a successful write.

---

## 3. Technical Responsibility

The frontend transaction module and the API client are responsible for the CRUD flow.

### Required API wrappers

- `createTransaction(payload)`
- `updateTransaction(transactionId, payload)`
- `deleteTransaction(transactionId)`
- `getTransactions()`
- `getTransaction(transactionId)`

### Example API wrapper pattern

```javascript
export async function createTransaction(payload) {
  return apiRequest({
    action: 'CREATE_TRANSACTION',
    payload
  });
}
```

This keeps the UI logic clean and ensures all routes follow the same contract.

---

## 4. Create Flow

### User interaction

1. User fills out the form for an expense, income, or transfer.
2. User clicks Save transaction.
3. Frontend validates the payload.
4. The API client sends the normalized request.
5. The table and summary cards refresh.

### Example create payload

```json
{
  "transactionType": "EXPENSE",
  "transactionDate": "2026-09-23",
  "amount": 450,
  "categoryId": "CAT-001",
  "paymentMethod": "BANK",
  "paidFromAccountId": "ACC-001",
  "notes": "Groceries"
}
```

### Expected result

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transactionId": "TXN-20260923-XYZ123"
  }
}
```

---

## 5. Read Flow

The UI must load transactions via `GET_TRANSACTIONS` on app startup and after each successful mutation.

The transaction row should display:

- date
- type
- category
- payment method or account reference
- amount
- notes
- edit and delete actions

The table supports a clean empty state when no rows are available.

---

## 6. Update Flow

When the user clicks Edit on a transaction row:

1. the UI fetches the transaction by ID
2. the form is populated with the existing values
3. the save button changes to Update transaction
4. the cancel button becomes visible
5. the updated payload is sent to `UPDATE_TRANSACTION`

The update should preserve the original transaction identity and refresh the ledger state immediately.

### Example update request

```json
{
  "transactionId": "TXN-001",
  "transactionType": "EXPENSE",
  "transactionDate": "2026-09-24",
  "amount": 2000,
  "categoryId": "CAT-001",
  "paymentMethod": "BANK",
  "paidFromAccountId": "ACC-001",
  "notes": "Updated household purchase"
}
```

---

## 7. Delete Flow

When the user clicks Delete on a transaction row:

1. a confirmation dialog appears
2. if confirmed, the UI calls `DELETE_TRANSACTION`
3. the backend marks the row logically deleted or removes it according to the backend contract
4. the table and summary refresh automatically

Example confirmation:

```text
Delete this transaction?
```

The delete process must avoid accidental data loss and must still reflect the balance recalculation immediately.

---

## 8. Refresh and Status Behavior

After successful create, update, or delete operations, the app must:

- refresh the list of transactions
- refresh the balance summary cards
- reset the form to the blank create state
- show a success notification

Example message:

```text
Transaction created successfully.
```

Error handling should provide a direct message such as:

```text
Amount must be greater than zero.
```

---

## 9. Frontend Validation Rules

Before sending a request, the frontend must reject invalid transactions with a clear message. Validation should include:

- date required
- amount > 0
- category required
- matching account fields for expense/income/transfer
- no same-account transfer
- payment method required for expense transactions

Example:

```javascript
function validateTransactionPayload(payload) {
  if (!payload.transactionDate) {
    throw new Error('Transaction date is required.');
  }

  if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  if (payload.transactionType === 'TRANSFER' && payload.fromAccountId === payload.toAccountId) {
    throw new Error('From and To accounts cannot be the same.');
  }
}
```

---

## 10. Definition of Done

The story is complete when:

1. create transaction works end-to-end
2. the transaction list loads from backend data
3. edit flow loads existing values correctly
4. delete flow confirms and removes the row safely
5. the frontend refreshes without full page reload
6. status messages reflect create/update/delete outcome
7. balances update after transaction changes

---

## 11. Example CRUD Sequence

```text
User opens frontend
   |
   v
List loads from GET_TRANSACTIONS
   |
   v
User adds sample expense
   |
   v
POST CREATE_TRANSACTION
   |
   v
UI refreshes summary and ledger
   |
   v
User edits transaction
   |
   v
PUT UPDATE_TRANSACTION
   |
   v
User deletes transaction
   |
   v
DELETE TRANSACTION
   |
   v
Final UI state reflects ledger accurately
```

This completes the full transaction lifecycle from the user’s perspective and ensures the frontend matches the backend ledger contract.
