import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap';
import { EXTRAS, WICKET } from '../CommentartConst';
import "../CommentaryCss.css"
const ExtrasModal = ({ toggle, isOpen, extraType, updateExtras }) => {
    const [run, setRun] = useState(0)
    const [isBoundary, setIsBoundary] = useState(undefined)
    const handleSubmit = (type) => {
        const objToSend = { run, type, isBoundary: ((+run === 4) || (+run === 6)) ? isBoundary : false }
        updateExtras(objToSend)
    }
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader className='normal-header' toggle={toggle}>
                Select&nbsp;
                <b>{extraType}</b> Extra Run
            </ModalHeader>
            <ModalBody>
                <Table responsive>
                    {/* Ball Type:&nbsp;{extraType} */}
                    <Row>
                        {<Col xs={6} md={6} lg={6} >
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
                        </Col >}
                        {((+run === 4) || (+run === 6)) &&
                            <Col xs={6} md={6} lg={6} >
                                Is Boundary
                                <div className="switch-padding form-switch form-switch-lg ">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="customSwitchsizelg"
                                        // defaultChecked
                                        checked={isBoundary}
                                        onChange={(e) => {
                                            setIsBoundary(!isBoundary)
                                        }}
                                        value={isBoundary}
                                    />
                                </div>
                            </Col>}
                    </Row>
                </Table>
            </ModalBody>
            <ModalFooter>
                <Button color="danger" className="decision-Button text-left" onClick={() => handleSubmit(WICKET)}>Wicket</Button>
                <Button color="success" className="decision-Button text-right" onClick={() => handleSubmit(EXTRAS)}>Update</Button>
            </ModalFooter>
        </Modal >
    )
}

export default ExtrasModal