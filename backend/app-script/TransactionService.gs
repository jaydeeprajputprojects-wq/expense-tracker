const TransactionService = {

  createTransaction: function(data) {
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction request is required.'
      };
    }

    const validation = ValidationService.validateTransaction(data);

    if (!validation.valid) {
      return {
        success: false,
        code: validation.code,
        message: validation.message
      };
    }

    const transactionId = generateTransactionId_();
    const now = new Date();

    const transactionRecord = {
      Transaction_ID: transactionId,
      Transaction_Date: validation.value.transactionDate,
      Transaction_Type: validation.value.transactionType,
      Amount: validation.value.amount,
      Category_ID: validation.value.categoryId || '',
      Payment_Method: validation.value.paymentMethod || '',
      Paid_From_Account_ID: validation.value.paidFromAccountId || '',
      Received_Into_Account_ID: validation.value.receivedIntoAccountId || '',
      From_Account_ID: validation.value.fromAccountId || '',
      To_Account_ID: validation.value.toAccountId || '',
      Notes: validation.value.notes || '',
      Created_Date: now,
      Updated_Date: now,
      Status: 'ACTIVE'
    };

    appendRecord(CONFIG.SHEETS.TRANSACTIONS, transactionRecord);

    return {
      success: true,
      transactionId: transactionId,
      record: transactionRecord
    };
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

function generateTransactionId_() {
  const today = new Date();
  const datePart = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('');

  const randomPart = String(Utilities.getUuid())
    .replace(/-/g, '')
    .slice(0, 6)
    .toUpperCase();

  return 'TXN-' + datePart + '-' + randomPart;
}

function createTransaction(transaction) {
  const result = TransactionService.createTransaction(transaction);

  if (!result || !result.success) {
    return ResponseUtil.error(
      result && result.code ? result.code : 'SERVER_ERROR',
      result && result.message ? result.message : 'Unable to create transaction.'
    );
  }

  return ResponseUtil.success(
    { transactionId: result.transactionId },
    'Transaction created successfully'
  );
}

function testInvalidDate() {

  var result = validateTransactionDate('31-02-2026');

  Logger.log(result);

}

function testValidHistoricalDate() {

  var result = validateTransactionDate('15-08-1995');

  Logger.log(result);

}