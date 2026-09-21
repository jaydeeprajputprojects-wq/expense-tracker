const ValidationService = {

  validateTransaction: function(data) {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction request is required.'
      };
    }

    if (data.amount === undefined || data.amount === null || data.amount === '') {
      return {
        valid: false,
        code: 'TRANSACTION_AMOUNT_REQUIRED',
        message: 'Transaction amount is required.'
      };
    }

    return validateTransactionAmount(data.amount);
  },

  validateExpense: function(data) {
    // To be implemented
  },

  validateIncome: function(data) {
    // To be implemented
  },

  validateTransfer: function(data) {
    // To be implemented
  },

  validateAccount: function(accountId) {
    // To be implemented
  },

  validateCategory: function(categoryId) {
    // To be implemented
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
