import React, { useEffect, useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap';
import { BALL_WIDE, EXTRAS, NO_BALL, WICKET } from '../CommentartConst';
import "../CommentaryCss.css"

const ExtrasModal = ({ toggle, isOpen, extraType, updateExtras }) => {
    const defaultValue = (extraType === BALL_WIDE || extraType === NO_BALL) ? 0 : 1
    const [run, setRun] = useState(defaultValue)
    const [isBoundary, setIsBoundary] = useState(undefined)
    const handleSubmit = (type) => {
        const objToSend = { run: +run, type, isBoundary: ((+run === 4) || (+run === 6)) ? isBoundary : false }
        updateExtras(objToSend)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) toggle();
        else if (e.key === 'Enter') handleSubmit(EXTRAS)
    };
    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [run])
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const inputElement = document.getElementById('runs');
                if (inputElement) inputElement.focus();
            }, 150);
        }
    }, [isOpen]);
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader className='normal-header'>
                Select&nbsp;
                <b>{extraType}</b> Extra Run
            </ModalHeader>
            <ModalBody>
                <Table responsive>
                    <Row>
                        {<Col xs={12} md={6} lg={6} >
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
                            <Col xs={12} md={6} lg={6}>
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
            <ModalFooter className='d-block' >
                <Button color="danger" className="decision-Button text-left" onClick={() => handleSubmit(WICKET)}>Wicket</Button>
                <Button color="light" className="decision-Button text-right" onClick={() => toggle()}>Close</Button>
                <Button color="success" className="decision-Button text-right" onClick={() => handleSubmit(EXTRAS)}>Update</Button>
            </ModalFooter>
        </Modal >
    )
}

export default ExtrasModal