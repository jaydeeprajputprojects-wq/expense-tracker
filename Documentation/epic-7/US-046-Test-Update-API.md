# US-046 — Test Update API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-046  
**Status:** Detailed test specification

---

## Objective

Validate that `UPDATE_TRANSACTION` modifies an existing transaction without creating a duplicate or compensating transaction.

## Primary Flow

```text
Create Expense ₹1,000
        ↓
Update Expense ₹2,000
        ↓
GET_TRANSACTION
        ↓
GET_BALANCES
```

## Sample Update Payload

```json
{
  "action": "UPDATE_TRANSACTION",
  "transactionId": "TXN-20260921-EXP-001",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 2200,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Updated grocery expense"
  }
}
```

## Additional Update Cases

- amount changed
- date changed
- category changed
- account changed
- notes changed
- invalid payload
- non-existent transaction ID
- deleted transaction ID

## Test Flow

1. Create an initial expense.
2. Update the amount and notes.
3. Verify `Transaction_ID` remains unchanged.
4. Confirm `Created_Date` is preserved.
5. Confirm `Updated_Date` changes.
6. Confirm only one row is updated.
7. Confirm balance reflects the new financial impact.
8. Confirm invalid or deleted IDs are rejected.

## Acceptance Criteria

- [ ] Existing transaction can be updated
- [ ] Transaction ID remains unchanged
- [ ] Existing row is updated
- [ ] No duplicate transaction is created
- [ ] No compensating transaction is created
- [ ] Updated amount is reflected
- [ ] Updated category/account data is reflected
- [ ] `Updated_Date` changes
- [ ] `Created_Date` remains unchanged
- [ ] Balance reflects new data
- [ ] Invalid update is rejected
- [ ] Unknown ID returns not-found
- [ ] Deleted transaction cannot be updated as active
- [ ] Test passes in collection

---

## Financial Rule

Editing a transaction must be treated as an in-place update of the same ledger entry, not as a delete + create pair.
