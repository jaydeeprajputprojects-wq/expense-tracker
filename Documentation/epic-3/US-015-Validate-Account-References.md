# US-015 — Validate Account References

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Transaction Management  
**User Story:** US-015  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to validate account references before saving a transaction, so that only valid account IDs are accepted and invalid account references are rejected with clear errors.

### Acceptance Criteria

1. Account ID must be provided.
2. Account ID must be a valid string.
3. Account must exist in the master data.
4. Missing accounts must return `ACCOUNT_NOT_FOUND`.
5. Account type must match the expected type when provided.
6. Invalid account references must not be saved.
7. Existing API response conventions must be maintained.

---

## 2. Why Account Validation Is Required

A transaction references one or more accounts. If the ID is missing or points to a non-existent account, the resulting financial data becomes unreliable.

This affects:

- Bank balance calculation
- Credit-card outstanding tracking
- Gift-card balance tracking
- Transfer validation
- Expense and income processing

A transaction such as:

```text
Expense from account ACC999
```

must not be accepted if no such account exists in the master sheet.

---

## 3. Validation Rules

| Rule | Requirement |
|---|---|
| Account ID required | Yes |
| ID must be trimmed | Yes |
| Account must exist | Yes |
| Missing account | Reject with `ACCOUNT_NOT_FOUND` |
| Type mismatch | Reject with `INVALID_ACCOUNT_TYPE` |
| Valid account | Accept |

---

## 4. Master Data Source

The validator uses the master data already exposed by the repository layer:

```javascript
getAccounts()
```

This reads the `Accounts` sheet and returns clean account objects.

Each account record is expected to contain:

```javascript
{
  accountId: 'ACC001',
  accountType: 'BANK'
}
```

---

## 5. Step-by-Step Implementation

### Step 1 — Validate required input

The function must reject the following:

- `undefined`
- `null`
- empty string
- whitespace-only string

```javascript
if (
  accountId === undefined ||
  accountId === null ||
  accountId === ''
) {
  return {
    valid: false,
    code: 'INVALID_ACCOUNT_ID',
    message: 'Account ID is required.'
  };
}
```

Then trim the value before continuing:

```javascript
var normalizedAccountId = String(accountId).trim();
```

---

### Step 2 — Check account existence

Use the master-data list:

```javascript
var accounts = getAccounts();
var account = accounts.find(function(item) {
  return item.accountId === normalizedAccountId;
});
```

If no account is found, return:

```javascript
return {
  valid: false,
  code: 'ACCOUNT_NOT_FOUND',
  message: 'Account not found.'
};
```

---

### Step 3 — Validate account type when required

Some actions require a specific account category.

Example:

```javascript
ValidationService.validateAccount('ACC001', 'BANK');
```

If the actual account type does not match:

```javascript
if (expectedType && account.accountType !== expectedType) {
  return {
    valid: false,
    code: 'INVALID_ACCOUNT_TYPE',
    message: 'Account type does not match the expected payment method.'
  };
}
```

This is used when a payment method or transfer type needs a specific account family such as:

- `BANK`
- `CREDIT_CARD`
- `GIFT_CARD`

---

### Step 4 — Return valid account object

If everything passes:

```javascript
return {
  valid: true,
  value: account
};
```

This allows the caller to use the validated master-record details later.

---

## 6. Example Scenarios

### Valid account

```javascript
ValidationService.validateAccount('ACC001', 'BANK');
```

Result:

```javascript
{
  valid: true,
  value: { accountId: 'ACC001', accountType: 'BANK' }
}
```

### Missing account

```javascript
ValidationService.validateAccount('ACC999');
```

Result:

```javascript
{
  valid: false,
  code: 'ACCOUNT_NOT_FOUND',
  message: 'Account not found.'
}
```

### Type mismatch

```javascript
ValidationService.validateAccount('ACC001', 'CREDIT_CARD');
```

Result:

```javascript
{
  valid: false,
  code: 'INVALID_ACCOUNT_TYPE',
  message: 'Account type does not match the expected payment method.'
}
```

---

## 7. Implementation Location

The validation belongs in `ValidationService.gs` and is exposed through:

```javascript
ValidationService.validateAccount(accountId, expectedType)
```

This keeps account validation centralized and reusable across transaction, transfer, and balance logic.

---

## 8. Acceptance Check

The story is complete when all of the following pass:

- blank account ID is rejected
- missing account ID is rejected
- non-existent account ID returns `ACCOUNT_NOT_FOUND`
- type mismatch returns `INVALID_ACCOUNT_TYPE`
- valid account passes and returns the account object

---

## 9. Implementation Result

The backend code now validates account references centrally and rejects invalid or unknown account IDs before transaction save operations continue.
