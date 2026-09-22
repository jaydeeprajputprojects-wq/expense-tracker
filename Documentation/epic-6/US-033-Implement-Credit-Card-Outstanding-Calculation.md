# US-033 — Implement Credit Card Outstanding Calculation

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 6 — Balance Engine  
**User Story:** US-033  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want credit-card outstanding balances to reflect liabilities accurately, so that card spending, incoming transfers, and bill payments are tracked without double-counting.

### Acceptance Criteria

1. Credit-card opening outstanding is used as the base value.
2. Credit-card expenses increase the outstanding balance.
3. Incoming transfers reduce the outstanding liability when treated as funds received to settle the card.
4. Bill payments reduce the outstanding liability.
5. Outgoing transfers are treated as settlement or movement that reduce the card value appropriately.
6. The calculation matches the credit-card business rules.

---

## 2. Business Rule

The credit-card calculation supports the following pattern:

```text
+ Credit Card Expense
+ Incoming Transfer
- Bill Payment
- Outgoing Transfer
```

The practical interpretation is:

- credit-card purchases increase the amount owed
- a transfer into a credit card is treated as a debt increase if it reflects liability movement or account balancing
- bill payment reduces the card liability
- transfer out from the card reduces the outstanding if it is movement away from the card

This is different from a bank account, because a credit card is treated as a liability and spending increases what is owed.

---

## 3. Balance Interpretation

For a credit card, the balance is effectively a liability balance rather than a cash balance.

```text
Current Outstanding = Opening Outstanding + Credit Card Expenses + Incoming Transfer - Bill Payment - Outgoing Transfer
```

The key rule is that the payment itself is not treated as an expense; it is a transfer that reduces the outstanding amount.

---

## 4. Implementation Logic

The engine uses the account type to decide whether the transfer or expense direction is inverted:

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

This ensures that for a credit card:

- expense increases outstanding
- bill payment or transfer-in settlement reduces the outstanding value
- transfer out from the card decreases the available liability position appropriately

---

## 5. Example Scenario

Example credit-card movement:

```text
Opening Outstanding: ₹0
Credit Card Expense: ₹5,000
Incoming Transfer: ₹2,000
Bill Payment: ₹3,000
Outgoing Transfer: ₹1,000
```

Result:

```text
0 + 5000 + 2000 - 3000 - 1000 = 3000
```

Final outstanding:

```text
₹3,000
```

This is the expected liability state for a credit-card account.

---

## 6. Acceptance Check

The story is complete when:

- credit-card expense increases outstanding
- credit-card payment reduces outstanding
- transfer behavior is consistent with the liability model
- the system avoids double-counting the bill-payment as an expense
- the API exposes the final value correctly

---

## 7. Implementation Result

The credit-card outstanding calculation is implemented using the liability-oriented rule set. Credit-card spending raises the outstanding balance, while payment and settlement movement reduce it without introducing duplicate expense impact.
