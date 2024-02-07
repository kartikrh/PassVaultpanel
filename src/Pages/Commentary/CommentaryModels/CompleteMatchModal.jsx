import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const CompleteCurrentMatchModal = ({ isOpen, toggle, onYesClick, onNoClick }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Complete Match
            </ModalHeader>
            <ModalBody>
                Do You want to Complete this match?
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right " onClick={onNoClick}>No</Button>
            </ModalFooter>
        </Modal>
    )
}

export default CompleteCurrentMatchModal