import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const UndoInnnigsModal = ({ isOpen, toggle, onPlayerSelectionClick, onLastInnigsClick }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Change Innings
            </ModalHeader>
            <ModalBody>
                What do you want to perform?
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={onPlayerSelectionClick}>Player Selection</Button>
            </ModalFooter>
        </Modal>
    )
}

export default UndoInnnigsModal