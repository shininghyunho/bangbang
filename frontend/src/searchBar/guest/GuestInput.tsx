import { useState } from 'react';
import GuestSelector from './GuestSelector';
import GuestModal from './GuestModal';

import { GUEST_TYPES } from './guest-constants';

const MIN_COUNT = 0;
const MAX_COUNT = 8;

type GuestType = { adult: number; child: number; infant: number };

export default function GuestInput({ guestGroup, setGuestGroup }: {
    guestGroup: GuestType;
    setGuestGroup: (newGuest: GuestType) => void;
}) {
    const [showModal, setShowModal] = useState(false);

    const handleIncrement = (category: keyof GuestType) => {
        const newCounts = { ...guestGroup };
        newCounts[category] = Math.min(MAX_COUNT, guestGroup[category] + 1);

        // 유아는 성인이 필수
        if (category === GUEST_TYPES.INFANT && newCounts.infant > 0 && newCounts.adult === 0) {
            newCounts.adult = 1;
        }
        setGuestGroup(newCounts);
    };

    const handleDecrement = (category: keyof GuestType) => {
        const newCounts = { ...guestGroup };
        newCounts[category] = Math.max(MIN_COUNT, guestGroup[category] - 1);

        // 성인이 0이 되면 유아도 0
        if (category === GUEST_TYPES.ADULT && newCounts.adult === 0) {
            newCounts.infant = 0;
        }
        setGuestGroup(newCounts);
    };

    const handleResetCounts = () => {
        setGuestGroup({
            adult: 0,
            child: 0,
            infant: 0,
        });
    };

    const totalGuests = guestGroup.adult + guestGroup.child;

    return (
        <>
            <GuestSelector
                onClick={() => setShowModal(true)}
                guestCount={totalGuests}
                infantCount={guestGroup.infant}
                onReset={handleResetCounts}
            />
            <GuestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                counts={guestGroup}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                minCount={MIN_COUNT}
                maxCount={MAX_COUNT}
            />
        </>
    );
}