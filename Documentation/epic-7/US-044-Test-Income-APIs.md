# US-044 — Test Income APIs

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-044  
**Status:** Detailed test specification

---

## Objective

Validate income creation, retrieval, and balance impact.

## Primary Flow

```text
Create Income
      ↓
GET_TRANSACTION
      ↓
GET_TRANSACTIONS
      ↓
GET_BALANCES
```

## Sample Valid Income

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "INCOME",
    "transactionDate": "22-09-2026",
    "amount": 60000,
    "categoryId": "CAT003",
    "receivedIntoAccountId": "ACC001",
    "notes": "September salary"
  }
}
```

## Negative Cases

- missing amount
- zero amount
- negative amount
- invalid date
- invalid receiving account
- invalid category

## Test Flow

1. Create valid income.
2. Validate transaction ID is created.
3. Retrieve the created record and verify `ACTIVE` status.
4. Confirm it appears in transaction list.
5. Confirm receiving account balance increases accordingly.
6. Validate all invalid inputs are rejected with standard messages.

## Acceptance Criteria

- [ ] Valid income is created
- [ ] Income receives a valid transaction ID
- [ ] Income is stored as `ACTIVE`
- [ ] Income appears in active transaction list
- [ ] Receiving account balance increases correctly
- [ ] Invalid amount is rejected
- [ ] Invalid date is rejected
- [ ] Invalid category is rejected
- [ ] Invalid receiving account is rejected
- [ ] Balance API reflects income impact
- [ ] Test passes in the collection

---

## Financial Rule

Income must increase the destination account and must not be counted as a transfer or expense.
