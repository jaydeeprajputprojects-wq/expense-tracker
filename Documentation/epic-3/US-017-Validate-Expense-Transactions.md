# US-017 — Validate Expense Transactions

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Transaction Management  
**User Story:** US-017  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to validate expense transactions before saving them, so that only valid expenses are accepted and invalid entries are rejected with clear business errors.

### Acceptance Criteria

1. Expense transactions must include a valid transaction date.
2. Expense amount must be a positive number greater than zero.
3. Category ID must exist in the master data.
4. Payment method must be provided.
5. Paid-from account must be provided.
6. The account must exist in the `Accounts` sheet.
7. The paid-from account must match the selected payment method.
8. A valid expense must be returned with normalized values.
9. Invalid data must return the correct error code and message.

---

## 2. Why Expense Validation Is Required

Expense transactions affect cash flow, category-based reporting, and account balances. If an expense is saved with a missing or mismatched account, the application can create inaccurate financial records and distort reporting.

This is especially important because the tracker integrates with account master data and uses payment-method-specific validation rules.

Examples of invalid scenarios:

- expense without date
- amount is zero or negative
- category does not exist
- payment method is blank
- paid-from account is missing
- bank account selected for a credit-card payment

---

## 3. Validation Rules

| Rule | Requirement |
|---|---|
| Transaction date | Required and must be valid `DD-MM-YYYY` |
| Amount | Required and must be > 0 |
| Category | Required and must exist |
| Payment method | Required |
| Paid-from account | Required |
| Account existence | Must exist in master data |
| Account type match | Must match selected payment method |
| Valid expense | Accept |

---

## 4. Business Rules for Payment Methods

The system supports the following payment methods and expected account types:

| Payment Method | Expected Account Type |
|---|---|
| `BANK` | `BANK` |
| `CREDIT_CARD` | `CREDIT_CARD` |
| `GIFT_CARD` | `GIFT_CARD` |

If a user selects a payment method but the account type does not match, the expense is rejected with:

```javascript
INVALID_PAYMENT_METHOD_ACCOUNT
```

---

## 5. Step-by-Step Implementation

### Step 1 — Validate basic transaction data

The validator first checks the request object and transaction type.

```javascript
if (!data || typeof data !== 'object') {
  return {
    valid: false,
    code: 'INVALID_REQUEST',
    message: 'Transaction request is required.'
  };
}
```

Then it validates date and amount using the shared helper functions:

```javascript
var dateValidation = validateTransactionDate(data.transactionDate);
if (!dateValidation.valid) {
  return dateValidation;
}

var amountValidation = validateTransactionAmount(data.amount);
if (!amountValidation.valid) {
  return amountValidation;
}
```

---

### Step 2 — Validate category reference

Expense transactions must refer to a valid category.

```javascript
var categoryValidation = this.validateCategory(data.categoryId);
if (!categoryValidation.valid) {
  return categoryValidation;
}
```

If category lookup fails, the result is one of the category validation errors such as:

- `INVALID_CATEGORY_ID`
- `CATEGORY_NOT_FOUND`

---

### Step 3 — Validate required payment fields

The application requires both the payment method and the account from which funds are paid.

```javascript
if (
  data.paymentMethod === undefined ||
  data.paymentMethod === null ||
  data.paymentMethod === ''
) {
  return {
    valid: false,
    code: 'INVALID_PAYMENT_METHOD',
    message: 'Payment method is required.'
  };
}

if (
  data.paidFromAccountId === undefined ||
  data.paidFromAccountId === null ||
  data.paidFromAccountId === ''
) {
  return {
    valid: false,
    code: 'INVALID_PAID_FROM_ACCOUNT',
    message: 'Paid from account is required.'
  };
}
```

---

### Step 4 — Validate payment method against account type

The code maps payment method to the expected account type using the configuration constants.

```javascript
var paymentMethod = String(data.paymentMethod).trim().toUpperCase();
var expectedAccountType = null;

if (paymentMethod === PAYMENT_METHODS.BANK) {
  expectedAccountType = ACCOUNT_TYPES.BANK;
} else if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
  expectedAccountType = ACCOUNT_TYPES.CREDIT_CARD;
} else if (paymentMethod === PAYMENT_METHODS.GIFT_CARD) {
  expectedAccountType = ACCOUNT_TYPES.GIFT_CARD;
}
```

Then the account is validated using the master-data list:

```javascript
var accountValidation = this.validateAccount(data.paidFromAccountId, expectedAccountType);
if (!accountValidation.valid) {
  if (accountValidation.code === 'ACCOUNT_NOT_FOUND') {
    return accountValidation;
  }

  return {
    valid: false,
    code: 'INVALID_PAYMENT_METHOD_ACCOUNT',
    message: 'Paid from account must match the selected payment method.'
  };
}
```

---

### Step 5 — Return normalized valid expense

When all validations pass, the response returns a normalized object that can be persisted safely.

```javascript
return {
  valid: true,
  value: {
    transactionType: TRANSACTION_TYPES.EXPENSE,
    transactionDate: dateValidation.value,
    amount: amountValidation.value,
    categoryId: categoryValidation.value.Category_ID,
    paymentMethod: paymentMethod,
    paidFromAccountId: data.paidFromAccountId,
    notes: data.notes || ''
  }
};
```

---

## 6. Example Scenarios

### Valid expense

```javascript
ValidationService.validateExpense({
  transactionDate: '21-09-2026',
  amount: '100',
  categoryId: 'CAT001',
  paymentMethod: 'BANK',
  paidFromAccountId: 'ACC001'
});
```

Result:

```javascript
{
  valid: true,
  value: {
    transactionType: 'EXPENSE',
    transactionDate: '21-09-2026',
    amount: 100,
    categoryId: 'CAT001',
    paymentMethod: 'BANK',
    paidFromAccountId: 'ACC001',
    notes: ''
  }
}
```

### Invalid payment method/account mismatch

```javascript
ValidationService.validateExpense({
  transactionDate: '21-09-2026',
  amount: '100',
  categoryId: 'CAT001',
  paymentMethod: 'CREDIT_CARD',
  paidFromAccountId: 'ACC001'
});
```

Result:

```javascript
{
  valid: false,
  code: 'INVALID_PAYMENT_METHOD_ACCOUNT',
  message: 'Paid from account must match the selected payment method.'
}
```

---

## 7. Implementation Location

The expense validation logic belongs in:

```javascript
ValidationService.validateExpense(data)
```

This logic is implemented in `ValidationService.gs` and is invoked through the transaction router:

```javascript
if (normalizedType === TRANSACTION_TYPES.EXPENSE) {
  return this.validateExpense(data);
}
```

---

## 8. Acceptance Check

The story is complete when all of the following pass:

- valid expense with matching account and payment method is accepted
- invalid payment method is rejected
- missing paid-from account is rejected
- missing category is rejected
- invalid account ID is rejected
- valid normalized response is returned for a correct expense

---

## 9. Implementation Result

The business logic has been implemented and validated in the Apps Script runtime. The validation suite confirms that valid expense creation succeeds and mismatched account/payment combinations are correctly rejected.
