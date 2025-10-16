import { useState } from 'react';

const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const buttonStyle = {
    width: '40px',
    height: '40px',
    border: '2px solid #e5e7eb',
    borderRadius: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
};

const countStyle = {
    margin: '0 1rem',
    minWidth: '20px',
    textAlign: 'center',
    fontSize: '1.5rem',
} as const;

const MIN_COUNT=0;
const MAX_COUNT=8;

export default function GuestCategory({ title, subTitle }: { title: string; subTitle: string }) {
    const [count, setCount] = useState(0);

    const handleDecrement = () => setCount(prevCount => Math.max(MIN_COUNT, prevCount - 1));
    const handleIncrement = () => setCount(prevCount => Math.min(MAX_COUNT, prevCount + 1));

    return (
        <div style={containerStyle}>
            <div>
                <p style={{ fontWeight: '800' }}>{title}</p>
                <p style={{ fontSize: '0.875rem', color: '#848c9bff' }}>{subTitle}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button style={buttonStyle} onClick={handleDecrement} disabled={count === MIN_COUNT}>-</button>
                <span style={countStyle}>{count}</span>
                <button style={buttonStyle} onClick={handleIncrement} disabled={count === MAX_COUNT}>+</button>
            </div>
        </div>
    );
}