# US-022 — Implement Credit Card Expense Processing

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-022  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want credit-card expenses to increase the card outstanding correctly, so that credit-card usage is reflected without misclassifying the transaction as a transfer.

### Acceptance Criteria

1. A valid expense with `paymentMethod = CREDIT_CARD` is accepted.
2. The paid-from account matches the `CREDIT_CARD` account type.
3. The transaction is saved as an expense.
4. The credit-card outstanding increases by the expense amount.
5. Invalid credit-card expense requests are rejected.

---

## 2. Business Rule

A credit-card expense does not represent a transfer. It represents consumption on the credit card.

Example:

```text
ICICI Credit Card → Merchant
₹10,000
```

Expected financial impact:

```text
Expense +₹10,000
Credit Card Outstanding +₹10,000
```

---

## 3. Validation Rule

The system maps the payment method to the expected account type:

```javascript
else if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
  expectedAccountType = ACCOUNT_TYPES.CREDIT_CARD;
}
```

This ensures that a paid-from account like `ACC002` is checked against the credit-card account type before the expense can be stored.

---

## 4. Example Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 10000,
    "categoryId": "CAT001",
    "paymentMethod": "CREDIT_CARD",
    "paidFromAccountId": "ACC002",
    "notes": "Hotel booking"
  }
}
```

### Expected effect

- the transaction is saved as `EXPENSE`
- the source is a valid credit-card account
- credit-card outstanding increases by `₹10,000`

---

## 5. Validation Failures

The following conditions are rejected:

- credit-card payment method but account is not a `CREDIT_CARD`
- missing payment method
- invalid date
- amount ≤ 0
- invalid category
- missing paid-from account

The user receives a validation error with the relevant code, such as:

```javascript
INVALID_PAYMENT_METHOD_ACCOUNT
```

---

## 6. Acceptance Check

The story is complete when:

- credit-card expenses validate correctly for a matching credit-card account
- mismatched credit-card account validation fails
- the transaction record is persisted as `EXPENSE`
- the credit-card outstanding is increased by the transaction amount

---

## 7. Implementation Result

The backend validates credit-card expense requests through the shared transaction validation path and stores the transaction as a real expense linked to a valid credit card account.
