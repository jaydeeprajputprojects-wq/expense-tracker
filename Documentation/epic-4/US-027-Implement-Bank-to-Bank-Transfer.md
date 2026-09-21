# US-027 — Implement Bank-to-Bank Transfer

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-027  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want bank-to-bank transfers to move value between accounts without creating expense or income entries, so that internal account movement stays accurate.

### Acceptance Criteria

1. A `TRANSFER` between two bank accounts is accepted.
2. The source account decreases by the transfer amount.
3. The destination account increases by the transfer amount.
4. Expense total remains unchanged.
5. Income total remains unchanged.

---

## 2. Business Rule

Example:

```text
SBI → HDFC
₹20,000
```

Effect:

```text
SBI -₹20,000
HDFC +₹20,000
Expense unchanged
Income unchanged
```

---

## 3. Balance Logic

The transfer engine reduces the source and increases the destination without treating the transaction as income or expense.

```javascript
if (transactionType === TRANSACTION_TYPES.TRANSFER) {
  if (fromAccountId === normalizedAccountId) {
    currentBalance -= amount;
  }

  if (toAccountId === normalizedAccountId) {
    currentBalance += amount;
  }
}
```

This is the central rule used for internal account-to-account value movement.

---

## 4. Acceptance Check

The story is complete when:

- bank-to-bank transfer is saved as `TRANSFER`
- source balance decreases
- destination balance increases
- expense and income totals remain unchanged

---

## 5. Implementation Result

The balance service applies the transfer impact to the relevant accounts while leaving expense and income totals unchanged.
