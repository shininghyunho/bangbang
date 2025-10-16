export default function GuestSelector ({ onClick }: { onClick: () => void}) {
    return (
        <div className="flex items-center">
            <div onClick={onClick}>
                인원
            </div>
            <button>X</button>
        </div>
    )
}