import React, { useEffect } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const ChangeInningsModal = ({ isOpen, toggle, onYesClick, onNoClick }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) onNoClick();
        else if (e.key === 'Enter') onYesClick()
    };
    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [])
    return (
        <Modal backdrop="static" className="commentary-modal red-warning-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader>
                Change Innings
            </ModalHeader>
            <ModalBody>
                Do you want to end the current innings?
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right " onClick={onNoClick}>No</Button>
                <Button color="light" className="decision-Button text-right" onClick={() => toggle()}>Close</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ChangeInningsModal