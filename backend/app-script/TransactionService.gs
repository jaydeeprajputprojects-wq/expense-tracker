const TransactionService = {

  createTransaction: function(data) {
    // To be implemented
  },

  updateTransaction: function(transactionId, data) {
    // To be implemented
  },

  deleteTransaction: function(transactionId) {
    // To be implemented
  },

  getTransactions: function() {
    // To be implemented
  },

  getTransaction: function(transactionId) {
    // To be implemented
  }

};

function createTransaction(transaction) {

  // 1. Validate request object
  if (!transaction || typeof transaction !== 'object') {
    return ResponseUtil.error(
      'INVALID_REQUEST',
      'Transaction request is required.'
    );
  }

  // 2. Validate transaction date
  var dateValidation = validateTransactionDate(
    transaction.transactionDate
  );

  if (!dateValidation.valid) {
    return ResponseUtil.error(
      dateValidation.code,
      dateValidation.message
    );
  }

  // 3. Validate transaction amount
  var amountValidation = ValidationService.validateTransaction(transaction);

  if (!amountValidation.valid) {
    return ResponseUtil.error(
      amountValidation.code,
      amountValidation.message
    );
  }

  // 4. Preserve the validated values
  var validatedTransactionDate = dateValidation.value;
  var validatedAmount = amountValidation.value;

  // 5. Continue with the existing transaction validations
  //    Example:
  //    - Account validation
  //    - Category validation
  //    - Transaction type validation

  // 6. Build the transaction row
  var transactionRow = [
    transaction.id,
    validatedTransactionDate,
    transaction.accountId,
    transaction.categoryId,
    transaction.type,
    validatedAmount,
    transaction.description
  ];

  // 7. Save using the existing repository method
  return SheetRepository.appendTransaction(transactionRow);
}

function testInvalidDate() {

  var result = validateTransactionDate('31-02-2026');

  Logger.log(result);

}

function testValidHistoricalDate() {

  var result = validateTransactionDate('15-08-1995');

  Logger.log(result);

}