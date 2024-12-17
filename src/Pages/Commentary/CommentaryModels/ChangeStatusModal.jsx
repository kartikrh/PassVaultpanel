import React, { useEffect, useState } from 'react'
import { Button, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap';
import "../CommentaryCss.css"

const ChangeStatusModal = ({ statusList, toggle, onSubmit }) => {
    const [updatedStatusList, setUpadtedStatusList] = useState(statusList);
    const [search, setSearch] = useState("");
    const [customStatus, setCustomStatus] = useState("");

    useEffect(() => {
        setSearch("");
        setUpadtedStatusList(statusList);
    }, [statusList]);

    useEffect(() => {
        const filteredStatusList = statusList?.filter(value => value.displayStatus.toLowerCase().includes(search.toLowerCase()));
        setUpadtedStatusList(filteredStatusList)
    }, [search])

    useEffect(() => {
        setTimeout(() => {
            const inputElement = document.getElementById('statusInput');
            if (inputElement) inputElement.focus();
        }, 150);
    }, []);

    return (
        <Modal backdrop="static" size='lg' className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} scrollable>
            <ModalHeader> <div className='modal-header-style'>Status</div> </ModalHeader>
            <ModalBody>
                Update Commentary Display Status
                <Row className="pt-2">
                    <Col xs={9} md={9} lg={10}>
                        <Input
                            id="customStatus"
                            className="form-control mb-3"
                            type="text"
                            placeholder='Custom Status'
                            value={customStatus}
                            onChange={(e) => {
                                setCustomStatus(e.target.value)
                            }}
                        />
                    </Col>
                    <Col xs={3} md={3} lg={2}>
                        <Button className=" btn btn-success w-100" onClick={() => onSubmit(customStatus)} >
                            Save
                        </Button>
                    </Col>
                </Row>
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
            <ModalFooter>
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
            </ModalFooter>
        </Modal >
    )
}

export default ChangeStatusModal