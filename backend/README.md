# Backend

This directory contains the backend application of the Expense Tracker.

## Responsibilities

The backend will provide:

* REST APIs
* Business logic
* Authentication and authorization
* Data persistence
* Validation
* Financial transaction processing
* Security-related functionality

The backend technology and architecture will follow the Technical Design Document available under `docs/TDD.md`.

## Development

Backend implementation will be delivered incrementally through the project User Stories.

## Browser access and CORS

The Google Apps Script backend is still the business-logic and data layer, but the browser should not call it directly from a Cloudflare-hosted frontend.

Instead:
- the browser calls the Cloudflare Worker proxy at `/api`
- the Worker forwards the request to the Apps Script web app
- the Apps Script backend returns JSON
- the Worker adds the required CORS headers before returning the response

This avoids the browser rejecting direct cross-origin requests from `script.google.com`.

## Deployment note

When the Apps Script project is redeployed, the current web app URL must be copied into the Cloudflare Worker target configuration. If the URL is stale, the frontend will fail with fetch or network errors even though the UI code is otherwise correct.
