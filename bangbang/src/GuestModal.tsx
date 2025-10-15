import { useEffect, useRef } from 'react';

function GuestCategory({ title, subTitle }: { title: string; subTitle: string }) {
    return (
    <>
        <p>{title}</p>
        <p>{subTitle}</p>
    </>)
}

export default function GuestModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    
    useEffect(() => {
        if(!isOpen) return;

        const dialog = ref.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, [isOpen]);

    function handleBackgroundClick(e: React.MouseEvent<HTMLDialogElement>) {
        if(e.target === ref.current) onClose();
    }

    return (
        <dialog ref={ref} onClick={handleBackgroundClick} onClose={onClose}>
            <GuestCategory title="성인" subTitle="만 13세 이상"/>
            <GuestCategory title="어린이" subTitle="만 2세 ~ 12세"/>
            <GuestCategory title="유아" subTitle="만 2세 미만"/>
        </dialog>
    );
}
