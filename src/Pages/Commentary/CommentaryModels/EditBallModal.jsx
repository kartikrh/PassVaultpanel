import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const EditBallModal = ({ onClose, onBallUpdate }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} onClose={onClose} >
            <ModalHeader>
                Edit Ball Details
            </ModalHeader>
            <ModalBody>
                What do you want to Edit:
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button"
                    onClick={() => { console.log("Update Ball API") }}>Save</Button>
                <Button color="danger" className="decision-Button text-right" onClick={() => onClose()}>Close</Button>
            </ModalFooter>
        </Modal >
    )
}

export default EditBallModal