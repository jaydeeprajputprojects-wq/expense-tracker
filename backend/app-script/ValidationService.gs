const ValidationService = {

  validateTransaction: function(data) {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction request is required.'
      };
    }

    if (
      data.transactionType === undefined ||
      data.transactionType === null ||
      data.transactionType === ''
    ) {
      return {
        valid: false,
        code: 'TRANSACTION_TYPE_REQUIRED',
        message: 'Transaction type is required.'
      };
    }

    var normalizedType = String(data.transactionType).trim().toUpperCase();

    if (
      normalizedType !== TRANSACTION_TYPES.EXPENSE &&
      normalizedType !== TRANSACTION_TYPES.INCOME &&
      normalizedType !== TRANSACTION_TYPES.TRANSFER
    ) {
      return {
        valid: false,
        code: 'INVALID_TRANSACTION_TYPE',
        message: 'Transaction type is invalid.'
      };
    }

    if (normalizedType === TRANSACTION_TYPES.EXPENSE) {
      return this.validateExpense(data);
    }

    if (normalizedType === TRANSACTION_TYPES.INCOME) {
      return this.validateIncome(data);
    }

    return this.validateTransfer(data);
  },

  validateExpense: function(data) {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction request is required.'
      };
    }

    var dateValidation = validateTransactionDate(data.transactionDate);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    var amountValidation = validateTransactionAmount(data.amount);
    if (!amountValidation.valid) {
      return amountValidation;
    }

    var categoryValidation = this.validateCategory(data.categoryId);
    if (!categoryValidation.valid) {
      return categoryValidation;
    }

    if (
      data.paymentMethod === undefined ||
      data.paymentMethod === null ||
      data.paymentMethod === ''
    ) {
      return {
        valid: false,
        code: 'INVALID_PAYMENT_METHOD',
        message: 'Payment method is required.'
      };
    }

    if (
      data.paidFromAccountId === undefined ||
      data.paidFromAccountId === null ||
      data.paidFromAccountId === ''
    ) {
      return {
        valid: false,
        code: 'INVALID_PAID_FROM_ACCOUNT',
        message: 'Paid from account is required.'
      };
    }

    var paymentMethod = String(data.paymentMethod).trim().toUpperCase();
    var expectedAccountType = null;

    if (paymentMethod === PAYMENT_METHODS.BANK) {
      expectedAccountType = ACCOUNT_TYPES.BANK;
    } else if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
      expectedAccountType = ACCOUNT_TYPES.CREDIT_CARD;
    } else if (paymentMethod === PAYMENT_METHODS.GIFT_CARD) {
      expectedAccountType = ACCOUNT_TYPES.GIFT_CARD;
    }

    if (!expectedAccountType) {
      return {
        valid: false,
        code: 'INVALID_PAYMENT_METHOD',
        message: 'Payment method is invalid.'
      };
    }

    var accountValidation = this.validateAccount(data.paidFromAccountId, expectedAccountType);
    if (!accountValidation.valid) {
      if (accountValidation.code === 'ACCOUNT_NOT_FOUND') {
        return accountValidation;
      }

      return {
        valid: false,
        code: 'INVALID_PAYMENT_METHOD_ACCOUNT',
        message: 'Paid from account must match the selected payment method.'
      };
    }

    if (paymentMethod === PAYMENT_METHODS.GIFT_CARD) {
      var giftCardBalance = Number(accountValidation.value.openingBalance || 0);
      var requestedAmount = Number(amountValidation.value);

      if (giftCardBalance < requestedAmount) {
        return {
          valid: false,
          code: 'INSUFFICIENT_GIFT_CARD_BALANCE',
          message: 'Gift card balance is insufficient for this transaction.'
        };
      }
    }

    return {
      valid: true,
      value: {
        transactionType: TRANSACTION_TYPES.EXPENSE,
        transactionDate: dateValidation.value,
        amount: amountValidation.value,
        categoryId: categoryValidation.value.Category_ID,
        paymentMethod: paymentMethod,
        paidFromAccountId: data.paidFromAccountId,
        notes: data.notes || ''
      }
    };
  },

  validateIncome: function(data) {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction request is required.'
      };
    }

    var dateValidation = validateTransactionDate(data.transactionDate);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    var amountValidation = validateTransactionAmount(data.amount);
    if (!amountValidation.valid) {
      return amountValidation;
    }

    var categoryValidation = this.validateCategory(data.categoryId);
    if (!categoryValidation.valid) {
      return categoryValidation;
    }

    if (
      data.receivedIntoAccountId === undefined ||
      data.receivedIntoAccountId === null ||
      data.receivedIntoAccountId === ''
    ) {
      return {
        valid: false,
        code: 'INVALID_RECEIVING_ACCOUNT',
        message: 'Receiving account is required.'
      };
    }

    var accountValidation = this.validateAccount(data.receivedIntoAccountId);
    if (!accountValidation.valid) {
      return accountValidation;
    }

    return {
      valid: true,
      value: {
        transactionType: TRANSACTION_TYPES.INCOME,
        transactionDate: dateValidation.value,
        amount: amountValidation.value,
        categoryId: categoryValidation.value.Category_ID,
        receivedIntoAccountId: data.receivedIntoAccountId,
        notes: data.notes || ''
      }
    };
  },

  validateTransfer: function(data) {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction request is required.'
      };
    }

    var dateValidation = validateTransactionDate(data.transactionDate);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    var amountValidation = validateTransactionAmount(data.amount);
    if (!amountValidation.valid) {
      return amountValidation;
    }

    var fromRawValue = data.fromAccountId;
    var toRawValue = data.toAccountId;
    var fromAccountId = String(fromRawValue === undefined || fromRawValue === null ? '' : fromRawValue).trim();
    var toAccountId = String(toRawValue === undefined || toRawValue === null ? '' : toRawValue).trim();

    if (fromAccountId === '') {
      return {
        valid: false,
        code: 'INVALID_FROM_ACCOUNT',
        message: 'From account is required.'
      };
    }

    if (toAccountId === '') {
      return {
        valid: false,
        code: 'INVALID_TO_ACCOUNT',
        message: 'To account is required.'
      };
    }

    var fromIsCash = fromAccountId.toUpperCase() === 'CASH';
    var toIsCash = toAccountId.toUpperCase() === 'CASH';

    if (fromIsCash && toIsCash) {
      return {
        valid: false,
        code: 'INVALID_TRANSFER_ACCOUNT',
        message: 'Transfer cannot move money from cash to cash.'
      };
    }

    if (!fromIsCash) {
      var fromAccountValidation = this.validateAccount(fromAccountId);
      if (!fromAccountValidation.valid) {
        return fromAccountValidation;
      }
    }

    if (!toIsCash) {
      var toAccountValidation = this.validateAccount(toAccountId);
      if (!toAccountValidation.valid) {
        return toAccountValidation;
      }
    }

    if (!fromIsCash && !toIsCash && fromAccountId === toAccountId) {
      return {
        valid: false,
        code: 'INVALID_TRANSFER_ACCOUNT',
        message: 'From and To accounts must be different.'
      };
    }

    return {
      valid: true,
      value: {
        transactionType: TRANSACTION_TYPES.TRANSFER,
        transactionDate: dateValidation.value,
        amount: amountValidation.value,
        fromAccountId: fromAccountId,
        toAccountId: toAccountId,
        notes: data.notes || ''
      }
    };
  },

  validateAccount: function(accountId, expectedType) {
    if (
      accountId === undefined ||
      accountId === null ||
      accountId === ''
    ) {
      return {
        valid: false,
        code: 'INVALID_ACCOUNT_ID',
        message: 'Account ID is required.'
      };
    }

    var normalizedAccountId = String(accountId).trim();

    if (normalizedAccountId === '') {
      return {
        valid: false,
        code: 'INVALID_ACCOUNT_ID',
        message: 'Account ID is required.'
      };
    }

    var accounts = getAccounts();
    var account = accounts.find(function(item) {
      return item.accountId === normalizedAccountId;
    });

    if (!account) {
      return {
        valid: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found.'
      };
    }

    if (expectedType && account.accountType !== expectedType) {
      return {
        valid: false,
        code: 'INVALID_ACCOUNT_TYPE',
        message: 'Account type does not match the expected payment method.'
      };
    }

    return {
      valid: true,
      value: account
    };
  },

  validateCategory: function(categoryId) {
    if (
      categoryId === undefined ||
      categoryId === null ||
      categoryId === ''
    ) {
      return {
        valid: false,
        code: 'INVALID_CATEGORY_ID',
        message: 'Category ID is required.'
      };
    }

    var normalizedCategoryId = String(categoryId).trim();

    if (normalizedCategoryId === '') {
      return {
        valid: false,
        code: 'INVALID_CATEGORY_ID',
        message: 'Category ID is required.'
      };
    }

    var categories = getCategories();
    var category = categories.find(function(item) {
      return item.Category_ID === normalizedCategoryId;
    });

    if (!category) {
      return {
        valid: false,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.'
      };
    }

    return {
      valid: true,
      value: category
    };
  }

};

/**
 * Validates a transaction date in DD-MM-YYYY format.
 *
 * @param {string} transactionDate
 * @returns {Object}
 */
function validateTransactionDate(transactionDate) {

  // 1. Required validation
  if (
    transactionDate === null ||
    transactionDate === undefined ||
    transactionDate === ''
  ) {
    return {
      valid: false,
      code: 'TRANSACTION_DATE_REQUIRED',
      message: 'Transaction date is required.'
    };
  }

  // 2. Type validation
  if (typeof transactionDate !== 'string') {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_DATE',
      message: 'Transaction date must be a string in DD-MM-YYYY format.'
    };
  }

  // 3. Exact format validation
  var datePattern = /^\d{2}-\d{2}-\d{4}$/;

  if (!datePattern.test(transactionDate)) {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_DATE_FORMAT',
      message: 'Transaction date must be in DD-MM-YYYY format.'
    };
  }

  // 4. Extract date components
  var day = Number(transactionDate.substring(0, 2));
  var month = Number(transactionDate.substring(3, 5));
  var year = Number(transactionDate.substring(6, 10));

  // 5. Validate month
  if (month < 1 || month > 12) {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_DATE',
      message: 'Transaction month must be between 01 and 12.'
    };
  }

  // 6. Validate year
  if (year < 1) {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_DATE',
      message: 'Transaction year must be valid.'
    };
  }

  // 7. Validate day according to the month and year
  var daysInMonth = getDaysInMonth(month, year);

  if (day < 1 || day > daysInMonth) {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_DATE',
      message: 'Transaction date is not a valid calendar date.'
    };
  }

  // 8. Return the original string without conversion
  return {
    valid: true,
    value: transactionDate
  };
}

/**
 * Validates and converts a transaction amount.
 *
 * Rules:
 * 1. Amount is required.
 * 2. Amount must convert to a valid number.
 * 3. Zero is not allowed.
 * 4. Negative values are not allowed.
 * 5. Invalid numeric values are rejected.
 *
 * @param {string|number} amount
 * @returns {Object}
 */
function validateTransactionAmount(amount) {

  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    return {
      valid: false,
      code: 'TRANSACTION_AMOUNT_REQUIRED',
      message: 'Transaction amount is required.'
    };
  }

  if (typeof amount === 'string') {
    amount = amount.trim();
  }

  if (amount === '') {
    return {
      valid: false,
      code: 'TRANSACTION_AMOUNT_REQUIRED',
      message: 'Transaction amount is required.'
    };
  }

  var numericAmount = Number(amount);

  if (
    !isFinite(numericAmount) ||
    isNaN(numericAmount)
  ) {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_AMOUNT',
      message: 'Transaction amount must be a valid number.'
    };
  }

  if (numericAmount <= 0) {
    return {
      valid: false,
      code: 'INVALID_TRANSACTION_AMOUNT',
      message: 'Transaction amount must be greater than zero.'
    };
  }

  return {
    valid: true,
    value: numericAmount
  };
}

/**
 * Returns the number of days in a month.
 *
 * @param {number} month
 * @param {number} year
 * @returns {number}
 */
function getDaysInMonth(month, year) {

  var daysByMonth = [
    31, // January
    28, // February
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31  // December
  ];

  // Leap-year calculation
  var isLeapYear =
    (year % 400 === 0) ||
    (year % 4 === 0 && year % 100 !== 0);

  if (month === 2 && isLeapYear) {
    return 29;
  }

  return daysByMonth[month - 1];
}

function testValidateTransactionAmountRequired() {
  var result = validateTransactionAmount('');
  if (result.valid !== false || result.code !== 'TRANSACTION_AMOUNT_REQUIRED') {
    throw new Error('Amount required validation failed');
  }
}

function testValidateTransactionAmountNumeric() {
  var result = validateTransactionAmount('abc');
  if (result.valid !== false || result.code !== 'INVALID_TRANSACTION_AMOUNT') {
    throw new Error('Invalid numeric amount validation failed');
  }
}

function testValidateTransactionAmountZero() {
  var result = validateTransactionAmount('0');
  if (result.valid !== false || result.code !== 'INVALID_TRANSACTION_AMOUNT') {
    throw new Error('Zero amount validation failed');
  }
}

function testValidateTransactionAmountNegative() {
  var result = validateTransactionAmount('-100');
  if (result.valid !== false || result.code !== 'INVALID_TRANSACTION_AMOUNT') {
    throw new Error('Negative amount validation failed');
  }
}

function testValidateTransactionAmountValid() {
  var result = validateTransactionAmount('2500.50');
  if (result.valid !== true || result.value !== 2500.5) {
    throw new Error('Valid amount conversion failed');
  }
}

function testValidateAccountRequired() {
  var result = ValidationService.validateAccount('');
  if (result.valid !== false || result.code !== 'INVALID_ACCOUNT_ID') {
    throw new Error('Account ID required validation failed');
  }
}

function testValidateAccountExists() {
  var result = ValidationService.validateAccount('ACC999');
  if (result.valid !== false || result.code !== 'ACCOUNT_NOT_FOUND') {
    throw new Error('Missing account should raise ACCOUNT_NOT_FOUND');
  }
}

function testValidateAccountTypeMismatch() {
  var result = ValidationService.validateAccount('ACC001', 'CREDIT_CARD');
  if (result.valid !== false || result.code !== 'INVALID_ACCOUNT_TYPE') {
    throw new Error('Account type validation failed');
  }
}

function getTestAccountId_(expectedType) {
  var accounts = getAccounts();

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found in the master data for validation tests.');
  }

  var candidate = accounts.find(function(account) {
    return !expectedType || account.accountType === expectedType;
  });

  if (!candidate) {
    throw new Error('No matching account found in master data for test validation.');
  }

  return candidate.accountId;
}

function getTransferTestAccountPair_() {
  var accounts = getAccounts();

  if (!accounts || accounts.length < 2) {
    throw new Error('At least 2 accounts are required for transfer validation tests.');
  }

  var fromAccount = accounts[0];
  var toAccount = accounts[1];

  if (!fromAccount || !toAccount) {
    throw new Error('Valid transfer account pair was not found in the master data.');
  }

  return {
    fromAccountId: fromAccount.accountId,
    toAccountId: toAccount.accountId
  };
}

function testValidateAccountValid() {
  var accountId = getTestAccountId_('BANK');
  var result = ValidationService.validateAccount(accountId, 'BANK');
  if (result.valid !== true || result.value.accountId !== accountId) {
    throw new Error('Valid account validation failed');
  }
}

function testValidateCategoryRequired() {
  var result = ValidationService.validateCategory('');
  if (result.valid !== false || result.code !== 'INVALID_CATEGORY_ID') {
    throw new Error('Category ID required validation failed');
  }
}

function testValidateCategoryExists() {
  var result = ValidationService.validateCategory('CAT999');
  if (result.valid !== false || result.code !== 'CATEGORY_NOT_FOUND') {
    throw new Error('Missing category should raise CATEGORY_NOT_FOUND');
  }
}

function testValidateCategoryValid() {
  var result = ValidationService.validateCategory('CAT001');
  if (result.valid !== true || result.value.Category_ID !== 'CAT001') {
    throw new Error('Valid category validation failed');
  }
}

function testValidateExpenseMissingDate() {
  var result = ValidationService.validateExpense({
    amount: '100',
    categoryId: 'CAT001',
    paymentMethod: 'BANK',
    paidFromAccountId: 'ACC001'
  });

  if (result.valid !== false || result.code !== 'TRANSACTION_DATE_REQUIRED') {
    throw new Error('Expense date validation failed');
  }
}

function testValidateExpenseMissingCategory() {
  var result = ValidationService.validateExpense({
    transactionDate: '21-09-2026',
    amount: '100',
    paymentMethod: 'BANK',
    paidFromAccountId: 'ACC001'
  });

  if (result.valid !== false || result.code !== 'INVALID_CATEGORY_ID') {
    throw new Error('Expense category validation failed');
  }
}

function testValidateExpensePaymentMethodMismatch() {
  var result = ValidationService.validateExpense({
    transactionDate: '21-09-2026',
    amount: '100',
    categoryId: 'CAT001',
    paymentMethod: 'CREDIT_CARD',
    paidFromAccountId: 'ACC001'
  });

  if (result.valid !== false || result.code !== 'INVALID_PAYMENT_METHOD_ACCOUNT') {
    throw new Error('Expense payment method/account mismatch validation failed');
  }
}

function testValidateExpenseValid() {
  var accountId = getTestAccountId_('BANK');
  var result = ValidationService.validateExpense({
    transactionDate: '21-09-2026',
    amount: '100',
    categoryId: 'CAT001',
    paymentMethod: 'BANK',
    paidFromAccountId: accountId
  });

  if (result.valid !== true || result.value.amount !== 100) {
    throw new Error('Valid expense validation failed');
  }
}

function testValidateIncomeMissingReceivingAccount() {
  var result = ValidationService.validateIncome({
    transactionDate: '21-09-2026',
    amount: '100',
    categoryId: 'CAT001'
  });

  if (result.valid !== false || result.code !== 'INVALID_RECEIVING_ACCOUNT') {
    throw new Error('Income receiving account validation failed');
  }
}

function testValidateIncomeValid() {
  var accountId = getTestAccountId_();
  var result = ValidationService.validateIncome({
    transactionDate: '21-09-2026',
    amount: '100',
    categoryId: 'CAT001',
    receivedIntoAccountId: accountId
  });

  if (result.valid !== true || result.value.amount !== 100) {
    throw new Error('Valid income validation failed');
  }
}

function testValidateTransferSameAccount() {
  var accountId = getTestAccountId_();
  var result = ValidationService.validateTransfer({
    transactionDate: '21-09-2026',
    amount: '100',
    fromAccountId: accountId,
    toAccountId: accountId
  });

  if (result.valid !== false || result.code !== 'INVALID_TRANSFER_ACCOUNT') {
    throw new Error('Transfer same-account validation failed');
  }
}

function testValidateTransferValid() {
  var transferAccounts = getTransferTestAccountPair_();
  var result = ValidationService.validateTransfer({
    transactionDate: '21-09-2026',
    amount: '100',
    fromAccountId: transferAccounts.fromAccountId,
    toAccountId: transferAccounts.toAccountId
  });

  if (result.valid !== true || result.value.amount !== 100) {
    throw new Error('Valid transfer validation failed');
  }
}

function runAllTransactionAmountValidationTests() {
  var tests = [
    testValidateTransactionAmountRequired,
    testValidateTransactionAmountNumeric,
    testValidateTransactionAmountZero,
    testValidateTransactionAmountNegative,
    testValidateTransactionAmountValid
  ];

  var passed = 0;
  var failed = 0;

  tests.forEach(function(testFn) {
    try {
      testFn();
      passed++;
    } catch (error) {
      failed++;
      Logger.log('FAILED: ' + testFn.name + ' | ' + error.message);
    }
  });

  Logger.log('Transaction amount validation tests passed: ' + passed + '/' + tests.length);

  if (failed > 0) {
    throw new Error('US-014 amount validation tests failed');
  }
}

function runAllAccountAndCategoryValidationTests() {
  var tests = [
    testValidateAccountRequired,
    testValidateAccountExists,
    testValidateAccountTypeMismatch,
    testValidateAccountValid,
    testValidateCategoryRequired,
    testValidateCategoryExists,
    testValidateCategoryValid
  ];

  var passed = 0;
  var failed = 0;

  tests.forEach(function(testFn) {
    try {
      testFn();
      passed++;
    } catch (error) {
      failed++;
      Logger.log('FAILED: ' + testFn.name + ' | ' + error.message);
    }
  });

  Logger.log('Account/category validation tests passed: ' + passed + '/' + tests.length);

  if (failed > 0) {
    throw new Error('US-015/US-016 validation tests failed');
  }
}

function runAllTransactionTypeValidationTests() {
  var tests = [
    testValidateExpenseMissingDate,
    testValidateExpenseMissingCategory,
    testValidateExpensePaymentMethodMismatch,
    testValidateExpenseValid,
    testValidateIncomeMissingReceivingAccount,
    testValidateIncomeValid,
    testValidateTransferSameAccount,
    testValidateTransferValid
  ];

  var passed = 0;
  var failed = 0;

  tests.forEach(function(testFn) {
    try {
      testFn();
      passed++;
    } catch (error) {
      failed++;
      Logger.log('FAILED: ' + testFn.name + ' | ' + error.message);
    }
  });

  Logger.log('Transaction type validation tests passed: ' + passed + '/' + tests.length);

  if (failed > 0) {
    throw new Error('US-017/US-018/US-019 validation tests failed');
  }
}

function runFeature32Validation() {
  runAllTransactionTypeValidationTests();
}

function testFeature32SampleData() {
  var accounts = getAccounts();

  if (!accounts || accounts.length < 2) {
    throw new Error('At least 2 accounts are required for Feature 3.2 sample validation.');
  }

  var sourceAccount = accounts[0];
  var destinationAccount = accounts[1];

  if (!sourceAccount || !destinationAccount) {
    throw new Error('Valid account IDs were not found in the sheet data.');
  }

  var samples = [
    {
      name: 'valid expense',
      data: {
        transactionType: 'EXPENSE',
        transactionDate: '21-09-2026',
        amount: '100',
        categoryId: 'CAT001',
        paymentMethod: 'BANK',
        paidFromAccountId: sourceAccount.accountId
      },
      expectedValid: true,
      expectedCode: null
    },
    {
      name: 'invalid expense payment method mismatch',
      data: {
        transactionType: 'EXPENSE',
        transactionDate: '21-09-2026',
        amount: '100',
        categoryId: 'CAT001',
        paymentMethod: 'CREDIT_CARD',
        paidFromAccountId: sourceAccount.accountId
      },
      expectedValid: false,
      expectedCode: 'INVALID_PAYMENT_METHOD_ACCOUNT'
    },
    {
      name: 'valid income',
      data: {
        transactionType: 'INCOME',
        transactionDate: '21-09-2026',
        amount: '100',
        categoryId: 'CAT001',
        receivedIntoAccountId: sourceAccount.accountId
      },
      expectedValid: true,
      expectedCode: null
    },
    {
      name: 'invalid income missing receiving account',
      data: {
        transactionType: 'INCOME',
        transactionDate: '21-09-2026',
        amount: '100',
        categoryId: 'CAT001'
      },
      expectedValid: false,
      expectedCode: 'INVALID_RECEIVING_ACCOUNT'
    },
    {
      name: 'valid transfer',
      data: {
        transactionType: 'TRANSFER',
        transactionDate: '21-09-2026',
        amount: '100',
        fromAccountId: sourceAccount.accountId,
        toAccountId: destinationAccount.accountId
      },
      expectedValid: true,
      expectedCode: null
    },
    {
      name: 'invalid transfer same account',
      data: {
        transactionType: 'TRANSFER',
        transactionDate: '21-09-2026',
        amount: '100',
        fromAccountId: sourceAccount.accountId,
        toAccountId: sourceAccount.accountId
      },
      expectedValid: false,
      expectedCode: 'INVALID_TRANSFER_ACCOUNT'
    }
  ];

  var allPassed = true;

  samples.forEach(function(sample) {
    var result = ValidationService.validateTransaction(sample.data);
    Logger.log(sample.name + ': ' + JSON.stringify(result));

    if (result.valid !== sample.expectedValid) {
      allPassed = false;
      Logger.log('FAILED: ' + sample.name + ' expected valid=' + sample.expectedValid + ' but got ' + result.valid);
      return;
    }

    if (sample.expectedCode && result.code !== sample.expectedCode) {
      allPassed = false;
      Logger.log('FAILED: ' + sample.name + ' expected code=' + sample.expectedCode + ' but got ' + result.code);
    }
  });

  if (!allPassed) {
    throw new Error('Feature 3.2 sample validation failed');
  }

  Logger.log('Feature 3.2 sample validation tests passed');
}


