const ResponseUtil = {

  /**
   * Creates a standardized successful API response.
   *
   * Response format:
   *
   * {
   *   "success": true,
   *   "message": "Request successful",
   *   "data": {}
   * }
   */
  success: function(data, message) {

    const response = {
      success: true,
      message: message || 'Request successful',
      data: data || {}
    };

    return this.toJsonResponse(response);
  },


  /**
   * Creates a standardized API error response.
   *
   * Response format:
   *
   * {
   *   "success": false,
   *   "error": {
   *     "code": "ERROR_CODE",
   *     "message": "Error message"
   *   }
   * }
   */
  error: function(code, message) {

    const response = {
      success: false,
      error: {
        code: code || 'SERVER_ERROR',
        message: message || 'An unexpected error occurred'
      }
    };

    return this.toJsonResponse(response);
  },


  /**
   * Converts a JavaScript object into
   * a Google Apps Script JSON response.
   */
  toJsonResponse: function(response) {

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }

};

/**
 * Creates a JSON HTTP response.
 *
 * @param {Object} payload Response object
 * @return {TextOutput} JSON response
 */
function createJsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}