# US-025 — Process Income Balance Impact

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-025  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want income transactions to increase the correct account balance, so that salary and incoming funds reflect accurate statements and cash-flow totals.

### Acceptance Criteria

1. Income transactions are added to the receiving account.
2. The receiving account balance increases by the incoming amount.
3. The current balance is calculated from opening balance plus income.
4. Expense and transfer rules remain separate and unaffected.
5. The system exposes balances via the backend API.

---

## 2. Business Rule

Income increases the destination account.

Example:

```text
SBI Opening Balance = ₹50,000
Salary Income = ₹25,000
Current SBI Balance = ₹75,000
```

Formula:

```text
Current Balance = Opening Balance + Income - Expenses - Outgoing Transfers + Incoming Transfers
```

For the direct income case:

```text
Current Balance = Opening Balance + Salary Income
```

---

## 3. Balance Calculation Logic

The balance service traverses transaction rows and adjusts the account value based on matching transaction-type rules.

```javascript
if (transactionType === TRANSACTION_TYPES.INCOME && receivedIntoAccountId === normalizedAccountId) {
  currentBalance += amount;
}
```

This ensures that:

- `INCOME` adds to the receiving account's running balance
- `EXPENSE` subtracts from the paid-from account
- `TRANSFER` updates both source and destination accounts

---

## 4. Example Impact

Given:

```text
Opening Balance: 5000
Income: 2500
Expense: 1000
Transfer Out: 300
```

Result:

```text
Current Balance = 5000 + 2500 - 1000 - 300 = 6200
```

This matches the intended bank-balance behavior.

---

## 5. API Behavior

The backend exposes the result through:

```text
GET_BALANCES
```

Example response:

```json
{
  "success": true,
  "data": {
    "balances": [
      {
        "accountId": "ACC001",
        "accountType": "BANK",
        "openingBalance": 5000,
        "currentBalance": 6200
      }
    ]
  }
}
```

---

## 6. Acceptance Check

The story is complete when:

- income increases the receiving account balance
- salary inflow is captured in the current account value
- balances are returned by the API
- the formula remains consistent with the design documents

---

## 7. Implementation Result

The backend now calculates account balances by starting from the opening balance and applying income, expense, and transfer impacts according to transaction type and account linkage.
