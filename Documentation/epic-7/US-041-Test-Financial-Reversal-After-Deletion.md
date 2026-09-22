# US-041 — Test Financial Reversal After Deletion

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — Transaction Update and Delete APIs  
**User Story:** US-041  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want to confirm that deleting an expense removes its financial impact and restores the account balance, so that the ledger remains consistent after a transaction is removed from active processing.

### Acceptance Criteria

1. Opening account balance is captured.
2. An expense is created successfully.
3. The expense reduces the account balance to the expected value.
4. The expense is active before deletion.
5. Delete operation marks the transaction as `DELETED`.
6. The transaction row remains in the sheet.
7. Deleted transaction is absent from GET_TRANSACTIONS.
8. Deleted transaction is excluded from balance calculation.
9. Account balance returns to the pre-expense value.
10. No compensating transaction is created.

---

## 2. Test Scenario

### Initial conditions

```text
Opening account balance = ₹10,000
Expense = ₹2,000
```

### Expected after creating expense

```text
Account balance = ₹8,000
```

### Expected after deleting expense

```text
Account balance = ₹10,000
```

---

## 3. Test Flow

### Step 1 — Capture starting balance

Read the balance before the transaction is created.

Example:

```text
Opening = ₹10,000
```

### Step 2 — Create expense

Request:

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "20-09-2026",
    "amount": 2000,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Deletion reversal scenario"
  }
}
```

Expected result:

- transaction is created successfully
- account balance decreases to `₹8,000`
- transaction status remains `ACTIVE`

### Step 3 — Retrieve transaction

Call:

```text
GET_TRANSACTION
```

Verify:

- `Status = ACTIVE`
- `Amount = 2000`
- transaction is available for read operations

### Step 4 — Delete transaction

Request:

```json
{
  "action": "DELETE_TRANSACTION",
  "transactionId": "TXN-000001"
}
```

Expected result:

- response indicates successful logical delete
- `Status` becomes `DELETED`
- `Updated_Date` is refreshed
- row remains stored in the sheet

### Step 5 — Verify active transaction list

Call:

```text
GET_TRANSACTIONS
```

Expected:

- deleted transaction is not returned
- only active transactions remain in the list

### Step 6 — Verify balance reversal

Call:

```text
GET_BALANCES
```

Expected:

```text
Account balance = ₹10,000
```

This confirms the delete logic removes the transaction from active balance calculations.

---

## 4. Validation Checklist

The test passes only if all of the following are true:

- opening balance is captured
- expense is created successfully
- expense reduces account balance to ₹8,000
- transaction is active before deletion
- DELETE_TRANSACTION succeeds
- transaction row remains in the sheet
- `Status = DELETED`
- deleted transaction is absent from active reads
- deleted transaction is absent from balance logic
- account balance is restored to ₹10,000
- no additional compensating transaction is created

---

## 5. Acceptance Check

The story is complete when:

- the expense reduces the opening balance correctly
- the delete operation changes status to `DELETED`
- the row remains in the Transactions sheet
- active transaction queries no longer include it
- balance reports reflect the restored account value
- no physical row deletion occurs

---

## 6. Implementation Result

The delete flow restores the financial state by excluding the transaction from active calculations while preserving its row for auditability. This gives the application the expected logical-deletion behavior without creating compensating ledger entries.
