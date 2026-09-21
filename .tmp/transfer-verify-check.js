const fs = require('fs');
const vm = require('vm');

const files = [
  'backend/app-script/Config.gs',
  'backend/app-script/SheetRepository.gs',
  'backend/app-script/MasterDataRepository.gs',
  'backend/app-script/ResponseUtil.gs',
  'backend/app-script/ValidationService.gs',
  'backend/app-script/TransactionService.gs',
  'backend/app-script/BalanceService.gs'
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
      { accountId: 'ACC001', accountName: 'SBI', accountType: 'BANK', openingBalance: 50000, status: 'ACTIVE' },
      { accountId: 'ACC002', accountName: 'HDFC', accountType: 'BANK', openingBalance: 20000, status: 'ACTIVE' },
      { accountId: 'ACC003', accountName: 'ICICI CC', accountType: 'CREDIT_CARD', openingBalance: 15000, status: 'ACTIVE' },
      { accountId: 'ACC004', accountName: 'Amazon Gift Card', accountType: 'GIFT_CARD', openingBalance: 5000, status: 'ACTIVE' }
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
        { Transaction_Type: 'INCOME', Received_Into_Account_ID: 'ACC001', Amount: 15000 },
        { Transaction_Type: 'EXPENSE', Paid_From_Account_ID: 'ACC001', Amount: 10000 },
        { Transaction_Type: 'TRANSFER', From_Account_ID: 'ACC001', To_Account_ID: 'ACC002', Amount: 20000 },
        { Transaction_Type: 'TRANSFER', From_Account_ID: 'ACC001', To_Account_ID: 'ACC003', Amount: 10000 },
        { Transaction_Type: 'TRANSFER', From_Account_ID: 'ACC003', To_Account_ID: 'ACC004', Amount: 5000 }
      ];
    }
    return [];
  }
`, ctx);

const bankToBank = vm.runInContext("ValidationService.validateTransfer({ transactionType:'TRANSFER', transactionDate:'21-09-2026', amount:'20000', fromAccountId:'ACC001', toAccountId:'ACC002', notes:'move' })", ctx);
if (!(bankToBank && bankToBank.valid && bankToBank.value.amount === 20000)) {
  throw new Error('Bank-to-bank validation failed: ' + JSON.stringify(bankToBank));
}

const bankToCash = vm.runInContext("ValidationService.validateTransfer({ transactionType:'TRANSFER', transactionDate:'21-09-2026', amount:'2500', fromAccountId:'ACC001', toAccountId:'CASH', notes:'withdraw' })", ctx);
if (!(bankToCash && bankToCash.valid)) {
  throw new Error('Bank-to-cash validation failed: ' + JSON.stringify(bankToCash));
}

const cashToBank = vm.runInContext("ValidationService.validateTransfer({ transactionType:'TRANSFER', transactionDate:'21-09-2026', amount:'2500', fromAccountId:'CASH', toAccountId:'ACC001', notes:'deposit' })", ctx);
if (!(cashToBank && cashToBank.valid)) {
  throw new Error('Cash-to-bank validation failed: ' + JSON.stringify(cashToBank));
}

const bankBalance = vm.runInContext("BalanceService.calculateAccountBalance('ACC001')", ctx);
if (!(bankBalance && bankBalance.currentBalance === 25000)) {
  throw new Error('Bank balance math failed: ' + JSON.stringify(bankBalance));
}

const creditOutstanding = vm.runInContext("BalanceService.calculateAccountBalance('ACC003')", ctx);
if (!(creditOutstanding && creditOutstanding.currentBalance === 10000)) {
  throw new Error('Credit-card outstanding math failed: ' + JSON.stringify(creditOutstanding));
}

const giftBalance = vm.runInContext("BalanceService.calculateAccountBalance('ACC004')", ctx);
if (!(giftBalance && giftBalance.currentBalance === 10000)) {
  throw new Error('Gift-card balance math failed: ' + JSON.stringify(giftBalance));
}

console.log('bankToBank=' + JSON.stringify(bankToBank));
console.log('bankToCash=' + JSON.stringify(bankToCash));
console.log('cashToBank=' + JSON.stringify(cashToBank));
console.log('bankBalance=' + JSON.stringify(bankBalance));
console.log('creditOutstanding=' + JSON.stringify(creditOutstanding));
console.log('giftBalance=' + JSON.stringify(giftBalance));
console.log('PASS: transfer validation and balance impact verified');
