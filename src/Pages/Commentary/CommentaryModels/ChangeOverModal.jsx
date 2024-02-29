import React, { useEffect } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const ChangeOverModal = ({ isOpen, toggle, onYesClick, onNoClick }) => {
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') { onYesClick(); }
        };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [onYesClick]);
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Change Over
            </ModalHeader>
            <ModalBody>
                Do You want to change the current over?
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right " onClick={onNoClick}>No</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ChangeOverModal