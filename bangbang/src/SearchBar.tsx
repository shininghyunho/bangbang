import { useState } from "react";
import GuestModal from "./GuestModal";
import GuestSelector from "./GuestSelector";

const borderColor = '#e5e7eb';

const searchBarStyle = {
    display: 'flex',
    alignItems: 'center',
    border: `5px solid ${borderColor}`,
    borderRadius: '3rem',
};

const childStyle = {
    padding: '1rem 2rem',
};

const childWithBorderStyle = {
    ...childStyle,
    borderLeft: `5px solid ${borderColor}`,
};

export default function SearchBar() {
    const [showModal,setShowModal] = useState(false);

    function handleClose() {
        setShowModal(false);
    }

    return(
        <>
            <div style={searchBarStyle}>
                <div style={childStyle}>체크인</div>
                <div style={childWithBorderStyle}>체크아웃</div>
                <div style={childWithBorderStyle}>요금</div>
                <div style={childWithBorderStyle}>
                    <GuestSelector onClick={() => { setShowModal(true) }} />
                </div>
                <div style={childWithBorderStyle}>검색</div>
            </div>
            <GuestModal isOpen={showModal} onClose={handleClose}></GuestModal>
        </>
    )
}