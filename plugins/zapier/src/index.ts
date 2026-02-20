/**
 * Settlr Zapier App — Entry Point
 *
 * Registers authentication, triggers, and actions with the Zapier platform.
 */

import { version as platformVersion } from "zapier-platform-core";
import authentication from "./authentication/api-key";
import payoutClaimedTrigger from "./triggers/payout-claimed";
import paymentReceivedTrigger from "./triggers/payment-received";
import sendPayoutCreate from "./creates/send-payout";
import createPaymentLinkCreate from "./creates/create-payment-link";

const App = {
  version: "1.0.0",
  platformVersion,

  authentication,

  // Attach the API key to every outbound request automatically
  beforeRequest: [
    (request: any, z: any, bundle: any) => {
      if (bundle.authData?.apiKey) {
        request.headers = request.headers || {};
        request.headers["X-API-Key"] = bundle.authData.apiKey;
      }
      return request;
    },
  ],

  // Throw on 401 so Zapier can prompt re-auth
  afterResponse: [
    (response: any, z: any) => {
      if (response.status === 401) {
        throw new z.errors.RefreshAuthError("API key is invalid or expired.");
      }
      return response;
    },
  ],

  triggers: {
    [payoutClaimedTrigger.key]: payoutClaimedTrigger,
    [paymentReceivedTrigger.key]: paymentReceivedTrigger,
  },

  creates: {
    [sendPayoutCreate.key]: sendPayoutCreate,
    [createPaymentLinkCreate.key]: createPaymentLinkCreate,
  },

  searches: {},
};

export default App;
module.exports = App;
