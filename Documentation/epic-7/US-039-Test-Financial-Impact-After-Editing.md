# US-039 — Test Financial Impact After Editing

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — Transaction Update and Read APIs  
**User Story:** US-039  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want to verify that editing an existing transaction changes only the relevant financial impact and does not create duplicate or compensating records, so that the account ledger remains faithful to the latest transaction state.

### Acceptance Criteria

1. A baseline expense transaction is created successfully.
2. A transaction ID is captured for the original record.
3. The expense is updated to a new amount successfully.
4. The same Transaction ID is retained.
5. Only the original transaction remains active.
6. No compensating or additional transaction is created.
7. The additional expense impact is reflected in the account balance.
8. GET_TRANSACTION and GET_TRANSACTIONS return the updated values.
9. The balance API reflects the updated amount.

---

## 2. Test Scenario

### Original transaction

```text
Transaction Type = Expense
Original Amount = ₹1,000
```

### Update transaction

```text
New Amount = ₹2,000
```

### Expected net effect

The account should be impacted by an additional `₹1,000` expense amount after the update.

---

## 3. Test Flow

### Step 1 — Create baseline expense

Create the original expense record.

Example request:

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "20-09-2026",
    "amount": 1000,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Baseline expense"
  }
}
```

Expected outcome:

- expense is created successfully
- `transactionId` is returned
- ledger contains one active expense record

### Step 2 — Retrieve the original transaction

Call:

```text
GET_TRANSACTION
```

Verify:

- `Amount = 1000`
- `Status = ACTIVE`
- `Transaction_ID` matches the created row

### Step 3 — Update the transaction

Call:

```text
UPDATE_TRANSACTION
```

Payload:

```json
{
  "action": "UPDATE_TRANSACTION",
  "transactionId": "TXN-000001",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "20-09-2026",
    "amount": 2000,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Updated expense"
  }
}
```

Expected outcome:

- same `Transaction_ID`
- amount becomes `2000`
- `Updated_Date` changes
- `Created_Date` remains unchanged
- no separate row is appended

### Step 4 — Verify transaction list

Call:

```text
GET_TRANSACTIONS
```

Expected:

- only one active transaction for the target ID
- amount is `2000`
- no duplicate or reversal row appears

### Step 5 — Verify financial impact

If the initial account balance was:

```text
₹10,000
```

Then:

- after original expense of ₹1,000 → ₹9,000
- after updating to ₹2,000 → ₹8,000

The net change after the update is therefore:

```text
additional reduction = ₹1,000
```

This confirms that the ledger reflects the updated amount rather than creating a duplicate or compensating transaction.

---

## 4. Validation Checklist

The test passes only if all of the following are checked:

- original transaction created successfully
- original `Transaction_ID` captured
- update succeeds with new amount
- same Transaction ID retained
- only one active transaction remains for that record
- no compensating transaction present
- no duplicate transaction created
- account balance decreases by the additional ₹1,000
- `GET_TRANSACTION` returns ₹2,000
- `GET_TRANSACTIONS` shows the updated row correctly
- balance API output shows the new ledger snapshot

---

## 5. Acceptance Check

The story is complete when:

- baseline expense record is created
- update changes the amount to ₹2,000
- original ID remains unchanged
- total number of active transaction rows does not increase
- no compensating transaction appears
- final account balance reflects the additional ₹1,000 reduction

---

## 6. Implementation Result

The update flow preserves the transaction identity, updates the same row in place, and ensures the financial impact is reflected solely through the revised ledger state. This is validated by transaction retrieval and balance recalculation after the amount change.
