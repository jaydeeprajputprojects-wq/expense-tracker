# US-047 — Test Delete API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-047  
**Status:** Detailed test specification

---

## Objective

Validate logical deletion and financial reversal for active transactions.

## Primary Flow

```text
Create Expense
      ↓
GET_TRANSACTION
      ↓
DELETE_TRANSACTION
      ↓
GET_TRANSACTIONS
      ↓
GET_BALANCES
```

## Sample Delete Request

```json
{
  "action": "DELETE_TRANSACTION",
  "transactionId": "TXN-20260921-EXP-001"
}
```

## Additional Delete Cases

- delete non-existing transaction
- delete already deleted transaction
- delete different transaction types

## Test Flow

1. Create a valid expense.
2. Retrieve the transaction for confirmation.
3. Delete it using `DELETE_TRANSACTION`.
4. Confirm status becomes `DELETED`.
5. Confirm row remains in sheet.
6. Confirm the transaction is not returned by GET_TRANSACTIONS.
7. Confirm balance returns to the pre-transaction value.
8. Confirm repeated delete is rejected safely.

## Acceptance Criteria

- [ ] Active transaction can be deleted
- [ ] Status becomes `DELETED`
- [ ] Row is not physically removed
- [ ] Transaction excluded from active retrieval
- [ ] Transaction excluded from balance calculation
- [ ] Balance is restored correctly
- [ ] Non-existent ID returns not-found
- [ ] Repeated delete is handled safely
- [ ] No compensating transaction is created
- [ ] Collection test passes

---

## Financial Rule

Logical deletion removes the item from active ledger calculations without destroying historical data.
