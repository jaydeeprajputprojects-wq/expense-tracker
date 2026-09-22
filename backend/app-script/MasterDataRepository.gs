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


const MASTER_DATA_CACHE_KEY = 'EXPENSE_TRACKER_MASTER_DATA';
const MASTER_DATA_CACHE_TTL_SECONDS = 300;

function getMasterDataCache_() {
  return CacheService && CacheService.getScriptCache ? CacheService.getScriptCache() : null;
}

function readMasterDataFromCache_() {
  const cache = getMasterDataCache_();

  if (!cache) {
    return null;
  }

  try {
    const cachedValue = cache.get(MASTER_DATA_CACHE_KEY);

    if (!cachedValue) {
      return null;
    }

    const parsed = JSON.parse(cachedValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.warn('Failed to read cached master data:', error && error.message ? error.message : error);
    return null;
  }
}

function writeMasterDataToCache_(payload) {
  const cache = getMasterDataCache_();

  if (!cache || !payload || typeof payload !== 'object') {
    return;
  }

  try {
    cache.put(MASTER_DATA_CACHE_KEY, JSON.stringify(payload), MASTER_DATA_CACHE_TTL_SECONDS);
  } catch (error) {
    console.warn('Failed to cache master data:', error && error.message ? error.message : error);
  }
}

function getMasterDataBundle_() {
  const cached = readMasterDataFromCache_();

  if (cached) {
    return cached;
  }

  const payload = {
    accounts: getAccounts(),
    categories: getCategories(),
    configuration: getConfiguration()
  };

  writeMasterDataToCache_(payload);

  return payload;
}

function clearMasterDataCache_() {
  const cache = getMasterDataCache_();

  if (!cache) {
    return;
  }

  cache.remove(MASTER_DATA_CACHE_KEY);
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