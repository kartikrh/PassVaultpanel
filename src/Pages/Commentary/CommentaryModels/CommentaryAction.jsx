import React, { useState } from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import { NO_BALL_BYE, NO_BALL_LEG_BYE } from '../CommentartConst';
import RunsModal from './RunsModal';
const CommentaryAction = ({ toggle, updateExtras, handleRuns, changeOver, endInnings, paneltyRuns, retiredHurt, updateRemark }) => {
    const [showRunsPopup, setShowRunsPopup] = useState(false)
    return (
        <>
            <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    Actions
                </ModalHeader>
                <ModalBody>
                    <div className='m-3'> Please Select an Action :</div>
                    <Row>
                        <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                            onClick={() => updateExtras(NO_BALL_BYE)}>
                            No Ball Bye
                        </Col>
                        <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                            onClick={() => updateExtras(NO_BALL_LEG_BYE)}>
                            No Ball Leg Bye
                        </Col>
                        <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                            onClick={() => setShowRunsPopup(true)}>
                            <img className="button-icon" src="icons/5.png" alt="Icon" />
                        </Col>
                        <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                            onClick={paneltyRuns}>
                            <img className="button-icon" src="icons/p.png" alt="Icon" />
                            enalty
                        </Col>
                        <Col role="button" className=" score-button green-success-button" xs={3} md={3} lg={3}
                            onClick={changeOver}>
                            <img className="button-icon" src="icons/end-over.png" alt="Icon" />
                            End Over
                        </Col>
                        <Col role="button" className=" score-button red-warning-button" xs={3} md={3} lg={3}
                            onClick={endInnings}>
                            <img className="button-icon" src="icons/end-innings.png" alt="Icon" />
                            End Innings
                        </Col>
                        <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                            onClick={retiredHurt}>
                            <img className="button-icon" src="icons/r.png" alt="Icon" />
                            etired Hurt
                        </Col>
                    </Row>
                </ModalBody>
            </Modal >
            {
                showRunsPopup && <RunsModal
                    toggle={() => setShowRunsPopup(false)}
                    onSubmitClick={(runs) => handleRuns(runs, 1)}
                />
            }
        </>
    )
}

export default CommentaryAction