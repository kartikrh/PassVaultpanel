import React from 'react'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const ChangeOverModal = ({ isOpen, toggle, onYesClick, onNoClick }) => {
    return (
        <Modal style={{ marginTop: "80px", maxHeight: "90vh" }} zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Do You want to change the current over?
            </ModalHeader>
            <ModalBody>
                <Button color="success" className="decision-Button" onClick={onYesClick}>Yes</Button>
                <Button color="danger" className="decision-Button text-right " onClick={onNoClick}>No</Button>
            </ModalBody>
        </Modal>
    )
}

export default ChangeOverModal