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
            <div className="flex items-center border rounded divide-x">
                <div>체크인</div>
                <div>체크아웃</div>
                <div>요금</div>
                <div>
                    <GuestSelector onClick={() => { setShowModal(true) }} />
                </div>
                <div>검색</div>
            </div>
            <GuestModal isOpen={showModal} onClose={handleClose}></GuestModal>
        </>
    )
}