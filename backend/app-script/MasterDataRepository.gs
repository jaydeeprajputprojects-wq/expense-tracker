/**
 * ============================================================
 * MasterDataRepository.gs
 *
 * US-011 — Master-Data Repository
 *
 * Responsibilities:
 * - Read Accounts
 * - Read Categories
 * - Read Configuration
 * - Convert rows into clean JavaScript objects
 *
 * Dependencies:
 * - Config.gs
 * - SheetRepository.gs
 *
 * No business logic should be added here.
 * ============================================================
 */


/**
 * Convert blank values to null and trim strings.
 *
 * @param {*} value
 * @returns {*}
 */
function cleanMasterDataValue_(value) {

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {

    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      return null;
    }

    return trimmedValue;
  }

  return value;
}


/**
 * Clean a single master-data record.
 *
 * @param {Object} record
 * @returns {Object}
 */
function cleanMasterDataRecord_(record) {

  const cleanRecord = {};

  Object.keys(record).forEach(function(key) {

    cleanRecord[key] =
      cleanMasterDataValue_(record[key]);

  });

  return cleanRecord;
}


/**
 * Read and clean all records from a master-data sheet.
 *
 * @param {string} sheetName
 * @returns {Object[]}
 */
function getCleanMasterData_(sheetName) {

  const records =
    getAllRecords(sheetName);

  return records.map(function(record) {

    return cleanMasterDataRecord_(record);

  });
}


/**
 * Read Accounts.
 *
 * @returns {Object[]}
 */
function getAccounts() {

  const records =
    getCleanMasterData_(
      CONFIG.SHEETS.ACCOUNTS
    );

  return records.map(function(record) {

    return mapAccountToCleanObject_(record);

  });
}


/**
 * Read Categories.
 *
 * @returns {Object[]}
 */
function getCategories() {

  return getCleanMasterData_(
    CONFIG.SHEETS.CATEGORIES
  );
}


/**
 * Read Configuration.
 *
 * @returns {Object[]}
 */
function getConfiguration() {

  return getCleanMasterData_(
    CONFIG.SHEETS.CONFIGURATION
  );
}

function mapAccountToCleanObject_(record) {

  return {
    accountId: record.Account_ID,
    accountName: record.Account_Name,
    accountType: record.Account_Type,
    openingBalance: record.Opening_Balance,
    status: record.Status
  };
}