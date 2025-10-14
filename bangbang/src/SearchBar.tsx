import { useState } from "react";
import GuestModal from "./GuestModal";
import GuestSelector from "./GuestSelector";

export default function SearchBar() {
    const [on,setOn] = useState(false);

    function handleOnClick() {
        setOn(prev => !prev);
    }

    return(
        <>
            <div>
                <div className="search-field">체크인</div>
                <div className="search-field">체크아웃</div>
                <div className="search-field">요금</div>
                <GuestSelector onClick={handleOnClick}/>
                <div className="search-field">검색</div>
            </div>
            {on && <GuestModal/>}
        </>
    )
}