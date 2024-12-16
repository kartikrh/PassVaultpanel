import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
const UndoOverModal = ({ isOpen, toggle, onChangebowlerClick, onLastOverClick }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader>
                Undo Over
            </ModalHeader>
            <ModalBody>
                Please select one
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button" onClick={onChangebowlerClick}>Change Bowler</Button>
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
                <Button color="danger" className="decision-Button text-right " onClick={onLastOverClick}>Last Over</Button>
            </ModalFooter>
        </Modal>
    )
}

export default UndoOverModal