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
        getLastRow: () => 20,
        getLastColumn: () => 20,
        getRange: () => ({ getValues: () => [[]] }),
        getDataRange: () => ({ getValues: () => [[]] }),
        appendRow: () => {},
        setValues: () => {}
      })
    })
  },
  ContentService: {
    createTextOutput: (txt) => ({
      getContent: () => txt,
      setMimeType: () => ({})
    }),
    MimeType: { JSON: 'application/json' }
  },
  LockService: {
    getScriptLock: () => ({
      waitLock: () => {},
      releaseLock: () => {}
    })
  },
  __records: {
    Transactions: [],
    Accounts: [
      { Account_ID: 'ACC001', Account_Name: 'SBI Savings', Account_Type: 'BANK', Opening_Balance: 50000, Status: 'ACTIVE' },
      { Account_ID: 'ACC002', Account_Name: 'ICICI CC', Account_Type: 'CREDIT_CARD', Opening_Balance: 0, Status: 'ACTIVE' },
      { Account_ID: 'ACC003', Account_Name: 'Amazon Gift Card', Account_Type: 'GIFT_CARD', Opening_Balance: 5000, Status: 'ACTIVE' },
      { Account_ID: 'ACC004', Account_Name: 'HDFC Savings', Account_Type: 'BANK', Opening_Balance: 15000, Status: 'ACTIVE' }
    ],
    Categories: [
      { Category_ID: 'CAT001', Category_Name: 'Food', Status: 'ACTIVE' },
      { Category_ID: 'CAT002', Category_Name: 'Travel', Status: 'ACTIVE' },
      { Category_ID: 'CAT003', Category_Name: 'Salary', Status: 'ACTIVE' }
    ],
    Configuration: [
      { Key: 'DATE_FORMAT', Value: 'dd-MM-yyyy', Status: 'ACTIVE' }
    ]
  }
};

const ctx = vm.createContext(context);
for (const file of files) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
}

vm.runInContext(`
  function getAllRecords(sheetName) {
    return __records[sheetName] || [];
  }

  function appendRecord(sheetName, record) {
    __records[sheetName].push(record);
    return { rowNumber: __records[sheetName].length, record: record };
  }

  function findRecordWithRow(sheetName, criteria) {
    const rows = __records[sheetName] || [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (row && row.Transaction_ID === criteria.Transaction_ID) {
        return { rowNumber: i + 1, record: row };
      }
    }
    return null;
  }

  function updateRecord(sheetName, rowNumber, record) {
    const rows = __records[sheetName] || [];
    rows[rowNumber - 1] = record;
    return rows[rowNumber - 1];
  }

  function getAccounts() {
    return __records.Accounts;
  }

  function getCategories() {
    return __records.Categories;
  }

  function getConfiguration() {
    return __records.Configuration;
  }

  function getSheetByName(name) {
    return { getRange: () => ({ getValues: () => [] }) };
  }
`, ctx);

function asJson(obj) {
  return JSON.parse(obj && obj.getContent ? obj.getContent() : JSON.stringify(obj || {}));
}

const masterDataResponse = asJson(vm.runInContext('Api.handleGetMasterData()', ctx));
if (!(masterDataResponse && masterDataResponse.success === true && masterDataResponse.data && Array.isArray(masterDataResponse.data.accounts) && Array.isArray(masterDataResponse.data.categories) && Array.isArray(masterDataResponse.data.configuration))) {
  throw new Error('GET_MASTER_DATA contract mismatch: ' + JSON.stringify(masterDataResponse));
}

const createdExpense = asJson(vm.runInContext(`Api.handleCreateTransaction({ data: { transactionType: 'EXPENSE', transactionDate: '21-09-2026', amount: 1200, categoryId: 'CAT001', paymentMethod: 'BANK', paidFromAccountId: 'ACC001', notes: 'Groceries' } })`, ctx));
if (!(createdExpense && createdExpense.success === true && createdExpense.data && createdExpense.data.transactionId)) {
  throw new Error('Create expense failed: ' + JSON.stringify(createdExpense));
}

const transactionId = createdExpense.data.transactionId;
const createdIncome = asJson(vm.runInContext(`Api.handleCreateTransaction({ data: { transactionType: 'INCOME', transactionDate: '22-09-2026', amount: 60000, categoryId: 'CAT003', receivedIntoAccountId: 'ACC001', notes: 'September salary' } })`, ctx));
if (!(createdIncome && createdIncome.success === true && createdIncome.data && createdIncome.data.transactionId)) {
  throw new Error('Create income failed: ' + JSON.stringify(createdIncome));
}

const createdTransfer = asJson(vm.runInContext(`Api.handleCreateTransaction({ data: { transactionType: 'TRANSFER', transactionDate: '23-09-2026', amount: 4000, fromAccountId: 'ACC001', toAccountId: 'ACC004', notes: 'Savings transfer' } })`, ctx));
if (!(createdTransfer && createdTransfer.success === true && createdTransfer.data && createdTransfer.data.transactionId)) {
  throw new Error('Create transfer failed: ' + JSON.stringify(createdTransfer));
}

const getTransaction = asJson(vm.runInContext(`Api.handleGetTransaction({ action: 'GET_TRANSACTION', transactionId: '${transactionId}' })`, ctx));
if (!(getTransaction && getTransaction.success === true && getTransaction.data && getTransaction.data.transaction && getTransaction.data.transaction.transactionId === transactionId)) {
  throw new Error('GET_TRANSACTION failed: ' + JSON.stringify(getTransaction));
}

const updatedExpense = asJson(vm.runInContext(`Api.handleUpdateTransaction({ transactionId: '${transactionId}', data: { transactionType: 'EXPENSE', transactionDate: '21-09-2026', amount: 2200, categoryId: 'CAT001', paymentMethod: 'BANK', paidFromAccountId: 'ACC001', notes: 'Updated groceries' } })`, ctx));
if (!(updatedExpense && updatedExpense.success === true && updatedExpense.data && updatedExpense.data.transaction && updatedExpense.data.transaction.Amount === 2200)) {
  throw new Error('UPDATE_TRANSACTION failed: ' + JSON.stringify(updatedExpense));
}

const deletedExpense = asJson(vm.runInContext(`Api.handleDeleteTransaction({ transactionId: '${transactionId}' })`, ctx));
if (!(deletedExpense && deletedExpense.success === true && deletedExpense.data && deletedExpense.data.transaction && deletedExpense.data.transaction.Status === 'DELETED')) {
  throw new Error('DELETE_TRANSACTION failed: ' + JSON.stringify(deletedExpense));
}

const balances = asJson(vm.runInContext('Api.handleGetBalances()', ctx));
if (!(balances && balances.success === true && Array.isArray(balances.data && balances.data.balances ? balances.data.balances : balances.data))) {
  throw new Error('GET_BALANCES failed: ' + JSON.stringify(balances));
}

console.log('PASS: Epic 7 API testing suite checks verified');
console.log('Created expense ID:', transactionId);
console.log('Balance response keys:', Object.keys(balances.data || {}));
