# US-036 — Implement GET_TRANSACTIONS API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — Read Transaction APIs  
**User Story:** US-036  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the system to return all active transactions through a dedicated GET_TRANSACTIONS API, so that the frontend can display the transaction ledger and support filtering, reporting, and reconciliation workflows.

### Acceptance Criteria

1. The backend exposes a GET_TRANSACTIONS endpoint.
2. The endpoint returns all active transactions.
3. Deleted transactions are excluded from results.
4. Transactions are returned in a predictable sorted order.
5. The response follows the standard project API envelope.
6. The payload includes both IDs and human-readable reference values such as category and account names.
7. The endpoint handles empty result sets without failure.

---

## 2. Business Rule

The transaction ledger is the source of truth for all activity records. The GET_TRANSACTIONS API must read the raw transaction dataset, apply the business rule for active records, and return a sanitized and consistent set of transaction objects to the client application.

Business rules:

- Only `ACTIVE` records are returned.
- Records marked `DELETED` are never returned to the client.
- The transactions list is sorted by date in a deterministic sequence.
- Missing or malformed records are ignored safely.
- The API returns the same transaction contract used throughout the application.

The general flow is:

```text
Read transactions sheet
   |
   v
Filter out null records
   |
   v
Exclude DELETED status records
   |
   v
Map each row to the transaction contract
   |
   v
Resolve category/account display names
   |
   v
Sort the list
   |
   v
Return standard JSON response
```

---

## 3. Technical Responsibility

The GET_TRANSACTIONS API sits above the repository and service layer. It must orchestrate retrieval and transformation without embedding business logic directly into the API route layer.

The endpoint is responsible for:

1. retrieving all transaction rows from the storage layer
2. filtering out non-active or logically deleted rows
3. converting raw sheet rows into normalized objects
4. resolving ID-based references into friendly values
5. sorting the result set for consistent UI rendering
6. returning the standard success envelope

The functional structure should resemble:

```javascript
function handleGetTransactions_() {
  const transactions = TransactionService.getTransactions();

  if (!transactions || !Array.isArray(transactions)) {
    return ResponseUtil.success({ transactions: [] }, 'Transactions fetched successfully');
  }

  return ResponseUtil.success({ transactions: transactions }, 'Transactions fetched successfully');
}
```

This keeps read operations simple and ensures the service layer owns the business logic.

---

## 4. API Response Expectations

The response must follow the standard project contract and expose the transaction list in a consistent structure.

Example success response:

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": {
    "transactions": [
      {
        "transactionId": "TXN-20260922-ABC123",
        "transactionType": "EXPENSE",
        "transactionDate": "2026-09-22",
        "amount": 2500,
        "categoryId": "CAT-001",
        "categoryName": "Groceries",
        "paymentMethod": "BANK",
        "paidFromAccountId": "ACC-001",
        "paidFromAccountName": "SBI Bank",
        "receivedIntoAccountId": "",
        "receivedIntoAccountName": "",
        "fromAccountId": "",
        "fromAccountName": "",
        "toAccountId": "",
        "toAccountName": "",
        "notes": "Weekly household purchase",
        "status": "ACTIVE",
        "createdDate": "2026-09-22T10:00:00Z",
        "updatedDate": "2026-09-22T10:00:00Z"
      }
    ]
  }
}
```

### Response contract rules

- The root object must include `success`.
- A message should be included for readability and debugging.
- The `data` payload must include `transactions`.
- Each transaction object should contain both raw IDs and resolved names.
- Empty states should still return `success: true` with an empty array.

---

## 5. Data Processing Requirements

The service layer must handle the following during list retrieval:

### 5.1 Raw transaction extraction

The transaction repository returns rows directly from the ledger sheet. Each row may contain:

- `Transaction_ID`
- `Transaction_Date`
- `Transaction_Type`
- `Amount`
- `Category_ID`
- `Payment_Method`
- `Paid_From_Account_ID`
- `Received_Into_Account_ID`
- `From_Account_ID`
- `To_Account_ID`
- `Notes`
- `Created_Date`
- `Updated_Date`
- `Status`

### 5.2 Active record filter

Only rows that are not logically deleted should remain in the output.

```javascript
if (String(transaction.Status || '').trim().toUpperCase() === 'DELETED') {
  return false;
}
```

### 5.3 Mapping

The raw data is converted to a transaction object with normalized keys such as:

- `transactionId`
- `transactionType`
- `transactionDate`
- `amount`
- `categoryId`
- `categoryName`
- `status`

### 5.4 Name resolution

The transaction object must resolve references to human-readable values for:

- category name
- paid from account name
- received into account name
- from account name
- to account name

This improves readability for the UI and avoids exposing only internal IDs.

### 5.5 Sorting

The list should be stable and deterministic. When multiple dates share the same value, the code should sort by transaction ID as a secondary key.

```javascript
if (leftDate !== rightDate) {
  return leftDate - rightDate;
}

return leftKey.localeCompare(rightKey);
```

---

## 6. Example API Flow

```text
GET /exec?action=GET_TRANSACTIONS
```

Expected behavior:

- read all transaction rows from the ledger
- exclude deleted records
- map each row into the public transaction model
- resolve account/category names
- sort the list by date and ID
- return a standard success response

---

## 7. Test Coverage Expectations

The API should be validated for:

- valid retrieval when transaction rows exist
- correct return of active transactions only
- exclusion of `DELETED` rows
- empty list handling when no transactions exist
- date ordering correctness
- stable ordering when dates are equal
- correct account/category name resolution
- response envelope compliance
- invalid or malformed row tolerance

### Example test cases

1. Returns all active transactions.
2. Omits records with status `DELETED`.
3. Returns `[]` when the transaction sheet is empty.
4. Returns results sorted by date ascending.
5. Uses transaction ID as a tiebreaker.
6. Produces the same shape as the project API standard.

---

## 8. Acceptance Check

The story is complete when:

- GET_TRANSACTIONS is callable through the Apps Script route layer
- active transactions are returned
- deleted transactions are excluded
- the list is sorted consistently
- the response shape matches the standard API format
- the UI can consume the transaction ledger without extra transformation

---

## 9. Implementation Result

The GET_TRANSACTIONS API is implemented as the public read operation for the transaction ledger. It reads active records, filters out deleted entries, enriches each record with reference names, orders the list deterministically, and returns the result through the project-standard JSON response contract.
