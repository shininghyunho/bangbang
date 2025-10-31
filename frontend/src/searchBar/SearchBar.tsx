import { useState } from "react";
import GuestInput from "./guest/GuestInput";
import PriceInput from "./price/PriceInput";
import DateInput from "./date/DateInput";
import { fetchSearch } from "./SearchController";
import { useSearch } from "./SearchContext";

const childStyle = {
    padding: '0.5rem 1rem',
};

const childWithBorderStyle = {
    ...childStyle,
    borderLeft: '3px solid #838a97ff',
};

export default function SearchBar() {
    // 체크인 체크아웃 날짜, 최소 최대 금액, 성인 어린이 유아 수
    const [dateGroup, setDateGroup] = useState({ fromDate:'2025-01-01', toDate:'2025-01-02' });
    const [priceGroup, setPriceGroup] = useState({ minPrice: 70000, maxPrice: 120000 });
    const [guestGroup, setGuestGroup] = useState({ adult:1, child:1, infant:1 });

    const { setSearchResults, setIsLoading } = useSearch();

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const data = await fetchSearch(dateGroup, priceGroup, guestGroup);
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div style={{ display: 'flex', alignItems: 'center', padding:'0.5rem 1.5rem', border: '3px solid #838a97ff', borderRadius: '5rem' }}>
            <div style={childStyle}>
                <DateInput
                    displayName="체크인"
                    dateGroup={dateGroup}
                    setDateGroup={setDateGroup}
                    dateName="fromDate"
                />
            </div>
            <div style={childWithBorderStyle}>
                <DateInput
                    displayName="체크아웃"
                    dateGroup={dateGroup}
                    setDateGroup={setDateGroup}
                    dateName="toDate"
                />
            </div>
            <div style={childWithBorderStyle}>
                <PriceInput priceGroup={priceGroup} setPriceGroup={setPriceGroup} />
            </div>
            <div style={childWithBorderStyle}>
                <GuestInput guestGroup={guestGroup} setGuestGroup={setGuestGroup} />
            </div>
            <div onClick={handleSearch} style={{...childWithBorderStyle, cursor: 'pointer', fontWeight: 'bold' }}>
                검색
            </div>
        </div>
    )
}