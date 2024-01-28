import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import CardComponent from '../CardComponent';
const UpdateInningsModal = ({ isOpen, toggle, onsubmit, currentInningTeams }) => {
    const [battingTeamId, setBattingTeamId] = useState({});
    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                Update Innigns
            </ModalHeader>
            <ModalBody>
                Please Select current batting team?
                <Row>
                    {currentInningTeams?.map((val, index) => (
                        <Col
                            key={index}
                            xs={6}
                            onClick={() => { setBattingTeamId(val.teamId) }}
                        >
                            <CardComponent
                                title={val.teamName}
                                selectIcon={"bx bxs-check-circle"}
                                onClickColor={"#099680"}
                                bgColor={"#55c6b4"}
                                check={val.teamId === battingTeamId}
                            />
                        </Col>
                    ))}
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={() => onsubmit(battingTeamId)}>Submit</Button>
            </ModalFooter>
        </Modal >
    )
}

export default UpdateInningsModal