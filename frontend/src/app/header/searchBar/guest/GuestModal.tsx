import { useEffect, useRef } from 'react';
import GuestCategory from './GuestCategory';
import { GUEST_TYPES } from './guest-constants';

const categoryStyle = {
    padding: '1.5rem 0',
    borderBottom: '5px solid #e5e7eb'
};

const lastCategoryStyle = {
    ...categoryStyle,
    borderBottom: 'none'
};

export default function GuestModal({ isOpen, onClose, counts, onIncrement, onDecrement, minCount, maxCount }: { 
    isOpen: boolean, 
    onClose: () => void, 
    counts: { adult: number, child: number, infant: number },
    onIncrement: (category: keyof typeof counts) => void,
    onDecrement: (category: keyof typeof counts) => void,
    minCount: number,
    maxCount: number
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    
    useEffect(() => {
        if(!isOpen) return;

        const dialog = dialogRef.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, [isOpen]);

    const handleBackgroundClick = () => onClose();

    return (
        <dialog ref={dialogRef} onClick={handleBackgroundClick} style={{padding:0, borderRadius: '5rem' }}>
            <section onClick={e => e.stopPropagation()} style={{padding:'4rem 5rem', width: '400px'}}>
                <div style={categoryStyle}>
                    <GuestCategory 
                        title="성인" 
                        subTitle="만 13세 이상"
                        count={counts.adult}
                        onIncrement={() => onIncrement(GUEST_TYPES.ADULT)}
                        onDecrement={() => onDecrement(GUEST_TYPES.ADULT)}
                        minCount={minCount}
                        maxCount={maxCount}
                    />
                </div>
                <div style={categoryStyle}>
                    <GuestCategory 
                        title="어린이" 
                        subTitle="만 2세 ~ 12세"
                        count={counts.child}
                        onIncrement={() => onIncrement(GUEST_TYPES.CHILD)}
                        onDecrement={() => onDecrement(GUEST_TYPES.CHILD)}
                        minCount={minCount}
                        maxCount={maxCount}
                    />
                </div>
                <div style={lastCategoryStyle}>
                    <GuestCategory 
                        title="유아" 
                        subTitle="만 2세 미만"
                        count={counts.infant}
                        onIncrement={() => onIncrement(GUEST_TYPES.INFANT)}
                        onDecrement={() => onDecrement(GUEST_TYPES.INFANT)}
                        minCount={minCount}
                        maxCount={maxCount}
                    />
                </div>
            </section>
        </dialog>
    );
}
