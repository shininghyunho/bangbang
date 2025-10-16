import { useState } from 'react';
import GuestSelector from './GuestSelector';
import GuestModal from './GuestModal';

const MIN_COUNT = 0;
const MAX_COUNT = 8;

export const GUEST_TYPES = {
    ADULT: 'adult',
    CHILD: 'child',
    INFANT: 'infant',
} as const;

export default function GuestInput() {
    const [showModal, setShowModal] = useState(false);
    const [counts, setCounts] = useState({
        adult: 0,
        child: 0,
        infant: 0,
    });

    const handleIncrement = (category: keyof typeof counts) => {
        setCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            newCounts[category] = Math.min(MAX_COUNT, prevCounts[category] + 1);

            // 유아는 성인이 필수
            if (category === GUEST_TYPES.INFANT && newCounts.infant > 0 && newCounts.adult === 0) {
                newCounts.adult = 1;
            }
            return newCounts;
        });
    };

    const handleDecrement = (category: keyof typeof counts) => {
        setCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            newCounts[category] = Math.max(MIN_COUNT, prevCounts[category] - 1);

            // 성인이 0이 되면 유아도 0
            if (category === GUEST_TYPES.ADULT && newCounts.adult === 0) {
                newCounts.infant = 0;
            }
            return newCounts;
        });
    };

    const handleResetCounts = () => {
        setCounts({
            adult: 0,
            child: 0,
            infant: 0,
        });
    };

    const totalGuests = counts.adult + counts.child;

    return (
        <>
            <GuestSelector
                onClick={() => setShowModal(true)}
                guestCount={totalGuests}
                infantCount={counts.infant}
                onReset={handleResetCounts}
            />
            <GuestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                counts={counts}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                minCount={MIN_COUNT}
                maxCount={MAX_COUNT}
            />
        </>
    );
}