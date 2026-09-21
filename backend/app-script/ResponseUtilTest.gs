function testSuccessResponse() {

  const response = ResponseUtil.success(
    {
      transactionId: 'TXN-001',
      amount: 2500
    },
    'Transaction created successfully'
  );

  Logger.log(response.getContent());
}

function testDefaultSuccessResponse() {

  const response = ResponseUtil.success();

  Logger.log(response.getContent());
}

function testErrorResponse() {

  const response = ResponseUtil.error(
    'INVALID_REQUEST',
    'Request body is required'
  );

  Logger.log(response.getContent());
}

function testDefaultErrorResponse() {

  const response = ResponseUtil.error();

  Logger.log(response.getContent());
}