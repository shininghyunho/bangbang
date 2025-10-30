import { useState } from "react";

const KAKAO_REST_API_KEY = import.meta.env.KAKAO_REST_API_KEY;
const REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";

export function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = {
    name: '사용자',
    imageUrl: 'https://cataas.com/cat'
  };

  const handleLogin = () => {
    const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
    location.href = kakaoLoginUrl;
  };

  return (
    <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isLoggedIn ? (
          <>
            <img src={user.imageUrl} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }} />
            <span>{user.name}님</span>
            <button onClick={() => setIsLoggedIn(false)}>로그아웃</button>
          </>
        ) : (
          <button onClick={handleLogin}>로그인</button>
        )}
    </div>
  );
}