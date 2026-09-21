const fs = require('fs');
const vm = require('vm');

const files = [
  'backend/app-script/Config.gs',
  'backend/app-script/SheetRepository.gs',
  'backend/app-script/MasterDataRepository.gs',
  'backend/app-script/ResponseUtil.gs',
  'backend/app-script/ValidationService.gs',
  'backend/app-script/TransactionService.gs',
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
      getRange: () => ({ getValues: () => [[]] }),
      getLastRow: () => 2,
      getLastColumn: () => 1
    })
  },
  ContentService: {
    createTextOutput: (txt) => ({
      _txt: txt,
      getContent: function () { return this._txt; },
      setMimeType: function () { return this; }
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
      { accountId: 'ACC001', accountType: 'BANK', openingBalance: 5000 },
      { accountId: 'ACC002', accountType: 'CREDIT_CARD', openingBalance: 0 },
      { accountId: 'ACC003', accountType: 'GIFT_CARD', openingBalance: 1000 }
    ];
  }
  function getCategories() {
    return [{ Category_ID: 'CAT001', Category_Name: 'Food' }];
  }
  function getConfiguration() {
    return [];
  }
  function appendRecord(sheet, record) {
    return { rowNumber: 1, record: record };
  }
  function getAllRecords() {
    return [];
  }
`, ctx);

const invalid = vm.runInContext(
  'ValidationService.validateExpense({transactionDate:"21-09-2026", amount:1500, categoryId:"CAT001", paymentMethod:"GIFT_CARD", paidFromAccountId:"ACC003"})',
  ctx
);
console.log('invalid:', invalid);
if (!(invalid.valid === false && invalid.code === 'INSUFFICIENT_GIFT_CARD_BALANCE')) {
  throw new Error('gift-card validation failed: ' + JSON.stringify(invalid));
}

const created = vm.runInContext(
  'TransactionService.createTransaction({transactionType:"EXPENSE",transactionDate:"21-09-2026",amount:200,categoryId:"CAT001",paymentMethod:"BANK",paidFromAccountId:"ACC001",notes:"Lunch"})',
  ctx
);
console.log('created:', created);
if (!(created && created.success === true && created.transactionId)) {
  throw new Error('transaction service failed: ' + JSON.stringify(created));
}

const response = vm.runInContext(
  'Api.handleCreateTransaction({data:{transactionType:"EXPENSE",transactionDate:"21-09-2026",amount:100,categoryId:"CAT001",paymentMethod:"BANK",paidFromAccountId:"ACC001",notes:"Coffee"}})',
  ctx
);
console.log('response raw:', response);
console.log('response keys:', Object.keys(response || {}));
const payload = JSON.parse(response && response.getContent ? response.getContent() : JSON.stringify(response || {}));
console.log('payload:', payload);
if (!(payload.success === true && payload.data && payload.data.transactionId)) {
  throw new Error('api create failed: ' + JSON.stringify(payload));
}

console.log('PASS: backend expense rules verified');
