import { useState } from 'react';
import PriceModal from './PriceModal';

type PriceType = { minPrice: number; maxPrice: number };

export default function PriceInput({ priceGroup, setPriceGroup }: {
    priceGroup: PriceType;
    setPriceGroup: (newPrice: PriceType) => void;
}) {
    const [showModal, setShowModal] = useState(false);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // 숫자 이쁘게 변환
        const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
        setPriceGroup({
            ...priceGroup,
            [name]: numericValue,
        });
    }

    const handleResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPriceGroup({ minPrice: 0, maxPrice: 0 });
    }

    const getDisplayText = () => {
        const { minPrice, maxPrice } = priceGroup;
        const KOKR='ko-KR';
        const min = minPrice.toLocaleString(KOKR);
        const max = maxPrice.toLocaleString(KOKR);

        // set price
        const style = { color: '#848c9bff', fontSize: '0.9rem' };
        if (minPrice !== 0 && maxPrice !== 0) return <div style={style}>{`₩${min} ~ ₩${max}`}</div>;
        if (minPrice !== 0) return <div style={style}>{`₩${min} ~`}</div>;
        if (maxPrice !== 0) return <div style={style}>{`~ ₩${max}`}</div>;
    }

    return (
        <>
            <div onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>요금</div>
                    {getDisplayText()}
                </div>
                {(priceGroup.minPrice !== 0 || priceGroup.maxPrice !== 0) && <button onClick={handleResetClick} style={{ marginLeft: '1.5rem' }}>X</button>}
            </div>
            <PriceModal
                minPrice={priceGroup.minPrice}
                maxPrice={priceGroup.maxPrice}
                onChange={handlePriceChange}
                onClose={() => setShowModal(false)}
                isOpen={showModal}
            />
        </>
    );
}
