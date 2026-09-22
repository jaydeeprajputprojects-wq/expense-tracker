# US-037 — Implement GET_TRANSACTION API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — Read Transaction APIs  
**User Story:** US-037  
**Estimated Effort:** 3 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the backend to return a specific transaction by its transaction identifier, so that the frontend can load the details required for viewing, editing, or auditing a single financial event.

### Acceptance Criteria

1. The backend exposes a GET_TRANSACTION endpoint.
2. The endpoint accepts a `transactionId` parameter.
3. A valid transaction ID returns the matching transaction record.
4. An empty or missing transaction ID is rejected with a validation error.
5. A non-existent transaction ID returns a not-found error.
6. Deleted transactions are not returned.
7. The response matches the standard project API envelope.

---

## 2. Business Rule

The system must support lookup of a single transaction record by identifier. This is different from the list operation, which returns all active entries, because the detail endpoint must validate the request and return exactly one transaction when legitimate.

Key rules:

- `transactionId` is required.
- The service must compare the provided ID against the normalized transaction ID values.
- `DELETED` records must not be returned even if the ID exists in the ledger.
- If the ID is missing, malformed, or blank, the API returns an invalid request response.
- If the transaction does not exist, the API returns a clearly defined not-found response.

---

## 3. Technical Responsibility

The detail API must be thin and delegate real logic to the service layer. The route handler should simply validate the action and pass the `transactionId` to `TransactionService.getTransaction()`.

Example flow:

```javascript
function handleGetTransaction_() {
  const transactionId = requestData.transactionId;
  const result = TransactionService.getTransaction(transactionId);

  if (!result || !result.success) {
    return ResponseUtil.error(result && result.code ? result.code : 'SERVER_ERROR', result && result.message ? result.message : 'Unable to fetch transaction.');
  }

  return ResponseUtil.success({ transaction: result.transaction }, 'Transaction fetched successfully');
}
```

This keeps the API consistent with the rest of the project and allows validation and search behavior to live in one place.

---

## 4. API Request Expectations

The client sends a request like:

```text
GET /exec?action=GET_TRANSACTION&transactionId=TXN-20260922-ABC123
```

or through a request payload shaped in the same way as other Apps Script handlers.

The attribute `transactionId` is required and must be trimmed for comparison purposes.

---

## 5. API Response Expectations

### 5.1 Success response

```json
{
  "success": true,
  "message": "Transaction fetched successfully",
  "data": {
    "transaction": {
      "transactionId": "TXN-20260922-ABC123",
      "transactionType": "INCOME",
      "transactionDate": "2026-09-22",
      "amount": 20000,
      "categoryId": "CAT-003",
      "categoryName": "Salary",
      "paymentMethod": "BANK",
      "paidFromAccountId": "",
      "paidFromAccountName": "",
      "receivedIntoAccountId": "ACC-002",
      "receivedIntoAccountName": "HDFC Savings",
      "fromAccountId": "",
      "fromAccountName": "",
      "toAccountId": "",
      "toAccountName": "",
      "notes": "September salary",
      "status": "ACTIVE",
      "createdDate": "2026-09-22T09:15:00Z",
      "updatedDate": "2026-09-22T09:15:00Z"
    }
  }
}
```

### 5.2 Invalid request response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "transactionId is required"
  }
}
```

### 5.3 Not found response

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction not found"
  }
}
```

---

## 6. Business Logic Implementation Details

The service method must:

1. check whether `transactionId` is missing or blank
2. normalize the value with `String(transactionId).trim()`
3. read the active transactions list via the same `getTransactions()` method
4. locate the matching record by matching `transactionId`
5. return a single transaction object if found
6. return a not-found result if no match exists

Pseudo-code:

```javascript
getTransaction: function(transactionId) {
  if (transactionId === undefined || transactionId === null || String(transactionId).trim() === '') {
    return {
      success: false,
      code: 'INVALID_REQUEST',
      message: 'transactionId is required'
    };
  }

  const normalizedTransactionId = String(transactionId).trim();
  const transactions = this.getTransactions();
  const transaction = transactions.find(function(item) {
    return String(item.transactionId || '').trim() === normalizedTransactionId;
  });

  if (!transaction) {
    return {
      success: false,
      code: 'TRANSACTION_NOT_FOUND',
      message: 'Transaction not found'
    };
  }

  return {
    success: true,
    transaction: transaction
  };
}
```

This ensures that the lookup uses the same active-only filtering and normalized mapping rules as the list API.

---

## 7. Example API Flow

```text
GET /exec?action=GET_TRANSACTION&transactionId=TXN-20260922-ABC123
```

Expected behavior:

- validate the required parameter
- fetch the active transaction list
- search by exact normalized transaction ID
- return the transaction details if found
- otherwise return a standard not-found response

---

## 8. Test Coverage Expectations

The API should be tested for:

- valid detail retrieval for an existing active transaction
- invalid request when `transactionId` is missing
- invalid request when `transactionId` is blank
- not-found result for an unknown ID
- exclusion of deleted transactions even when the ID exists in raw storage
- exact matching of normalized ID values
- correct envelope and error codes

### Example scenarios

1. `GET_TRANSACTION` with valid ID returns the matching object.
2. `GET_TRANSACTION` with missing ID returns `INVALID_REQUEST`.
3. `GET_TRANSACTION` with unknown ID returns `TRANSACTION_NOT_FOUND`.
4. `GET_TRANSACTION` for a deleted transaction does not return it.
5. Response includes the projected transaction contract with names and identifiers.

---

## 9. Acceptance Check

The story is complete when:

- the GET_TRANSACTION endpoint is available
- the caller can request one transaction by ID
- missing or empty IDs are rejected
- not-found transactions return an error response
- deleted transactions are not surfaced
- the returned object matches the standard transaction structure

---

## 10. Implementation Result

The GET_TRANSACTION API is implemented as the single-record retrieval endpoint for the ledger. It validates the ID input, filters out logically deleted records, locates the exact transaction by normalized identifier, and returns the standard success or error response expected by the application and its frontend consumers.
