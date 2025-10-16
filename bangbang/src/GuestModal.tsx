import { useEffect, useRef } from 'react';

const categoryStyle = {
    padding: '1.5rem 0',
    borderBottom: '1px solid #e5e7eb'
};

const lastCategoryStyle = {
    ...categoryStyle,
    borderBottom: 'none'
};

function GuestCategory({ title, subTitle }: { title: string; subTitle: string }) {
    return (
        <div>
            <p style={{ fontWeight: '600' }}>{title}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{subTitle}</p>
        </div>
    );
}

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
        <dialog ref={ref} onClick={handleBackgroundClick} style={{padding:0, borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}}>
            <section onClick={e => e.stopPropagation()} style={{padding:'1rem 1.5rem', width: '384px'}}>
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
