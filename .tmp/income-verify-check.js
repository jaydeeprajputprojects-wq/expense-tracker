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
    createTextOutput: (txt) => ({
      getContent: () => txt,
      setMimeType: () => ({})
    }),
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
      { accountId: 'ACC002', accountName: 'Credit Card', accountType: 'CREDIT_CARD', openingBalance: 0, status: 'ACTIVE' },
      { accountId: 'ACC003', accountName: 'Gift Card', accountType: 'GIFT_CARD', openingBalance: 1000, status: 'ACTIVE' }
    ];
  }
  function getCategories() {
    return [{ Category_ID: 'CAT001', Category_Name: 'Salary' }];
  }
  function getConfiguration() { return []; }
  function appendRecord(sheet, record) { return { rowNumber: 1, record: record }; }
  function getAllRecords(sheetName) {
    if (sheetName === 'Transactions') {
      return [
        { Transaction_Type: 'INCOME', Received_Into_Account_ID: 'ACC001', Amount: 2500 },
        { Transaction_Type: 'EXPENSE', Paid_From_Account_ID: 'ACC001', Amount: 1000 },
        { Transaction_Type: 'TRANSFER', From_Account_ID: 'ACC001', To_Account_ID: 'ACC002', Amount: 300 }
      ];
    }
    return [];
  }
`, ctx);

const validIncome = vm.runInContext("ValidationService.validateIncome({ transactionType:'INCOME', transactionDate:'21-09-2026', amount:'2500', categoryId:'CAT001', receivedIntoAccountId:'ACC001', notes:'Salary' })", ctx);
if (!(validIncome && validIncome.valid && validIncome.value.amount === 2500)) {
  throw new Error('Income validation failed: ' + JSON.stringify(validIncome));
}

const created = vm.runInContext("TransactionService.createTransaction({ transactionType:'INCOME', transactionDate:'21-09-2026', amount:2500, categoryId:'CAT001', receivedIntoAccountId:'ACC001', notes:'Salary' })", ctx);
if (!(created && created.success && created.transactionId)) {
  throw new Error('Income create failed: ' + JSON.stringify(created));
}

const bankBalance = vm.runInContext("BalanceService.calculateAccountBalance('ACC001')", ctx);
if (!(bankBalance && bankBalance.currentBalance === 6200)) {
  throw new Error('Income balance impact failed: ' + JSON.stringify(bankBalance));
}

const balances = vm.runInContext('BalanceService.getBalances()', ctx);
if (!(Array.isArray(balances) && balances.length > 0 && balances[0].currentBalance === 6200)) {
  throw new Error('GET_BALANCES data failed: ' + JSON.stringify(balances));
}

console.log('validIncome=' + JSON.stringify(validIncome));
console.log('created=' + JSON.stringify(created));
console.log('bankBalance=' + JSON.stringify(bankBalance));
console.log('balances=' + JSON.stringify(balances));
console.log('PASS: income API and balance impact verified');
