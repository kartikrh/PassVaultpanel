import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../CommentaryCss.css"
import { CHANGE_BOWLER, SWITCH_BOWLER } from '../CommentartConst';
const ChangeBowlerModal = ({ isOpen, toggle, onBowlerChange }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Change Bowler
            </ModalHeader>
            <ModalBody>
                Do you want to :
            </ModalBody>
            <ModalFooter className='d-block'>
                <Button color="success" className="decision-Button"
                    onClick={() => { onBowlerChange(SWITCH_BOWLER) }}>Change bowler for current over</Button>
                <Button color="danger" className="decision-Button text-right"
                    onClick={() => { onBowlerChange(CHANGE_BOWLER) }}>Continue over with differnt bowler</Button>
            </ModalFooter>
        </Modal >
    )
}

export default ChangeBowlerModal