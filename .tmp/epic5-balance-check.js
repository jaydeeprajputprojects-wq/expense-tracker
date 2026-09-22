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
      { accountId: 'ACC001', accountName: 'Bank', accountType: 'BANK', openingBalance: 100000, status: 'ACTIVE' },
      { accountId: 'ACC002', accountName: 'Credit Card', accountType: 'CREDIT_CARD', openingBalance: 0, status: 'ACTIVE' },
      { accountId: 'ACC003', accountName: 'Gift Card', accountType: 'GIFT_CARD', openingBalance: 5000, status: 'ACTIVE' }
    ];
  }
  function getAllRecords(sheetName) {
    if (sheetName === 'Transactions') {
      return [
        { Transaction_Type: 'INCOME', Received_Into_Account_ID: 'ACC001', Amount: 80000, Status: 'ACTIVE' },
        { Transaction_Type: 'EXPENSE', Paid_From_Account_ID: 'ACC001', Amount: 10000, Status: 'ACTIVE' },
        { Transaction_Type: 'TRANSFER', From_Account_ID: 'ACC001', To_Account_ID: 'ACC003', Amount: 20000, Status: 'ACTIVE' },
        { Transaction_Type: 'EXPENSE', Paid_From_Account_ID: 'ACC002', Amount: 2500, Status: 'ACTIVE' },
        { Transaction_Type: 'EXPENSE', Paid_From_Account_ID: 'ACC003', Amount: 600, Status: 'INACTIVE' },
        { Transaction_Type: 'TRANSFER', From_Account_ID: 'ACC002', To_Account_ID: 'ACC001', Amount: 5000, Status: 'ACTIVE' }
      ];
    }
    return [];
  }
`, ctx);

const bankBalance = vm.runInContext("BalanceService.calculateAccountBalance('ACC001')", ctx);
if (!(bankBalance && bankBalance.currentBalance === 150000)) {
  throw new Error('Bank balance mismatch: ' + JSON.stringify(bankBalance));
}

const creditBalance = vm.runInContext("BalanceService.calculateAccountBalance('ACC002')", ctx);
if (!(creditBalance && creditBalance.currentBalance === 5000)) {
  throw new Error('Credit-card outstanding mismatch: ' + JSON.stringify(creditBalance));
}

const giftBalance = vm.runInContext("BalanceService.calculateAccountBalance('ACC003')", ctx);
if (!(giftBalance && giftBalance.currentBalance === 20000)) {
  throw new Error('Gift-card balance mismatch: ' + JSON.stringify(giftBalance));
}

const balances = vm.runInContext('BalanceService.getBalances()', ctx);
if (!Array.isArray(balances) || balances.length !== 3) {
  throw new Error('Balance list mismatch: ' + JSON.stringify(balances));
}

const apiResponse = vm.runInContext('Api.handleGetBalances()', ctx);
const payload = JSON.parse(apiResponse.getContent());
if (!payload || !payload.data || !payload.data.balances) {
  throw new Error('API response missing balances: ' + JSON.stringify(payload));
}

console.log('bankBalance=' + JSON.stringify(bankBalance));
console.log('creditBalance=' + JSON.stringify(creditBalance));
console.log('giftBalance=' + JSON.stringify(giftBalance));
console.log('payload=' + JSON.stringify(payload));
console.log('PASS: Epic 5 balance engine checks verified');
