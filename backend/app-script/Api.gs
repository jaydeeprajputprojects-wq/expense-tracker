const Api = {

  /**
   * Handles HTTP GET requests.
   *
   * Examples:
   *
   * GET /exec
   * GET /exec?action=GET_MASTER_DATA
   * GET /exec?action=GET_TRANSACTIONS
   * GET /exec?action=GET_TRANSACTION&transactionId=TXN-001
   * GET /exec?action=GET_BALANCES
   */
  handleGetRequest: function(e) {

    try {

      // Validate request object
      if (!e) {
        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Request object is required'
        );
      }

      // No action = API health check
      if (!e.parameter || !e.parameter.action) {

        return ResponseUtil.success(
          {
            message: CONFIG.APP_NAME + ' API is running'
          },
          'Request successful'
        );
      }

      const action = String(e.parameter.action).trim().toUpperCase();

      // Validate action
      if (!action) {
        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Action is required'
        );
      }

      // Route GET action
      return this.routeGetAction(action, e.parameter);

    } catch (error) {

      console.error(error);

      return ResponseUtil.error(
        'SERVER_ERROR',
        error.message || 'Unexpected server error'
      );
    }
  },


  /**
   * Handles HTTP POST requests.
   *
   * Expected body:
   *
   * {
   *   "action": "CREATE_TRANSACTION",
   *   "data": {}
   * }
   */
  handlePostRequest: function(e) {

    try {

      // Validate request object
      if (!e) {
        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Request object is required'
        );
      }

      // Validate POST body
      if (!e.postData || !e.postData.contents) {
        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Request body is required'
        );
      }

      const rawBody = e.postData.contents;

      // Parse JSON
      let request;

      try {

        request = JSON.parse(rawBody);

      } catch (jsonError) {

        return ResponseUtil.error(
          'INVALID_JSON',
          'Request body must contain valid JSON'
        );
      }

      // Validate parsed request
      if (!request || typeof request !== 'object') {

        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Request body must be a JSON object'
        );
      }

      // Validate action
      if (!request.action) {

        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Action is required'
        );
      }

      const action = String(request.action)
        .trim()
        .toUpperCase();

      if (!action) {

        return ResponseUtil.error(
          'INVALID_REQUEST',
          'Action is required'
        );
      }

      // Route POST action
      return this.routePostAction(action, request);

    } catch (error) {

      console.error(error);

      return ResponseUtil.error(
        'SERVER_ERROR',
        error.message || 'Unexpected server error'
      );
    }
  },


  /**
   * Routes GET actions.
   */
  routeGetAction: function(action, parameters) {

    switch (action) {

      case 'GET_MASTER_DATA':

        return this.handleGetMasterData();


      case 'GET_TRANSACTIONS':

        return this.handleGetTransactions(parameters);


      case 'GET_TRANSACTION':

        return this.handleGetTransaction(parameters);


      case 'GET_BALANCES':

        return this.handleGetBalances();


      default:

        return ResponseUtil.error(
          'UNKNOWN_ACTION',
          'Unsupported GET action: ' + action
        );
    }
  },


  /**
   * Routes POST actions.
   */
  routePostAction: function(action, request) {

    switch (action) {

      case 'CREATE_TRANSACTION':

        return this.handleCreateTransaction(request);


      case 'UPDATE_TRANSACTION':

        return this.handleUpdateTransaction(request);


      case 'DELETE_TRANSACTION':

        return this.handleDeleteTransaction(request);


      default:

        return ResponseUtil.error(
          'UNKNOWN_ACTION',
          'Unsupported POST action: ' + action
        );
    }
  },


  /**
   * GET_MASTER_DATA
   *
   * Actual master-data implementation will be added
   * in the repository/service story.
   */
  handleGetMasterData: function() {

    const accounts = getAccounts() || [];
    const categories = getCategories() || [];
    const configuration = getConfiguration() || [];

    return ResponseUtil.success(
      {
        accounts: accounts,
        categories: categories,
        configuration: configuration
      },
      'Master data fetched successfully'
    );
  },


  /**
   * GET_TRANSACTIONS
   */
  handleGetTransactions: function(parameters) {

    const transactions = TransactionService.getTransactions();

    return ResponseUtil.success(
      {
        transactions: transactions
      },
      'Transactions fetched successfully'
    );
  },


  /**
   * GET_TRANSACTION
   */
  handleGetTransaction: function(parameters) {

    const transactionId = parameters && parameters.transactionId;

    if (!transactionId || String(transactionId).trim() === '') {

      return ResponseUtil.error(
        'INVALID_REQUEST',
        'transactionId is required'
      );
    }

    const result = TransactionService.getTransaction(transactionId);

    if (!result || !result.success) {
      return ResponseUtil.error(
        result && result.code ? result.code : 'TRANSACTION_NOT_FOUND',
        result && result.message ? result.message : 'Transaction not found'
      );
    }

    return ResponseUtil.success(
      {
        transaction: result.transaction
      },
      'Transaction fetched successfully'
    );
  },


  /**
   * GET_BALANCES
   */
  handleGetBalances: function() {

    const balances = BalanceService.getBalances();

    return ResponseUtil.success(
      {
        balances: balances,
        accounts: balances
      },
      'Balances fetched successfully'
    );
  },


  /**
   * CREATE_TRANSACTION
   */
  handleCreateTransaction: function(request) {

    if (!request || !request.data) {

      return ResponseUtil.error(
        'INVALID_REQUEST',
        'Request data is required'
      );
    }

    const validation = ValidationService.validateTransaction(request.data);

    if (!validation.valid) {
      return ResponseUtil.error(
        validation.code,
        validation.message
      );
    }

    const created = TransactionService.createTransaction(validation.value);

    if (!created || !created.success) {
      return ResponseUtil.error(
        created && created.code ? created.code : 'SERVER_ERROR',
        created && created.message ? created.message : 'Unable to create transaction.'
      );
    }

    return ResponseUtil.success(
      {
        transactionId: created.transactionId
      },
      'Transaction created successfully'
    );
  },


  /**
   * UPDATE_TRANSACTION
   */
  handleUpdateTransaction: function(request) {

    if (!request || typeof request !== 'object') {
      return ResponseUtil.error(
        'INVALID_REQUEST',
        'Request object is required'
      );
    }

    const payload = request.data && typeof request.data === 'object' ? request.data : request;
    const transactionId = request.transactionId !== undefined ? request.transactionId : (payload && payload.transactionId !== undefined ? payload.transactionId : null);

    if (
      transactionId === undefined ||
      transactionId === null ||
      String(transactionId).trim() === ''
    ) {
      return ResponseUtil.error(
        'INVALID_REQUEST',
        'transactionId is required'
      );
    }

    if (!payload || typeof payload !== 'object') {
      return ResponseUtil.error(
        'INVALID_REQUEST',
        'Request data is required'
      );
    }

    const result = TransactionService.updateTransaction(transactionId, payload);

    if (!result || !result.success) {
      return ResponseUtil.error(
        result && result.code ? result.code : 'SERVER_ERROR',
        result && result.message ? result.message : 'Unable to update transaction.'
      );
    }

    return ResponseUtil.success(
      {
        transactionId: result.transactionId,
        transaction: result.record
      },
      'Transaction updated successfully'
    );
  },


  /**
   * DELETE_TRANSACTION
   */
  handleDeleteTransaction: function(request) {

    if (!request || typeof request !== 'object') {
      return ResponseUtil.error(
        'INVALID_REQUEST',
        'Request object is required'
      );
    }

    const payload = request.data && typeof request.data === 'object' ? request.data : request;
    const transactionId = request.transactionId !== undefined ? request.transactionId : (payload && payload.transactionId !== undefined ? payload.transactionId : null);

    if (
      transactionId === undefined ||
      transactionId === null ||
      String(transactionId).trim() === ''
    ) {
      return ResponseUtil.error(
        'INVALID_REQUEST',
        'transactionId is required'
      );
    }

    const result = TransactionService.deleteTransaction(transactionId);

    if (!result || !result.success) {
      return ResponseUtil.error(
        result && result.code ? result.code : 'SERVER_ERROR',
        result && result.message ? result.message : 'Unable to delete transaction.'
      );
    }

    return ResponseUtil.success(
      {
        transactionId: result.transactionId,
        transaction: result.record
      },
      'Transaction deleted successfully'
    );
  }

};

/**
 * Handles GET API requests.
 *
 * Supported action:
 * - GET_MASTER_DATA
 *
 * @param {Object} e Apps Script event object
 * @return {TextOutput} JSON response
 */
function doGet(e) {
  try {
    const action = getRequestAction_(e);

    switch (action) {
      case "GET_MASTER_DATA":
        return handleGetMasterData_();

      case "GET_TRANSACTIONS":
        return handleGetTransactions_();

      case "GET_TRANSACTION":
        return handleGetTransaction_(e);

      case "GET_BALANCES":
        return handleGetBalances_();

      default:
        return createJsonResponse_({
          success: false,
          action: action,
          data: null,
          message: "Unsupported GET action: " + action
        });
    }
  } catch (error) {
    console.error(error);

    return createJsonResponse_({
      success: false,
      action: null,
      data: null,
      message: error.message
    });
  }
}

/**
 * Reads a value from either a standard Apps Script parameter map or a raw query string.
 *
 * @param {Object} e Apps Script event object
 * @param {string} key Parameter name
 * @return {string|null}
 */
function getRequestValue_(e, key) {
  if (!e) {
    return null;
  }

  if (e.parameter && e.parameter[key] !== undefined && e.parameter[key] !== null) {
    return e.parameter[key];
  }

  if (e.parameters && e.parameters[key] !== undefined && e.parameters[key] !== null) {
    return e.parameters[key];
  }

  const rawQuery = typeof e.queryString === 'string' ? e.queryString : '';

  if (!rawQuery) {
    return null;
  }

  const pairs = rawQuery.split('&');

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];

    if (!pair || pair.indexOf('=') === -1) {
      continue;
    }

    const [queryKey, ...valueParts] = pair.split('=');
    const decodedKey = decodeURIComponent(queryKey || '');
    const decodedValue = decodeURIComponent(valueParts.join('=') || '');

    if (decodedKey === key) {
      return decodedValue;
    }
  }

  return null;
}

/**
 * Extracts the action parameter from the request.
 *
 * Example:
 * ?action=GET_MASTER_DATA
 *
 * @param {Object} e Apps Script event object
 * @return {string} Request action
 */
function getRequestAction_(e) {
  const action = getRequestValue_(e, 'action');

  if (action === null || action === undefined) {
    return "";
  }

  return String(action)
    .trim()
    .toUpperCase();
}


/**
 * Handles the GET_MASTER_DATA request.
 *
 * Fetches:
 * - Accounts
 * - Categories
 * - Configuration
 *
 * @return {TextOutput} JSON response
 */
function handleGetMasterData_() {
  const accounts = getAccounts();
  const categories = getCategories();
  const configuration = getConfiguration();

  return createJsonResponse_({
    success: true,
    action: "GET_MASTER_DATA",
    data: {
      accounts: accounts,
      categories: categories,
      configuration: configuration
    },
    message: "Master data fetched successfully"
  });
}

function handleGetTransactions_() {
  const transactions = TransactionService.getTransactions();

  return createJsonResponse_({
    success: true,
    action: "GET_TRANSACTIONS",
    data: {
      transactions: transactions
    },
    message: "Transactions fetched successfully"
  });
}

function handleGetTransaction_(e) {
  const parameters = e && e.parameter ? e.parameter : {};
  const transactionId = getRequestValue_(e, 'transactionId') || parameters.transactionId;

  if (!transactionId || String(transactionId).trim() === '') {
    return createJsonResponse_({
      success: false,
      action: "GET_TRANSACTION",
      data: null,
      message: "transactionId is required"
    });
  }

  const result = TransactionService.getTransaction(transactionId);

  if (!result || !result.success) {
    return createJsonResponse_({
      success: false,
      action: "GET_TRANSACTION",
      data: null,
      code: result && result.code ? result.code : 'TRANSACTION_NOT_FOUND',
      message: result && result.message ? result.message : 'Transaction not found'
    });
  }

  return createJsonResponse_({
    success: true,
    action: "GET_TRANSACTION",
    data: {
      transaction: result.transaction
    },
    message: "Transaction fetched successfully"
  });
}

function handleGetBalances_() {
  const balances = BalanceService.getBalances();

  return createJsonResponse_({
    success: true,
    action: "GET_BALANCES",
    data: {
      balances: balances,
      accounts: balances
    },
    message: "Balances fetched successfully"
  });
}