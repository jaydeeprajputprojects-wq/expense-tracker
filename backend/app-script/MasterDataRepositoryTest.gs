/**
 * US-011 — Master-Data Repository Test Suite
 *
 * Tests:
 * 1. Accounts can be read.
 * 2. Categories can be read.
 * 3. Configuration can be read.
 * 4. Data is returned as clean JavaScript objects.
 * 5. Empty rows are ignored.
 */

/**
 * Assert that a condition is true.
 */
function assertTrue_(condition, message) {
  if (!condition) {
    throw new Error("ASSERTION FAILED: " + message);
  }
}

/**
 * Assert that two values are equal.
 */
function assertEqual_(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      "ASSERTION FAILED: " +
      message +
      " | Expected: " +
      expected +
      " | Actual: " +
      actual
    );
  }
}

/**
 * Assert that a value is an array.
 */
function assertArray_(value, message) {
  assertTrue_(
    Array.isArray(value),
    message + " should be an array."
  );
}

/**
 * Assert that a value is a plain object.
 */
function assertObject_(value, message) {
  assertTrue_(
    value !== null &&
      typeof value === "object" &&
      !Array.isArray(value),
    message + " should be an object."
  );
}

/**
 * Test 1: Read Accounts.
 */
function testReadAccounts() {
  Logger.log("Running testReadAccounts...");

  const accounts = getAccounts();

  assertArray_(accounts, "Accounts");

  Logger.log("Accounts records found: " + accounts.length);
  Logger.log("testReadAccounts PASSED");
}

/**
 * Test 2: Read Categories.
 */
function testReadCategories() {
  Logger.log("Running testReadCategories...");

  const categories = getCategories();

  assertArray_(categories, "Categories");

  Logger.log("Categories records found: " + categories.length);
  Logger.log("testReadCategories PASSED");
}

/**
 * Test 3: Read Configuration.
 */
function testReadConfiguration() {
  Logger.log("Running testReadConfiguration...");

  const configuration = getConfiguration();

  assertArray_(configuration, "Configuration");

  Logger.log(
    "Configuration records found: " + configuration.length
  );

  Logger.log("testReadConfiguration PASSED");
}

/**
 * Test 4: Accounts return clean objects.
 */
function testAccountsReturnsCleanObjects() {
  Logger.log("Running testAccountsReturnsCleanObjects...");

  const accounts = getAccounts();

  accounts.forEach(function(account, index) {
    assertObject_(
      account,
      "Account at index " + index
    );

    Object.keys(account).forEach(function(key) {
      const value = account[key];

      if (typeof value === "string") {
        assertEqual_(
          value,
          value.trim(),
          "Account string value should be trimmed for key: " + key
        );
      }
    });
  });

  Logger.log("testAccountsReturnsCleanObjects PASSED");
}

/**
 * Test 5: Categories return clean objects.
 */
function testCategoriesReturnsCleanObjects() {
  Logger.log("Running testCategoriesReturnsCleanObjects...");

  const categories = getCategories();

  categories.forEach(function(category, index) {
    assertObject_(
      category,
      "Category at index " + index
    );

    Object.keys(category).forEach(function(key) {
      const value = category[key];

      if (typeof value === "string") {
        assertEqual_(
          value,
          value.trim(),
          "Category string value should be trimmed for key: " + key
        );
      }
    });
  });

  Logger.log("testCategoriesReturnsCleanObjects PASSED");
}

/**
 * Test 6: Configuration returns clean objects.
 */
function testConfigurationReturnsCleanObjects() {
  Logger.log("Running testConfigurationReturnsCleanObjects...");

  const configuration = getConfiguration();

  configuration.forEach(function(config, index) {
    assertObject_(
      config,
      "Configuration record at index " + index
    );

    Object.keys(config).forEach(function(key) {
      const value = config[key];

      if (typeof value === "string") {
        assertEqual_(
          value,
          value.trim(),
          "Configuration string value should be trimmed for key: " + key
        );
      }
    });
  });

  Logger.log("testConfigurationReturnsCleanObjects PASSED");
}

/**
 * Test 7: Verify all master-data functions return arrays.
 */
function testMasterDataFunctionsReturnArrays() {
  Logger.log("Running testMasterDataFunctionsReturnArrays...");

  assertArray_(getAccounts(), "getAccounts()");
  assertArray_(getCategories(), "getCategories()");
  assertArray_(getConfiguration(), "getConfiguration()");

  Logger.log("testMasterDataFunctionsReturnArrays PASSED");
}

/**
 * Main test runner.
 */
function runAllMasterDataRepositoryTests() {
  let passed = 0;
  let failed = 0;

  Logger.log("==========================================");
  Logger.log("US-011 MASTER-DATA REPOSITORY TEST SUITE");
  Logger.log("==========================================");

  const tests = [
    testReadAccounts,
    testReadCategories,
    testReadConfiguration,
    testAccountsReturnsCleanObjects,
    testCategoriesReturnsCleanObjects,
    testConfigurationReturnsCleanObjects,
    testMasterDataFunctionsReturnArrays
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
  Logger.log("US-011 TEST SUMMARY");
  Logger.log("Passed: " + passed);
  Logger.log("Failed: " + failed);
  Logger.log("Total: " + tests.length);
  Logger.log("==========================================");

  if (failed > 0) {
    throw new Error(
      "US-011 TESTS FAILED. Check the execution logs."
    );
  }

  Logger.log("ALL US-011 TESTS PASSED");
}