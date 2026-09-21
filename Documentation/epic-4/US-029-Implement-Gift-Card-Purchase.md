# US-029 — Implement Gift Card Purchase

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-029  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want gift-card loading or purchase transfers to increase the gift-card value without being counted as an expense, so that loaded value and purchase flows remain accurate.

### Acceptance Criteria

1. `Credit Card → Gift Card` is stored as a transfer.
2. The credit-card outstanding increases by the amount.
3. Gift-card balance increases by the amount.
4. Expense total remains unchanged.
5. The transfer is not treated as a purchase expense.

---

## 2. Business Rule

Example:

```text
ICICI CC → Amazon Gift Card
₹5,000
```

Expected:

```text
CC Outstanding +₹5,000
Gift Card Balance +₹5,000
Expense unchanged
```

This is not an expense because it creates stored value rather than consuming value.

---

## 3. Balance Impact

The transfer engine increases the credit-card liability and also increases the receiving gift-card balance.

```javascript
if (transactionType === TRANSACTION_TYPES.TRANSFER) {
  if (fromAccountId === normalizedAccountId && accountType === ACCOUNT_TYPES.CREDIT_CARD) {
    currentBalance += amount;
  }

  if (toAccountId === normalizedAccountId && accountType === ACCOUNT_TYPES.GIFT_CARD) {
    currentBalance += amount;
  }
}
```

---

## 4. Acceptance Check

The story is complete when:

- credit-card gift-card funding is recorded as `TRANSFER`
- credit-card outstanding increases
- gift-card balance increases
- no expense is generated

---

## 5. Implementation Result

The backend handles credit-to-gift-card movement as a transfer and reflects the value increase on both sides without counting it as an expense.
