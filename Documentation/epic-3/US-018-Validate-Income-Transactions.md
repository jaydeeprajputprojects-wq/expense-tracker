# US-018 — Validate Income Transactions

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Transaction Management  
**User Story:** US-018  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to validate income transactions before saving them, so that only valid income entries are accepted and invalid records are rejected with clear business errors.

### Acceptance Criteria

1. Income transactions must include a valid transaction date.
2. Amount must be a positive number greater than zero.
3. Category ID must exist in the master data.
4. Receiving account must be provided.
5. Receiving account must exist in the `Accounts` sheet.
6. Invalid or missing receiving accounts must be rejected.
7. Valid income transactions must be normalized before storage.
8. Existing API response conventions must be maintained.

---

## 2. Why Income Validation Is Required

Income transactions increase account balances and affect the cash-flow model. If the receiving account is missing or invalid, the transaction becomes inaccurate and can overstate the available balance in the wrong account.

This is a critical validation because income is often used in reports such as:

- monthly inflow
- salary and bonus tracking
- cash flow analysis
- budget comparisons

---

## 3. Validation Rules

| Rule | Requirement |
|---|---|
| Transaction date | Required and valid `DD-MM-YYYY` |
| Amount | Required and > 0 |
| Category | Must exist |
| Receiving account | Required |
| Account existence | Must exist in master data |
| Valid income | Accept |

---

## 4. Master Data Source

The validator uses the repository layer function:

```javascript
getAccounts()
```

This enables account checks against the real master data rather than manually maintained values.

---

## 5. Step-by-Step Implementation

### Step 1 — Validate date and amount

Income validation reuses the same validators for date and amount.

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

### Step 2 — Validate category

```javascript
var categoryValidation = this.validateCategory(data.categoryId);
if (!categoryValidation.valid) {
  return categoryValidation;
}
```

This ensures the transaction belongs to a valid category before it is saved.

---

### Step 3 — Validate receiving account

The receiving account is mandatory for income transactions.

```javascript
if (
  data.receivedIntoAccountId === undefined ||
  data.receivedIntoAccountId === null ||
  data.receivedIntoAccountId === ''
) {
  return {
    valid: false,
    code: 'INVALID_RECEIVING_ACCOUNT',
    message: 'Receiving account is required.'
  };
}
```

Then the account is verified against the master data:

```javascript
var accountValidation = this.validateAccount(data.receivedIntoAccountId);
if (!accountValidation.valid) {
  return accountValidation;
}
```

---

### Step 4 — Return normalized transaction payload

```javascript
return {
  valid: true,
  value: {
    transactionType: TRANSACTION_TYPES.INCOME,
    transactionDate: dateValidation.value,
    amount: amountValidation.value,
    categoryId: categoryValidation.value.Category_ID,
    receivedIntoAccountId: data.receivedIntoAccountId,
    notes: data.notes || ''
  }
};
```

---

## 6. Example Scenarios

### Valid income

```javascript
ValidationService.validateIncome({
  transactionDate: '21-09-2026',
  amount: '100',
  categoryId: 'CAT001',
  receivedIntoAccountId: 'ACC001'
});
```

Result:

```javascript
{
  valid: true,
  value: {
    transactionType: 'INCOME',
    transactionDate: '21-09-2026',
    amount: 100,
    categoryId: 'CAT001',
    receivedIntoAccountId: 'ACC001',
    notes: ''
  }
}
```

### Missing receiving account

```javascript
ValidationService.validateIncome({
  transactionDate: '21-09-2026',
  amount: '100',
  categoryId: 'CAT001'
});
```

Result:

```javascript
{
  valid: false,
  code: 'INVALID_RECEIVING_ACCOUNT',
  message: 'Receiving account is required.'
}
```

---

## 7. Implementation Location

The income validation belongs in:

```javascript
ValidationService.validateIncome(data)
```

It is invoked through the transaction router:

```javascript
if (normalizedType === TRANSACTION_TYPES.INCOME) {
  return this.validateIncome(data);
}
```

---

## 8. Acceptance Check

The story is complete when all of the following pass:

- valid income is accepted with a valid receiving account
- missing receiving account is rejected
- invalid account ID is rejected with `ACCOUNT_NOT_FOUND`
- invalid category is rejected
- invalid amount/date is rejected
- valid normalized response is returned

---

## 9. Implementation Result

The feature has been implemented and validated in the Apps Script runtime. Valid income transactions are accepted when the receiving account is present and the account exists in the master data, while invalid requests are rejected with the expected error codes.
