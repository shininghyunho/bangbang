import GuestSelector from "./GuestSelector";

export default function SearchBar() {
    return(
        <div>
            <div className="search-field">체크인</div>
            <div className="search-field">체크아웃</div>
            <div className="search-field">요금</div>
            <GuestSelector/>
            <div className="search-field">검색</div>
        </div>
    )
}