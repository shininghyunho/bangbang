import { useState } from "react";
import GuestModal from "./GuestModal";
import GuestSelector from "./GuestSelector";

export default function SearchBar() {
    const [showModal,setShowModal] = useState(false);

    function handleClose() {
        setShowModal(false);
    }

    return(
        <>
            <div>
                <div className="search-field">체크인</div>
                <div className="search-field">체크아웃</div>
                <div className="search-field">요금</div>
                <GuestSelector onClick={()=>{setShowModal(true)}}/>
                <div className="search-field">검색</div>
            </div>
            <GuestModal isOpen={showModal} onClose={handleClose}></GuestModal>
        </>
    )
}