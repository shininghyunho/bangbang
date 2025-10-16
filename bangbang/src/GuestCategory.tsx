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

export default function GuestCategory({ title, subTitle, count, onIncrement, onDecrement, minCount, maxCount }: {
    title: string;
    subTitle: string;
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    minCount: number;
    maxCount: number;
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ fontWeight: '800' }}>{title}</p>
                <p style={{ fontSize: '0.875rem', color: '#848c9bff' }}>{subTitle}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button style={buttonStyle} onClick={onDecrement} disabled={count === minCount}>-</button>
                <span style={{ margin: '0 1rem', minWidth: '20px', textAlign: 'center', fontSize: '1.5rem' }}>{count}</span>
                <button style={buttonStyle} onClick={onIncrement} disabled={count === maxCount}>+</button>
            </div>
        </div>
    );
}