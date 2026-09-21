function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}


function getSheet_(sheetName) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  return sheet;
}


function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();

  if (lastColumn === 0) {
    return [];
  }

  return sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0];
}


function mapRowToObject_(headers, row) {
  const record = {};

  headers.forEach((header, index) => {
    record[header] = row[index];
  });

  return record;
}


function mapObjectToRow_(headers, record) {
  return headers.map(header => record[header] ?? '');
}


function getRow_(sheetName, rowNumber) {
  const sheet = getSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();

  if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return null;
  }

  return sheet
    .getRange( rowNumber, 1, 1, lastColumn)
    .getValues()[0];
}


function getAllRecords(sheetName) {
  const sheet = getSheet_(sheetName);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2 || lastColumn === 0) {
    return [];
  }

  const headers = getHeaders_(sheet);

  const rows = sheet
    .getRange(2, 1, lastRow - 1, lastColumn)
    .getValues();

  return rows.map(row => mapRowToObject_(headers, row));
}


function appendRow_(sheetName, rowData) {
  const sheet = getSheet_(sheetName);

  sheet.appendRow(rowData);

  return sheet.getLastRow();
}


function appendRecord(sheetName, record) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);

  const row = mapObjectToRow_(headers, record);

  sheet.appendRow(row);

  return {
    rowNumber: sheet.getLastRow(),
    record: record
  };
}


function updateRow_(sheetName, rowNumber, rowData) {
  const sheet = getSheet_(sheetName);
  const lastColumn = sheet.getLastColumn();

  if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    throw new Error(`Invalid row number: ${rowNumber}`);
  }

  if (rowData.length !== lastColumn) {
    throw new Error('Row data does not match sheet column count');
  }

  sheet
    .getRange(rowNumber, 1, 1, lastColumn)
    .setValues([rowData]);

  return true;
}


function updateRecord(sheetName, rowNumber, record) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);

  const row = mapObjectToRow_(headers, record);

  updateRow_(sheetName, rowNumber, row);

  return record;
}


function findRecords(sheetName, criteria) {
  const records = getAllRecords(sheetName);

  return records.filter(record => {
    return Object.keys(criteria).every(key => {
      return record[key] === criteria[key];
    });
  });
}


function findRecord(sheetName, criteria) {
  const records = findRecords(sheetName, criteria);

  return records.length > 0 ? records[0] : null;
}


function findRecordWithRow(sheetName, criteria) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 2) {
    return null;
  }

  const rows = sheet
    .getRange(2, 1, lastRow - 1, lastColumn)
    .getValues();

  for (let i = 0; i < rows.length; i++) {
    const record = mapRowToObject_(headers, rows[i]);

    const matches = Object.keys(criteria).every(key => {
      return record[key] === criteria[key];
    });

    if (matches) {
      return {
        rowNumber: i + 2,
        record: record
      };
    }
  }

  return null;
}