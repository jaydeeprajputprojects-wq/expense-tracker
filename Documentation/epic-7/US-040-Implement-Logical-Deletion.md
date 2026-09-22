# US-040 — Implement Logical Deletion

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — Transaction Update and Delete APIs  
**User Story:** US-040  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want a transaction to be deleted logically rather than physically removed, so that historical data remains available while the transaction no longer affects active balances or active transaction lists.

### Acceptance Criteria

1. The backend exposes a DELETE_TRANSACTION API.
2. The request includes an existing transaction ID.
3. The transaction is located in the Transactions sheet.
4. Missing or blank transaction IDs are rejected.
5. Non-existent transactions return a not-found error.
6. Active transactions can be logically deleted.
7. Deleted transactions keep their original row and historical data.
8. Status changes to `DELETED`.
9. Updated Date is refreshed.
10. Deleted transactions are excluded from active retrieval.
11. Deleted transactions are excluded from balance calculations.
12. No physical row deletion occurs.
13. The API returns a successful logical-deletion response.

---

## 2. Business Rule

Logical deletion is a soft-delete pattern. The transaction row remains in the spreadsheet, preserving the audit trail, but the record is marked as `DELETED` so it is no longer considered active by business logic.

This is the expected process:

```text
DELETE_TRANSACTION
   |
   v
Find transaction by Transaction_ID
   |
   v
Validate existence and current state
   |
   v
Set Status = DELETED
   |
   v
Update Updated_Date
   |
   v
Keep row in sheet for audit/history
   |
   v
Exclude from active reads and balances
```

Important: the system must not call `deleteRow()` or physically remove the record.

---

## 3. Technical Responsibility

The delete workflow is split between the API layer and the service layer.

The API route must:

- read the `transactionId` from the request payload
- reject blank or missing values
- call the service method
- translate service errors to the standard project response

The service must:

- locate the transaction by transaction ID
- reject missing records
- reject duplicate logical deletion if already marked `DELETED`
- update only the necessary fields
- preserve the original row and historical values
- protect the mutation with LockService

---

## 4. API Contract

### Request example

```json
{
  "action": "DELETE_TRANSACTION",
  "transactionId": "TXN-000001"
}
```

### Success response

```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "transactionId": "TXN-000001",
    "transaction": {
      "Transaction_ID": "TXN-000001",
      "Transaction_Type": "EXPENSE",
      "Transaction_Date": "20-09-2026",
      "Amount": 2000,
      "Category_ID": "CAT001",
      "Payment_Method": "BANK",
      "Paid_From_Account_ID": "ACC001",
      "Status": "DELETED",
      "Updated_Date": "2026-09-22T10:15:00.000Z"
    }
  }
}
```

### Invalid request response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "transactionId is required"
  }
}
```

### Not-found response

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction not found"
  }
}
```

---

## 5. Update Rules for Logical Delete

When deleting a transaction, the row remains but becomes logically inactive.

The implementation must only change:

- `Status = DELETED`
- `Updated_Date = current timestamp`

The following values must remain unchanged:

- `Transaction_ID`
- `Transaction_Type`
- `Transaction_Date`
- `Amount`
- `Category_ID`
- `Payment_Method`
- `Paid_From_Account_ID`
- `Received_Into_Account_ID`
- `From_Account_ID`
- `To_Account_ID`
- `Notes`
- `Created_Date`

This ensures historical and audit data remains intact while the record is removed from active processing.

---

## 6. Active-Record Filtering

The logic for active reads must exclude `Status = DELETED` records globally.

That means:

- `GET_TRANSACTIONS` does not return deleted rows
- `GET_TRANSACTION` does not return deleted rows
- balance calculations ignore deleted rows

This is the core rule behind the soft-delete design.

---

## 7. Balance Impact

A logically deleted transaction must stop contributing to financial totals.

This means the balance engine simply sees the record as inactive and excludes it.

```text
Status = DELETED
    ↓
Ignored in balance calculations
    ↓
Account returns to prior state
```

No compensating journal is required, because the deleted transaction is removed from the active ledger model instead of physically deleted.

---

## 8. Locking and Concurrency Protection

The delete action mutates spreadsheet state and must run under a lock.

Expected pattern:

```javascript
const lock = LockService.getScriptLock();
lock.waitLock(30000);

try {
  const record = find transaction by ID;
  validate not already deleted;
  update row status to DELETED;
} finally {
  lock.releaseLock();
}
```

This prevents two requests from deleting or editing the same row at the same time.

---

## 9. Acceptance Check

The story is complete when:

- DELETE_TRANSACTION route is available
- transaction ID is required
- existing transaction can be deleted logically
- non-existent transaction returns not-found error
- active records are updated to `DELETED`
- row remains in the sheet
- `Updated_Date` changes
- deleted records disappear from active transaction reads
- deleted records do not affect balance totals
- no physical row deletion occurs

---

## 10. Implementation Result

The backend now supports logical deletion for transactions. Deleted transactions remain in the ledger for historical traceability, while being excluded from active transaction reads and balance calculations through the standard status-based filtering rules.
