# US-021 — Implement Bank Expense Processing

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-021  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want bank expenses to reduce the source account balance correctly, so that the ledger reflects real cash outflow and expense totals remain accurate.

### Acceptance Criteria

1. A valid bank expense is accepted when the payment method is `BANK`.
2. The selected account matches the `BANK` account type.
3. The expense amount is recorded as an expense.
4. The bank account value decreases by the expense amount.
5. The system rejects invalid bank-expense requests.

---

## 2. Business Rule

A bank expense represents money leaving a bank account to purchase a product or service.

Example:

```text
SBI → Merchant
₹2,000
```

Expected financial impact:

```text
Expense +₹2,000
Bank -₹2,000
```

This is treated as a real consumption entry rather than a transfer.

---

## 3. Validation Logic

The payment method is validated against the account type before the expense is saved.

```javascript
var paymentMethod = String(data.paymentMethod).trim().toUpperCase();
var expectedAccountType = null;

if (paymentMethod === PAYMENT_METHODS.BANK) {
  expectedAccountType = ACCOUNT_TYPES.BANK;
}
```

The validation then checks:

```javascript
var accountValidation = this.validateAccount(data.paidFromAccountId, expectedAccountType);
```

This ensures the account used for payment is an actual bank account and not a credit card or gift card.

---

## 4. Persistence Impact

A valid bank expense is stored as:

```javascript
Transaction_Type: 'EXPENSE'
Payment_Method: 'BANK'
Paid_From_Account_ID: 'ACC001'
Amount: 2000
```

The financial engine applies the business rule that the bank source loses money while expense totals increase.

---

## 5. Example Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "EXPENSE",
    "transactionDate": "21-09-2026",
    "amount": 2000,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Groceries"
  }
}
```

### Expected meaning

- source account: `ACC001`
- payment method: `BANK`
- category: `CAT001`
- expense value: `₹2,000`
- resulting bank balance: decreased by `2,000`

---

## 6. Errors This Rule Rejects

Examples of invalid conditions:

- `paymentMethod = BANK` but account is a credit card
- missing paid-from account
- invalid account ID
- zero or negative amount
- invalid transaction date

These errors are surfaced through the standardized validation response layer.

---

## 7. Acceptance Check

The story is complete when:

- bank expense requests validate successfully for bank accounts
- mismatched bank-account validation fails
- the transaction is stored as an `EXPENSE`
- the resulting financial effect is a decrease in bank balance and an increase in expense total

---

## 8. Implementation Result

The backend currently validates bank expenses through the shared expense rule and persists the transaction with the correct account linkage and expense classification.
