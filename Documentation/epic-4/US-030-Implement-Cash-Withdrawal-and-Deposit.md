# US-030 — Implement Cash Withdrawal/Deposit

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 4 — Transaction Management Backend  
**User Story:** US-030  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want cash withdrawal and cash deposit to be supported as transfers, without introducing Cash as a formal account type, so that the business rules match the BRD and the ledger remains consistent.

### Acceptance Criteria

1. `Bank → Cash` is accepted as a transfer.
2. `Cash → Bank` is accepted as a transfer.
3. No formal cash account type is introduced.
4. The transfer is not treated as an expense or income.
5. The bank balance is adjusted accordingly.

---

## 2. Business Rule

The BRD explicitly treats cash withdrawal/deposit as transfers.

Examples:

```text
Bank → Cash
Cash → Bank
```

There is no separate `Cash` account type in Phase 1. The implementation uses the external `CASH` identifier when needed, and it does not add a fourth formal master-data account type.

---

## 3. Validation Rule

Cash flows are accepted when one side of the transfer is `CASH` and the other side is a valid account ID.

```javascript
var fromIsCash = fromAccountId.toUpperCase() === 'CASH';
var toIsCash = toAccountId.toUpperCase() === 'CASH';
```

The validator accepts the transfer if:

- source is valid bank card or gift card
- destination is valid bank card or gift card
- one side is `CASH` and the other is an existing master-data account
- source and destination are not the same

---

## 4. Balance Impact

For a cash withdrawal:

```text
Bank → Cash
```

The bank balance decreases and there is no expense.

For a cash deposit:

```text
Cash → Bank
```

The bank balance increases and there is no income.

The transfer engine treats these as external movement, not as account-to-account financial product movement.

---

## 5. Acceptance Check

The story is complete when:

- `Bank → Cash` is valid as a transfer
- `Cash → Bank` is valid as a transfer
- the system does not create a formal cash master account
- bank balance updates correctly without creating expense or income totals

---

## 6. Implementation Result

Cash withdrawal and deposit are handled as transfers while remaining outside the formal account-model design, in line with the BRD and the technical design.
