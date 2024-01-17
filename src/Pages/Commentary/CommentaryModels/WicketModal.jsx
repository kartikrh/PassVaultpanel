import React, { useEffect, useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';

const SelectPlayerModal = ({ toggle, isOpen, onSubmit }) => {

    return (
        <Modal style={{ marginTop: "80px", maxHeight: "90vh" }} zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Wicket
            </ModalHeader>
            <ModalBody>

            </ModalBody>
        </Modal>
    )
}

export default SelectPlayerModal