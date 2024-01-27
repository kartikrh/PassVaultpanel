import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import CardComponent from '../CardComponent';
import { NON_STRIKE, ON_STRIKE } from '../CommentartConst';
const UpdateStrikeModal = ({ isOpen, toggle, onsubmit, players }) => {
    const [batterId, setBatterId] = useState({});
    return (
        <Modal className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Update On Strike Player
            </ModalHeader>
            <ModalBody>
                Please Select current batter :
                <Row>
                    <Col xs={6} md={6} lg={6} onClick={() => { setBatterId(players?.[ON_STRIKE]?.commentaryPlayerId) }}>
                        <CardComponent
                            title={players?.[ON_STRIKE]?.playerName}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                            check={players?.[ON_STRIKE]?.commentaryPlayerId === batterId}
                        />
                    </Col>
                    <Col xs={6} md={6} lg={6} onClick={() => { setBatterId(players?.[NON_STRIKE]?.commentaryPlayerId) }}>
                        <CardComponent
                            title={players?.[NON_STRIKE]?.playerName}
                            selectIcon={"bx bxs-check-circle"}
                            onClickColor={"#099680"}
                            bgColor={"#55c6b4"}
                            check={players?.[NON_STRIKE]?.commentaryPlayerId === batterId}
                        />
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={() => onsubmit(batterId)}>Submit</Button>
            </ModalFooter>
        </Modal >
    )
}

export default UpdateStrikeModal