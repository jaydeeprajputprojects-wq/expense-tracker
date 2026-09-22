const BalanceService = {

  getBalances: function() {
    var accounts = getAccounts() || [];
    var self = this;

    return accounts.map(function(account) {
      var accountId = account && account.accountId ? String(account.accountId).trim() : '';
      var balance = self.calculateAccountBalance(accountId);

      return {
        accountId: accountId,
        accountName: account && account.accountName ? account.accountName : accountId,
        accountType: account && account.accountType ? account.accountType : '',
        openingBalance: Number(account && account.openingBalance !== undefined ? account.openingBalance : 0),
        currentBalance: Number(balance && balance.currentBalance !== undefined ? balance.currentBalance : 0),
        status: account && account.status ? account.status : 'ACTIVE'
      };
    });
  },

  calculateAccountBalance: function(accountId) {
    var normalizedAccountId = String(accountId || '').trim();

    if (!normalizedAccountId) {
      return {
        accountId: '',
        openingBalance: 0,
        currentBalance: 0
      };
    }

    var accounts = getAccounts() || [];
    var account = accounts.find(function(item) {
      return String(item.accountId || '').trim() === normalizedAccountId;
    });

    if (!account) {
      return {
        accountId: normalizedAccountId,
        openingBalance: 0,
        currentBalance: 0
      };
    }

    var openingBalance = Number(account.openingBalance || 0);
    var currentBalance = openingBalance;
    var transactions = getAllRecords(CONFIG.SHEETS.TRANSACTIONS) || [];

    if (!transactions.length) {
      return {
        accountId: account.accountId,
        openingBalance: openingBalance,
        currentBalance: currentBalance
      };
    }

    transactions.forEach(function(transaction) {
      if (!isTransactionActive_(transaction)) {
        return;
      }

      var amount = Number(transaction.Amount || 0);

      if (!isFinite(amount) || amount <= 0) {
        return;
      }

      var transactionType = String(transaction.Transaction_Type || '').trim().toUpperCase();
      var paidFromAccountId = String(transaction.Paid_From_Account_ID || '').trim();
      var receivedIntoAccountId = String(transaction.Received_Into_Account_ID || '').trim();
      var fromAccountId = String(transaction.From_Account_ID || '').trim();
      var toAccountId = String(transaction.To_Account_ID || '').trim();
      var accountType = String(account.accountType || '').trim().toUpperCase();

      if (transactionType === TRANSACTION_TYPES.EXPENSE && paidFromAccountId === normalizedAccountId) {
        if (accountType === ACCOUNT_TYPES.CREDIT_CARD) {
          currentBalance += amount;
        } else {
          currentBalance -= amount;
        }
      }

      if (transactionType === TRANSACTION_TYPES.INCOME && receivedIntoAccountId === normalizedAccountId) {
        currentBalance += amount;
      }

      if (transactionType === TRANSACTION_TYPES.TRANSFER) {
        var fromIsCash = fromAccountId.toUpperCase() === 'CASH';
        var toIsCash = toAccountId.toUpperCase() === 'CASH';

        if (!fromIsCash && fromAccountId === normalizedAccountId) {
          currentBalance -= amount;
        }

        if (!toIsCash && toAccountId === normalizedAccountId) {
          if (accountType === ACCOUNT_TYPES.CREDIT_CARD) {
            currentBalance -= amount;
          } else {
            currentBalance += amount;
          }
        }
      }
    });

    return {
      accountId: account.accountId,
      openingBalance: openingBalance,
      currentBalance: currentBalance
    };
  }

};

function isTransactionActive_(transaction) {
  if (!transaction || typeof transaction !== 'object') {
    return false;
  }

  var status = String(transaction.Status || transaction.status || '').trim().toUpperCase();

  return status === '' || status === 'ACTIVE';
}