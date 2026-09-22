const API_BASE_URL = "https://script.google.com/macros/s/AKfycbx2fZsDgM3RCFVkSQhM1ai4kr4kyc7AbTfWUP1QWdwZhQwmhdqX_ZG03WDQhsIm5IyC/exec";

function buildApiUrl(endpoint = "") {
  const normalizedEndpoint = endpoint || "";
  const queryString = normalizedEndpoint.startsWith("?") ? normalizedEndpoint : `?${normalizedEndpoint}`;

  return `${API_BASE_URL}${queryString}`;
}

export async function apiRequest(endpoint = "", options = {}) {
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
