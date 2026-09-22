# Frontend + Backend Development Context

## 1. Project Overview

Project name: Personal Finance & Money Flow Tracker

Repository root:
- c:\content-creation\fin-track-basic\expense-tracker

Primary tech stack:
- Frontend: Vanilla JavaScript ES modules
- Backend: Google Apps Script
- Data source: Google Sheets
- UI styling: Tailwind CSS CDN
- Icons: Lucide
- Deployment model: Cloudflare Worker proxy + Cloudflare Pages/Workers static frontend + Google Apps Script backend

The system is a personal finance tracker for handling:
- income
- expense
- transfer
- balances
- transaction history
- master data (accounts, categories, configuration)

---

## 2. Goals and Delivery Scope

This project implements a full personal finance ledger with:
- master data loading
- dynamic transaction form
- expense/income/transfer transaction handling
- CRUD lifecycle for transactions
- transaction summary cards
- balance calculation and rendering
- API-first design between frontend and Google Apps Script backend

This work was implemented across multiple phases:
- Epic 8: Frontend application initialization
- Epic 9: Dynamic transaction form
- Epic 10: Frontend transaction CRUD
- Backend API contracts for transaction read/write actions
- Validation and balance logic under the Apps Script backend

---

## 3. Critical Architecture

### Frontend structure
- frontend/index.html
- frontend/css/style.css
- frontend/js/api.js
- frontend/js/accounts.js
- frontend/js/transactions.js
- frontend/js/ui.js
- frontend/js/utils.js

### Backend structure
- backend/app-script/Api.gs
- backend/app-script/ValidationService.gs
- backend/app-script/TransactionService.gs
- backend/app-script/BalanceService.gs
- backend/app-script/MasterDataRepository.gs
- backend/app-script/SheetRepository.gs
- backend/app-script/Config.gs

### API contract pattern
The Apps Script backend exposes JSON responses using the standard envelope:

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": {
    "transactions": []
  }
}
```

For failures:

```json
{
  "success": false,
  "message": "Transaction date must be in DD-MM-YYYY format.",
  "error": {
    "code": "INVALID_TRANSACTION_DATE_FORMAT"
  }
}
```

---

## 4. Business and Technical Rules that Matter

### Date format contract
The backend validation expects dates in the exact format:
- DD-MM-YYYY

Examples:
- 25-09-2026
- 01-01-2027

Browser date input produces:
- YYYY-MM-DD

So before submission the frontend must convert:
- 2026-09-25 -> 25-09-2026

This issue caused the actual runtime error:
- "Transaction date must be in DD-MM-YYYY format."

### Category field naming issues
Backend master-data categories are returned with headers like:
- Category_ID
- Category_Name

Frontend expects normalized field names such as:
- categoryId
- categoryName

If the frontend reads raw backend rows directly without normalization, it shows:
- Unnamed
- empty labels
- broken dropdowns

This was fixed by normalizing both styles:
- categoryId || Category_ID
- categoryName || Category_Name

### Account field naming issues
The same pattern applied to accounts:
- accountId || Account_ID
- accountName || Account_Name

### Deployed Apps Script mismatch
The frontend does not use local files as the backend. It uses a deployed Google Apps Script Web App URL in api.js.

This means if the app is pointed to a stale deployed version, the browser will show errors like:
- Unsupported GET action: GET_TRANSACTIONS

This was a true deployment issue, not a frontend code issue.

---

## 5. Actual Frontend State and Implementation Summary

### 5.1 Application initialization
Implemented startup sequence:
- master data fetch
- accounts/categories/config storage
- transaction list fetch
- balance fetch
- summary card rendering
- transaction table rendering
- app status message

Key file:
- frontend/js/ui.js

Important functions:
- loadMasterData()
- loadTransactions()
- loadBalances()
- renderBalanceSummary()
- renderTransactionTable()
- initializeUI()

### 5.2 Dynamic transaction form
Implemented dynamic form behavior based on transaction type:
- EXPENSE
- INCOME
- TRANSFER

Key file:
- frontend/js/transactions.js

Relevant functions:
- setFieldVisibility(type)
- populateFormWithTransaction(transaction)
- resetTransactionForm()
- buildTransactionPayloadFromForm()
- validateTransactionPayload(payload)
- initializeTransactions(state)

Business rules:
- expense shows payment method and paid-from account
- income shows receiving account
- transfer shows from and to accounts
- invalid same-account transfers are rejected
- dropdowns are filtered to relevant account types

### 5.3 CRUD API layer
Key file:
- frontend/js/api.js

Implemented API wrappers:
- getMasterData()
- getTransactions()
- getTransaction(transactionId)
- getBalances()
- createTransaction(payload)
- updateTransaction(transactionId, payload)
- deleteTransaction(transactionId)

The frontend uses a shared API wrapper that targets the Cloudflare Worker proxy at `/api` and forwards requests to the deployed Google Apps Script backend. This avoids browser CORS failures and keeps the frontend calls same-origin.

### 5.4 Validation and user feedback
The frontend now:
- validates required form data before submit
- shows status messages for success and failure
- refreshes the list after save or delete
- resets form after successful create/update
- confirms delete operations before executing them

### 5.5 Single-submit protection requirement
A single user click on the Save button must produce exactly one transaction record. During the implementation, a duplicate-save bug was discovered where the same form was re-initialized repeatedly and each re-init attached a new submit listener. This caused one click to fire multiple API submissions and insert multiple identical rows into the sheet.

The fix required:
- guarding form event binding so submit handlers are only attached once
- preventing repeated module initialization from stacking listeners
- avoiding duplicate refresh-triggered reinitialization during the same user flow

This is treated as a business requirement, not just a cleanup issue. The system must ensure that the save action is idempotent from the user’s perspective: one click, one record.

---

## 6. Runtime Deployment Issues and Resolutions

### 6.1 Browser opened via file://
Opening the frontend directly from a local file, such as `file:///.../frontend/index.html`, causes browser network calls to fail because the page is not running under an HTTP origin. This blocks API access and can trigger generic network errors even when the backend URL is valid.

Resolution:
- open the app via a local web server, such as `http://localhost:8000`, or from the deployed Cloudflare site
- do not rely on direct file-open execution for the working frontend

### 6.2 Direct Apps Script call from browser caused CORS failure
The browser was previously calling the Google Apps Script URL directly. When the app was hosted on Cloudflare Workers, that request was rejected with:

```text
Access to fetch at 'https://script.google.com/.../exec' from origin 'https://<workers-domain>' has been blocked by CORS policy
```

This happened because the Google Apps Script response did not include the required `Access-Control-Allow-Origin` headers for the browser origin.

Resolution:
- keep the backend in Google Apps Script
- add a Cloudflare Worker proxy for `/api`
- let the browser call the worker endpoint instead of the script.google.com URL directly
- return CORS headers from the worker response

### 6.3 Stale Apps Script web app URL
If the deployed Google Apps Script URL was not updated after redeploying the web app, the frontend would keep pointing to the wrong backend, causing save and fetch errors.

Resolution:
- redeploy the Apps Script web app
- copy the new current web app URL
- update the worker target URL in the Cloudflare Worker configuration.

### 6.4 Current architecture after fix
- Frontend: static HTML/JS assets served from Cloudflare
- Browser request: `GET /api?...` or `POST /api`
- Worker: forwards to Google Apps Script
- Backend: Apps Script executes action handlers and returns JSON
- Response: Worker adds CORS headers and sends JSON back to the browser

## 7. Important Bugs Found and Root Causes

### Bug 1: Unsupported GET action: GET_TRANSACTIONS
Root cause:
- Browser was hitting a stale deployed Google Apps Script version.
- Workspace backend code already supported GET_TRANSACTIONS, but the live deployment did not.

Fix approach:
- redeploy the Apps Script Web App
- update the deployed URL if necessary
- refresh the page after deployment

### Bug 2: Category dropdown displayed unnamed options
Root cause:
- frontend consumed raw category records without normalizing field names.
- actual backend rows used Category_ID and Category_Name.

Fix approach:
- normalize both camelCase and backend header names
- treat both as valid values before rendering dropdowns

### Bug 3: Date save rejected as invalid
Root cause:
- browser date input used YYYY-MM-DD
- backend expected DD-MM-YYYY

Fix approach:
- convert on submit before sending payload
- convert on edit load back to browser input format

### Bug 4: Save flow sometimes failed because of missing attribute mapping
Root cause:
- form payload keys were not consistently aligned with backend contract names
- e.g. category and account fields may be read incorrectly depending on source object shape

Fix approach:
- normalize raw backend objects before storing app state
- ensure payload uses consistent contract keys and backend-compatible names

---

## 7. Exact Files Changed During the Work

### Frontend files
- frontend/index.html
- frontend/js/api.js
- frontend/js/accounts.js
- frontend/js/transactions.js
- frontend/js/ui.js

### Backend files
- backend/app-script/Api.gs
- backend/app-script/ValidationService.gs
- backend/app-script/TransactionService.gs
- backend/app-script/MasterDataRepository.gs

### Documentation files created
- Documentation/epic-8/US-049-Implement-Frontend-Application-Initialization.md
- Documentation/epic-9/US-050-Implement-Dynamic-Transaction-Form.md
- Documentation/epic-10/US-051-Implement-Frontend-Transaction-CRUD.md

---

## 8. Current Working State

At the time of this handoff:
- The frontend logic for application initialization, dynamic form, and CRUD is implemented.
- Date conversion is corrected.
- Category normalization is corrected.
- The remaining critical requirement is live deployment sync between the browser frontend and the actual Google Apps Script Web App URL.

The app will only work properly after the deployed backend is refreshed to the current workspace code.

---

## 9. Important Developer Notes

### Always verify the deployed backend
If the browser shows:
- Unsupported GET action: GET_TRANSACTIONS

then do not keep changing the frontend first. Check if the backend deployment is stale.

### Date contract must always be respected
Any new transaction code must preserve:
- frontend input: YYYY-MM-DD
- API payload: DD-MM-YYYY

### Never assume category field names
When reading master data, account for both styles:
- camelCase
- legacy uppercase header names

### Refresh after any backend code change
Whenever Apps Script functions change, redeploy the web app before using the browser.

---

## 10. Recommended Next Actions for Continuation

1. Redeploy the Google Apps Script web app from the current workspace code.
2. Confirm the frontend API base URL points to the latest deployed script URL.
3. Refresh the page and verify the app loads master data correctly.
4. Test create transaction for expense, income, and transfer.
5. Verify edit load and update behavior.
6. Verify delete confirmation and refresh.
7. Verify balance summary updates after each mutation.
8. Check category dropdown labels show values like CSB, FOOD, TRAVEL instead of Unnamed.
9. Validate transaction list rendering using real backend data.

---

## 11. Real Data Examples Used During Debugging

Actual category values observed in the project data:
- CAT001 = CSB
- CAT002 = FOOD
- CAT003 = TRAVEL
- CAT004 = HouseHold
- CAT005 = RENT
- CAT006 = PARTY
- CAT007 = SIP
- CAT008 = INVESTMENT
- CAT009 = INSURANCE
- CAT010 = OTHERS
- CAT011 = GIFT
- CAT012 = FEES
- CAT013 = SUBSCRIPTION
- CAT014 = ENTERTAINMENT

These values must be preserved when rendering the category dropdown and when creating transaction rows.

---

## 12. Final Handoff Summary

The project has the frontend and backend code largely aligned, and the critical runtime problems encountered were caused by:
- stale deployment mismatch
- date-format mismatch between frontend browser input and backend validation
- raw object field-name mismatch for master data

The project is in a strong state for continuation once the deployed Apps Script version is synced to the current workspace code.
