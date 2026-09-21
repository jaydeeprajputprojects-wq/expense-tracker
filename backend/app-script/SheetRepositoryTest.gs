/**
 * SheetRepositoryTest.gs
 *
 * US-010 — Google Sheets Repository Test Suite
 *
 * IMPORTANT:
 * 1. Run setupRepositoryTestData()
 * 2. Run runAllRepositoryTests()
 * 3. Run cleanupRepositoryTestData()
 */


/* ============================================================
 * TEST CONFIGURATION
 * ============================================================
 */

const REPOSITORY_TEST_CONFIG = {

  TEST_TRANSACTION_ID: 'TEST-US010-001',

  TEST_TRANSACTION_ID_2: 'TEST-US010-002',

  TEST_AMOUNT: 100,

  UPDATED_AMOUNT: 250,

  TEST_TRANSACTION_TYPE: 'EXPENSE',

  TEST_CATEGORY_ID: 'TEST-CAT-US010',

  TEST_PAYMENT_METHOD: 'CASH',

  TEST_ACCOUNT_ID: 'TEST-ACC-US010',

  TEST_NOTES: 'US-010 Repository Test',

  TEST_STATUS: 'ACTIVE'
};


/* ============================================================
 * TEST RUNNER
 * ============================================================
 */

function runAllRepositoryTests() {

  Logger.log('==========================================');
  Logger.log('US-010 SHEET REPOSITORY TEST SUITE');
  Logger.log('==========================================');

  let passed = 0;
  let failed = 0;

  const tests = [
    testSheetLookup,
    testInvalidSheetLookup,
    testHeaderReading,
    testReadAllRecords,
    testAppendRecord,
    testFindRecords,
    testFindRecord,
    testFindRecordWithRow,
    testGetRow,
    testUpdateRecord,
    testReadUpdatedRecord
  ];

  tests.forEach(function(testFunction) {

    try {

      Logger.log('');
      Logger.log('Running: ' + testFunction.name);

      testFunction();

      Logger.log('PASS: ' + testFunction.name);

      passed++;

    } catch (error) {

      Logger.log('FAIL: ' + testFunction.name);
      Logger.log('Error: ' + error.message);

      failed++;
    }
  });

  Logger.log('');
  Logger.log('==========================================');
  Logger.log('TEST SUMMARY');
  Logger.log('==========================================');

  Logger.log('Passed: ' + passed);
  Logger.log('Failed: ' + failed);
  Logger.log('Total: ' + tests.length);

  Logger.log('==========================================');

  if (failed > 0) {

    throw new Error(
      'US-010 test suite completed with ' +
      failed +
      ' failed test(s).'
    );
  }

  Logger.log('ALL US-010 TESTS PASSED');
}


/* ============================================================
 * TEST DATA SETUP
 * ============================================================
 */

function setupRepositoryTestData() {

  Logger.log('==========================================');
  Logger.log('SETTING UP US-010 TEST DATA');
  Logger.log('==========================================');

  cleanupRepositoryTestData();

  const transactionRecord = createTestTransaction(
    REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID,
    REPOSITORY_TEST_CONFIG.TEST_AMOUNT
  );

  const result = appendRecord(
    CONFIG.SHEETS.TRANSACTIONS,
    transactionRecord
  );

  Logger.log(
    'Created test transaction at row: ' +
    result.rowNumber
  );


  const transactionRecord2 = createTestTransaction(
    REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID_2,
    200
  );

  const result2 = appendRecord(
    CONFIG.SHEETS.TRANSACTIONS,
    transactionRecord2
  );

  Logger.log(
    'Created second test transaction at row: ' +
    result2.rowNumber
  );

  Logger.log('Test data setup completed.');
}


/* ============================================================
 * CREATE TEST TRANSACTION
 * ============================================================
 */

function createTestTransaction(transactionId, amount) {

  const now = new Date();

  return {

    Transaction_ID: transactionId,

    Transaction_Date: now,

    Transaction_Type:
      REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_TYPE,

    Amount: amount,

    Category_ID:
      REPOSITORY_TEST_CONFIG.TEST_CATEGORY_ID,

    Payment_Method:
      REPOSITORY_TEST_CONFIG.TEST_PAYMENT_METHOD,

    Paid_From_Account_ID:
      REPOSITORY_TEST_CONFIG.TEST_ACCOUNT_ID,

    Received_Into_Account_ID: '',

    From_Account_ID:
      REPOSITORY_TEST_CONFIG.TEST_ACCOUNT_ID,

    To_Account_ID: '',

    Notes:
      REPOSITORY_TEST_CONFIG.TEST_NOTES,

    Created_Date: now,

    Updated_Date: now,

    Status:
      REPOSITORY_TEST_CONFIG.TEST_STATUS
  };
}


/* ============================================================
 * CLEANUP
 * ============================================================
 */

function cleanupRepositoryTestData() {

  Logger.log('Cleaning US-010 test data...');

  const sheet =
    getSheet_(CONFIG.SHEETS.TRANSACTIONS);

  const headers =
    getHeaders_(sheet);

  const transactionIdIndex =
    headers.indexOf('Transaction_ID');

  if (transactionIdIndex === -1) {

    throw new Error(
      'Transaction_ID header not found. ' +
      'Check Transactions sheet headers.'
    );
  }

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2) {

    Logger.log(
      'No transaction data found.'
    );

    return;
  }

  const rows =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        lastColumn
      )
      .getValues();

  let deletedCount = 0;

  /*
   * Delete from bottom to top.
   */
  for (
    let i = rows.length - 1;
    i >= 0;
    i--
  ) {

    const transactionId =
      rows[i][transactionIdIndex];

    if (
      transactionId ===
        REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID ||

      transactionId ===
        REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID_2
    ) {

      sheet.deleteRow(i + 2);

      deletedCount++;
    }
  }

  Logger.log(
    'Deleted test records: ' +
    deletedCount
  );
}


/* ============================================================
 * TEST 1 — SHEET LOOKUP
 * ============================================================
 */

function testSheetLookup() {

  const sheet =
    getSheet_(CONFIG.SHEETS.TRANSACTIONS);

  assertTrue(
    sheet !== null,
    'Transactions sheet should exist'
  );

  assertEqual(
    CONFIG.SHEETS.TRANSACTIONS,
    sheet.getName(),
    'Sheet name should match configuration'
  );
}


/* ============================================================
 * TEST 2 — INVALID SHEET LOOKUP
 * ============================================================
 */

function testInvalidSheetLookup() {

  let errorThrown = false;

  try {

    getSheet_(
      'THIS_SHEET_DOES_NOT_EXIST'
    );

  } catch (error) {

    errorThrown = true;

    assertTrue(
      error.message.indexOf(
        'Sheet not found'
      ) !== -1,
      'Error should indicate sheet was not found'
    );
  }

  assertTrue(
    errorThrown,
    'Invalid sheet lookup should throw an error'
  );
}


/* ============================================================
 * TEST 3 — HEADER READING
 * ============================================================
 */

function testHeaderReading() {

  const sheet =
    getSheet_(CONFIG.SHEETS.TRANSACTIONS);

  const headers =
    getHeaders_(sheet);

  assertTrue(
    headers.length > 0,
    'Transactions sheet should contain headers'
  );

  assertTrue(
    headers.indexOf('Transaction_ID') !== -1,
    'Transaction_ID header should exist'
  );

  assertTrue(
    headers.indexOf('Amount') !== -1,
    'Amount header should exist'
  );

  assertTrue(
    headers.indexOf('Category_ID') !== -1,
    'Category_ID header should exist'
  );

  assertTrue(
    headers.indexOf('Status') !== -1,
    'Status header should exist'
  );
}


/* ============================================================
 * TEST 4 — READ ALL RECORDS
 * ============================================================
 */

function testReadAllRecords() {

  const records =
    getAllRecords(
      CONFIG.SHEETS.TRANSACTIONS
    );

  assertTrue(
    Array.isArray(records),
    'getAllRecords should return an array'
  );

  const testRecord =
    records.find(function(record) {

      return record.Transaction_ID ===
        REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID;
    });

  assertTrue(
    testRecord !== undefined,
    'Test transaction should be returned'
  );

  assertEqual(
    REPOSITORY_TEST_CONFIG.TEST_AMOUNT,
    testRecord.Amount,
    'Amount should be read correctly'
  );
}


/* ============================================================
 * TEST 5 — APPEND RECORD
 * ============================================================
 */

function testAppendRecord() {

  removeTransactionById(
    REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
  );

  const record =
    createTestTransaction(
      REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID,
      REPOSITORY_TEST_CONFIG.TEST_AMOUNT
    );

  const result =
    appendRecord(
      CONFIG.SHEETS.TRANSACTIONS,
      record
    );

  assertTrue(
    result !== null,
    'appendRecord should return a result'
  );

  assertTrue(
    result.rowNumber > 1,
    'Appended record should have a valid row number'
  );

  const savedRecord =
    findRecord(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Transaction_ID:
          REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
      }
    );

  assertTrue(
    savedRecord !== null,
    'Appended record should be searchable'
  );
}


/* ============================================================
 * TEST 6 — FIND RECORDS
 * ============================================================
 */

function testFindRecords() {

  const records =
    findRecords(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Account_ID:
          REPOSITORY_TEST_CONFIG.TEST_ACCOUNT_ID
      }
    );

  /*
   * Your actual schema does not have Account_ID.
   *
   * Use Paid_From_Account_ID instead.
   */
  const accountRecords =
    findRecords(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Paid_From_Account_ID:
          REPOSITORY_TEST_CONFIG.TEST_ACCOUNT_ID
      }
    );

  assertTrue(
    Array.isArray(accountRecords),
    'findRecords should return an array'
  );

  assertTrue(
    accountRecords.length >= 1,
    'At least one test record should be found'
  );

  accountRecords.forEach(function(record) {

    assertEqual(
      REPOSITORY_TEST_CONFIG.TEST_ACCOUNT_ID,
      record.Paid_From_Account_ID,
      'All returned records should match criteria'
    );
  });
}


/* ============================================================
 * TEST 7 — FIND SINGLE RECORD
 * ============================================================
 */

function testFindRecord() {

  const record =
    findRecord(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Transaction_ID:
          REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
      }
    );

  assertTrue(
    record !== null,
    'findRecord should return a record'
  );

  assertEqual(
    REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID,
    record.Transaction_ID,
    'Transaction_ID should match'
  );

  assertEqual(
    REPOSITORY_TEST_CONFIG.TEST_AMOUNT,
    record.Amount,
    'Amount should match'
  );
}


/* ============================================================
 * TEST 8 — FIND RECORD WITH ROW
 * ============================================================
 */

function testFindRecordWithRow() {

  const result =
    findRecordWithRow(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Transaction_ID:
          REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
      }
    );

  assertTrue(
    result !== null,
    'findRecordWithRow should return a result'
  );

  assertTrue(
    result.rowNumber >= 2,
    'Returned row number should be a data row'
  );

  assertTrue(
    result.record !== null,
    'Result should contain the record'
  );

  assertEqual(
    REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID,
    result.record.Transaction_ID,
    'Returned record should match'
  );
}


/* ============================================================
 * TEST 9 — GET ROW
 * ============================================================
 */

function testGetRow() {

  const result =
    findRecordWithRow(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Transaction_ID:
          REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
      }
    );

  assertTrue(
    result !== null,
    'Test record should exist'
  );

  const row =
    getRow_(
      CONFIG.SHEETS.TRANSACTIONS,
      result.rowNumber
    );

  assertTrue(
    row !== null,
    'getRow_ should return a row'
  );

  assertTrue(
    Array.isArray(row),
    'getRow_ should return an array'
  );

  const headers =
    getHeaders_(
      getSheet_(
        CONFIG.SHEETS.TRANSACTIONS
      )
    );

  const transactionIdIndex =
    headers.indexOf('Transaction_ID');

  assertEqual(
    REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID,
    row[transactionIdIndex],
    'Transaction_ID should be read from correct column'
  );
}


/* ============================================================
 * TEST 10 — UPDATE RECORD
 * ============================================================
 */

function testUpdateRecord() {

  const result =
    findRecordWithRow(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Transaction_ID:
          REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
      }
    );

  assertTrue(
    result !== null,
    'Test record should exist before update'
  );

  const updatedRecord = {

    Transaction_ID:
      result.record.Transaction_ID,

    Transaction_Date:
      result.record.Transaction_Date,

    Transaction_Type:
      result.record.Transaction_Type,

    Amount:
      REPOSITORY_TEST_CONFIG.UPDATED_AMOUNT,

    Category_ID:
      result.record.Category_ID,

    Payment_Method:
      result.record.Payment_Method,

    Paid_From_Account_ID:
      result.record.Paid_From_Account_ID,

    Received_Into_Account_ID:
      result.record.Received_Into_Account_ID,

    From_Account_ID:
      result.record.From_Account_ID,

    To_Account_ID:
      result.record.To_Account_ID,

    Notes:
      'Updated US-010 Repository Test',

    Created_Date:
      result.record.Created_Date,

    Updated_Date:
      new Date(),

    Status:
      result.record.Status
  };

  const updateResult =
    updateRecord(
      CONFIG.SHEETS.TRANSACTIONS,
      result.rowNumber,
      updatedRecord
    );

  assertTrue(
    updateResult !== null,
    'updateRecord should return the updated record'
  );
}


/* ============================================================
 * TEST 11 — READ UPDATED RECORD
 * ============================================================
 */

function testReadUpdatedRecord() {

  const record =
    findRecord(
      CONFIG.SHEETS.TRANSACTIONS,
      {
        Transaction_ID:
          REPOSITORY_TEST_CONFIG.TEST_TRANSACTION_ID
      }
    );

  assertTrue(
    record !== null,
    'Updated record should exist'
  );

  assertEqual(
    REPOSITORY_TEST_CONFIG.UPDATED_AMOUNT,
    record.Amount,
    'Amount should contain updated value'
  );

  assertEqual(
    'Updated US-010 Repository Test',
    record.Notes,
    'Notes should contain updated value'
  );
}


/* ============================================================
 * REMOVE SINGLE TEST TRANSACTION
 * ============================================================
 */

function removeTransactionById(transactionId) {

  const sheet =
    getSheet_(CONFIG.SHEETS.TRANSACTIONS);

  const headers =
    getHeaders_(sheet);

  const transactionIdIndex =
    headers.indexOf('Transaction_ID');

  if (transactionIdIndex === -1) {

    throw new Error(
      'Transaction_ID header not found'
    );
  }

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2) {
    return;
  }

  const rows =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        lastColumn
      )
      .getValues();

  for (
    let i = rows.length - 1;
    i >= 0;
    i--
  ) {

    if (
      rows[i][transactionIdIndex] ===
      transactionId
    ) {

      sheet.deleteRow(i + 2);
    }
  }
}


/* ============================================================
 * ASSERTION HELPERS
 * ============================================================
 */

function assertTrue(condition, message) {

  if (!condition) {

    throw new Error(
      'Assertion failed: ' + message
    );
  }
}


function assertEqual(expected, actual, message) {

  if (expected !== actual) {

    throw new Error(
      'Assertion failed: ' +
      message +
      ' | Expected: ' +
      expected +
      ' | Actual: ' +
      actual
    );
  }
}