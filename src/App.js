import { useEffect, useState } from "react";

function App() {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // 確保 SDK 載入好了
    if (window.OKEXOAuthSDK) {
      window.OKEXOAuthSDK.init({
        requestUrl: "https://www.okx.com",
        onInit: () => {
          setSdkReady(true);
        },
      });
    } else {
      console.error("OKX SDK not found on window");
    }
  }, []);

  const handleOkxLogin = () => {
    // CSRF 保護
    const state = JSON.stringify({
      provider: "OKX",
      seed: crypto.randomUUID(),
    })

    sessionStorage.setItem("oauth_okx_state", state); // 👈 這一行要加
    const storedState = sessionStorage.getItem("oauth_okx_state");
    console.log("storedState: ", storedState);
    const clientId = "6191b79866d540bbba1166d67bb45b84GCesTg2U"; 
    const redirectUri = "http://localhost:3000/api/oauth/proxy"; 

    if (sdkReady && window.OKEXOAuthSDK) {
      window.OKEXOAuthSDK.authorize({
        response_type: "code",
        access_type: "offline",
        client_id: clientId,
        redirect_uri: encodeURIComponent(redirectUri),
        scope: "read_only",
        state: encodeURIComponent(state),
      });
    } else {
      console.error("SDK not ready");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>OKX OAuth Login</h1>
      <p>Click the button below to authorize with OKX:</p>
      <button onClick={handleOkxLogin} disabled={!sdkReady}>
        Login with OKX
      </button>
    </div>
  );
}

export default App;
