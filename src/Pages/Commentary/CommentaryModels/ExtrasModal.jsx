import React from 'react'
import { Modal, ModalBody, ModalHeader, Table } from 'reactstrap';

const ExtrasModal = ({ runList, toggle, isOpen, selectExtraRun }) => {
    return (
        <Modal style={{ marginTop: "80px", maxHeight: "90vh" }} zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Select Extra Runs
            </ModalHeader>
            <ModalBody>
                <Table responsive>
                    <tbody>
                        {runList?.map(item => <tr key={item.value}>
                            <td role='button' onClick={() => selectExtraRun(item.value)} >{item.label}</td>
                        </tr>)}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    )
}

export default ExtrasModal