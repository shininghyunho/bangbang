import { useState } from 'react';
import PriceModal from './PriceModal';

export default function PriceInput() {
    const [price, setPrice] = useState({ minPrice: 0, maxPrice: 0 });
    const [showModal, setShowModal] = useState(false);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // 숫자 이쁘게 변환
        const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
        setPrice(prevPrice => ({
            ...prevPrice,
            [name]: numericValue,
        }));
    }

    const handleResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPrice({ minPrice: 0, maxPrice: 0 });
    }

    const getDisplayText = () => {
        const { minPrice, maxPrice } = price;
        const min = minPrice.toLocaleString('ko-KR');
        const max = maxPrice.toLocaleString('ko-KR');

        // set price
        if (minPrice !== 0 && maxPrice !== 0) return <div style={{ color: '#848c9bff', fontSize: '0.9rem' }}>{`₩${min} ~ ₩${max}`}</div>;
        if (minPrice !== 0) return <div style={{ color: '#848c9bff', fontSize: '0.9rem' }}>{`₩${min} ~`}</div>;
        if (maxPrice !== 0) return <div style={{ color: '#848c9bff', fontSize: '0.9rem' }}>{`~ ₩${max}`}</div>;
    }

    return (
        <>
            <div onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>요금</div>
                    {getDisplayText()}
                </div>
                {(price.minPrice !== 0 || price.maxPrice !== 0) && <button onClick={handleResetClick} style={{ marginLeft: '1.5rem' }}>X</button>}
            </div>
            <PriceModal
                minPrice={price.minPrice}
                maxPrice={price.maxPrice}
                onChange={handlePriceChange}
                onClose={() => setShowModal(false)}
                isOpen={showModal}
            />
        </>
    );
}
