import { useEffect, useRef } from 'react';
import GuestCategory from './GuestCategory';

const categoryStyle = {
    padding: '1.5rem 0',
    borderBottom: '5px solid #e5e7eb'
};

const lastCategoryStyle = {
    ...categoryStyle,
    borderBottom: 'none'
};

export default function GuestModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    
    useEffect(() => {
        if(!isOpen) return;

        const dialog = ref.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, [isOpen]);

    const handleBackgroundClick = () => onClose();


    return (
        <dialog ref={ref} onClick={handleBackgroundClick} style={{padding:0, borderRadius: '5rem' }}>
            <section onClick={e => e.stopPropagation()} style={{padding:'4rem 5rem', width: '400px'}}>
                <div style={categoryStyle}>
                    <GuestCategory title="성인" subTitle="만 13세 이상"/>
                </div>
                <div style={categoryStyle}>
                    <GuestCategory title="어린이" subTitle="만 2세 ~ 12세"/>
                </div>
                <div style={lastCategoryStyle}>
                    <GuestCategory title="유아" subTitle="만 2세 미만"/>
                </div>
            </section>
        </dialog>
    );
}
