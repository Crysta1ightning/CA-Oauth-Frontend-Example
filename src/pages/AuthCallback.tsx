import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OKX_PROVIDERNAME, STATENAME } from '../utils/oauth/const';

function getCookieValue(name) {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  if (value === undefined) return null;
  return value;
}

function parseJwt(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch (e) {
    console.error('Invalid JWT token:', e);
    return null;
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("成功跳轉");
  const [provider, setProvider] = useState('');
  const [username, setUsername] = useState('');
  const [force, setForce] = useState(false);
  const [oauthSessionId, setOauthSessionId] = useState('');

  const sendQuery = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const domain = urlParams.get('domain');
    console.log(code);
    console.log(state);
    console.log(domain);

    if (!code || !state || (provider === OKX_PROVIDERNAME && !domain)) {
      setStatus("缺少參數");
      return;
    }

    let info;
    console.log("Provider: ", provider);
    if (provider === OKX_PROVIDERNAME) {
      info = {"domain": domain};
      console.log("extraInfo: ", info);
    }

    console.log("Token:", token);
    console.log(document.cookie);

    const headers = {
      "Content-Type": "application/json",
      "X-staging-token": "dNqXFka25d4ZsK3",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Set Authorization");
    }

    try {
      const res = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: `
            mutation LoginOauth($code: String!, $provider: String!, $extraInfo: JSON, $force: Boolean, $username: String) {
              loginOauth(code: $code, provider: $provider, extraInfo: $extraInfo, force: $force, username: $username) {
                token
                user {
                  id
                  username
                }
              }
            }
          `,
          variables: {
            code,
            provider,
            extraInfo: info,
            force,
            username
          }
        })
      });

      const json = await res.json();
      const data = json.data?.loginOauth;

      if (res.ok && !json.errors) {
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        setStatus(JSON.stringify(data, null, 2));
        sessionStorage.removeItem(STATENAME);
      } else {
        console.error('登入失敗', json.errors || data);
        setStatus(JSON.stringify(json.errors || data, null, 2));
        sessionStorage.removeItem(STATENAME);
        
        const oauthSessionId = json.errors[0].extensions.oauthSessionId;
        setOauthSessionId(oauthSessionId);
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
      console.error('網路錯誤:', err);
      // navigate('/?error=network_error');
    }
  };
    
  const sendContinueQuery = async () => {
    console.log("Token:", token);

    const headers = {
      "Content-Type": "application/json",
      "X-staging-token": "dNqXFka25d4ZsK3",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: `
            mutation LoginOauthContinue($provider: String!, $oauthSessionId: String!, $force: Boolean, $username: String) {
              loginOauthContinue(provider: $provider, oauthSessionId: $oauthSessionId, force: $force, username: $username) {
                token
                user {
                  id
                  username
                }
              }
            }
          `,
          variables: {
            provider,
            oauthSessionId,
            force,
            username
          }
        })
      });

      const json = await res.json();
      const data = json.data?.loginOauth;

      if (res.ok && !json.errors) {
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        setStatus(JSON.stringify(data, null, 2));
        sessionStorage.removeItem(STATENAME);
      } else {
        console.error('登入失敗', json.errors || data);
         
        setStatus(JSON.stringify(json.errors || data, null, 2));
        sessionStorage.removeItem(STATENAME);

        const oauthSessionId = json.errors[0].extensions.oauthSessionId;
        setOauthSessionId(oauthSessionId);
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
      console.error('網路錯誤:', err);
      // navigate('/?error=network_error');
    }
  };
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    console.log(code);
    console.log(state);

    if (!code || !state) {
      setStatus("缺少參數");
      // navigate('/?error=missing_parameters');
      return;
    }

    const storedState = sessionStorage.getItem(STATENAME);
    console.log("storedState: ", storedState, "state: ", state);
    if (!storedState || state !== storedState) {
      setStatus("CSRF check failed");
      sessionStorage.removeItem(STATENAME); // 清掉
      // navigate('/?error=csrf_failed');

      return;
    }
    setProvider(JSON.parse(state).provider);
    const _token = getCookieValue('auth_token');
    if (_token) {
      setToken(_token);
      const _payload = parseJwt(_token);
      setId(_payload.id);
    }

  }, [navigate]);

  return (
    <div>
      <div>Token: {token}</div>
      <div>Id: {id}</div>
      <div>{status}</div>
      <br/>
      <div>Oauth Session ID: {oauthSessionId}</div>

      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ marginLeft: '8px' }}
          />
        </label>
      </div>

      <div style={{ marginTop: '8px' }}>
        <label>
          Force:
          <button
            onClick={() => setForce(prev => !prev)}
            style={{ marginLeft: '8px' }}
          >
            {force ? '✅ True' : '❌ False'}
          </button>
        </label>
      </div>

      
      <div style={{ marginTop: '8px' }}>
        <button
          onClick={() => sendQuery()}
          style={{ marginLeft: '8px' }}
        >Send Query
        </button>
      </div>

      <div style={{ marginTop: '8px' }}>
        <button
          onClick={() => sendContinueQuery()}
          style={{ marginLeft: '8px' }}
        >Send Continue Query
        </button>
      </div>
    </div>
  );
}
