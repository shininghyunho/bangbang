export default function GuestSelector ({ onClick, guestCount, infantCount, onReset }: { onClick: () => void, guestCount: number, infantCount: number, onReset: () => void }) {
    const getCountText = () => {
        const guestText = guestCount > 0 ? `게스트 ${guestCount}명` : '';
        const infantText = infantCount > 0 ? `유아 ${infantCount}명` : '';

        return (guestText && infantText) ? (`${guestText}, ${infantText}`) : (guestText || infantText);
    };

    const handleResetClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // reset 뿐만 아니라 GuestSelector 까지 클릭되면 모달창이 여닫아짐.
        onReset();
    };

    const countText = getCountText();
    const totalCount = guestCount + infantCount;

    return (
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={onClick}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div>인원</div>
                {totalCount > 0 && <div style={{ color: '#848c9bff', fontSize: '0.9rem' }}>{countText}</div>}
            </div>
            {totalCount > 0 && <button onClick={handleResetClick} style={{ marginLeft: '1.5rem' }}>X</button>}
        </div>
    )
}