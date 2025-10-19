import GuestInput from "./GuestInput";

const childStyle = {
    padding: '0.5rem 1rem',
};

const childWithBorderStyle = {
    ...childStyle,
    borderLeft: '3px solid #838a97ff',
};

export default function SearchBar() {
    return(
        <div style={{ display: 'flex', alignItems: 'center', padding:'0.5rem 1.5rem', border: '3px solid #838a97ff', borderRadius: '5rem' }}>
            <div style={childStyle}>체크인</div>
            <div style={childWithBorderStyle}>체크아웃</div>
            <div style={childWithBorderStyle}>요금</div>
            <div style={childWithBorderStyle}>
                <GuestInput />
            </div>
            <div style={childWithBorderStyle}>검색</div>
        </div>
    )
}