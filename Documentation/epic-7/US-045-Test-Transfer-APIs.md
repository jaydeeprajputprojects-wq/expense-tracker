# US-045 — Test Transfer APIs

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-045  
**Status:** Detailed test specification

---

## Objective

Validate transfer creation and confirm that transfers move money between accounts without creating expense or income totals.

## Sample Scenarios

### 1. Bank → Bank transfer

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "TRANSFER",
    "transactionDate": "23-09-2026",
    "amount": 4000,
    "fromAccountId": "ACC001",
    "toAccountId": "ACC004",
    "notes": "Transfer to savings"
  }
}
```

### 2. Bank → Credit Card payment

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "TRANSFER",
    "transactionDate": "23-09-2026",
    "amount": 2500,
    "fromAccountId": "ACC001",
    "toAccountId": "ACC002",
    "notes": "Credit card bill payment"
  }
}
```

### 3. Credit Card → Gift Card transfer

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionType": "TRANSFER",
    "transactionDate": "23-09-2026",
    "amount": 1500,
    "fromAccountId": "ACC002",
    "toAccountId": "ACC003",
    "notes": "Gift card top-up"
  }
}
```

## Negative Cases

- invalid from account
- invalid to account
- same account transfer
- invalid amount
- invalid date

## Test Flow

1. Create valid bank-to-bank transfer.
2. Validate source account decreases and destination increases.
3. Validate no expense or income is created.
4. Repeat for bank-to-credit-card payment and credit-card-to-gift-card transfer.
5. Trigger invalid combinations and confirm controlled failure.

## Acceptance Criteria

- [ ] Valid bank-to-bank transfer is created
- [ ] Source account decreases correctly
- [ ] Destination account increases correctly
- [ ] Transfer is not counted as expense
- [ ] Transfer is not counted as income
- [ ] Credit-card payment reduces outstanding
- [ ] Gift-card purchase increases gift-card balance
- [ ] Same-account transfer is rejected
- [ ] Invalid accounts are rejected
- [ ] Invalid amount/date are rejected
- [ ] Test collection passes

---

## Financial Rule

Transfers represent movement of value between accounts and must not affect expense or income totals.
