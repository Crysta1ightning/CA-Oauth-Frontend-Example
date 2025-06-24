import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePayload } from '../utils/oauth/payload';
import { STATENAME } from '../utils/oauth/const';

function getCookieValue(name) {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  if (value == "undefined") return null;
  return value;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("登入中...");

  useEffect(() => {
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

      const storedState = sessionStorage.getItem(STATENAME);
      console.log("storedState: ", storedState, "state: ", state);
      if (!storedState || state !== storedState) {
        setStatus("CSRF check failed");
        sessionStorage.removeItem(STATENAME); // 清掉
        // navigate('/?error=csrf_failed');
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

      const payload = generatePayload(urlParams);
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

    sendQuery();
  }, [navigate]);

  return <div>{status}</div>;
}
