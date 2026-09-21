const BalanceService = {

  getBalances: function() {
    var accounts = getAccounts();
    var self = this;

    return accounts.map(function(account) {
      var balance = self.calculateAccountBalance(account.accountId);

      return {
        accountId: account.accountId,
        accountName: account.accountName || account.accountId,
        accountType: account.accountType,
        openingBalance: Number(account.openingBalance || 0),
        currentBalance: balance.currentBalance,
        status: account.status || 'ACTIVE'
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

    var accounts = getAccounts();
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
    var transactions = getAllRecords(CONFIG.SHEETS.TRANSACTIONS);

    if (!transactions || transactions.length === 0) {
      return {
        accountId: account.accountId,
        openingBalance: openingBalance,
        currentBalance: currentBalance
      };
    }

    transactions.forEach(function(transaction) {
      var amount = Number(transaction.Amount || 0);

      if (!isFinite(amount) || amount <= 0) {
        return;
      }

      var transactionType = String(transaction.Transaction_Type || '').trim().toUpperCase();
      var paidFromAccountId = String(transaction.Paid_From_Account_ID || '').trim();
      var receivedIntoAccountId = String(transaction.Received_Into_Account_ID || '').trim();
      var fromAccountId = String(transaction.From_Account_ID || '').trim();
      var toAccountId = String(transaction.To_Account_ID || '').trim();

      if (transactionType === TRANSACTION_TYPES.EXPENSE && paidFromAccountId === normalizedAccountId) {
        currentBalance -= amount;
      }

      if (transactionType === TRANSACTION_TYPES.INCOME && receivedIntoAccountId === normalizedAccountId) {
        currentBalance += amount;
      }

      if (transactionType === TRANSACTION_TYPES.TRANSFER) {
        if (fromAccountId === normalizedAccountId) {
          currentBalance -= amount;
        }

        if (toAccountId === normalizedAccountId) {
          currentBalance += amount;
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