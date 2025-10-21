import { useState } from 'react';
import DateModal from './DateModal';

type DateType = { fromDate: string; toDate: string };

export default function DateInput({
    displayName,
    dateGroup,
    setDateGroup,
    dateName,
} : {
    displayName: string;
    dateGroup: DateType;
    setDateGroup: (newDate: DateType) => void;
    dateName: 'fromDate' | 'toDate';
}) {
    const [showModal, setShowModal] = useState(false);

    const date = dateGroup[dateName];

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateGroup({ ...dateGroup, [dateName]: e.target.value });
    };
    
    const handleResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDateGroup({ ...dateGroup, [dateName]: '' });
    }

    return (
        <>
            <div onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>{displayName}</div>
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