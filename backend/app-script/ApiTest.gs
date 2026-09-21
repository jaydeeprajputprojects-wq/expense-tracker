/**
 * US-012 — GET_MASTER_DATA API Test Suite
 */

/**
 * Test helper for assertions.
 */
function assertApiTrue_(condition, message) {
  if (!condition) {
    throw new Error("ASSERTION FAILED: " + message);
  }
}

/**
 * Test that a value is an object.
 */
function assertApiObject_(value, message) {
  assertApiTrue_(
    value !== null &&
      typeof value === "object" &&
      !Array.isArray(value),
    message + " should be an object."
  );
}

/**
 * Test that a value is an array.
 */
function assertApiArray_(value, message) {
  assertApiTrue_(
    Array.isArray(value),
    message + " should be an array."
  );
}

function testGetRequestAction() {
  Logger.log("Running testGetRequestAction...");

  const event = {
    parameter: {
      action: "get_master_data"
    }
  };

  const action = getRequestAction_(event);

  assertApiTrue_(
    action === "GET_MASTER_DATA",
    "Action should be converted to uppercase."
  );

  Logger.log("testGetRequestAction PASSED");
}

function testGetRequestActionWithMissingParameter() {
  Logger.log("Running testGetRequestActionWithMissingParameter...");

  const action = getRequestAction_({
    parameter: {}
  });

  assertApiTrue_(
    action === "",
    "Missing action should return an empty string."
  );

  Logger.log("testGetRequestActionWithMissingParameter PASSED");
}

function testHandleGetMasterData() {
  Logger.log("Running testHandleGetMasterData...");

  const response = handleGetMasterData_();

  assertApiTrue_(
    response !== null,
    "API response should not be null."
  );

  const responseText = response.getContent();

  assertApiTrue_(
    typeof responseText === "string",
    "API response should contain text."
  );

  const payload = JSON.parse(responseText);

  assertApiObject_(
    payload,
    "GET_MASTER_DATA payload"
  );

  assertApiTrue_(
    payload.success === true,
    "success should be true."
  );

  assertApiTrue_(
    payload.action === "GET_MASTER_DATA",
    "action should be GET_MASTER_DATA."
  );

  assertApiObject_(
    payload.data,
    "payload.data"
  );

  assertApiArray_(
    payload.data.accounts,
    "payload.data.accounts"
  );

  assertApiArray_(
    payload.data.categories,
    "payload.data.categories"
  );

  assertApiArray_(
    payload.data.configuration,
    "payload.data.configuration"
  );

  Logger.log("testHandleGetMasterData PASSED");
}

function testDoGetMasterData() {
  Logger.log("Running testDoGetMasterData...");

  const event = {
    parameter: {
      action: "GET_MASTER_DATA"
    }
  };

  const response = doGet(event);
  const payload = JSON.parse(response.getContent());

  assertApiTrue_(
    payload.success === true,
    "doGet should return success true."
  );

  assertApiTrue_(
    payload.action === "GET_MASTER_DATA",
    "doGet should return the correct action."
  );

  assertApiArray_(
    payload.data.accounts,
    "Accounts data"
  );

  assertApiArray_(
    payload.data.categories,
    "Categories data"
  );

  assertApiArray_(
    payload.data.configuration,
    "Configuration data"
  );

  Logger.log("testDoGetMasterData PASSED");
}

function testUnsupportedGetAction() {
  Logger.log("Running testUnsupportedGetAction...");

  const event = {
    parameter: {
      action: "UNKNOWN_ACTION"
    }
  };

  const response = doGet(event);
  const payload = JSON.parse(response.getContent());

  assertApiTrue_(
    payload.success === false,
    "Unsupported action should return success false."
  );

  assertApiTrue_(
    payload.action === "UNKNOWN_ACTION",
    "Response should contain the unsupported action."
  );

  Logger.log("testUnsupportedGetAction PASSED");
}

function runAllUS012Tests() {
  let passed = 0;
  let failed = 0;

  Logger.log("==========================================");
  Logger.log("US-012 GET_MASTER_DATA API TEST SUITE");
  Logger.log("==========================================");

  const tests = [
    testGetRequestAction,
    testGetRequestActionWithMissingParameter,
    testHandleGetMasterData,
    testDoGetMasterData,
    testUnsupportedGetAction
  ];

  tests.forEach(function(testFunction) {
    try {
      testFunction();
      passed++;
    } catch (error) {
      failed++;

      Logger.log(
        "FAILED: " +
        testFunction.name +
        " | " +
        error.message
      );
    }
  });

  Logger.log("==========================================");
  Logger.log("US-012 TEST SUMMARY");
  Logger.log("Passed: " + passed);
  Logger.log("Failed: " + failed);
  Logger.log("Total: " + tests.length);
  Logger.log("==========================================");

  if (failed > 0) {
    throw new Error(
      "US-012 TESTS FAILED. Check the execution logs."
    );
  }

  Logger.log("ALL US-012 TESTS PASSED");
}