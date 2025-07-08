import { useEffect, useState } from "react";
import { handleOkxLogin } from "./utils/oauth/okx";
import { handleBybitLogin } from "./utils/oauth/bybit";

function getCookieValue(name) {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  if (value === undefined) return null;
  return value
}

function parseJwt(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch (e) {
    console.error('Invalid JWT token:', e);
    return null;
  }
}

function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [token, setToken] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
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

    const _token = getCookieValue('auth_token');
    if (_token) {
      setToken(_token);
      const _payload = parseJwt(_token);
      setId(_payload.id);
    }
  }, []);

  const logOut = async () => {
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
    setToken(null);
    setId(null); // 如果你也存了使用者 ID
    console.log("Logged out successfully.");
  }

  const handleV1Login = async () => {
    setLoginStatus("Logging in...");
    try {
      const res = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-staging-token": "dNqXFka25d4ZsK3",
        },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) 
            }
          `,
          variables: {
            email,
            password,
          },
        }),
      });

      const json = await res.json();
      const data = json.data?.login;

      if (res.ok && !json.errors) {
        document.cookie = `auth_token=${data}; path=/; max-age=604800; SameSite=Lax`;
        setLoginStatus(`Login successful: ${JSON.stringify(data)}`);
      } else {
        console.error("登入失敗", json.errors);
        setLoginStatus(`Login failed: ${JSON.stringify(json.errors)}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginStatus(`Login error: ${err}`);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div>Token: {token}</div>
      <div>Id: {id}</div>
      <h1>V1 Login</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Password:
          <input
            type="text" // 你說不要加 type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <button onClick={handleV1Login}>Login with Email</button>
      <div style={{ marginTop: "1rem", color: "gray" }}>{loginStatus}</div>

      <h1 style={{ marginTop: "2rem" }}>OAuth Login</h1>
      <button onClick={() => handleOkxLogin(sdkReady)} disabled={!sdkReady}>
        Login with OKX
      </button>
      <br />
      <button onClick={handleBybitLogin} disabled={!sdkReady}>
        Login with Bybit
      </button>

      <h1 style={{ marginTop: "2rem" }}>Log out</h1>
      <button onClick={logOut}>
        logOut
      </button>
    </div>
  );
}

export default App;
