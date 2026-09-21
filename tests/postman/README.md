# Postman Collection

This folder contains a Postman collection JSON file that can be imported directly into Postman.

Import file:
- `expense-tracker-api.postman_collection.json`

Base URL:
- `https://script.google.com/macros/s/AKfycbx2fZsDgM3RCFVkSQhM1ai4kr4kyc7AbTfWUP1QWdwZhQwmhdqX_ZG03WDQhsIm5IyC/exec`

Collections included:
- Master Data
- Expense
- Income
- Transfer
- Validation

How to use:
1. Open Postman
2. Click Import
3. Choose the JSON file
4. Run the requests in order
5. Compare the response to the expected result in each request

Notes:
- Transaction creation requests return a generated `transactionId` value; it changes on each run.
- If the deployment is not public, Postman may need Google auth or a valid session.
- The Sheets-backed logic will only work if the Apps Script project is connected to the same spreadsheet configured in `Config.gs`.
