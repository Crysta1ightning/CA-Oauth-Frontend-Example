import { OKX_CLEINT_ID, REDIRECT_URI, STATENAME, OKX_PROVIDERNAME } from "./const";

export const handleOkxLogin = (sdkReady) => {
  // CSRF 保護
  const state = JSON.stringify({
    provider: OKX_PROVIDERNAME,
    seed: crypto.randomUUID(),
  })
  sessionStorage.setItem(STATENAME, state); // 👈 這一行要加
  const storedState = sessionStorage.getItem(STATENAME);
  console.log("storedState: ", storedState);

  if (sdkReady && window.OKEXOAuthSDK) {
    window.OKEXOAuthSDK.authorize({
      response_type: "code",
      access_type: "offline",
      client_id: OKX_CLEINT_ID,
      redirect_uri: encodeURIComponent(REDIRECT_URI),
      scope: "fast_api",
      state: encodeURIComponent(state),
    });
  } else {
    console.error("SDK not ready");
  }
};
