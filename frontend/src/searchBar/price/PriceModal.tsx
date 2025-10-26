import { useEffect, useRef } from 'react';

export default function PriceModal({
    minPrice,
    maxPrice,
    onChange,
    onClose,
    isOpen,
}: {
    minPrice: number;
    maxPrice: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    isOpen: boolean;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const dialog = dialogRef.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, [isOpen]);

    const handleBackgroundClick = () => onClose();

    const inputStyle: React.CSSProperties = {
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '1rem',
        width: '150px',
        textAlign: 'right',
    };

    return (
    <dialog ref={dialogRef} onClick={handleBackgroundClick} onClose={onClose} style={{padding: 0,borderRadius: '2rem'}}>
      <section onClick={e => e.stopPropagation()} style={{padding:'2rem 3rem', width: '450px'}}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>최소 가격</label>
                <input
                  name="minPrice"
                  type="text"
                  value={minPrice === 0 ? '' : minPrice.toLocaleString('ko-KR')}
                  onChange={onChange}
                  placeholder="0"
                  style={inputStyle}
                />
            </div>
            <span>~</span>
            <div>
                <label style={{display: 'block', marginBottom: '0.5rem'}}>최대 가격</label>
                <input
                  name="maxPrice"
                  type="text"
                  value={maxPrice === 0 ? '' : maxPrice.toLocaleString('ko-KR')}
                  onChange={onChange}
                  placeholder="제한 없음"
                  style={inputStyle}
                />
            </div>
        </div>
      </section>
    </dialog>
    )
}
