import { BYBIT_CLEINT_ID, REDIRECT_URI, STATENAME, BYBIT_PROVIDERNAME } from "./const";
export const handleBybitLogin = () => {
    // CSRF 保護
    const state = JSON.stringify({
        provider: BYBIT_PROVIDERNAME,
        seed: crypto.randomUUID(),
    })
    sessionStorage.setItem(STATENAME, state); // oauth_bybit_state
    const storedState = sessionStorage.getItem(STATENAME);
    console.log("storedState: ", storedState);

    const baseUrl = "https://www.bybit.com/oauth";
    const query = new URLSearchParams({
        client_id: BYBIT_CLEINT_ID,
        response_type: "code",
        scope: "restrict,restrict-email,openapi", // restrict, openapi, openapai-order, api-spot
        state: encodeURIComponent(state),
        redirect_uri: encodeURIComponent(REDIRECT_URI)
    });
    const authUrl = `${baseUrl}?${query.toString()}`;

    window.location.href = authUrl;
};

export const generateBybitPayload = (urlParams, force) => {
  return {
    provider: BYBIT_PROVIDERNAME,
    force
  };
}
