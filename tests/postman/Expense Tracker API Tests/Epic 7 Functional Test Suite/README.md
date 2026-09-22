# Epic 7 Functional Test Suite

This folder contains the consolidated scenario-based API test suite for Epic 7.

## Structure

- 01_Master_Data
- 02_Transactions
- 03_Read_And_Validate
- 04_Update
- 05_Delete
- 06_Balance

## Run Order

1. Get master data
2. Create expense
3. Create income
4. Create transfer
5. Get transaction
6. Update transaction
7. Delete transaction
8. Get balances

## Notes

- Each request is a single scenario and uses sample payloads.
- The collection is intentionally organized by business flow rather than by raw endpoint name.
- No duplicate scenario collection is created for the same workflow.
