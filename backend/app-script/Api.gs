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

    return ResponseUtil.error(
      'NOT_IMPLEMENTED',
      'GET_MASTER_DATA is not implemented yet'
    );
  },


  /**
   * GET_TRANSACTIONS
   */
  handleGetTransactions: function(parameters) {

    return ResponseUtil.error(
      'NOT_IMPLEMENTED',
      'GET_TRANSACTIONS is not implemented yet'
    );
  },


  /**
   * GET_TRANSACTION
   */
  handleGetTransaction: function(parameters) {

    if (!parameters.transactionId) {

      return ResponseUtil.error(
        'INVALID_REQUEST',
        'transactionId is required'
      );
    }

    return ResponseUtil.error(
      'NOT_IMPLEMENTED',
      'GET_TRANSACTION is not implemented yet'
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

    if (!request.data) {

      return ResponseUtil.error(
        'INVALID_REQUEST',
        'Request data is required'
      );
    }

    return ResponseUtil.error(
      'NOT_IMPLEMENTED',
      'UPDATE_TRANSACTION is not implemented yet'
    );
  },


  /**
   * DELETE_TRANSACTION
   */
  handleDeleteTransaction: function(request) {

    if (!request.transactionId && !request.data) {

      return ResponseUtil.error(
        'INVALID_REQUEST',
        'transactionId is required'
      );
    }

    return ResponseUtil.error(
      'NOT_IMPLEMENTED',
      'DELETE_TRANSACTION is not implemented yet'
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
 * Extracts the action parameter from the request.
 *
 * Example:
 * ?action=GET_MASTER_DATA
 *
 * @param {Object} e Apps Script event object
 * @return {string} Request action
 */
function getRequestAction_(e) {
  if (!e || !e.parameter) {
    return "";
  }

  return String(e.parameter.action || "")
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