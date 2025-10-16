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
            <div className="flex items-center p-2 border rounded-lg shadow-sm">
                <div className="p-2 font-semibold">체크인</div>
                <div className="p-2 font-semibold">체크아웃</div>
                <div className="p-2 text-gray-400">요금</div>
                <GuestSelector onClick={()=>{setShowModal(true)}}/>
                <div className="p-2 bg-blue-500 text-white rounded-md ml-2">검색</div>
            </div>
            <GuestModal isOpen={showModal} onClose={handleClose}></GuestModal>
        </>
    )
}