import React, { useEffect, useState } from 'react'
import { Input, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap';
import "../CommentaryCss.css"

const ChangeStatusModal = ({ statusList, toggle, isOpen, onSubmit }) => {
    const [updatedStatusList, setUpadtedStatusList] = useState(statusList);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setSearch("");
        setUpadtedStatusList(statusList);
    }, [isOpen, statusList]);

    useEffect(() => {
        const filteredStatusList = statusList?.filter(value => value.displayStatus.toLowerCase().includes(search.toLowerCase()));
        setUpadtedStatusList(filteredStatusList)
    }, [search])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const inputElement = document.getElementById('statusInput');
                if (inputElement) inputElement.focus();
            }, 150); // Adjust timing as needed
        }
    }, [isOpen]);

    return (
        <Modal backdrop="static" size='xl' className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}> <div className='modal-header-style'>Status</div> </ModalHeader>
            <ModalBody>
                Update Commentary Display Status
                <Row>
                    <Table responsive>
                        <thead>
                            <Input
                                id="statusInput"
                                className="form-control mb-3"
                                type="text"
                                placeholder='Status'
                                value={search}
                                onChange={(e) => {
                                    console.log(e.target.value)
                                    setSearch(e.target.value)
                                }}
                            />
                        </thead>
                        <tbody>
                            {updatedStatusList?.map(value => <tr key={value.displayStatusId}>
                                <td role='button' onClick={() => onSubmit(value.displayStatus)} >{value.displayStatus}</td>
                            </tr>)}
                        </tbody>
                    </Table>
                </Row>
            </ModalBody>
        </Modal >
    )
}

export default ChangeStatusModal