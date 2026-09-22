# US-043 — Test Expense APIs

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-043  
**Status:** Detailed test specification

---

## Objective

Validate the Expense API flow end-to-end and ensure financial behavior is correct for each supported expense type.

## Primary Flow

```text
Create Expense
      ↓
GET_TRANSACTION
      ↓
GET_TRANSACTIONS
      ↓
GET_BALANCES
```

## Sample Scenarios

### 1. Bank Expense

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 1200,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Groceries"
  }
}
```

### 2. Credit Card Expense

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 3500,
    "categoryId": "CAT002",
    "paymentMethod": "CREDIT_CARD",
    "paidFromAccountId": "ACC002",
    "notes": "Hotel booking"
  }
}
```

### 3. Gift Card Expense

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 500,
    "categoryId": "CAT001",
    "paymentMethod": "GIFT_CARD",
    "paidFromAccountId": "ACC003",
    "notes": "Gift card usage"
  }
}
```

## Negative Cases

- invalid amount
- invalid date
- missing category
- invalid account
- invalid payment method/account combination

## Test Flow

1. Create a valid bank expense.
2. Retrieve the created transaction by ID.
3. Confirm it appears in active transactions.
4. Confirm bank balance decreases.
5. Repeat for credit-card expense and gift-card expense.
6. Trigger validation failures and confirm standard errors.

## Acceptance Criteria

- [ ] Valid bank expense is created
- [ ] Valid credit-card expense is created
- [ ] Valid gift-card expense is created
- [ ] Transaction ID is returned
- [ ] Expense is stored as `ACTIVE`
- [ ] Expense appears in GET_TRANSACTIONS
- [ ] Bank expense reduces bank balance
- [ ] Credit-card expense increases outstanding
- [ ] Gift-card expense reduces gift-card balance
- [ ] Invalid requests are rejected
- [ ] Standardized error body is returned
- [ ] Postman test passes

---

## Expected Financial Rule

- Bank expense reduces source bank account.
- Credit-card expense increases outstanding for the card.
- Gift-card expense consumes gift-card balance.
- Expense is only counted as expense when value is consumed.
