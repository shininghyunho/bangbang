import { useState } from "react";
import GuestInput from "./guest/GuestInput";
import PriceInput from "./price/PriceInput";
import DateInput from "./date/DateInput";

const childStyle = {
    padding: '0.5rem 1rem',
};

const childWithBorderStyle = {
    ...childStyle,
    borderLeft: '3px solid #838a97ff',
};

export default function SearchBar() {
    // too many states...
    const [dateGroup, setDateGroup] = useState({ fromDate:'', toDate:'' });

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
                <PriceInput/>
            </div>
            <div style={childWithBorderStyle}>
                <GuestInput />
            </div>
            <div style={childWithBorderStyle}>검색</div>
        </div>
    )
}