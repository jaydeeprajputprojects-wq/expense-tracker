# US-042 — Test GET_MASTER_DATA

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Epic 7 — API Testing & Backend Stabilization  
**User Story:** US-042  
**Status:** Detailed test specification

---

## Objective

Validate that `GET_MASTER_DATA` returns the master information required for the frontend transaction screens and dropdowns.

## Scope

The test covers:

- accounts master data
- categories master data
- configuration master data
- active/inactive filter behavior
- consistent response envelope
- missing or invalid backend configuration handling

## API Contract

Request:

```http
GET /exec?action=GET_MASTER_DATA
```

Expected response structure:

```json
{
  "success": true,
  "message": "Master data fetched successfully",
  "data": {
    "accounts": [
      {
        "accountId": "ACC001",
        "accountName": "SBI Savings",
        "accountType": "BANK",
        "status": "ACTIVE"
      }
    ],
    "categories": [
      {
        "categoryId": "CAT001",
        "categoryName": "Food",
        "status": "ACTIVE"
      }
    ],
    "configuration": [
      {
        "key": "DATE_FORMAT",
        "value": "dd-MM-yyyy"
      }
    ]
  }
}
```

## Sample Data

Accounts sample:

```json
[
  { "accountId": "ACC001", "accountName": "SBI Savings", "accountType": "BANK", "status": "ACTIVE" },
  { "accountId": "ACC002", "accountName": "ICICI CC", "accountType": "CREDIT_CARD", "status": "ACTIVE" },
  { "accountId": "ACC003", "accountName": "Amazon GC", "accountType": "GIFT_CARD", "status": "ACTIVE" }
]
```

Categories sample:

```json
[
  { "categoryId": "CAT001", "categoryName": "Food", "status": "ACTIVE" },
  { "categoryId": "CAT002", "categoryName": "Travel", "status": "ACTIVE" },
  { "categoryId": "CAT003", "categoryName": "Salary", "status": "ACTIVE" }
]
```

## Test Flow

1. Call `GET_MASTER_DATA`.
2. Verify response is successful.
3. Validate `accounts` array exists and contains valid account objects.
4. Validate `categories` array exists and contains valid category objects.
5. Validate `configuration` exists and includes required defaults.
6. Confirm IDs are unique and usable by transaction payloads.
7. Confirm all active records are available for new transactions.
8. Confirm inactive records are excluded from active UI selection.
9. Confirm invalid or missing sheet configuration yields controlled error.

## Acceptance Criteria

- [ ] API request returns success
- [ ] Accounts are listed
- [ ] Categories are listed
- [ ] Configuration is returned
- [ ] Required fields are populated
- [ ] IDs are unique and usable
- [ ] Response matches standard envelope
- [ ] Invalid/missing sheet config fails gracefully
- [ ] Test is saved in the collection
- [ ] Scenario passes consistently

---

## Notes

Master data is the foundation for all transaction creation and validation, so this test must pass before any frontend integration is considered stable.
