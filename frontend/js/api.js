/**

* API module.
*
* Backend integration will be implemented
* in a future User Story.
  */

const API_BASE_URL = "";

export async function apiRequest(endpoint, options = {}) {
const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

```
if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
}

return response.json();
```

}
