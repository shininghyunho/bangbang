import { useEffect, useState } from "react";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:3000';

interface User {
  name: string;
  imageUrl: string;
}

export function Login() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const imgUrl = params.get("imgUrl");
    const error = params.get("error");

    if (name && imgUrl) setUser({ name, imageUrl: imgUrl });
    else if (error) console.error("카카오 로그인 중 오류 발생:", error);

    if (name || imgUrl || error) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleLogin = () => {
    const KAKAO_REDIRECT_URI = `${BACKEND_API_BASE_URL}/auth/kakao/callback`;
    const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}`;
    location.href = kakaoLoginUrl;
  };

  return (
    <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <img src={user.imageUrl} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }} />
            <span>{user.name}님</span>
            <button onClick={() => setUser(null)}>로그아웃</button>
          </>
        ) : (
          <button onClick={handleLogin}>로그인</button>
        )}
    </div>
  );
}