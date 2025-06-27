import { useEffect, useState } from "react";
import { handleOkxLogin } from "./utils/oauth/okx";
import { handleBybitLogin } from "./utils/oauth/bybit";


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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>OAuth Login</h1>
      <button onClick={() => {handleOkxLogin(sdkReady)}} disabled={!sdkReady}>
        Login with OKX
      </button>
      <br/>
      <button onClick={handleBybitLogin} disabled={!sdkReady}>
        Login with Bybit
      </button>
    </div>
  );
}

export default App;
