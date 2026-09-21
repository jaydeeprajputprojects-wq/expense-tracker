# US-014 — Validate Transaction Amount

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Transaction Management  
**User Story:** US-014  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to validate transaction amounts before saving a transaction, so that only valid, positive monetary values are accepted and invalid entries are rejected.

### Acceptance Criteria

1. Amount is required.
2. Amount is converted to a numeric value.
3. Zero is rejected.
4. Negative values are rejected.
5. Invalid numeric values are rejected.
6. Invalid transactions must not be saved.
7. Existing backend validation patterns must be preserved.

---

## 2. Why Amount Validation Is Required

A transaction represents a real financial movement. If an amount is blank, zero, negative, or non-numeric, the application would create unreliable balances and reporting.

Examples:

- `""` → missing value
- `"0"` → not allowed
- `"-1000"` → negative value
- `"abc"` → invalid numeric text
- `"2500.50"` → valid numeric amount

Therefore, validation must happen before the transaction is saved.

---

## 3. Rules to Implement

| Rule | Requirement |
|---|---|
| Required | Yes |
| Numeric conversion | Allowed |
| Zero | Rejected |
| Negative | Rejected |
| Invalid text | Rejected |
| Valid decimal | Accepted |
| Storage | Keep numeric value as a number |

---

## 4. Step-by-Step Implementation

### Step 1 — Add validator to ValidationService.gs

Create a reusable function named `validateTransactionAmount(amount)`.

It should:

1. Check if the amount is missing.
2. Trim string input.
3. Convert the value to `Number(amount)`.
4. Reject non-finite/non-numeric values.
5. Reject values `<= 0`.
6. Return `{ valid: true, value: numericAmount }` for valid values.

### Step 2 — Return consistent validation shape

Use the same response structure already used by transaction-date validation:

```javascript
return {
  valid: false,
  code: 'TRANSACTION_AMOUNT_REQUIRED',
  message: 'Transaction amount is required.'
};
```

or:

```javascript
return {
  valid: false,
  code: 'INVALID_TRANSACTION_AMOUNT',
  message: 'Transaction amount must be greater than zero.'
};
```

### Step 3 — Validate numeric conversion

Use:

```javascript
var numericAmount = Number(amount);
```

Then reject:

- `NaN`
- `Infinity`
- empty/blank string after trim
- non-numeric values like `abc`

### Step 4 — Reject zero and negatives

```javascript
if (numericAmount <= 0) {
  return {
    valid: false,
    code: 'INVALID_TRANSACTION_AMOUNT',
    message: 'Transaction amount must be greater than zero.'
  };
}
```

### Step 5 — Integrate into transaction validation flow

The validation object should be checked before saving the row.

```javascript
var amountValidation = ValidationService.validateTransaction(transaction);

if (!amountValidation.valid) {
  return ResponseUtil.error(
    amountValidation.code,
    amountValidation.message
  );
}
```

### Step 6 — Store the converted numeric value

The validated amount is then used in the transaction row instead of the raw user input.

```javascript
var validatedAmount = amountValidation.value;
```

This ensures amounts are stored consistently as numbers.

---

## 5. Example Validation Outcomes

### Valid input

```text
Amount = "2500.50"
Result = valid, value = 2500.5
```

### Invalid input

```text
Amount = ""
Result = TRANSACTION_AMOUNT_REQUIRED
```

```text
Amount = "0"
Result = INVALID_TRANSACTION_AMOUNT
```

```text
Amount = "-100"
Result = INVALID_TRANSACTION_AMOUNT
```

```text
Amount = "abc"
Result = INVALID_TRANSACTION_AMOUNT
```

---

## 6. Acceptance Check

The story is complete when all of the following pass:

- No blank amount is accepted.
- No zero value is accepted.
- No negative value is accepted.
- No invalid text is accepted.
- Valid numeric values are converted and stored as numbers.
- Transactions with invalid amounts are rejected before saving.

---

## 7. Implementation Result

The backend now validates transaction amounts centrally in `ValidationService.gs` and the transaction creation flow rejects invalid amounts before writing data.
