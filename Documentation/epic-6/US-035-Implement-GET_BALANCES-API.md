# US-035 — Implement GET_BALANCES API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 6 — Balance Engine  
**User Story:** US-035  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the backend to expose all account balances through a dedicated GET_BALANCES API, so that the frontend and reporting layer can fetch the current accounting state without duplicating balance logic.

### Acceptance Criteria

1. The backend can calculate balances for all accounts.
2. The API returns all account records.
3. The API returns each account's opening balance.
4. The API returns each account's current balance.
5. The API is tested against expected values.
6. The response is consumer-friendly and consistent with the project API standard.

---

## 2. Business Rule

The API is the public access point for the authoritative balance engine.

It must:

- fetch account master data
- calculate balance for each active account
- include opening and current values in the response
- return the accounts in a consistent format
- remain the single source of truth for balance-driven UI and reporting

---

## 3. Technical Responsibility

The GET_BALANCES API is responsible for orchestration rather than calculation logic details.

It should:

```javascript
const balances = BalanceService.getBalances();

return ResponseUtil.success(
  {
    balances: balances,
    accounts: balances
  },
  'Balances fetched successfully'
);
```

This allows the caller to consume account information consistently, while the balance engine remains the authoritative calculator.

---

## 4. API Response Expectations

The response should include each account as a structured object:

```json
{
  "accountId": "ACC001",
  "accountName": "SBI Bank",
  "accountType": "BANK",
  "openingBalance": 100000,
  "currentBalance": 150000,
  "status": "ACTIVE"
}
```

The response may also include a wrapper structure such as:

```json
{
  "success": true,
  "message": "Balances fetched successfully",
  "data": {
    "balances": [
      {
        "accountId": "ACC001",
        "accountName": "SBI Bank",
        "accountType": "BANK",
        "openingBalance": 100000,
        "currentBalance": 150000
      }
    ],
    "accounts": [
      {
        "accountId": "ACC001",
        "accountName": "SBI Bank",
        "accountType": "BANK",
        "openingBalance": 100000,
        "currentBalance": 150000
      }
    ]
  }
}
```

The important point is that the output exposes the source account data together with the authoritative computed current balance.

---

## 5. Example Balance API Flow

```text
GET /exec?action=GET_BALANCES
```

Expected behavior:

- retrieve all accounts
- calculate each account's current balance from opening balance + active transactions
- return every account with opening and current values
- keep the result ready for UI rendering and reporting consumption

---

## 6. Test Coverage Expectations

The API should be tested for:

- successful retrieval when accounts exist
- correct opening balance return
- correct current balance calculation
- inactive records ignored
- correct response schema and success flag
- empty or missing account list handling

---

## 7. Acceptance Check

The story is complete when:

- GET_BALANCES is callable
- all accounts are returned
- each account includes opening balance and current balance
- the calculation is performed by the balance engine
- the API test passes for valid balance scenarios

---

## 8. Implementation Result

The GET_BALANCES API is implemented as the public endpoint for the balance engine. It returns each account's opening value and computed current value, making the financial ledger available to downstream UI and reporting use cases.
