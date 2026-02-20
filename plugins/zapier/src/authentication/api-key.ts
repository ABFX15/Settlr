/**
 * Settlr Zapier Integration — Authentication
 *
 * Uses API Key auth (X-API-Key header).
 * Test endpoint: GET /api/auth/me to validate the key.
 */

const authentication = {
  type: "custom" as const,
  test: {
    url: "{{bundle.authData.baseUrl}}/api/auth/me",
    method: "GET",
    headers: {
      "X-API-Key": "{{bundle.authData.apiKey}}",
    },
  },
  fields: [
    {
      key: "apiKey",
      label: "API Key",
      type: "string" as const,
      required: true,
      helpText:
        "Your Settlr API key. Find it at https://settlr.dev/dashboard/api-keys",
    },
    {
      key: "baseUrl",
      label: "Base URL",
      type: "string" as const,
      required: false,
      default: "https://settlr.dev",
      helpText: "Leave default unless you're self-hosting.",
    },
  ],
  connectionLabel: "{{bundle.inputData.email}} (Settlr)",
};

export default authentication;
