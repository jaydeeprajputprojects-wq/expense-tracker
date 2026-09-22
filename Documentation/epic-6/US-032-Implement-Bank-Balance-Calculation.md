# US-032 — Implement Bank Balance Calculation

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 6 — Balance Engine  
**User Story:** US-032  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the bank balance calculation to accurately reflect opening balance, income, expenses, and transfers, so that account statements and cash-flow totals remain trustworthy.

### Acceptance Criteria

1. Bank balance starts with the opening balance.
2. Income increases the bank balance.
3. Expense decreases the bank balance.
4. Outgoing transfer decreases the bank balance.
5. Incoming transfer increases the bank balance.
6. The formula matches the BRD requirement exactly.

---

## 2. Business Rule

The required bank calculation is:

```text
Opening = ₹100,000
Income = ₹80,000
Expense = ₹10,000
Transfer Out = ₹20,000

Balance = ₹150,000
```

Formula:

```text
Opening Balance
+ Income
+ Incoming Transfer
- Expense
- Outgoing Transfer
```

Therefore:

```text
100000 + 80000 - 10000 - 20000 = 150000
```

---

## 3. Business Interpretation

For a bank account:

- Income received into the bank is a positive movement
- Expense paid from the bank is a negative movement
- Transfer out from the bank is a negative movement
- Transfer in to the bank is a positive movement

This makes the bank account work like a standard liquid balance account.

---

## 4. Implementation Logic

The branch used for bank accounts is:

```javascript
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
```

This is correct for standard bank-account flow and is the primary balance formula used in the core engine.

---

## 5. Example Scenario

Given:

```text
Opening Balance = 100000
Transaction 1: Income 80000 into ACC001
Transaction 2: Expense 10000 from ACC001
Transaction 3: Transfer Out 20000 from ACC001
```

Result:

```text
100000 + 80000 - 10000 - 20000 = 150000
```

Final bank balance:

```json
{
  "accountId": "ACC001",
  "openingBalance": 100000,
  "currentBalance": 150000
}
```

---

## 6. Acceptance Check

The story is complete when:

- opening bank balance is used as the base value
- income adds to account balance
- expense subtracts from account balance
- transfer out subtracts from account balance
- transfer in adds to account balance
- final value equals the expected bank balance test case

---

## 7. Implementation Result

The bank balance calculation is implemented using the standard account formula and correctly matches the expected outcome for opening balance, income, outgoing transfer, and expense activity.
