import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("登入中...");

  useEffect(() => {
    const sendQuery = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      console.log(code);
      console.log(state)

      if (!code || !state) {
        console.error('缺少參數');
        // navigate('/?error=missing_parameters');
        return;
      }

      const storedState = sessionStorage.getItem("oauth_okx_state");
      console.log("storedState: ", storedState, "state: ", state);
      if (!storedState || state !== storedState) {
        setStatus("CSRF check failed");
        sessionStorage.removeItem("oauth_okx_state"); // 清掉
        // navigate('/?error=csrf_failed');
        return;
      }

      const query = new URLSearchParams({
        code,
        state,
      }).toString();

      try {
        const res = await fetch(`http://localhost:4000/auth/callback?${query}`);

        const data = await res.json();
        console.log("data: ", data);

        if (res.ok) {
          console.log('登入成功', data);
          setStatus(JSON.stringify(data, null, 2));
          sessionStorage.removeItem("oauth_okx_state");
          // navigate('/arena');
        } else {
          console.error('登入失敗', data.error);
          setStatus(JSON.stringify(data, null, 2));
          sessionStorage.removeItem("oauth_okx_state");
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
