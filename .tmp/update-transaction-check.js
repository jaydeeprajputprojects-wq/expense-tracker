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

const sheetData = [
  {
    Transaction_ID: 'TXN-100',
    Transaction_Date: '20-09-2026',
    Transaction_Type: 'EXPENSE',
    Amount: 1000,
    Category_ID: 'CAT001',
    Payment_Method: 'BANK',
    Paid_From_Account_ID: 'ACC001',
    Received_Into_Account_ID: '',
    From_Account_ID: '',
    To_Account_ID: '',
    Notes: 'Original expense',
    Created_Date: '2026-09-01',
    Updated_Date: '2026-09-01',
    Status: 'ACTIVE'
  }
];

const headers = Object.keys(sheetData[0]);
const rowValues = [headers, ...sheetData.map(row => headers.map(key => row[key] ?? ''))];

const buildSheet = () => {
  const sheet = {
    name: 'Transactions',
    getLastRow: () => rowValues.length,
    getLastColumn: () => rowValues[0].length,
    getRange: (row, col, numRows, numCols) => ({
      getValues: () => {
        const rows = rowValues.slice(row - 1, (row - 1) + numRows || rowValues.length);
        return rows.map(r => r.slice(col - 1, (col - 1) + numCols || r.length));
      },
      setValues: (values) => {
        const targetRow = row - 1;
        rowValues[targetRow] = values[0];
        return true;
      }
    }),
    appendRow: () => {},
    getDataRange: () => ({
      getValues: () => rowValues
    })
  };

  return sheet;
};

const context = {
  console,
  Logger: { log: () => {} },
  Utilities: { getUuid: () => '1234567890abcdef' },
  sheetData,
  rowValues,
  headers,
  SpreadsheetApp: {
    openById: () => ({
      getSheetByName: () => buildSheet()
    })
  },
  ContentService: {
    createTextOutput: (txt) => ({ getContent: () => txt, setMimeType: () => ({}) }),
    MimeType: { JSON: 'application/json' }
  },
  LockService: {
    getScriptLock: () => ({
      waitLock: () => {},
      releaseLock: () => {}
    })
  }
};

const ctx = vm.createContext(context);
for (const file of files) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
}

vm.runInContext(`
  function getAccounts() {
    return [
      { accountId: 'ACC001', accountName: 'SBI Bank', accountType: 'BANK', openingBalance: 10000, status: 'ACTIVE' }
    ];
  }
  function getCategories() {
    return [
      { Category_ID: 'CAT001', Category_Name: 'Groceries' }
    ];
  }
  function getConfiguration() { return []; }
  function getAllRecords(sheetName) {
    return sheetData;
  }
`, ctx);

const result = vm.runInContext("TransactionService.updateTransaction('TXN-100', { transactionType: 'EXPENSE', transactionDate: '22-09-2026', amount: 2000, categoryId: 'CAT001', paymentMethod: 'BANK', paidFromAccountId: 'ACC001', notes: 'Updated expense' })", ctx);
if (!result || result.success !== true || result.transactionId !== 'TXN-100') {
  throw new Error('UPDATE_TRANSACTION failed: ' + JSON.stringify(result));
}
if (result.record.Amount !== 2000) {
  throw new Error('UPDATE_TRANSACTION did not update amount: ' + JSON.stringify(result));
}
console.log(JSON.stringify(result, null, 2));
console.log('PASS: update transaction checks verified');
