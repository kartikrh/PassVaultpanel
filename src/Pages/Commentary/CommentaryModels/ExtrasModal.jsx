import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap';

const ExtrasModal = ({ runList, toggle, isOpen, selectExtraRun }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
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
            <ModalFooter>
                <Button color="danger" className="decision-Button text-right " onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ExtrasModal