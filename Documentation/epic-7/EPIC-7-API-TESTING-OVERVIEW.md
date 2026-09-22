# EPIC 7 — API Testing & Backend Stabilization

**Goal:** Validate the backend APIs independently of the frontend and stabilize transaction operations before UI integration.

**Phase:** Phase 1 — Core Transaction Management  
**Stories:** US-042 through US-048  
**Status:** Detailed testing and collection specification

---

## Scope

This epic validates the complete backend contract for:

- master data retrieval
- transaction creation
- transaction reading
- transaction updating
- logical deletion
- balance calculation

The focus is on real API behavior, response format consistency, and financial correctness.

---

## Coverage Map

### Master data

- US-042 — Test GET_MASTER_DATA

### Expense, income, and transfer creation

- US-043 — Test Expense APIs
- US-044 — Test Income APIs
- US-045 — Test Transfer APIs

### Transaction lifecycle validation

- US-046 — Test Update API
- US-047 — Test Delete API
- US-048 — Test Balance API

---

## Functional Test Principles

1. One scenario has one request definition.
2. Requests are grouped by business behavior, not by implementation type.
3. Sample data is included in the request body for repeatable manual testing.
4. Response validation uses the standard project envelope.
5. No duplicate collection is created for the same scenario.

---

## Collection Structure

The postman collection is organized as a single functional suite:

```text
Epic 7 Functional Test Suite
├── 01_Master_Data
│   └── 01_Get_Master_Data.request.yaml
├── 02_Transactions
│   ├── 01_Create_Bank_Expense.request.yaml
│   ├── 02_Create_Income.request.yaml
│   └── 03_Create_Transfer.request.yaml
├── 03_Read_And_Validate
│   └── 01_Get_Transaction.request.yaml
├── 04_Update
│   └── 01_Update_Expense.request.yaml
├── 05_Delete
│   └── 01_Logical_Delete.request.yaml
├── 06_Balance
│   └── 01_Get_Balances.request.yaml
└── README.md
```

This keeps the collection readable and avoids duplicate request files for the same scenario.

---

## Sample Data Notes

The request bodies use realistic value sets such as:

- ACC001: SBI Savings
- ACC002: ICICI Credit Card
- ACC003: Amazon Gift Card
- CAT001: Food
- CAT002: Travel
- CAT003: Salary

Example values are intentionally stable so the same flows can be reused for manual QA and regression testing.

---

## Execution Order

Recommended run order:

1. Get master data
2. Create expense
3. Create income
4. Create transfer
5. Read transaction
6. Update transaction
7. Delete transaction
8. Check balances

---

## Expected Result

The backend is considered ready for frontend integration once all Epic 7 stories pass in the functional suite and the response structure remains consistent across requests.
