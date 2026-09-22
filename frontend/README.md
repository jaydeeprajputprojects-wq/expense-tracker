# Frontend

This directory contains the frontend application of the Expense Tracker.

## Responsibilities

The frontend will provide:

* User interface
* Authentication screens
* Dashboard
* Expense and income management
* Financial summaries
* Reports and visualizations
* API integration

The frontend technology and architecture will follow the Technical Design Document available under `docs/TDD.md`.

## Development

Frontend implementation will be delivered incrementally through the project User Stories.

## Runtime API setup

The frontend now calls the Cloudflare Worker API proxy instead of the raw Google Apps Script URL.

- Browser URL: `https://<project>.workers.dev` or a local HTTP server such as `http://localhost:8000`
- API route: `/api?action=GET_MASTER_DATA` and POST requests to `/api`
- Worker behavior: forwards requests to the deployed Apps Script web app and adds CORS headers

Important:
- Opening the app via `file://` is not supported for API calls
- Use a real web server or deployed Cloudflare site
- If you redeploy the Apps Script backend, update the proxy target URL in the Cloudflare Worker

## Current frontend configuration

The API base is defined in `frontend/js/api.js` and currently points to the Worker route:

```js
const API_BASE_URL = "https://53ad7c5e-expense-tracker.jaydeeprajputprojects.workers.dev/api";
```

This is used by the shared wrappers for master-data, transactions, balances, and CRUD actions.
