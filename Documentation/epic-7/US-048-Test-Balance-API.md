# US-048 — Test Balance API

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-048  
**Status:** Detailed test specification

---

## Objective

Validate `GET_BALANCES` against all supported transaction scenarios and ensure balances are derived from active transactions only.

## Scope

- establish baseline balances
- expense impact validation
- income impact validation
- transfer impact validation
- credit-card payment validation
- gift-card purchase validation
- logical deletion validation
- update validation

## Baseline Setup

Before running scenarios, capture the opening values of:

- bank accounts
- credit cards
- gift cards

## Test Flow

### Expense impact

- Bank expense decreases source bank balance
- Credit-card expense increases credit-card outstanding
- Gift-card expense decreases gift-card balance

### Income impact

- Income increases receiving bank account

### Transfer impact

- source account decreases
- destination account increases
- transfers are excluded from expense/income totals

### Update impact

- update a transaction and verify the new total is reflected

### Delete impact

- delete a transaction and verify the balance returns to prior value

## Acceptance Criteria

- [ ] `GET_BALANCES` API is available
- [ ] Bank balances calculate correctly
- [ ] Credit-card outstanding calculates correctly
- [ ] Gift-card balances calculate correctly
- [ ] Income increases receiving account
- [ ] Expense applies correct account impact
- [ ] Transfers affect source and destination correctly
- [ ] Transfers are not expense totals
- [ ] Transfers are not income totals
- [ ] Deleted transactions do not affect balances
- [ ] Updated transactions use updated financial impact
- [ ] API response matches standard envelope
- [ ] All scenarios pass in the collection

---

## Financial Rule

Balance is always a derived value based on active transactions only. Deleted and invalidated transactions must not remain in the calculation model.
