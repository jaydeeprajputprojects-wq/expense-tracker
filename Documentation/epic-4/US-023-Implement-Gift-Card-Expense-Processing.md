# US-023 — Implement Gift Card Expense Processing

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-023  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want gift-card expenses to reduce the available gift-card balance and reject overspending, so that the ledger reflects valid gift-card usage without allowing negative balances.

### Acceptance Criteria

1. A valid gift-card expense is accepted when the payment method is `GIFT_CARD`.
2. The paid-from account matches the `GIFT_CARD` account type.
3. The gift-card balance is checked before saving.
4. The expense is saved successfully when sufficient balance exists.
5. The system rejects the transaction when the balance is insufficient.
6. The transaction must not be recorded if the required balance is not available.

---

## 2. Business Rule

A gift card represents stored value. When it is used for payment, the available balance must decrease by the expense amount.

Example:

```text
Amazon Gift Card → Merchant
₹1,000
```

Expected financial impact:

```text
Expense +₹1,000
Gift Card Balance -₹1,000
```

If balance is not enough, the transaction must be rejected.

---

## 3. Insufficient Balance Validation

The implementation checks the current gift-card balance before accepting the expense.

```javascript
if (paymentMethod === PAYMENT_METHODS.GIFT_CARD) {
  var giftCardBalance = Number(accountValidation.value.openingBalance || 0);
  var requestedAmount = Number(amountValidation.value);

  if (giftCardBalance < requestedAmount) {
    return {
      valid: false,
      code: 'INSUFFICIENT_GIFT_CARD_BALANCE',
      message: 'Gift card balance is insufficient for this transaction.'
    };
  }
}
```

This rule prevents spending more than the stored value on the gift card.

---

## 4. Example Valid Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 1000,
    "categoryId": "CAT001",
    "paymentMethod": "GIFT_CARD",
    "paidFromAccountId": "ACC003",
    "notes": "Amazon purchase"
  }
}
```

If the gift card opening balance is `₹1,500`, this expense is valid.

---

## 5. Example Invalid Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 1500,
    "categoryId": "CAT001",
    "paymentMethod": "GIFT_CARD",
    "paidFromAccountId": "ACC003",
    "notes": "Overspend attempt"
  }
}
```

If `ACC003` has a balance of `₹1,000`, the transaction is rejected with:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_GIFT_CARD_BALANCE",
    "message": "Gift card balance is insufficient for this transaction."
  }
}
```

---

## 6. Error Classification

This is a distinct validation error, not a generic server failure. It ensures that the UI can direct the user to a specific business issue: gift-card balance exhaustion.

---

## 7. Acceptance Check

The story is complete when:

- a gift-card expense with sufficient balance is accepted
- a gift-card expense with insufficient balance is rejected
- the balance must be checked against the selected gift card account
- the transaction is stored as `EXPENSE` only when valid

---

## 8. Implementation Result

The backend validates gift-card expenses and prevents overspending by rejecting any expense whose value exceeds the gift-card balance.
