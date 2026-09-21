# US-026 — Create Transfer API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-026  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want to create a transfer transaction through the backend API, so that money movements between accounts are stored accurately without being treated as expenses or income.

### Acceptance Criteria

1. The API accepts a valid transfer payload.
2. `fromAccountId` is validated.
3. `toAccountId` is validated.
4. Amount is greater than zero.
5. `fromAccountId` and `toAccountId` are different.
6. A transaction ID is generated server-side.
7. The transfer is stored as `TRANSER` with `ACTIVE` status.

---

## 2. Business Rule

Transfers are movements of value between entities without creating a new expense or income.

Examples:

- Bank → Bank
- Bank → Credit Card
- Credit Card → Gift Card
- Bank → Cash
- Cash → Bank

They must be treated as transfers, not as expense or income.

---

## 3. Example Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "TRANSFER",
    "transactionDate": "21-09-2026",
    "amount": 20000,
    "fromAccountId": "ACC001",
    "toAccountId": "ACC002",
    "notes": "SBI to HDFC"
  }
}
```

---

## 4. Validation Rules

The transfer validator checks:

- date is valid
- amount is > 0
- source account is present
- destination account is present
- source and destination are not the same
- both account IDs exist in master data

Cash transfer values are also supported using `CASH` as a special external identifier.

---

## 5. Persistence

The transaction record is saved with:

```javascript
Transaction_Type: 'TRANSFER'
From_Account_ID: 'ACC001'
To_Account_ID: 'ACC002'
Status: 'ACTIVE'
```

The same `TransactionService.createTransaction()` pipeline is used for transfers.

---

## 6. Acceptance Check

The story is complete when:

- valid transfer is accepted
- invalid source/destination is rejected
- same-account transfer is rejected
- transfer is stored without being counted as expense or income

---

## 7. Implementation Result

The backend now accepts transfer creation and validates the account references and amount before saving the record.
