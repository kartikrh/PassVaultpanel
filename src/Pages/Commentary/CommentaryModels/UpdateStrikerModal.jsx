import React from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import CardComponent from '../CardComponent';
import { NON_STRIKE, ON_STRIKE } from '../CommentartConst';
const UpdateStrikeModal = ({ isOpen, toggle, onsubmit, players }) => {
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Update On Strike Player
            </ModalHeader>
            <ModalBody>
                Please Select current batter :
                <Row>
                    <Col xs={6} md={6} lg={6} onClick={() => onsubmit(players?.[ON_STRIKE]?.commentaryPlayerId)}>
                        <CardComponent
                            title={players?.[ON_STRIKE]?.playerName}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                        />
                    </Col>
                    <Col xs={6} md={6} lg={6} onClick={() => onsubmit(players?.[NON_STRIKE]?.commentaryPlayerId)}>
                        <CardComponent
                            title={players?.[NON_STRIKE]?.playerName}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                        />
                    </Col>
                </Row>
            </ModalBody>
        </Modal >
    )
}

export default UpdateStrikeModal