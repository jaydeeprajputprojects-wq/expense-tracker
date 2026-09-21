# US-028 — Implement Credit Card Bill Payment

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-028  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want credit-card bill payments to reduce the card outstanding without creating a new expense, so that the financial model reflects actual payment behavior correctly.

### Acceptance Criteria

1. `Bank → Credit Card` is stored as a transfer.
2. The bank balance decreases by the payment amount.
3. The credit-card outstanding decreases by the payment amount.
4. Expense total remains unchanged.
5. The payment is not counted as a new expense.

---

## 2. Business Rule

This is a critical rule from the BRD.

Example:

```text
SBI → ICICI Credit Card
₹10,000
```

Expected:

```text
Bank -₹10,000
Credit Card Outstanding -₹10,000
Expense unchanged
```

The payment itself must not create another expense.

---

## 3. Implementation Logic

The transfer engine treats credit-card settlement as a transfer and reverses the outstanding value instead of adding an expense.

```javascript
if (transactionType === TRANSACTION_TYPES.TRANSFER) {
  if (fromAccountId === normalizedAccountId) {
    if (accountType === ACCOUNT_TYPES.CREDIT_CARD) {
      currentBalance += amount;
    } else {
      currentBalance -= amount;
    }
  }

  if (toAccountId === normalizedAccountId) {
    if (accountType === ACCOUNT_TYPES.CREDIT_CARD) {
      currentBalance -= amount;
    } else {
      currentBalance += amount;
    }
  }
}
```

This preserves the BRD rule that payment reduces credit-card liability instead of creating a new expense.

---

## 4. Acceptance Check

The story is complete when:

- bank-to-credit-card payment is stored as `TRANSFER`
- bank balance declines
- credit-card outstanding declines
- no expense is created by the bill payment

---

## 5. Implementation Result

The backend now models credit-card bill payment as a transfer that reduces the card liability without affecting expense totals.
