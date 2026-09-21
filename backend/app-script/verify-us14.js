const fs = require('fs');
const vm = require('vm');
const path = "c:/content-creation/fin-track-basic/expense-tracker/backend/app-script/ValidationService.gs";
const source = fs.readFileSync(path, "utf8");
const context = {
  console,
  Logger: { log: (...args) => console.log(...args) },
  isFinite,
  isNaN,
  Number,
  Array,
  Object,
  String,
  Date,
  Math
};
vm.createContext(context);
vm.runInContext(source, context);
vm.runInContext("runAllTransactionAmountValidationTests();", context);
