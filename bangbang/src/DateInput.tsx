import { useState } from 'react';
import DateModal from './DateModal';

export default function DateInput({name}:{name:string}) {
    const [date, setDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };
    
    const handleResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDate('');
    }

    return (
        <>
            <div onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>{name}</div>
                    {date && <div style={{ color: '#848c9bff', fontSize: '0.9rem' }}>{date}</div>}
                </div>
            {date && <button onClick={handleResetClick} style={{ marginLeft: '1.5rem' }}>X</button>}
            </div>
            <DateModal 
                date={date}
                onChange={handleDateChange}
                onClose={() => setShowModal(false)}
                isOpen={showModal}
            />
        </>
    );
}