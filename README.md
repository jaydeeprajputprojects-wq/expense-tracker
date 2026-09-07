# Expense Tracker

A lightweight personal finance and money-flow tracking application for managing **expenses, income, transfers, bank accounts, credit cards, and gift cards**.

The application is designed to keep financial tracking simple while maintaining accurate account balances and avoiding double-counting of transfers such as credit-card bill payments and gift-card purchases.

---

## 🚀 Project Status

**Version:** `v0.1`
**Status:** Initial Development

The current version focuses on the core transaction-management functionality.

### Phase 1

* Account master data
* Category master data
* Expense management
* Income management
* Transfer management
* Credit-card outstanding tracking
* Gift-card balance tracking
* Transaction Add / View / Edit / Delete
* Dynamic transaction form
* Account balance calculation
* Google Sheets data storage
* Google Apps Script API

### Phase 2 — Planned

* Dashboard
* Charts and visualizations
* Search
* Filtering
* Advanced reports
* Money-flow visualization

### Phase 3 — Planned

* Authentication
* Authorization
* User management
* User-level/private data

---

## 🎯 Objectives

The primary objectives of this application are:

1. Track day-to-day expenses.
2. Track income and incoming money.
3. Track transfers between accounts.
4. Maintain accurate bank balances.
5. Track credit-card outstanding amounts.
6. Track gift-card balances.
7. Prevent transfers from being incorrectly counted as expenses.
8. Provide a simple and easy-to-use transaction interface.

---

## 💡 Core Financial Model

The application supports three formal account types:

| Account Type  | Description                                |
| ------------- | ------------------------------------------ |
| `BANK`        | Bank accounts                              |
| `CREDIT_CARD` | Credit cards and their outstanding amounts |
| `GIFT_CARD`   | Gift cards and their available balances    |

Multiple accounts of each type are supported.

Cash is not maintained as a separate formal account in Phase 1.

---

## 💰 Transaction Types

The application supports exactly three transaction types:

| Transaction Type | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `EXPENSE`        | Money/value consumed                          |
| `INCOME`         | Money received                                |
| `TRANSFER`       | Money/value moved between accounts or parties |

### Expense

Examples:

```text
Bank → Merchant
Credit Card → Merchant
Gift Card → Merchant
```

These are recorded as `EXPENSE`.

### Income

Examples:

```text
Employer → Bank Account
Person → Bank Account
```

These are recorded as `INCOME`.

### Transfer

Examples:

```text
Bank → Bank
Bank → Credit Card
Credit Card → Gift Card
Bank → Gift Card
Bank → Cash
Cash → Bank
```

These are recorded as `TRANSFER`.

---

## 💳 Credit Card Rules

Credit-card purchases are recorded as expenses on the purchase date.

Example:

```text
10-Sep-2026
Credit Card → Hotel
₹10,000
```

September expense:

```text
₹10,000
```

When the credit-card bill is paid:

```text
05-Oct-2026
Bank → Credit Card
₹10,000
```

This is a **TRANSFER**, not another expense.

Therefore:

```text
September Expense = ₹10,000
October Expense    = ₹0
```

The transfer reduces the credit-card outstanding balance.

---

## 🎁 Gift Card Rules

Buying a gift card is a transfer because value is moved from one account to another.

Example:

```text
Credit Card → Gift Card
₹5,000
```

This is:

```text
TRANSFER
```

Later, when the gift card is used:

```text
Gift Card → Merchant
₹1,000
```

This is:

```text
EXPENSE
```

Remaining gift-card balance:

```text
₹5,000 - ₹1,000 = ₹4,000
```

This prevents gift-card purchases from being counted as expenses twice.

---

## 🏦 Balance Calculation

### Bank Account

```text
Current Balance =
Opening Balance
+ Income
+ Incoming Transfers
- Expenses
- Outgoing Transfers
```

### Credit Card

```text
Current Outstanding =
Opening Outstanding
+ Credit Card Expenses
+ Incoming Transfers
- Credit Card Payments
- Outgoing Transfers
```

### Gift Card

```text
Current Balance =
Opening Balance
+ Incoming Transfers
- Gift Card Expenses
- Outgoing Transfers
```

Only active transactions are included in balance calculations.

---

## 🗂️ Data Model

The application uses Google Sheets as the data store.

### Accounts

| Column | Name              |
| ------ | ----------------- |
| A      | `Account_ID`      |
| B      | `Account_Name`    |
| C      | `Account_Type`    |
| D      | `Opening_Balance` |

Allowed account types:

```text
BANK
CREDIT_CARD
GIFT_CARD
```

### Categories

| Column | Name            |
| ------ | --------------- |
| A      | `Category_ID`   |
| B      | `Category_Name` |

Categories are maintained as master data and fetched dynamically by the application.

### Transactions

| Column | Name                       |
| ------ | -------------------------- |
| A      | `Transaction_ID`           |
| B      | `Transaction_Date`         |
| C      | `Transaction_Type`         |
| D      | `Amount`                   |
| E      | `Category_ID`              |
| F      | `Payment_Method`           |
| G      | `Paid_From_Account_ID`     |
| H      | `Received_Into_Account_ID` |
| I      | `From_Account_ID`          |
| J      | `To_Account_ID`            |
| K      | `Notes`                    |
| L      | `Created_Date`             |
| M      | `Updated_Date`             |
| N      | `Status`                   |

Transaction date format:

```text
DD-MM-YYYY
```

Example:

```text
07-09-2026
```

---

## 🖥️ Transaction Form

A single dynamic transaction form is used for all transaction types.

### Expense

Fields:

```text
Transaction Type
Date
Amount
Category
Payment Method
Paid From
Notes
```

### Income

Fields:

```text
Transaction Type
Date
Amount
Category
Received Into
Notes
```

### Transfer

Fields:

```text
Transaction Type
Date
Amount
From
To
Notes
```

The form dynamically shows and hides fields based on the selected transaction type.

---

## 🏗️ Architecture

```text
                    USER
                      |
                      v
              +---------------+
              | Web Browser   |
              |               |
              | HTML5         |
              | Tailwind CSS  |
              | Vanilla JS    |
              | Lucide Icons  |
              +-------+-------+
                      |
                    HTTPS
                      |
                      v
              +---------------+
              | Cloudflare    |
              | Pages         |
              |               |
              | Static        |
              | Frontend      |
              +-------+-------+
                      |
                    HTTPS
                      |
                      v
              +---------------+
              | Google Apps   |
              | Script        |
              |               |
              | API Layer     |
              | Service Layer |
              | Repository    |
              +-------+-------+
                      |
                      v
              +---------------+
              | Google Sheets |
              |               |
              | Accounts      |
              | Categories    |
              | Transactions  |
              | Configuration |
              +---------------+
```

---

## 🛠️ Technology Stack

| Layer           | Technology         |
| --------------- | ------------------ |
| Frontend        | HTML5              |
| CSS Framework   | Tailwind CSS       |
| Frontend Logic  | Vanilla JavaScript |
| Icons           | Lucide Icons       |
| Charts          | Chart.js — Phase 2 |
| Hosting         | Cloudflare Pages   |
| API / Backend   | Google Apps Script |
| Database        | Google Sheets      |
| HTTP            | Fetch API          |
| API Format      | JSON               |
| Version Control | Git                |
| Repository      | GitHub             |
| API Testing     | Postman / Bruno    |
| IDE             | VS Code            |
| Browser Testing | Chrome / DevTools  |

---

## 📁 Project Structure

```text
expense-tracker/
│
├── index.html
│
├── assets/
│   ├── css/
│   │   └── styles.css
│   │
│   └── js/
│       ├── app.js
│       ├── api.js
│       ├── transactions.js
│       ├── accounts.js
│       ├── validation.js
│       ├── ui.js
│       └── utils.js
│
├── components/
│   ├── transaction-form.js
│   ├── transaction-list.js
│   └── account-summary.js
│
├── config/
│   └── environment.js
│
└── README.md
```

Google Apps Script backend:

```text
apps-script/
│
├── Code.gs
├── Api.gs
├── TransactionService.gs
├── AccountService.gs
├── BalanceService.gs
├── ValidationService.gs
├── SheetRepository.gs
├── ResponseUtil.gs
└── Config.gs
```

---

## 🔌 API Operations

The application communicates with Google Apps Script using JSON APIs.

Supported operations:

```text
GET_MASTER_DATA
GET_TRANSACTIONS
GET_TRANSACTION
CREATE_TRANSACTION
UPDATE_TRANSACTION
DELETE_TRANSACTION
GET_BALANCES
```

### Example Request

```json
{
  "action": "CREATE_TRANSACTION",
  "data": {
    "transactionDate": "07-09-2026",
    "transactionType": "EXPENSE",
    "amount": 2500,
    "categoryId": "CAT001",
    "paymentMethod": "BANK",
    "paidFromAccountId": "ACC001",
    "notes": "Dinner"
  }
}
```

### Success Response

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transactionId": "TXN-20260907-A81F32"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than zero"
  }
}
```

---

## 🔄 Application Flow

### Application Startup

```text
User opens application
        ↓
Cloudflare Pages
        ↓
index.html
        ↓
JavaScript initialization
        ↓
GET_MASTER_DATA
        ↓
Google Apps Script
        ↓
Google Sheets
        ↓
Accounts + Categories + Configuration
        ↓
JSON Response
        ↓
Frontend Application State
        ↓
Render Application
```

### Create Expense

```text
Open Transaction Form
        ↓
Select EXPENSE
        ↓
Enter Date
        ↓
Enter Amount
        ↓
Select Category
        ↓
Select Payment Method
        ↓
Select Account
        ↓
Enter Notes
        ↓
Client Validation
        ↓
CREATE_TRANSACTION
        ↓
Apps Script Validation
        ↓
Generate Transaction ID
        ↓
Write Transaction
        ↓
Return Success
        ↓
Refresh Transactions
        ↓
Refresh Balances
```

---

## 🔐 Security

Phase 1 does not implement user authentication.

However:

* Google Sheet credentials must never be exposed in frontend code.
* Google service-account credentials must never be exposed in frontend code.
* API secrets must not be stored in frontend JavaScript.
* The browser should communicate with the Google Apps Script API rather than directly exposing the spreadsheet.
* Server-side validation must always be performed even when client-side validation exists.

Authentication and authorization are planned for Phase 3.

---

## ✅ Validation

Common validation:

* Date is required.
* Date must follow `DD-MM-YYYY`.
* Amount must be greater than zero.
* Notes are optional.

Expense:

* Category is required.
* Payment method is required.
* Paid-from account is required.
* Account type must match the selected payment method.

Income:

* Category is required.
* Receiving account is required.

Transfer:

* From account is required.
* To account is required.
* From and To accounts cannot be the same.
* Amount must be greater than zero.

---

## 🔒 Concurrent Writes

Google Apps Script locking should be used for transaction writes.

```text
Acquire Lock
     ↓
Validate Request
     ↓
Generate Transaction ID
     ↓
Write Transaction
     ↓
Release Lock
```

This helps prevent duplicate IDs and conflicting simultaneous writes.

---

## 🧪 Testing

### Frontend

Use:

* Chrome
* Chrome DevTools

Test:

* Form behavior
* Field validation
* Dynamic field visibility
* Date validation
* API error handling
* Responsive layout

### API

Use:

* Postman
* Bruno

Test:

* Master-data retrieval
* Transaction creation
* Transaction retrieval
* Transaction update
* Transaction deletion
* Balance calculation
* Invalid requests
* Invalid account/category references

### Business Scenarios

Important scenarios include:

```text
Salary → Bank
Bank → Bank
Bank → Merchant
Credit Card → Merchant
Credit Card → Gift Card
Gift Card → Merchant
Bank → Credit Card
Bank → Cash
Cash → Bank
```

---

## 🌿 Git Branching

The initial feature branch for this version is:

```text
feature/expense-tracker-v0.1
```

Recommended workflow:

```bash
git checkout main
git pull origin main
git checkout -b feature/expense-tracker-v0.1
```

After development:

```bash
git add .
git commit -m "Implement expense tracker v0.1"
git push -u origin feature/expense-tracker-v0.1
```

---

## 🚧 Out of Scope

The following are intentionally excluded from the current version:

* Authentication
* Authorization
* User registration
* User-level private data
* Bank API integration
* Credit-card API integration
* SMS/email transaction parsing
* Automated transaction synchronization
* Attachments/receipts
* Import/export
* Notifications
* Budgeting
* Subcategories
* Separate investment account
* Separate loan account
* Separate cash account
* Refund workflow
* Recurring transactions
* Dashboard
* Search
* Advanced filtering

---

## 📌 Development Roadmap

### v0.1

Core expense tracker:

```text
Google Sheets
    ↓
Master Data
    ↓
Apps Script API
    ↓
Repository Layer
    ↓
Validation
    ↓
Transaction Service
    ↓
Balance Service
    ↓
API Testing
    ↓
Frontend
    ↓
Dynamic Transaction Form
    ↓
CRUD
    ↓
Balance UI
    ↓
Cloudflare Pages
    ↓
End-to-End Testing
```

### Future Versions

```text
v0.1 → Core Transaction Management
v0.2 → Dashboard & Reporting
v0.3 → Search & Advanced Filtering
v0.4 → Authentication & Authorization
```

---

## 📄 Documentation

The project is supported by separate business and technical documentation covering:

* Business requirements
* Functional requirements
* Data model
* API design
* Application architecture
* Transaction rules
* Balance calculations
* Implementation approach

---

## 📜 License

License information will be added when the project is ready for public distribution.
