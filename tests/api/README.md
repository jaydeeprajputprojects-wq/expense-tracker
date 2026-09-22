# API Test Pack

This folder contains copy-paste-ready request examples for the Google Apps Script backend.

Base URL:
https://script.google.com/macros/s/AKfycbx2fZsDgM3RCFVkSQhM1ai4kr4kyc7AbTfWUP1QWdwZhQwmhdqX_ZG03WDQhsIm5IyC/exec

Use the request body exactly as shown in each file.

Important:
- POST requests must use `Content-Type: application/json`
- Action names are case-insensitive at runtime, but examples use uppercase values
- For successful creation, the response contains a generated `transactionId` value, which will differ each time
- For GET tests, use the same base URL with `?action=...`

Folder structure:
- 01-master-data
- 02-expense
- 03-income
- 04-transfer
- 05-validation
