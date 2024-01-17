import React, { useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FormBuilder from '../../../components/Common/Reusables/FormBuilder';
import { WICKET_FIELDS } from './WicketModalFieldConst';
const WicketModal = ({ toggle, isOpen, onSubmit }) => {
    const finalizeRef = useRef(null);
    const handleSubmit = () => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            onSubmit(dataToSave)
        }
    }
    return (
        <Modal style={{ marginTop: "80px", maxHeight: "90vh" }} zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Wicket
            </ModalHeader>
            <ModalBody>
                <FormBuilder
                    ref={finalizeRef}
                    fields={WICKET_FIELDS}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={handleSubmit}>Wicket</Button>
                <Button color="danger" className="decision-Button text-right " onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    )
}

export default WicketModal