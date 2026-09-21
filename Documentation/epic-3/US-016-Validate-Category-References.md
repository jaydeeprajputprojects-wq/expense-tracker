# US-016 — Validate Category References

**Project:** Personal Finance & Money Flow Tracker  
**Feature:** Transaction Management  
**User Story:** US-016  
**Estimated Effort:** 4 hours  
**Status:** Implementation Documentation

---

## 1. User Story

**As a user,** I want the application to validate category references before saving a transaction, so that only valid categories are accepted and invalid references are rejected with clear errors.

### Acceptance Criteria

1. Category ID must be provided.
2. Category ID must be a valid string.
3. Category must exist in the master data.
4. Missing categories must return `CATEGORY_NOT_FOUND`.
5. Invalid category references must not be saved.
6. Existing API response conventions must be maintained.

---

## 2. Why Category Validation Is Required

Expenses and income transactions often reference a category such as:

- Food
- Travel
- Shopping
- Investment
- Loan Payment

If the category is missing or invalid, the transaction becomes inconsistent and reporting logic cannot classify spending correctly.

This is particularly important because category-based reporting is planned for Phase 2, and the category master is the source of truth.

---

## 3. Validation Rules

| Rule | Requirement |
|---|---|
| Category ID required | Yes |
| ID must be trimmed | Yes |
| Category must exist | Yes |
| Missing category | Reject with `CATEGORY_NOT_FOUND` |
| Valid category | Accept |

---

## 4. Master Data Source

The validator uses the master data already exposed by the repository layer:

```javascript
getCategories()
```

This reads the `Categories` sheet and returns category records.

Each category record is expected to have:

```javascript
{
  Category_ID: 'CAT001',
  Category_Name: 'Food'
}
```

---

## 5. Step-by-Step Implementation

### Step 1 — Validate required input

The function must reject:

- `undefined`
- `null`
- empty string
- whitespace-only string

```javascript
if (
  categoryId === undefined ||
  categoryId === null ||
  categoryId === ''
) {
  return {
    valid: false,
    code: 'INVALID_CATEGORY_ID',
    message: 'Category ID is required.'
  };
}
```

Then trim the input:

```javascript
var normalizedCategoryId = String(categoryId).trim();
```

---

### Step 2 — Check category existence

Use the categories master list:

```javascript
var categories = getCategories();
var category = categories.find(function(item) {
  return item.Category_ID === normalizedCategoryId;
});
```

If no match exists:

```javascript
return {
  valid: false,
  code: 'CATEGORY_NOT_FOUND',
  message: 'Category not found.'
};
```

---

### Step 3 — Return valid category object

If the category exists:

```javascript
return {
  valid: true,
  value: category
};
```

This gives the caller the validated master-data row for downstream processing.

---

## 6. Example Scenarios

### Valid category

```javascript
ValidationService.validateCategory('CAT001');
```

Result:

```javascript
{
  valid: true,
  value: { Category_ID: 'CAT001', Category_Name: 'Food' }
}
```

### Missing category

```javascript
ValidationService.validateCategory('CAT999');
```

Result:

```javascript
{
  valid: false,
  code: 'CATEGORY_NOT_FOUND',
  message: 'Category not found.'
}
```

### Missing ID

```javascript
ValidationService.validateCategory('');
```

Result:

```javascript
{
  valid: false,
  code: 'INVALID_CATEGORY_ID',
  message: 'Category ID is required.'
}
```

---

## 7. Implementation Location

The validation belongs in `ValidationService.gs` and is exposed through:

```javascript
ValidationService.validateCategory(categoryId)
```

This ensures category validation is centralized and reusable.

---

## 8. Acceptance Check

The story is complete when all of the following pass:

- blank category ID is rejected
- missing category ID is rejected
- non-existent category ID returns `CATEGORY_NOT_FOUND`
- valid category passes and returns the category object

---

## 9. Implementation Result

The backend now validates category references centrally and blocks invalid or unknown category IDs before transaction save operations continue.
