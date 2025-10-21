import { useEffect, useRef } from 'react';

export default function DateModal({
  date,
  onChange,
  onClose,
  isOpen,
}: {
  date: string;
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

  return (
    <dialog ref={dialogRef} onClick={handleBackgroundClick} onClose={onClose} style={{padding: 0,borderRadius: '2rem'}}>
      <section onClick={e => e.stopPropagation()} style={{padding:'4rem 5rem', width: '100px'}}>
        <div onClick={e => e.stopPropagation()}>
          <input type="date" value={date} onChange={onChange} />
        </div>
      </section>
    </dialog>
  );
}