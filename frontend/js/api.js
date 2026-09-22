const API_BASE_URL = "/api";

function ensureHttpServerForApi() {
  if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
    throw new Error("Open this app through a local web server (for example http://localhost:8000) instead of opening index.html directly. The file:// protocol blocks API requests.");
  }
}

function buildApiUrl(endpoint = "") {
  if (!endpoint) {
    return API_BASE_URL;
  }

  const normalizedEndpoint = endpoint.startsWith("?") ? endpoint : `?${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}

export async function apiRequest(endpoint = "", options = {}) {
  ensureHttpServerForApi();

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    ...options
  };

  if (
    requestOptions.body &&
    typeof requestOptions.body !== "string" &&
    !(requestOptions.body instanceof FormData)
  ) {
    requestOptions.headers = {
      ...requestOptions.headers,
      "Content-Type": "application/json"
    };
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  try {
    const response = await fetch(buildApiUrl(endpoint), requestOptions);

    let payload;

    try {
      payload = await response.json();
    } catch (error) {
      throw new Error("API returned an invalid JSON response.");
    }

    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || `API request failed with status ${response.status}.`;
      throw new Error(message);
    }

    if (payload && payload.success === false) {
      const message = payload.error?.message || payload.message || "The API request failed.";
      throw new Error(message);
    }

    return payload && Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Network error: unable to reach the API server.");
    }

    throw error;
  }
}

export async function getMasterData() {
  return apiRequest("?action=GET_MASTER_DATA");
}

export async function getTransactions() {
  const result = await apiRequest("?action=GET_TRANSACTIONS");
  return result && typeof result === "object" && Array.isArray(result.transactions) ? result : { transactions: [] };
}

export async function getTransaction(transactionId) {
  const result = await apiRequest(`?action=GET_TRANSACTION&transactionId=${encodeURIComponent(transactionId)}`);
  return result && typeof result === "object" && result.transaction ? result : { transaction: null };
}

export async function getBalances() {
  const result = await apiRequest("?action=GET_BALANCES");
  return result && typeof result === "object" && Array.isArray(result.balances) ? result : { balances: [] };
}

export async function createTransaction(payload) {
  return apiRequest("", {
    method: "POST",
    body: {
      action: "CREATE_TRANSACTION",
      data: payload
    }
  });
}

export async function updateTransaction(transactionId, payload) {
  return apiRequest("", {
    method: "POST",
    body: {
      action: "UPDATE_TRANSACTION",
      transactionId,
      data: payload
    }
  });
}

export async function deleteTransaction(transactionId) {
  return apiRequest("", {
    method: "POST",
    body: {
      action: "DELETE_TRANSACTION",
      transactionId
    }
  });
}
