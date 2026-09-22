# US-050 — Implement Dynamic Transaction Form

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 9 — Dynamic Transaction Form  
**User Story:** US-050  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want a single transaction form that changes dynamically by transaction type, so that I can enter the correct fields for an expense, income, or transfer without confusion or invalid data entry.

### Acceptance Criteria

1. The transaction form supports `EXPENSE`, `INCOME`, and `TRANSFER` modes.
2. The form displays only the fields relevant to the selected transaction type.
3. Expense entries show payment method and paid-from account fields.
4. Income entries show received-into account fields.
5. Transfer entries show from-account and to-account fields.
6. The default transaction type is `EXPENSE`.
7. The form resets cleanly when the user cancels or completes a save.
8. Form values are mapped into the API payload required by the backend.

---

## 2. Business Rule

A transaction form is type-driven. The user selects a type, and the system decides which fields are necessary and which are hidden. This reduces errors, creates a better user experience, and ensures the payload matches the backend contract exactly.

The dynamic behavior is:

```text
Select transaction type
   |
   v
Set form visibility rules
   |
   v
Populate relevant account dropdowns
   |
   v
Validate required fields
   |
   v
Submit normalized payload
```

The form must never send non-relevant fields as if they were valid business data.

---

## 3. Technical Responsibility

The frontend transaction module is responsible for:

- toggling visible form sections
- controlling default values
- loading account data into selects
- populating form state for edit mode
- building the outbound transaction payload
- validating required fields before submit

The core functions should look like:

```javascript
export function setFieldVisibility(type) {
  const isExpense = type === 'EXPENSE';
  const isIncome = type === 'INCOME';
  const isTransfer = type === 'TRANSFER';

  document.getElementById('field-paymentMethod').classList.toggle('hidden', !isExpense);
  document.getElementById('field-paidFrom').classList.toggle('hidden', !isExpense);
  document.getElementById('field-receivedInto').classList.toggle('hidden', !isIncome);
  document.getElementById('field-transferFrom').classList.toggle('hidden', !isTransfer);
  document.getElementById('field-transferTo').classList.toggle('hidden', !isTransfer);
}
```

This keeps the UI rendering logic separate from business validation and API submission.

---

## 4. Form State Contract

### Expense payload fields

```json
{
  "transactionType": "EXPENSE",
  "transactionDate": "2026-09-23",
  "amount": 2500,
  "categoryId": "CAT-001",
  "paymentMethod": "BANK",
  "paidFromAccountId": "ACC-001",
  "notes": "Household groceries"
}
```

### Income payload fields

```json
{
  "transactionType": "INCOME",
  "transactionDate": "2026-09-23",
  "amount": 12000,
  "categoryId": "CAT-006",
  "receivedIntoAccountId": "ACC-002",
  "notes": "Salary"
}
```

### Transfer payload fields

```json
{
  "transactionType": "TRANSFER",
  "transactionDate": "2026-09-23",
  "amount": 3000,
  "fromAccountId": "ACC-001",
  "toAccountId": "ACC-003",
  "notes": "Move funds between accounts"
}
```

---

## 5. Account Filtering Rules

Account dropdowns must be filtered based on transaction type and business compatibility.

### Expense rules

- payment method must be selected
- only compatible account types are shown for the selected payment method
- the paid-from dropdown must show a valid account list

### Income rules

- only active accounts eligible for receiving money are available
- only the relevant account list is shown

### Transfer rules

- the from and to accounts must be valid active accounts
- the same account must not be selected for both sides

---

## 6. Validation Requirements

Before a form can be submitted, the frontend must validate:

- date is not blank
- amount is numeric and greater than zero
- category is selected
- payment method is selected for expenses
- source/destination accounts are selected where required
- transfer source and destination are not the same

Example validation function:

```javascript
function validateTransactionPayload(payload) {
  if (!payload.transactionDate) {
    throw new Error('Transaction date is required.');
  }

  if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  if (payload.transactionType === 'EXPENSE' && !payload.paidFromAccountId) {
    throw new Error('Paid from account is required.');
  }
}
```

---

## 7. Edit Mode Logic

When the user clicks Edit on a transaction row:

1. the transaction is fetched by ID
2. the form is populated with existing values
3. the transaction type is selected automatically
4. the relevant fields are shown
5. the save button changes to "Update transaction"
6. cancel button becomes available

This is the same form but in a pre-filled editing state instead of a blank create state.

---

## 8. UI Behavior Scenarios

### 8.1 Create expense

- user selects `EXPENSE`
- payment method and transfer fields appear
- account list filters to valid expense accounts
- form saves backend payload with `paymentMethod` and `paidFromAccountId`

### 8.2 Create income

- user selects `INCOME`
- income fields appear
- received-into account is required

### 8.3 Create transfer

- user selects `TRANSFER`
- from and to account fields appear
- validation rejects identical account selection

---

## 9. Definition of Done

The story is complete when:

1. the form responds correctly to transaction-type changes
2. only the correct fields are visible
3. dropdown filtering works for all transaction types
4. validation blocks invalid submissions
5. payload creation matches the backend API contract
6. edit mode and reset mode both work correctly

---

## 10. Example Transaction Form Flow

```text
User opens form
   |
   v
Select EXPENSE
   |
   v
Payment Method and Paid From fields appear
   |
   v
User chooses account and category
   |
   v
Frontend builds payload
   |
   v
API receives valid transaction object
``` 
