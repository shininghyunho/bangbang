export default function GuestSelector ({ onClick }: { onClick: () => void}) {
    return (
        <div style={{ display: 'flex',alignItems: 'center', cursor: 'pointer'}}>
            <div onClick={onClick}>
                인원
            </div>
            <button>X</button>
        </div>
    )
}