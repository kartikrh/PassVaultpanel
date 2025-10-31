import React, { useEffect, useState } from 'react'
import { Button, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import "../CommentaryCss.css"
import CardComponent from '../CardComponent';
const SuperOverModal = ({ toggle, onSuperOverClick, onResultClick, currentInningTeams }) => {
    const [isSuperOver, setIsSuperOver] = useState(false)
    const [battingTeamId, setBattingTeamId] = useState(null);
    const [error, setError] = useState("");
    const [overs, setOvers] = useState(false)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) onResultClick();
        else if (e.key === 'Enter') setIsSuperOver(true)
    };
    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [])
    return (
        <Modal backdrop="static" className="commentary-modal " zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader>
                Super Over
            </ModalHeader>
            <ModalBody>
                {isSuperOver ?
                    <>
                        <Row>
                            <Col xs={6} md={4} lg={3} className={`d-flex p-0`}>
                                <div className="lablediv small-label-div ">
                                    <label
                                        htmlFor={"overs"}
                                        className="dynamic-label-right form-label-class small-labels">
                                        Overs: </label>
                                </div>
                            </Col>
                            <Col className={`mb-4`} xs={6} md={8} lg={9}>
                                <Input
                                    className="form-control small-text-fields"
                                    type="number"
                                    step={1}
                                    id={"overs"}
                                    placeholder={"Overs"}
                                    name={"oves"}
                                    value={overs || ""}
                                    onChange={(e) => setOvers(+e.target.value)}
                                />
                            </Col>
                        </Row>
                        <span>Please select next Batting team: </span>
                        <Row>
                            {currentInningTeams?.map((val, index) => (
                                <Col
                                    key={index}
                                    xs={6}
                                    onClick={() => { setBattingTeamId(val.teamId); setError(""); }}
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
                    </>
                    : "The match is tied, please select an action to perform?"}
                {error && (
                    <div style={{ color: "red", marginTop: "1px", fontWeight: 200 }}>
                        {error}
                    </div>
                )}
            </ModalBody>
            <ModalFooter className='d-block'>
                {isSuperOver ?
                    <Button color="success" className="decision-Button" onClick={() => {
                        if (!battingTeamId) {
                            setError("Please select batting team.");
                            return;
                        }
                        setError("");
                        onSuperOverClick({ overs, battingTeamId })}}>Submit</Button>
                    : <>
                        <Button color="success" className="decision-Button" onClick={() => { setIsSuperOver(true) }}>Super Over</Button>
                        <Button color="light" className="decision-Button text-right mx-2" onClick={() => toggle()}>Close</Button>
                        <Button color="danger" className="decision-Button text-right " onClick={onResultClick}>Declare Result</Button>
                    </>}

            </ModalFooter>
        </Modal >
    )
}

export default SuperOverModal