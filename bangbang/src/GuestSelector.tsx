export default function GuestSelector ({ onClick }: { onClick: () => void}) {
    return (
        <>
            <div onClick={onClick}>
                인원
            </div>
            <button className="clear-guest">X</button>
        </>
    )
}