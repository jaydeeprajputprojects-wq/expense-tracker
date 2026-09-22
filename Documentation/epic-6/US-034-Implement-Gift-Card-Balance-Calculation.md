# US-034 — Implement Gift Card Balance Calculation

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 6 — Balance Engine  
**User Story:** US-034  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want gift-card balances to reflect the remaining available value after loading and usage, so that actual gift-card spending and transfers are tracked accurately.

### Acceptance Criteria

1. Gift card starts from opening balance.
2. Incoming transfer increases the remaining gift-card value.
3. Gift-card expense decreases the balance.
4. Outgoing transfer decreases the gift-card balance.
5. The remaining value remains accurate after all active transactions are applied.

---

## 2. Business Rule

The supporting formula is:

```text
Opening Balance
+ Incoming Transfer
- Gift Card Expense
- Outgoing Transfer
```

This means the gift card behaves like a stored-value instrument.

Example:

```text
Opening Balance = ₹5,000
Gift Card Expense = ₹1,500
Incoming Transfer = ₹0
Outgoing Transfer = ₹0

Current Balance = ₹3,500
```

---

## 3. Business Interpretation

Gift cards are not treated like cash in a general balance sheet; they are value-stored instruments with remaining usable value.

A gift-card expense reduces the balance because the card is being consumed. A transfer into the gift card increases its stored value. A transfer out decreases it.

---

## 4. Implementation Logic

The engine uses the same base logic with the gift-card-specific account behavior:

```javascript
if (transactionType === TRANSACTION_TYPES.EXPENSE && paidFromAccountId === normalizedAccountId) {
  if (accountType === ACCOUNT_TYPES.CREDIT_CARD) {
    currentBalance += amount;
  } else {
    currentBalance -= amount;
  }
}

if (transactionType === TRANSACTION_TYPES.TRANSFER) {
  if (!fromIsCash && fromAccountId === normalizedAccountId) {
    currentBalance -= amount;
  }

  if (!toIsCash && toAccountId === normalizedAccountId) {
    if (accountType === ACCOUNT_TYPES.CREDIT_CARD) {
      currentBalance -= amount;
    } else {
      currentBalance += amount;
    }
  }
}
```

For gift-card accounts, this means:

- using the gift card reduces its remaining balance
- receiving transfer into the gift card increases its balance
- sending transfer out reduces its balance

---

## 5. Example Scenario

Given:

```text
Opening Balance = ₹5,000
Gift Card Usage = ₹1,000
Gift Card Transfer In = ₹500
Gift Card Transfer Out = ₹200
```

Result:

```text
5000 + 500 - 1000 - 200 = 4300
```

Final gift-card balance:

```text
₹4,300
```

---

## 6. Acceptance Check

The story is complete when:

- gift-card opening value is used as the starting point
- gift-card expense reduces available balance
- incoming transfer adds to the available value
- outgoing transfer subtracts from available value
- no double-counting occurs when a gift card is consumed

---

## 7. Implementation Result

The gift-card calculation is implemented as a stored-value ledger. Active transaction effects update the available balance such that remaining value reflects actual usage, transfers, and reloads accurately.
