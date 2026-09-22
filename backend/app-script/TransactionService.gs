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
    if (
      transactionId === undefined ||
      transactionId === null ||
      String(transactionId).trim() === ''
    ) {
      return {
        success: false,
        code: 'INVALID_REQUEST',
        message: 'transactionId is required'
      };
    }

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        code: 'INVALID_REQUEST',
        message: 'Transaction update data is required.'
      };
    }

    const normalizedTransactionId = String(transactionId).trim();
    const lock = LockService && LockService.getScriptLock ? LockService.getScriptLock() : null;

    if (lock) {
      lock.waitLock(30000);
    }

    try {
      const records = getAllRecords(CONFIG.SHEETS.TRANSACTIONS) || [];
      const currentRecord = records.find(function(item) {
        return String(item.Transaction_ID || item.transactionId || '').trim() === normalizedTransactionId;
      });

      if (!currentRecord) {
        return {
          success: false,
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found'
        };
      }

      const currentStatus = String(currentRecord.Status || currentRecord.status || 'ACTIVE').trim().toUpperCase();

      if (currentStatus === 'DELETED') {
        return {
          success: false,
          code: 'TRANSACTION_DELETED',
          message: 'Deleted transactions cannot be updated.'
        };
      }

      const normalizedData = normalizeUpdatePayload_(currentRecord, data);
      const validation = ValidationService.validateTransaction(normalizedData);

      if (!validation.valid) {
        return {
          success: false,
          code: validation.code,
          message: validation.message
        };
      }

      const rowLookup = findRecordWithRow(CONFIG.SHEETS.TRANSACTIONS, { Transaction_ID: currentRecord.Transaction_ID });

      if (!rowLookup) {
        return {
          success: false,
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found'
        };
      }

      const updatedRecord = buildUpdatedTransactionRecord_(currentRecord, validation.value, normalizedData);
      updateRecord(CONFIG.SHEETS.TRANSACTIONS, rowLookup.rowNumber, updatedRecord);

      return {
        success: true,
        transactionId: String(currentRecord.Transaction_ID || normalizedTransactionId),
        record: updatedRecord
      };
    } catch (error) {
      return {
        success: false,
        code: 'SERVER_ERROR',
        message: error && error.message ? error.message : 'Unable to update transaction.'
      };
    } finally {
      if (lock) {
        lock.releaseLock();
      }
    }
  },

  deleteTransaction: function(transactionId) {
    // To be implemented
  },

  getTransactions: function() {
    const transactions = getAllRecords(CONFIG.SHEETS.TRANSACTIONS) || [];

    return transactions
      .filter(function(transaction) {
        if (!transaction || typeof transaction !== 'object') {
          return false;
        }

        const status = String(transaction.Status || transaction.status || 'ACTIVE').trim().toUpperCase();

        return status !== 'DELETED';
      })
      .map(function(transaction) {
        return mapTransactionRecord_(transaction);
      })
      .sort(sortTransactions_);
  },

  getTransaction: function(transactionId) {
    if (
      transactionId === undefined ||
      transactionId === null ||
      String(transactionId).trim() === ''
    ) {
      return {
        success: false,
        code: 'INVALID_REQUEST',
        message: 'transactionId is required'
      };
    }

    const normalizedTransactionId = String(transactionId).trim();
    const transactions = this.getTransactions();
    const transaction = transactions.find(function(item) {
      return String(item.transactionId || '').trim() === normalizedTransactionId;
    });

    if (!transaction) {
      return {
        success: false,
        code: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found'
      };
    }

    return {
      success: true,
      transaction: transaction
    };
  }

};

function normalizeUpdatePayload_(existingRecord, incomingData) {
  const payload = Object.assign({}, incomingData);

  if (!payload.transactionType && existingRecord && existingRecord.Transaction_Type) {
    payload.transactionType = existingRecord.Transaction_Type;
  }

  if (!payload.transactionDate && existingRecord && existingRecord.Transaction_Date) {
    payload.transactionDate = existingRecord.Transaction_Date;
  }

  if (!payload.amount && existingRecord && existingRecord.Amount !== undefined && existingRecord.Amount !== null) {
    payload.amount = existingRecord.Amount;
  }

  if (!payload.categoryId && existingRecord && existingRecord.Category_ID) {
    payload.categoryId = existingRecord.Category_ID;
  }

  if (!payload.paymentMethod && existingRecord && existingRecord.Payment_Method) {
    payload.paymentMethod = existingRecord.Payment_Method;
  }

  if (!payload.paidFromAccountId && existingRecord && existingRecord.Paid_From_Account_ID) {
    payload.paidFromAccountId = existingRecord.Paid_From_Account_ID;
  }

  if (!payload.receivedIntoAccountId && existingRecord && existingRecord.Received_Into_Account_ID) {
    payload.receivedIntoAccountId = existingRecord.Received_Into_Account_ID;
  }

  if (!payload.fromAccountId && existingRecord && existingRecord.From_Account_ID) {
    payload.fromAccountId = existingRecord.From_Account_ID;
  }

  if (!payload.toAccountId && existingRecord && existingRecord.To_Account_ID) {
    payload.toAccountId = existingRecord.To_Account_ID;
  }

  if (payload.accountId && !payload.paidFromAccountId && !payload.receivedIntoAccountId && !payload.fromAccountId && !payload.toAccountId) {
    payload.paidFromAccountId = payload.accountId;
  }

  if (payload.notes === undefined && existingRecord && existingRecord.Notes !== undefined) {
    payload.notes = existingRecord.Notes;
  }

  return payload;
}

function buildUpdatedTransactionRecord_(existingRecord, validatedValue, payload) {
  const baseRecord = Object.assign({}, existingRecord);

  baseRecord.Transaction_Type = validatedValue.transactionType || baseRecord.Transaction_Type || 'EXPENSE';
  baseRecord.Transaction_Date = validatedValue.transactionDate || baseRecord.Transaction_Date || '';
  baseRecord.Amount = validatedValue.amount !== undefined ? validatedValue.amount : baseRecord.Amount || 0;
  baseRecord.Category_ID = validatedValue.categoryId || baseRecord.Category_ID || '';
  baseRecord.Payment_Method = validatedValue.paymentMethod || baseRecord.Payment_Method || '';
  baseRecord.Paid_From_Account_ID = validatedValue.paidFromAccountId !== undefined ? validatedValue.paidFromAccountId : (baseRecord.Paid_From_Account_ID || '');
  baseRecord.Received_Into_Account_ID = validatedValue.receivedIntoAccountId !== undefined ? validatedValue.receivedIntoAccountId : (baseRecord.Received_Into_Account_ID || '');
  baseRecord.From_Account_ID = validatedValue.fromAccountId !== undefined ? validatedValue.fromAccountId : (baseRecord.From_Account_ID || '');
  baseRecord.To_Account_ID = validatedValue.toAccountId !== undefined ? validatedValue.toAccountId : (baseRecord.To_Account_ID || '');
  baseRecord.Notes = payload.notes !== undefined ? payload.notes : (baseRecord.Notes || '');
  baseRecord.Updated_Date = new Date();
  baseRecord.Status = String(baseRecord.Status || 'ACTIVE').trim().toUpperCase() || 'ACTIVE';

  return baseRecord;
}

function mapTransactionRecord_(record) {
  const categories = getCategories() || [];
  const accounts = getAccounts() || [];

  const category = categories.find(function(item) {
    return String(item.Category_ID || '').trim() === String(record.Category_ID || '').trim();
  });

  const resolveAccountName = function(accountIdValue) {
    const normalized = String(accountIdValue || '').trim();

    if (!normalized) {
      return '';
    }

    const match = accounts.find(function(item) {
      return String(item.accountId || '').trim() === normalized;
    });

    return match && match.accountName ? match.accountName : normalized;
  };

  return {
    transactionId: record.Transaction_ID || record.transactionId || '',
    transactionType: record.Transaction_Type || '',
    transactionDate: record.Transaction_Date || '',
    amount: Number(record.Amount || 0),
    categoryId: record.Category_ID || '',
    categoryName: category ? category.Category_Name || '' : '',
    paymentMethod: record.Payment_Method || '',
    paidFromAccountId: record.Paid_From_Account_ID || '',
    paidFromAccountName: resolveAccountName(record.Paid_From_Account_ID),
    receivedIntoAccountId: record.Received_Into_Account_ID || '',
    receivedIntoAccountName: resolveAccountName(record.Received_Into_Account_ID),
    fromAccountId: record.From_Account_ID || '',
    fromAccountName: resolveAccountName(record.From_Account_ID),
    toAccountId: record.To_Account_ID || '',
    toAccountName: resolveAccountName(record.To_Account_ID),
    notes: record.Notes || '',
    status: String(record.Status || 'ACTIVE').trim().toUpperCase() || 'ACTIVE',
    createdDate: record.Created_Date || '',
    updatedDate: record.Updated_Date || ''
  };
}

function sortTransactions_(left, right) {
  const leftDate = dateToComparable_(left && left.transactionDate ? left.transactionDate : '');
  const rightDate = dateToComparable_(right && right.transactionDate ? right.transactionDate : '');

  if (leftDate !== rightDate) {
    return leftDate - rightDate;
  }

  const leftKey = String(left && left.transactionId ? left.transactionId : '').trim();
  const rightKey = String(right && right.transactionId ? right.transactionId : '').trim();

  if (leftKey === rightKey) {
    return 0;
  }

  return leftKey.localeCompare(rightKey);
}

function dateToComparable_(value) {
  if (!value) {
    return 0;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return 0;
    }

    const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) {
      const isoDate = new Date(trimmed);
      return isNaN(isoDate.getTime()) ? 0 : isoDate.getTime();
    }

    const ukMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ukMatch) {
      const day = Number(ukMatch[1]);
      const month = Number(ukMatch[2]) - 1;
      const year = Number(ukMatch[3]);
      const parsedDate = new Date(year, month, day);
      return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
    }
  }

  return 0;
}

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