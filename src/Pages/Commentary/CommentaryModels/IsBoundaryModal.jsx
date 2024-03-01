import React, { useEffect } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const IsBoundaryModal = ({ isOpen, toggle, onYesClick, onNoClick }) => {
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
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Is Boundary
            </ModalHeader>
            <ModalBody>
                Is this a Boundary?
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right " onClick={onNoClick}>No</Button>
            </ModalFooter>
        </Modal>
    )
}

export default IsBoundaryModal