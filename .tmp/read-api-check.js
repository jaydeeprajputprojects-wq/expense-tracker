const fs = require('fs');
const vm = require('vm');

const files = [
  'backend/app-script/Config.gs',
  'backend/app-script/SheetRepository.gs',
  'backend/app-script/MasterDataRepository.gs',
  'backend/app-script/ResponseUtil.gs',
  'backend/app-script/ValidationService.gs',
  'backend/app-script/TransactionService.gs',
  'backend/app-script/BalanceService.gs',
  'backend/app-script/Api.gs'
];

const context = {
  console,
  Logger: { log: () => {} },
  Utilities: { getUuid: () => '1234567890abcdef' },
  SpreadsheetApp: {
    openById: () => ({
      getSheetByName: () => ({
        getLastRow: () => 2,
        getLastColumn: () => 1,
        getRange: () => ({ getValues: () => [[]] }),
        appendRow: () => {},
        getDataRange: () => ({ getValues: () => [[]] })
      }),
      getRange: () => ({ getValues: () => [[]] })
    })
  },
  ContentService: {
    createTextOutput: (txt) => ({ getContent: () => txt, setMimeType: () => ({}) }),
    MimeType: { JSON: 'application/json' }
  }
};

const ctx = vm.createContext(context);
for (const file of files) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
}

vm.runInContext(`
  function getAccounts() {
    return [
      { accountId: 'ACC001', accountName: 'SBI', accountType: 'BANK', openingBalance: 5000, status: 'ACTIVE' },
      { accountId: 'ACC002', accountName: 'HDFC', accountType: 'BANK', openingBalance: 2000, status: 'ACTIVE' },
      { accountId: 'ACC003', accountName: 'Gift Card', accountType: 'GIFT_CARD', openingBalance: 1000, status: 'ACTIVE' }
    ];
  }
  function getCategories() {
    return [
      { Category_ID: 'CAT001', Category_Name: 'Food' },
      { Category_ID: 'CAT002', Category_Name: 'Salary' }
    ];
  }
  function getConfiguration() { return []; }
  function getAllRecords(sheetName) {
    if (sheetName === 'Transactions') {
      return [
        { Transaction_ID: 'TXN-100', Transaction_Type: 'EXPENSE', Transaction_Date: '01-09-2026', Amount: 500, Category_ID: 'CAT001', Paid_From_Account_ID: 'ACC001', Notes: 'Lunch', Status: 'ACTIVE', Created_Date: '2026-09-01', Updated_Date: '2026-09-01' },
        { Transaction_ID: 'TXN-101', Transaction_Type: 'INCOME', Transaction_Date: '02-09-2026', Amount: 1000, Category_ID: 'CAT002', Received_Into_Account_ID: 'ACC001', Notes: 'Salary', Status: 'ACTIVE', Created_Date: '2026-09-02', Updated_Date: '2026-09-02' },
        { Transaction_ID: 'TXN-102', Transaction_Type: 'TRANSFER', Transaction_Date: '03-09-2026', Amount: 300, From_Account_ID: 'ACC001', To_Account_ID: 'ACC002', Notes: 'Move', Status: 'DELETED', Created_Date: '2026-09-03', Updated_Date: '2026-09-03' }
      ];
    }
    return [];
  }
`, ctx);

const txns = vm.runInContext('TransactionService.getTransactions()', ctx);
if (!Array.isArray(txns) || txns.length !== 2) {
  throw new Error('GET_TRANSACTIONS failed: ' + JSON.stringify(txns));
}

const single = vm.runInContext("TransactionService.getTransaction('TXN-100')", ctx);
if (!single || !single.success || !single.transaction || single.transaction.transactionId !== 'TXN-100') {
  throw new Error('GET_TRANSACTION valid failed: ' + JSON.stringify(single));
}

const missing = vm.runInContext("TransactionService.getTransaction('missing-id')", ctx);
if (!missing || !missing.success === false) {
  throw new Error('Missing transaction check failed: ' + JSON.stringify(missing));
}

const response = vm.runInContext('Api.handleGetTransactions({})', ctx);
const payload = JSON.parse(response.getContent());
if (!payload || payload.success !== true || !Array.isArray(payload.data.transactions) || payload.data.transactions.length !== 2) {
  throw new Error('API list failed: ' + JSON.stringify(payload));
}

console.log(JSON.stringify({ txns, single, missing, payload }, null, 2));
console.log('PASS: read API checks verified');
