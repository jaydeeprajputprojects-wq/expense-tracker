# US-031 — Implement Generic Account Balance Calculation

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 6 — Balance Engine  
**User Story:** US-031  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the system to derive each account's current balance from its opening balance and the ledger of active transactions, so that the financial snapshot reflects the true current position of each account.

### Acceptance Criteria

1. Each account starts from its opening balance.
2. Only active transactions are considered.
3. Income increases the receiving account balance.
4. Expenses decrease the paying account balance.
5. Incoming transfers increase the destination account balance.
6. Outgoing transfers decrease the source account balance.
7. Inactive transactions are ignored for balance calculations.

---

## 2. Business Rule

The balance engine is built on a single principle:

> The current balance is not stored manually; it is derived from master-data opening balance plus all applicable active transaction effects.

Generic formula:

```text
Opening Balance
+ Income
+ Incoming Transfer
- Expense
- Outgoing Transfer
```

This formula applies to bank accounts and other account types as a baseline calculation rule, with account-specific adjustments for credit-card and gift-card behavior in later stories.

---

## 3. Core Design

The system maintains two source-of-truth inputs:

- Account master data, which provides the opening balance
- Transaction ledger, which provides all financial events

The engine must:

1. Retrieve the account from master data.
2. Read all transactions.
3. Filter only active or default-active records.
4. Match transactions to the target account by account linkage.
5. Apply the net impact to the running balance.

---

## 4. Active Transaction Rule

Only ACTIVE transactions count.

This rule is important because historical and logically disabled records must not distort the current balance.

```javascript
if (!isTransactionActive_(transaction)) {
  return;
}
```

The helper should treat these as active by default:

- `Status === 'ACTIVE'`
- missing status as active for backward compatibility
- any non-explicit inactive value should not impact current balance

---

## 5. Generic Calculation Logic

The calculation logic for a single account follows the pattern below:

```javascript
var openingBalance = Number(account.openingBalance || 0);
var currentBalance = openingBalance;

transactions.forEach(function(transaction) {
  if (!isTransactionActive_(transaction)) {
    return;
  }

  var amount = Number(transaction.Amount || 0);

  if (!isFinite(amount) || amount <= 0) {
    return;
  }

  var transactionType = String(transaction.Transaction_Type || '').trim().toUpperCase();

  if (transactionType === TRANSACTION_TYPES.EXPENSE && paidFromAccountId === normalizedAccountId) {
    currentBalance -= amount;
  }

  if (transactionType === TRANSACTION_TYPES.INCOME && receivedIntoAccountId === normalizedAccountId) {
    currentBalance += amount;
  }

  if (transactionType === TRANSACTION_TYPES.TRANSFER) {
    if (fromAccountId === normalizedAccountId) {
      currentBalance -= amount;
    }

    if (toAccountId === normalizedAccountId) {
      currentBalance += amount;
    }
  }
});
```

This forms the generic baseline for all accounts before specialized account-type adjustments are applied.

---

## 6. Account-Type Specific Note

The generic formula is the default rule for account balances, but the project later differentiates behavior for:

- Bank accounts
- Credit cards
- Gift cards

For example:

- bank accounts reduce on expenses and increase on income
- credit-card balances behave as outstanding values rather than liquid balances
- gift-card balances track remaining value rather than a standard cash-like balance

The generic logic is therefore the foundation layer, while Epic 6 adds account-specific interpretation on top of it.

---

## 7. Validation / Acceptance Check

The story is complete when:

- opening balance is used as the base state
- only active transactions change the balance
- income increments the target account
- expense decrements the source account
- transfer source and destination effects are correctly applied
- inactive transactions do not affect the calculation

---

## 8. Implementation Result

The backend now implements the baseline balance engine concept: starting from the account opening balance and applying only active ledger entries to calculate the current account value. This forms the foundational logic required by the remaining balance stories.
