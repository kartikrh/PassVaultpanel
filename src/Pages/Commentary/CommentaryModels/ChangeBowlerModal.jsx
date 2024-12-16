import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
import { CHANGE_BOWLER, SWITCH_BOWLER } from '../CommentartConst';
const ChangeBowlerModal = ({ toggle, onBowlerChange }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader>
                Change Bowler
            </ModalHeader>
            <ModalBody>
                Do you want to :
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button"
                    onClick={() => { onBowlerChange(SWITCH_BOWLER) }}>Change Bowler</Button>
                <Button color="light" className="decision-Button text-right" onClick={() => toggle()}>Close</Button>
                <Button color="danger" className="decision-Button text-right"
                    onClick={() => { onBowlerChange(CHANGE_BOWLER) }}>Continue with new Bowler</Button>
            </ModalFooter>
        </Modal >
    )
}

export default ChangeBowlerModal