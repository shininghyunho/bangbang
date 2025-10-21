import { useState } from 'react';
import DateModal from './DateModal';

export default function FromDateInput() {
    const [fromDate, setFromDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFromDate(e.target.value);
    };

    return (
        <>
            <div onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>체크인</div>
                    {fromDate && <div style={{ color: '#848c9bff', fontSize: '0.9rem' }}>{fromDate}</div>}
                </div>
            </div>
            <DateModal 
                date={fromDate}
                onChange={handleDateChange}
                onClose={() => setShowModal(false)}
                isOpen={showModal}
            />
        </>
    );
}