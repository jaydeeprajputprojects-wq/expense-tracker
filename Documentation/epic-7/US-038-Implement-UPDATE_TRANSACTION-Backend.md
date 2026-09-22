# US-038 — Implement UPDATE_TRANSACTION Backend

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — Transaction Update and Read APIs  
**User Story:** US-038  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the backend to update an existing transaction without creating a compensating or duplicate transaction, so that ledger changes remain accurate and the financial impact reflects the latest approved values.

### Acceptance Criteria

1. The backend exposes an UPDATE_TRANSACTION API.
2. The request includes the existing Transaction ID and the new data payload.
3. The existing transaction is found in the Transactions sheet.
4. Missing or blank transaction IDs are rejected.
5. Deleted transactions cannot be updated.
6. Updated transaction data passes backend validation.
7. The original transaction ID remains unchanged.
8. The existing row is updated instead of appending a new record.
9. Created date remains unchanged while Updated Date is refreshed.
10. No compensating transaction is created.
11. Balance calculations reflect the edited record instantly.
12. Concurrent updates are protected using an Apps Script lock.

---

## 2. Business Rule

A transaction update is a direct data mutation of the original legal-finance event. The system does not reverse the old record and create a replacement row; it changes the original row in-place and recalculates the balance engine from the updated ledger state.

The business rule is:

```text
Existing Transaction Row
        ↓
Find row by Transaction_ID
        ↓
Validate updated data
        ↓
Update same row
        ↓
Refresh Updated_Date
        ↓
Recalculate balances
        ↓
Return success
```

This is materially different from create flows, because the transaction identity remains stable while the financial facts change.

---

## 3. Technical Responsibility

The backend update implementation must:

1. accept a `transactionId` and a payload
2. locate the original row in the `Transactions` sheet
3. validate the new values through the authoritative validation layer
4. maintain the original transaction identifier
5. update only editable fields
6. maintain the original `Created_Date`
7. refresh `Updated_Date`
8. avoid any compensating rows
9. protect mutating actions with Apps Script locking

The update route should act as the orchestration point, while `TransactionService.updateTransaction()` contains the actual mutation logic.

---

## 4. API Contract

### Example request payload

```json
{
  "action": "UPDATE_TRANSACTION",
  "transactionId": "TXN-000001",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "20-09-2026",
    "amount": 2000,
    "categoryId": "CAT-001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC-001",
    "notes": "Updated expense"
  }
}
```

### Example success response

```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transactionId": "TXN-000001",
    "transaction": {
      "Transaction_ID": "TXN-000001",
      "Transaction_Date": "20-09-2026",
      "Transaction_Type": "EXPENSE",
      "Amount": 2000,
      "Category_ID": "CAT-001",
      "Payment_Method": "BANK",
      "Paid_From_Account_ID": "ACC-001",
      "Notes": "Updated expense",
      "Created_Date": "2026-09-01",
      "Updated_Date": "2026-09-22T10:12:00.000Z",
      "Status": "ACTIVE"
    }
  }
}
```

---

## 5. Validation Requirements

The updated payload must pass the same transaction validation as a new transaction record.

Validation includes:

- transaction type required and valid
- date in `DD-MM-YYYY` format
- amount > 0 and numeric
- category must exist
- account must exist
- payment method must be valid
- transfer rules must remain valid for transfer transactions
- account-to-payment compatibility must be enforced
- gift-card balance check for gift-card expenses

The update process must not allow a row to be modified to a logically invalid state.

---

## 6. Row Update Logic

The implementation must preserve the original row identity. That means:

- never generate a new `Transaction_ID`
- never append a second transaction row
- update the same row that contains the original transaction
- keep `Created_Date` as-is
- overwrite `Updated_Date` to the current timestamp

Pseudo-code:

```javascript
const currentRecord = findExistingTransactionById(transactionId);

if (!currentRecord) {
  return error('TRANSACTION_NOT_FOUND');
}

if (currentRecord.Status === 'DELETED') {
  return error('TRANSACTION_DELETED');
}

const validation = ValidationService.validateTransaction(updatedPayload);
if (!validation.valid) {
  return error(validation.code, validation.message);
}

const updatedRecord = {
  ...currentRecord,
  ...validation.value,
  Created_Date: currentRecord.Created_Date,
  Updated_Date: new Date(),
  Status: 'ACTIVE'
};

updateRecord('Transactions', rowNumber, updatedRecord);
```

This ensures the account ledger changes without creating compensating records.

---

## 7. Locking and Concurrency Protection

Because transaction updates mutate a shared spreadsheet row, the project requires Apps Script locking to avoid concurrent write collisions.

The expected pattern is:

```javascript
const lock = LockService.getScriptLock();
lock.waitLock(30000);

try {
  const record = findExistingTransactionById(transactionId);
  validateTransaction(updatedPayload);
  updateRecord(...);
} finally {
  lock.releaseLock();
}
```

This prevents two simultaneous requests from writing to the same record at the same time.

---

## 8. Failure Scenarios

The update API must handle the following with clear, standardized errors:

### 8.1 Missing transactionId

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "transactionId is required"
  }
}
```

### 8.2 Transaction not found

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction not found"
  }
}
```

### 8.3 Deleted transaction

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_DELETED",
    "message": "Deleted transactions cannot be updated."
  }
}
```

### 8.4 Invalid update payload

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TRANSACTION_AMOUNT",
    "message": "Transaction amount must be a valid number."
  }
}
```

---

## 9. Balance Impact Rule

The update logic does not insert a reversal or a new row; instead, it updates the original record. This means the balance engine derives the new financial impact from the updated ledger state.

This is the correct model:

```text
Original row -> updated row -> recalculate balances
```

not:

```text
Original row -> reversal row -> new row
```

This is critical for accurate account snapshots and ledger integrity.

---

## 10. Acceptance Check

The story is complete when:

- UPDATE_TRANSACTION is callable
- existing ID is required
- missing transaction returns not-found error
- deleted transaction cannot be updated
- validation is enforced on all changed fields
- original transaction ID is preserved
- the same row is updated, not duplicated
- Created_Date remains unchanged
- Updated_Date is refreshed
- no compensating transaction is created
- account balances reflect the updated row
- concurrent writes are protected with a lock

---

## 11. Implementation Result

The backend now supports a direct transaction update flow that preserves ledger identity, validates updated values, updates the original row in place, refreshes the modification timestamp, and recalculates balances from the latest state without creating any compensating transaction.
