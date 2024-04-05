import React from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import { NO_BALL_BYE, NO_BALL_LEG_BYE } from '../CommentartConst';
const CommentaryAction = ({ toggle, updateExtras, changeOver, endInnings }) => {
    return (
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
                        onClick={changeOver}>
                        <img className="button-icon" src="icons/end-over.png" alt="Icon" />
                    </Col>
                    <Col role="button" className=" score-button" xs={3} md={3} lg={3}
                        onClick={endInnings}>
                        <img className="button-icon" src="icons/end-innings.png" alt="Icon" />
                    </Col>
                </Row>
            </ModalBody>
        </Modal >
    )
}

export default CommentaryAction