import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
export const UndoErrorModal = ({ toggle, undoError }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Undo Error
            </ModalHeader>
            <ModalBody>
                {undoError}
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={toggle}>Exit</Button>
            </ModalFooter>
        </Modal>
    )
}