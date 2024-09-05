import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
export const UndoErrorModal = ({ toggle, undoError }) => {
    const handleRefresh = () => {
        window.location.reload();
    };
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Warning
            </ModalHeader>
            <ModalBody>
                {undoError}
            </ModalBody>
            <ModalFooter>
                <Button color="danger" className="decision-Button float-left" onClick={toggle}>Exit</Button>
                <Button color="success" className="decision-Button" onClick={() => handleRefresh()}>Retry</Button>
            </ModalFooter>
        </Modal>
    )
}