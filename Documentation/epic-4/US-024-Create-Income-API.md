# US-024 — Create Income API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-024  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want to create an income transaction through the backend API, so that valid salary and inflow entries are stored with the correct account impact.

### Acceptance Criteria

1. The API accepts a valid income payload.
2. The request contains a valid date.
3. The request contains a valid amount greater than zero.
4. The category must exist.
5. The receiving account must exist and be valid.
6. The API rejects invalid income requests with a structured error response.
7. The backend generates a server-side transaction ID.
8. The transaction is saved with `Status = ACTIVE`.

---

## 2. Business Goal

Income records represent money coming into the user's financial accounts. These transactions must be validated like all other ledger events to ensure the receiving account and category are correct before the amount is stored.

---

## 3. API Contract

### Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "INCOME",
    "transactionDate": "21-09-2026",
    "amount": 2500,
    "categoryId": "CAT001",
    "receivedIntoAccountId": "ACC001",
    "notes": "Salary"
  }
}
```

### Success Response

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transactionId": "TXN-20260921-123ABC"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_RECEIVING_ACCOUNT",
    "message": "Receiving account is required."
  }
}
```

---

## 4. Validation Flow

The request is validated through the shared transaction layer:

```javascript
const validation = ValidationService.validateTransaction(request.data);

if (!validation.valid) {
  return ResponseUtil.error(validation.code, validation.message);
}
```

For income transactions, the backend routes to:

```javascript
ValidationService.validateIncome(data)
```

This validates:

- transaction date
- amount
- category existence
- receiving account presence
- receiving account existence

---

## 5. Persistence Model

When valid, the transaction record is saved with:

```javascript
Transaction_Type: 'INCOME'
Received_Into_Account_ID: 'ACC001'
Status: 'ACTIVE'
```

The service generates a transaction ID and appends the record to the Transactions sheet using the same process as expense creation.

---

## 6. Acceptance Check

The story is complete when:

- a valid income transaction is accepted
- invalid input is rejected with the correct code
- the receiving account is validated against master data
- the backend returns the created transaction ID
- the row is stored with `ACTIVE` status

---

## 7. Implementation Result

The backend supports income creation through the same transaction creation route used by other transaction types, and it validates the account and data before persistence.
