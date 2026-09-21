# US-019 — Validate Transfer Transactions

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Transaction Management  
**User Story:** US-019  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to validate transfer transactions before saving them, so that money can only move between valid and distinct accounts and invalid transfers are rejected with clear business errors.

### Acceptance Criteria

1. Transfer transactions must include a valid transaction date.
2. Amount must be a positive number greater than zero.
3. From account ID must be provided.
4. To account ID must be provided.
5. Both accounts must exist in the `Accounts` sheet.
6. From and To accounts cannot be the same.
7. Valid transfers must be normalized before storage.
8. Existing API response conventions must be maintained.

---

## 2. Why Transfer Validation Is Required

Transfers represent movement of funds between accounts and are critical for maintaining accurate balances. If a transfer is allowed to use the same account on both sides or a non-existent account, the balance logic becomes incorrect and financial reporting becomes unreliable.

This is essential for:

- internal account movement
- savings-to-checking transfers
- wallet-to-wallet adjustments
- ledger accuracy

---

## 3. Validation Rules

| Rule | Requirement |
|---|---|
| Transaction date | Required and valid `DD-MM-YYYY` |
| Amount | Required and > 0 |
| From account | Required |
| To account | Required |
| Account existence | Both accounts must exist |
| Same-account transfer | Reject |
| Valid transfer | Accept |

---

## 4. Validation Logic

The system validates three critical parts:

1. required transaction fields
2. account existence
3. from/to account differentiation

### Required validations

```javascript
if (
  data.fromAccountId === undefined ||
  data.fromAccountId === null ||
  data.fromAccountId === ''
) {
  return {
    valid: false,
    code: 'INVALID_FROM_ACCOUNT',
    message: 'From account is required.'
  };
}

if (
  data.toAccountId === undefined ||
  data.toAccountId === null ||
  data.toAccountId === ''
) {
  return {
    valid: false,
    code: 'INVALID_TO_ACCOUNT',
    message: 'To account is required.'
  };
}
```

---

### Account existence checks

```javascript
var fromAccountValidation = this.validateAccount(data.fromAccountId);
if (!fromAccountValidation.valid) {
  return fromAccountValidation;
}

var toAccountValidation = this.validateAccount(data.toAccountId);
if (!toAccountValidation.valid) {
  return toAccountValidation;
}
```

This ensures both accounts exist in the master data before the transaction is accepted.

---

### Same-account protection

```javascript
if (String(data.fromAccountId).trim() === String(data.toAccountId).trim()) {
  return {
    valid: false,
    code: 'INVALID_TRANSFER_ACCOUNT',
    message: 'From and To accounts must be different.'
  };
}
```

This rule prevents impossible internal transfers that debit and credit the same account at the same time.

---

## 5. Step-by-Step Implementation

### Step 1 — Validate date and amount

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

### Step 2 — Check account references

```javascript
var fromAccountValidation = this.validateAccount(data.fromAccountId);
if (!fromAccountValidation.valid) {
  return fromAccountValidation;
}

var toAccountValidation = this.validateAccount(data.toAccountId);
if (!toAccountValidation.valid) {
  return toAccountValidation;
}
```

---

### Step 3 — Reject self-transfer

```javascript
if (String(data.fromAccountId).trim() === String(data.toAccountId).trim()) {
  return {
    valid: false,
    code: 'INVALID_TRANSFER_ACCOUNT',
    message: 'From and To accounts must be different.'
  };
}
```

---

### Step 4 — Return normalized transfer payload

```javascript
return {
  valid: true,
  value: {
    transactionType: TRANSACTION_TYPES.TRANSFER,
    transactionDate: dateValidation.value,
    amount: amountValidation.value,
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    notes: data.notes || ''
  }
};
```

---

## 6. Example Scenarios

### Valid transfer

```javascript
ValidationService.validateTransfer({
  transactionDate: '21-09-2026',
  amount: '100',
  fromAccountId: 'ACC001',
  toAccountId: 'ACC002'
});
```

Result:

```javascript
{
  valid: true,
  value: {
    transactionType: 'TRANSFER',
    transactionDate: '21-09-2026',
    amount: 100,
    fromAccountId: 'ACC001',
    toAccountId: 'ACC002',
    notes: ''
  }
}
```

### Same account transfer

```javascript
ValidationService.validateTransfer({
  transactionDate: '21-09-2026',
  amount: '100',
  fromAccountId: 'ACC001',
  toAccountId: 'ACC001'
});
```

Result:

```javascript
{
  valid: false,
  code: 'INVALID_TRANSFER_ACCOUNT',
  message: 'From and To accounts must be different.'
}
```

---

## 7. Implementation Location

The transfer validation belongs in:

```javascript
ValidationService.validateTransfer(data)
```

It is invoked from the shared transaction validation router:

```javascript
return this.validateTransfer(data);
```

---

## 8. Acceptance Check

The story is complete when all of the following pass:

- valid transfer between two distinct accounts is accepted
- same-account transfer is rejected
- missing from account is rejected
- missing to account is rejected
- non-existent account is rejected
- valid transfer payload is returned in normalized format

---

## 9. Implementation Result

The transfer validation logic has been implemented and validated in the Apps Script runtime. The logic successfully supports valid transfers between distinct master-data accounts and rejects invalid transfers that would create inconsistent balance movements.
