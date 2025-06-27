import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePayload } from '../utils/oauth/payload';
import { OKX_PROVIDERNAME, STATENAME } from '../utils/oauth/const';

function getCookieValue(name) {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  if (value === "undefined") return null;
  return value
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("登入中...");
  const [username, setUsername] = useState('');
  const [force, setForce] = useState(false);
  const [oauthSessionId, setOauthSessionId] = useState('');

  const getProviderName = (urlParams) => {
    const state = urlParams.get("state");
    if (!state) throw new Error("Missing state");

    let parsedState;
    try {
      parsedState = JSON.parse(state);
    } catch {
      throw new Error("Invalid JSON in state param");
    }
    return parsedState.provider;
  }

  const sendQuery = async () => {
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

      const token = getCookieValue('auth_token');
      console.log("Token:", token);
      console.log(document.cookie);

      const headers = {
        "Content-Type": "application/json",
        "X-staging-token": "dNqXFka25d4ZsK3",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = generatePayload(urlParams, force);
      try {
        const res = await fetch(`http://localhost:4000/auth/callback`, {
          method: "POST",
          headers,
          body: JSON.stringify({ code, payload }),
        })

        const data = await res.json();
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        console.log("data: ", data);

        if (res.ok) {
          console.log('登入成功', data);
          setStatus(JSON.stringify(data, null, 2));
          sessionStorage.removeItem(STATENAME);
          // navigate('/arena');
        } else {
          console.error('登入失敗', data.error);
          setOauthSessionId(data.oauthSessionId); 
          setStatus(JSON.stringify(data, null, 2));
          sessionStorage.removeItem(STATENAME);
          // navigate('/?error=' + encodeURIComponent(data.error));
        }
      } catch (err) {
        setStatus(`Error: ${err}`);
        console.error('網路錯誤:', err);
        // navigate('/?error=network_error');
      }
    };
    
  const sendContinueQuery = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = getCookieValue('auth_token');
    console.log("Token:", token);
    console.log(document.cookie);

    const headers = {
      "Content-Type": "application/json",
      "X-staging-token": "dNqXFka25d4ZsK3",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {  
      "provider": getProviderName(urlParams),
      "force": force,
      "username": username,
      "oauthSessionId": oauthSessionId 
    }
    try {
      const res = await fetch(`http://localhost:4000/auth/continue`, {
        method: "POST",
        headers,
        body: JSON.stringify({ payload }),
      })

      const data = await res.json();
      document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      console.log("data: ", data);

      if (res.ok) {
        console.log('登入成功', data);
        setStatus(JSON.stringify(data, null, 2));
        sessionStorage.removeItem(STATENAME);
        // navigate('/arena');
      } else {
        console.error('登入失敗', data.error);
        setStatus(JSON.stringify(data, null, 2));
        sessionStorage.removeItem(STATENAME);
        // navigate('/?error=' + encodeURIComponent(data.error));
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
  }, [navigate]);

  return (
    <div>
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
