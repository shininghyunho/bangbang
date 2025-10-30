import { useState } from "react";

export function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = {
    name: '사용자',
    imageUrl: 'https://cataas.com/cat'
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
          <button onClick={() => setIsLoggedIn(true)}>로그인</button>
        )}
    </div>
  );
}