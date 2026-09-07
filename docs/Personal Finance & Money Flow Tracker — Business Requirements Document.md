# Business Requirements Document (BRD)

## Personal Finance & Money Flow Tracker

**Document Version:** 1.0  
**Status:** Draft / Baseline Requirements  
**Primary Scope:** Phase 1  
**Future Enhancements:** Phase 2 and Phase 3  

---

# 1. Executive Summary

The Personal Finance & Money Flow Tracker is a lightweight web-based application designed to provide a consolidated view of personal financial transactions across multiple bank accounts, credit cards, and gift cards.

The primary purpose of the application is not simply to record expenses, but to accurately track **where money/value comes from, where it moves, and where it is ultimately consumed**.

The application will allow users to manually record:

- Expenses
- Income
- Transfers

The system will maintain account-level balances/value and distinguish between actual expenses and internal money movements.

For example:

- Bank → Merchant = Expense
- Credit Card → Merchant = Expense
- Gift Card → Merchant = Expense
- Bank → Bank = Transfer
- Credit Card → Gift Card = Transfer
- Bank → Credit Card bill payment = Transfer
- Bank → Cash withdrawal = Transfer

This approach prevents double-counting and provides a more accurate representation of personal financial activity.

---

# 2. Business Objective

The main objectives are:

1. Maintain a centralized record of financial transactions.
2. Track multiple bank accounts.
3. Track multiple credit cards.
4. Track multiple gift cards.
5. Maintain current balances/value for supported accounts.
6. Track monthly and category-wise expenses.
7. Track income.
8. Track money movement between accounts.
9. Prevent transfers from being incorrectly counted as expenses.
10. Prevent credit-card bill payments from being counted as new expenses.
11. Prevent gift-card purchases from being counted as expenses until the gift card is actually used.
12. Provide a clear foundation for future dashboards, reporting, search, filtering, and user authentication.

---

# 3. Scope

## 3.1 In Scope — Phase 1

The first version will include:

- Public application access through URL.
- No authentication.
- Bank account management through master data.
- Credit card management through master data.
- Gift card management through master data.
- Category management through master data.
- Add transaction.
- View transaction history.
- Edit transaction.
- Delete transaction.
- Three transaction types:
  - Expense
  - Income
  - Transfer
- Dynamic transaction form.
- Account balance/value tracking.
- Credit-card spending tracking.
- Gift-card balance tracking.
- Manual income recording.
- Transfer tracking.
- Cash withdrawal/deposit as transfers.
- Credit-card bill payment as transfer.
- Investment as expense.
- Loan payment as expense.

---

# 4. Future Scope

## 4.1 Phase 2

The following functionality will be introduced in Phase 2:

- Financial dashboard.
- Charts and visualizations.
- Month-wise expense reporting.
- Category-wise expense reporting.
- Account-wise reporting.
- Credit-card-wise reporting.
- Gift-card-wise reporting.
- Payment-method-wise reporting.
- Transaction search.
- Transaction filters.
- More detailed money-flow visualization.

## 4.2 Phase 3

Phase 3 may introduce:

- User authentication.
- User-specific access.
- User-specific/private financial data.
- Role-based access if required.
- Additional security controls.

---

# 5. User Access & Security

## 5.1 Phase 1 Access Model

The application will be publicly accessible to anyone who possesses the application URL.

There will be:

- No login page.
- No registration.
- No authentication.
- No user-level data restriction.
- No user ownership concept.

All users accessing the application will initially work with the same underlying financial data.

## 5.2 Future Access Model

Authentication and user-level restrictions will be considered in Phase 3.

The architecture should therefore avoid unnecessary design decisions that would make future user separation impossible.

---

# 6. Financial Account Model

The application will support exactly three account types.

## 6.1 Bank Account

Examples:

- SBI Bank
- HDFC Bank
- ICICI Bank

A user may maintain multiple bank accounts.

Each bank account should have master information such as:

- Account Name
- Bank/Institution
- Account Type
- Opening Balance
- Active/Inactive status

The system will calculate and maintain the current balance based on transactions.

---

## 6.2 Credit Card

A user may maintain multiple credit cards.

For Phase 1, the credit-card master information will remain intentionally simple.

Required information:

- Card Name
- Total Spent / Outstanding tracking value

Example:

| Credit Card | Total Spent |
|---|---:|
| ICICI Amazon CC | ₹25,000 |
| HDFC Regalia | ₹40,000 |

Credit-card spending will increase the amount spent/outstanding.

Credit-card payments will reduce the outstanding amount but will **not create another expense**.

---

## 6.3 Gift Card

A user may maintain multiple gift cards.

Examples:

- Amazon Gift Card
- Flipkart Gift Card
- Myntra Gift Card

Gift-card master information should include sufficient information to identify the gift card and its opening/initial value.

The system will maintain the current available gift-card balance.

Example:

Initial gift card value:

> ₹5,000

After ₹1,500 purchase:

> Remaining balance = ₹3,500

---

# 7. Master Data Management

Master information will initially be maintained directly in Google Sheets.

The web application will use the master sheet as the reference source for dropdowns and account/category information.

## 7.1 Account Master

The master data should maintain separate lists for:

- Bank Accounts
- Credit Cards
- Gift Cards

The application should retrieve these values dynamically.

Inactive accounts should not normally be offered for new transactions, while historical transactions associated with them should remain available.

---

## 7.2 Category Master

The application will use a predefined category list.

There will be:

- No subcategories.
- No category hierarchy.
- No category creation from the application in Phase 1.

Categories will be maintained in the master sheet.

For initial testing, the master sheet may contain three categories.

Example:

- Food
- Travel
- Shopping

The final production category list can be expanded by updating the master data.

---

# 8. Transaction Model

The application will have exactly **three transaction types**.

## 8.1 Expense

An Expense represents money/value that has ultimately been consumed.

Examples:

- Product purchase.
- Service purchase.
- Investment.
- Loan payment.
- Purchase made using a bank account.
- Purchase made using a credit card.
- Purchase made using a gift card.

---

## 8.2 Income

Income represents money/value received by the user.

Examples:

- Salary.
- Bonus.
- Other manually recorded income.

Income will be entered manually through the transaction form.

---

## 8.3 Transfer

Transfer represents movement of money/value between accounts, people, cash, cards, gift cards, or other financial instruments without representing a new expense or income.

Examples:

- SBI → HDFC.
- SBI → another person's account.
- Another person → user's SBI account.
- Credit Card → Gift Card.
- Bank → Gift Card.
- Bank → Credit Card.
- Bank → Cash.
- Cash → Bank.
- Credit Card → Wallet.

---

# 9. Transaction Classification Rules

The following rules are core business rules.

| Scenario | Classification |
|---|---|
| Bank → Merchant | Expense |
| Credit Card → Merchant | Expense |
| Gift Card → Merchant | Expense |
| Investment | Expense |
| Loan Payment | Expense |
| Salary received | Income |
| Other money received as income | Income |
| Bank → Bank | Transfer |
| Bank → Other Person | Transfer |
| Other Person → Bank | Transfer |
| Credit Card → Gift Card | Transfer |
| Bank → Gift Card | Transfer |
| Bank → Credit Card | Transfer |
| Credit Card → Wallet | Transfer |
| Bank → Cash | Transfer |
| Cash → Bank | Transfer |

### Fundamental rule

> **Transfers must not be included in expense totals.**

Likewise:

> **Transfers must not be included in income totals.**

---

# 10. Expense Business Rules

An expense should represent the point at which a product/service/value is actually consumed.

## Example 1 — Bank Purchase

₹2,000 spent from SBI on groceries.

Transaction:

> Type = Expense  
> Amount = ₹2,000  
> Paid From = SBI  
> Category = Food

SBI balance decreases by ₹2,000.

Expense total increases by ₹2,000.

---

## Example 2 — Credit Card Purchase

₹5,000 hotel booking using ICICI Credit Card.

Transaction:

> Type = Expense  
> Amount = ₹5,000  
> Paid From = ICICI Credit Card

Credit-card outstanding/spending increases by ₹5,000.

Expense total increases by ₹5,000.

---

## Example 3 — Gift Card Purchase

₹5,000 Amazon Gift Card purchased using ICICI Credit Card.

This is **not an expense**.

It is:

> ICICI Credit Card → Amazon Gift Card

Transaction:

> Type = Transfer  
> Amount = ₹5,000

The credit-card liability/value increases appropriately.

The gift-card balance increases by ₹5,000.

Expense total does **not** increase.

---

## Example 4 — Gift Card Usage

₹1,000 purchase made using the Amazon Gift Card.

Transaction:

> Type = Expense  
> Amount = ₹1,000  
> Paid From = Amazon Gift Card

Gift-card balance decreases by ₹1,000.

Expense total increases by ₹1,000.

This prevents double-counting.

---

# 11. Credit Card Payment Rules

Credit-card bill payment is treated as a **Transfer**.

Example:

September:

> ₹20,000 purchases made using ICICI Credit Card.

September expense:

> ₹20,000

October:

> ₹20,000 transferred from SBI to ICICI Credit Card to pay the bill.

October transaction:

> Type = Transfer

October expense:

> ₹0 from the credit-card payment itself.

The original ₹20,000 expense remains associated with the actual purchase dates.

### Business Rule

> The expense date is the date on which the actual product/service was purchased, not the date on which the credit-card bill was paid.

---

# 12. Cash Withdrawal and Deposit

Cash is not a separate supported account type.

Cash movement will be treated as a transfer.

## Cash Withdrawal

Example:

> SBI → Cash ₹10,000

Transaction type:

> Transfer

Effect:

- SBI balance decreases by ₹10,000.
- Expense does not increase.

## Cash Deposit

Example:

> Cash → SBI ₹5,000

Transaction type:

> Transfer

Effect:

- SBI balance increases by ₹5,000.
- Income does not increase.

The cash side is considered an external/untracked balance in Phase 1.

---

# 13. Investment

Investment will be recorded using the **Expense** transaction type.

Example:

> ₹10,000 invested.

Transaction:

> Type = Expense  
> Amount = ₹10,000  
> Category = Investment

The amount will be included in expense calculations according to the agreed business rule.

No separate Investment account type is required in Phase 1.

---

# 14. Loan Payment

Loan payment will also be recorded using the **Expense** transaction type.

Example:

> ₹15,000 loan payment.

Transaction:

> Type = Expense  
> Amount = ₹15,000

No separate Loan account type is required in Phase 1.

---

# 15. Income Management

Income will be manually entered through the same transaction form.

Example:

> Date: 01-Sep-2026  
> Type: Income  
> Amount: ₹80,000  
> Category: Salary  
> Paid To: SBI Bank

Effect:

- SBI balance increases.
- Total income increases.

Income will be included in future monthly and category reports.

---

# 16. Transaction Form

The application will use a **single transaction form** for all transaction types.

The form will dynamically change based on the selected transaction type.

## Common fields

The form will contain:

1. Transaction Type
2. Date
3. Amount
4. Category
5. Payment Method
6. Paid From
7. Notes

Not every field will necessarily be visible for every transaction type.

---

# 17. Dynamic Form Behaviour

## 17.1 Expense

For Expense:

- Transaction Type = Expense
- Date
- Amount
- Category
- Payment Method
- Paid From
- Notes

Example:

> Expense → ₹2,000 → Food → Bank → SBI

---

## 17.2 Income

For Income:

- Transaction Type = Income
- Date
- Amount
- Category
- Receiving Account
- Notes

The UI may reuse the existing `Paid From` field conceptually but should display an appropriate label such as **Received Into** for better user understanding.

---

## 17.3 Transfer

Transfer requires two endpoints:

- From
- To

Example:

> SBI → HDFC

or:

> ICICI Credit Card → Amazon Gift Card

or:

> SBI → Cash

Therefore, when Transaction Type = Transfer, the form should display:

- Date
- Amount
- From Account/Source
- To Account/Destination
- Notes

Category and payment method are not required for a standard transfer.

---

# 18. Payment Method

For expenses, Payment Method identifies the instrument used for the payment.

Supported payment methods include:

- Bank
- Credit Card
- Gift Card

The exact account shown in `Paid From` must depend on the selected payment method.

### Example

Payment Method:

> Credit Card

Paid From:

- ICICI Credit Card
- HDFC Credit Card
- SBI Credit Card

Payment Method:

> Bank

Paid From:

- SBI
- HDFC
- ICICI

Payment Method:

> Gift Card

Paid From:

- Amazon Gift Card
- Flipkart Gift Card

This relationship should be dynamically populated from master data.

---

# 19. Transaction Date

Only a **date** is required.

Time is not required in Phase 1.

The application must allow transactions to be entered for the appropriate historical date.

This is important because users may need to record transactions after they actually occurred.

---

# 20. Transaction CRUD Operations

Phase 1 will support:

### Add

User can create a new transaction.

### View

User can view recorded transactions.

### Edit

User can modify an existing transaction.

### Delete

User can delete an existing transaction.

There is no separate refund workflow.

If a transaction was entered incorrectly or needs to be reversed, the agreed Phase 1 approach is to delete and recreate it where necessary.

---

# 21. Balance Calculation

The system must maintain current financial values based on:

- Opening balances from master data.
- Recorded transactions.

## Bank

Conceptually:

**Current Bank Balance = Opening Balance + Income + Incoming Transfers − Expenses − Outgoing Transfers**

---

## Credit Card

Conceptually:

**Current Credit Card Outstanding = Opening Outstanding + Credit Card Expenses + Incoming Liability Transfers − Credit Card Payments − Other Outgoing Settlement Adjustments**

The exact implementation should ensure that credit-card bill payment does not become an expense.

---

## Gift Card

Conceptually:

**Current Gift Card Balance = Opening Gift Card Value + Gift Card Loading/Transfer In − Gift Card Expenses − Gift Card Transfers Out**

Example:

Opening:

> ₹5,000

Purchase/use:

> ₹1,500

Current:

> ₹3,500

---

# 22. Transaction Impact Rules

| Transaction | Source Impact | Destination Impact | Expense? | Income? |
|---|---|---|---|---|
| Bank Expense | Decrease | — | Yes | No |
| Credit Card Expense | Increase Outstanding | — | Yes | No |
| Gift Card Expense | Decrease | — | Yes | No |
| Income | — | Increase | No | Yes |
| Bank → Bank | Decrease | Increase | No | No |
| Bank → Gift Card | Decrease | Increase Gift Card Value | No | No |
| CC → Gift Card | Increase CC Outstanding | Increase Gift Card Value | No | No |
| Bank → CC Payment | Decrease Bank | Decrease CC Outstanding | No | No |
| Bank → Cash | Decrease Bank | External Cash Increase | No | No |
| Cash → Bank | External Cash Decrease | Increase Bank | No | No |

---

# 23. Data Validation

The application should validate the following before saving a transaction.

## Common validation

- Transaction type is mandatory.
- Date is mandatory.
- Amount is mandatory.
- Amount must be greater than zero.
- Required account/source/destination must be selected.
- Category must be selected where applicable.
- Payment method must be selected for expenses.
- Notes are optional.

## Transfer validation

The application should require:

- From
- To

The system should prevent:

> From Account = To Account

because such a transaction has no financial meaning.

---

# 24. Gift Card Validation

When recording a gift-card expense, the application should verify that sufficient gift-card value is available.

Example:

Gift Card Balance:

> ₹1,000

Attempted expense:

> ₹1,500

The transaction should not be accepted because the gift-card balance is insufficient.

This validation helps maintain accurate gift-card balances.

---

# 25. Credit Card Validation

The system should track credit-card spending/outstanding.

For Phase 1, credit-limit enforcement is not required unless a credit limit is later introduced into the master data.

The application should nevertheless maintain the accumulated credit-card spending/payment values accurately.

---

# 26. Transaction Editing Impact

When a transaction is edited, its financial impact must be recalculated.

Example:

Original:

> SBI Expense ₹5,000

Edited to:

> SBI Expense ₹3,000

The system must reflect the ₹2,000 difference in the calculated SBI balance and expense totals.

Similarly, changing:

> Gift Card Expense ₹1,000

to:

> Gift Card Expense ₹500

must restore ₹500 to the gift-card balance.

Transfer edits must update both source and destination balances.

---

# 27. Transaction Deletion Impact

Deleting a transaction must remove its financial impact from calculated balances.

Example:

Original:

> SBI Expense ₹5,000

After deletion:

> SBI balance must increase back by ₹5,000 relative to the state containing that transaction.

Similarly, deleting a transfer must reverse the transfer impact on both sides.

---

# 28. Master Data Relationship

The application should not hard-code account names or category values.

Google Sheets will act as the initial master-data source.

Example master structure:

### Bank Account Master

| ID | Account Name | Opening Balance | Status |
|---|---|---:|---|
| B001 | SBI | 50000 | Active |
| B002 | HDFC | 30000 | Active |

### Credit Card Master

| ID | Card Name | Opening Outstanding | Status |
|---|---|---:|---|
| C001 | ICICI Amazon CC | 0 | Active |
| C002 | HDFC Card | 5000 | Active |

### Gift Card Master

| ID | Gift Card Name | Opening Balance | Status |
|---|---|---:|---|
| G001 | Amazon Gift Card | 5000 | Active |

### Category Master

| ID | Category | Status |
|---|---|---|
| CAT001 | Food | Active |
| CAT002 | Travel | Active |
| CAT003 | Shopping | Active |

The exact spreadsheet columns can be finalized during technical design.

---

# 29. Google Sheet Data Structure

The Google Sheet will contain at least:

1. Account Master
2. Credit Card Master
3. Gift Card Master
4. Category Master
5. Transaction Data

The master sheets provide reference information while the transaction sheet stores transaction records.

The application should treat the transaction data as the source for calculating financial activity.

---

# 30. Transaction Record

A transaction record should conceptually contain:

- Transaction ID
- Transaction Type
- Transaction Date
- Amount
- Category
- Payment Method
- Source/Paid From
- Destination/Received To
- Notes
- Created/Updated information where required by implementation

The final physical column structure can be determined during technical design.

---

# 31. Money Flow

The application is intended to capture not only expenses but also the movement of money/value.

Example:

### Salary Flow

> Salary → SBI

Then:

> SBI → ICICI Credit Card Payment

Then:

> ICICI Credit Card → Merchant

The system should be able to distinguish these events:

- Salary = Income
- SBI → Credit Card = Transfer
- Credit Card → Merchant = Expense

---

# 32. Example Complete Money Flow

Consider:

### Step 1

Salary received:

> ₹80,000 → SBI

Type:

> Income

### Step 2

₹20,000 transferred from SBI to HDFC.

Type:

> Transfer

### Step 3

₹5,000 Amazon Gift Card purchased using ICICI Credit Card.

Type:

> Transfer

### Step 4

₹2,000 Amazon purchase using Gift Card.

Type:

> Expense

### Step 5

₹10,000 hotel booking using ICICI Credit Card.

Type:

> Expense

### Step 6

₹12,000 transferred from SBI to ICICI Credit Card for bill payment.

Type:

> Transfer

The reporting logic must not count Step 3 or Step 6 as expenses.

Only the actual consumption transactions in Steps 4 and 5 are expenses.

---

# 33. Phase 1 Transaction View

The transaction screen should provide a basic list/table of recorded transactions.

Suggested information:

- Date
- Type
- Amount
- Category
- Payment Method
- From/Paid From
- To/Received To
- Notes
- Actions

Actions:

- Edit
- Delete

Advanced search and filtering are not required in Phase 1.

---

# 34. Phase 2 Dashboard

Dashboard functionality is explicitly deferred to Phase 2.

The dashboard may include:

### Financial Summary

- Total Income
- Total Expenses
- Net Cash Flow
- Total Transfers

### Account Summary

- Bank balances
- Credit-card outstanding/spending
- Gift-card balances

### Expense Analysis

- Monthly expenses
- Category-wise expenses
- Account-wise expenses
- Credit-card-wise expenses
- Gift-card-wise expenses

### Charts

Chart.js or another lightweight charting library may be used during implementation.

---

# 35. Phase 2 Search and Filtering

Search/filter functionality is deferred to Phase 2.

Potential filters:

- Date
- Month
- Transaction Type
- Category
- Payment Method
- Bank Account
- Credit Card
- Gift Card
- Amount range
- Merchant/description/notes if such a field is introduced later

Global text search may also be considered.

---

# 36. User Interface Requirements

The application should provide a simple, responsive interface.

Primary screens:

1. Home / Transaction Dashboard
2. Add Transaction
3. Transaction List
4. Edit Transaction
5. Account/Balance View

The exact navigation structure can be finalized during UI design.

---

# 37. Responsive Design

The application should work on:

- Desktop
- Laptop
- Tablet
- Mobile browser

The primary transaction-entry experience should remain usable on smaller screens.

---

# 38. Technical Architecture

The agreed initial technical architecture is:

**Frontend**

- HTML
- CSS
- Vanilla JavaScript

**Styling**

- Tailwind CSS

**Icons**

- Lucide Icons

**Charts**

- Chart.js for Phase 2

**API / Serverless Logic**

- Google Apps Script

**Data Store**

- Google Sheets

**Hosting**

- Cloudflare Pages

Conceptual architecture:

> User Browser  
> ↓  
> Cloudflare Pages  
> ↓  
> JavaScript Application  
> ↓  
> Google Apps Script API  
> ↓  
> Google Sheets

Google Drive will be used as the underlying storage/location for the Google Sheet, but **Google Drive will not be used as the website hosting platform**.

---

# 39. API Responsibility

Google Apps Script will act as the lightweight API layer between the frontend and Google Sheets.

It will be responsible for operations such as:

- Fetch master data.
- Fetch transactions.
- Create transaction.
- Update transaction.
- Delete transaction.
- Validate applicable business rules.
- Calculate or retrieve required financial values.

The frontend should not directly manipulate the Google Sheet.

---

# 40. Security Considerations

Although authentication is out of scope for Phase 1, the application should not expose unnecessary Google Sheet access credentials or sensitive implementation details in frontend JavaScript.

The frontend should communicate with the Google Apps Script endpoint rather than directly exposing the spreadsheet.

Authentication and authorization will be addressed in Phase 3.

---

# 41. Non-Functional Requirements

## Performance

The application should provide a lightweight user experience and should avoid unnecessary network requests.

## Availability

The application should be available whenever the hosting and Google services are available.

## Usability

Transaction entry should require minimal steps.

## Maintainability

Master data should be configurable through Google Sheets without requiring frontend code changes for ordinary account/category additions.

## Scalability

The design should allow future introduction of:

- Authentication
- Multiple users
- User-specific data
- More reports
- More financial entities

---

# 42. Error Handling

The application should provide clear messages for failures such as:

- Unable to load master data.
- Unable to save transaction.
- Unable to update transaction.
- Unable to delete transaction.
- Invalid amount.
- Missing required field.
- Insufficient gift-card balance.
- Invalid transfer.
- Source and destination are the same.
- Google Apps Script/API unavailable.

The user should receive understandable error messages rather than technical errors.

---

# 43. Out of Scope

The following are explicitly out of scope for the current version:

- User authentication.
- User registration.
- Role-based access.
- Private user data.
- Bank API integration.
- Credit-card API integration.
- Automatic transaction synchronization.
- SMS parsing.
- Email parsing.
- Receipt scanning.
- Attachments.
- Receipt/invoice storage.
- Import functionality.
- Export functionality.
- Notifications.
- Budget management.
- Refund workflow.
- Subcategories.
- Separate investment account.
- Separate loan account.
- Separate cash account.
- Advanced accounting.
- Tax management.
- Interest transaction type.
- Cashback transaction type.
- Dashboard in Phase 1.
- Search/filter in Phase 1.
- Recurring transaction automation.

---

# 44. Important Business Rules Summary

The following rules are critical and must remain consistent throughout implementation.

### Rule 1

Only three transaction types exist:

> Expense, Income, Transfer.

### Rule 2

Transfers are never expenses.

### Rule 3

Transfers are never income.

### Rule 4

Credit-card bill payment is a transfer.

### Rule 5

Credit-card bill payment does not create a new expense.

### Rule 6

The actual credit-card purchase is recorded as an expense on the purchase date.

### Rule 7

Gift-card purchase is a transfer.

### Rule 8

Gift-card usage is an expense.

### Rule 9

Gift-card balance must decrease when the gift card is used.

### Rule 10

Bank-to-bank movement is a transfer.

### Rule 11

Bank-to-other-person movement is a transfer.

### Rule 12

Money received from another person is a transfer unless it is specifically recorded as income.

### Rule 13

Cash withdrawal is a transfer.

### Rule 14

Cash deposit is a transfer.

### Rule 15

Investment is recorded as an expense.

### Rule 16

Loan payment is recorded as an expense.

### Rule 17

Opening balances come from master data.

### Rule 18

Current balances are derived from opening balances and transactions.

### Rule 19

Only dates are required; transaction time is not required.

### Rule 20

Refund processing is not supported in Phase 1.

### Rule 21

Incorrect transactions may be deleted and recreated.

### Rule 22

Categories have no subcategories.

### Rule 23

Account lists and categories are maintained through Google Sheets master data.

---

# 45. Phase-wise Delivery Plan

## Phase 1 — Core Transaction Management

### Account & Master Data

- Bank master
- Credit-card master
- Gift-card master
- Category master

### Transactions

- Expense
- Income
- Transfer

### Transaction Management

- Add
- View
- Edit
- Delete

### Financial Logic

- Bank balance
- Credit-card outstanding/spending
- Gift-card balance
- Transfer calculation
- Expense calculation
- Income calculation

### UI

- Responsive transaction form
- Dynamic fields
- Transaction list
- Basic balance information

---

## Phase 2 — Reporting & Analysis

- Dashboard
- Charts
- Monthly analysis
- Category analysis
- Account analysis
- Credit-card analysis
- Gift-card analysis
- Search
- Filters
- Enhanced money-flow visualization

---

## Phase 3 — Access Control

- Authentication
- User accounts
- User-specific data
- Authorization
- Role management if required
- Security enhancements

---

# 46. Acceptance Criteria — Phase 1

The Phase 1 implementation will be considered functionally complete when:

1. A user can open the application using its URL without authentication.
2. Bank accounts can be maintained through master data.
3. Credit cards can be maintained through master data.
4. Gift cards can be maintained through master data.
5. Categories can be maintained through master data.
6. A user can create an Expense.
7. A user can create an Income.
8. A user can create a Transfer.
9. The transaction form dynamically changes according to transaction type.
10. Expense payment-method selection dynamically loads relevant accounts.
11. Bank expenses reduce bank balance.
12. Credit-card expenses increase credit-card outstanding/spending.
13. Gift-card expenses reduce gift-card balance.
14. Income increases the destination account balance.
15. Bank-to-bank transfers correctly update both accounts.
16. Credit-card bill payments do not appear as expenses.
17. Gift-card purchases do not appear as expenses.
18. Gift-card usage appears as an expense.
19. Cash withdrawals are recorded as transfers.
20. Cash deposits are recorded as transfers.
21. Investment can be recorded as an expense.
22. Loan payment can be recorded as an expense.
23. Transactions can be viewed.
24. Transactions can be edited.
25. Transactions can be deleted.
26. Editing a transaction correctly updates its financial impact.
27. Deleting a transaction correctly reverses its financial impact.
28. Invalid transactions are rejected with understandable error messages.
29. Transaction date is stored and displayed correctly.
30. No transaction time is required.
31. No attachment functionality is required.
32. No search/filter functionality is required in Phase 1.
33. No dashboard functionality is required in Phase 1.

---

# 47. Assumptions

1. Google Sheets will be the initial central data store.
2. Google Apps Script will provide the API layer.
3. All transactions will initially be entered manually.
4. There will be no automated bank/card synchronization.
5. The application will initially operate as a shared ledger.
6. The application will initially be publicly accessible.
7. Master data will be maintained directly through Google Sheets.
8. Only three account types are supported.
9. Cash is not maintained as a formal account.
10. Investment and loan payments are intentionally classified as expenses.
11. Refunds are not separately modeled.
12. The user accepts deletion/re-entry as the correction mechanism for incorrect transactions.
13. Dashboard and advanced reporting are deferred to Phase 2.
14. Authentication and user separation are deferred to Phase 3.

---

# 48. Final Business Concept

The application should be understood as a **Personal Financial Transaction and Money-Flow Ledger**, rather than simply an expense tracker.

The core principle is:

> **Track the actual financial event and distinguish consumption from movement of money/value.**

For example:

**Salary**

> External Source → SBI  
> **Income**

**Credit Card Bill Payment**

> SBI → Credit Card  
> **Transfer**

**Gift Card Purchase**

> Credit Card → Gift Card  
> **Transfer**

**Actual Gift Card Purchase**

> Gift Card → Merchant  
> **Expense**

This model ensures that the same money/value is not counted multiple times as an expense.

The Phase 1 application will therefore establish a reliable transaction foundation, while Phase 2 will build reporting and visualization on top of that foundation and Phase 3 will introduce secure multi-user access.