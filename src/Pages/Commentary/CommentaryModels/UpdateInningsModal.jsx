import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import CardComponent from '../CardComponent';
const UpdateInningsModal = ({ isOpen, toggle, onsubmit, currentInningTeams }) => {
    const [battingTeamId, setBattingTeamId] = useState(null);
    const [error, setError] = useState("");

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} >
            <ModalHeader>
                Update Innigns
            </ModalHeader>
            <ModalBody>
                Please Select current batting team?
                <Row>
                    {currentInningTeams?.map((val, index) => (
                        <Col
                            key={index}
                            xs={6}
                            onClick={() => { setBattingTeamId(val.teamId); setError("");  }}
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
                {error && (
                    <div style={{ color: "red", marginTop: "1px", fontWeight: 200 }}>
                        {error}
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button"
                    // disabled={!battingTeamId} 
                    onClick={() => {
                        if (!battingTeamId) {
                            setError("Please select batting team.");
                            return;
                        }
                        setError("");
                        onsubmit(battingTeamId);
                }}>Submit</Button>
                <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
            </ModalFooter>
        </Modal >
    )
}

export default UpdateInningsModal