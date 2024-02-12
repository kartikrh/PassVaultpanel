import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap';
import { EXTRAS, WICKET } from '../CommentartConst';

const ExtrasModal = ({ toggle, isOpen, extraType, updateExtras }) => {
    const [run, setRun] = useState(0)
    const handleSubmit = (type) => {
        const objToSend = { run, type }
        updateExtras(objToSend)
    }
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}>
                Select Extra Runs
            </ModalHeader>
            <ModalBody>
                <Table responsive>
                    Ball Type:&nbsp;{extraType}
                    <Row>
                        {<Col xs={6} md={6} lg={4} >
                            Runs
                            <input
                                className="form-control"
                                type="number"
                                value={run}
                                id={"runs"}
                                onChange={(e) => setRun(e.target.value)}
                                min={0}
                                max={99}
                                step={1}
                            />
                        </Col>}
                    </Row>
                </Table>
            </ModalBody>
            <ModalFooter>
                <Button color="danger" className="decision-Button text-left" onClick={() => handleSubmit(WICKET)}>Wicket</Button>
                <Button color="success" className="decision-Button text-right" onClick={() => handleSubmit(EXTRAS)}>Update</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ExtrasModal