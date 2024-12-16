import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const WinnerModal = ({ isOpen, winnerAnnouncement, onExitClick }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={onExitClick} >
            <ModalHeader>
                Winner Announcement
            </ModalHeader>
            <ModalBody>
                {winnerAnnouncement}
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={onExitClick}>Exit</Button>
            </ModalFooter>
        </Modal>
    )
}

export default WinnerModal