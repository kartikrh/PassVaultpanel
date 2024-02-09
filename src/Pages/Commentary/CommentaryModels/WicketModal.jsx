import React, { useEffect, useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { BOLD, CATCH, CURRENT_BOWLER, HIT_BALL_TWICE, HIT_WICKET, LBW, NON_STRIKE, OBSTRACT_THE_FIELDING, ON_STRIKE, RETIRED_OUT, RUN_OUT, STUMP, TIMED_OUT, WICKET_TYPE_LIST } from '../CommentartConst';
import CardComponent from '../CardComponent';
import { compareNumStringValues } from '../../../components/Common/Reusables/reusableMethods';
import Select from "react-select";
import "../CommentaryCss.css"
import { useDispatch } from 'react-redux';
import { updateToastData } from '../../../Features/toasterSlice';
import { ERROR } from '../../../components/Common/Const';

const WicketModal = ({ onPitchPlayers, bowlingTeam, bowlingTeamDetails, toggle, isOpen, onSubmit }) => {
    const [wicketData, setWicketData] = useState({ runs: 0 });
    const [showFields, setShowFields] = useState({});
    const [bowlingPlayerList, setBowlingPlayerList] = useState([]);
    const dispatch = useDispatch()
    useEffect(() => {
        const formattedBowlerData = []
        bowlingTeam?.forEach(element => {
            formattedBowlerData.push({ label: element.playerName, value: element.commentaryPlayerId })
        })
        console.log(formattedBowlerData)
        setBowlingPlayerList(formattedBowlerData)
    }, [])

    const handleChange = (field, value) => {
        let updateDependFields = {}
        if (field === "wicketType") {
            let updateShowFields = {}
            if (value === BOLD || value === LBW || value === HIT_WICKET || value === HIT_BALL_TWICE) updateShowFields = { "batterId": false, "runs": false, "fielder1": false, "fielder2": false, }
            else if (value === RETIRED_OUT || value === OBSTRACT_THE_FIELDING || value === TIMED_OUT) updateShowFields = { "batterId": true, "runs": true, "fielder1": false, "fielder2": false, }
            else if (value === RUN_OUT) updateShowFields = { "batterId": true, "runs": true, "fielder1": true, "fielder2": true, }
            else if (value === CATCH || value === STUMP) {
                if (value === STUMP) updateDependFields["fielder1"] = bowlingTeamDetails?.commentaryPlayerTeamKipper
                updateShowFields = { "batterId": false, "runs": false, "fielder1": true, "fielder2": false, }
            }
            setShowFields(updateShowFields)
        }
        setWicketData((prevValue) => {
            return { ...prevValue, ...updateDependFields, [field]: value }
        })
    }

    const handleSubmit = () => {
        if (checkIfRequiredError()) {
            dispatch(updateToastData({
                data: "Please Fill all required fields", title: "Required Error", type: ERROR
            }));
        }
        else {
            const dataToSend = {
                wicketType: wicketData.wicketType,
                batterId: showFields["batterId"] ? wicketData.batterId : onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId,
                runs: showFields["runs"] ? wicketData.runs : 0,
                fielder1: showFields["fielder1"] ? wicketData.fielder1 : onPitchPlayers?.[CURRENT_BOWLER]?.commentaryPlayerId,
                fielder2: showFields["fielder2"] ? wicketData.fielder2 : onPitchPlayers?.[CURRENT_BOWLER]?.commentaryPlayerId,
            }
            onSubmit(dataToSend)
        }
    }

    const checkIfRequiredError = () => {
        let isRequiredError = false
        if (!wicketData.wicketType) isRequiredError = true
        Object.keys(showFields).forEach(field => {
            if (showFields[field] && !wicketData[field]) isRequiredError = true
        })
        return isRequiredError
    }

    return (
        <Modal backdrop="static" size='xl' className="commentary-modal" zIndex={1000} isOpen={isOpen} toggle={toggle} scrollable>
            <ModalHeader toggle={toggle}> <div className='modal-header-style'>Wicket</div> </ModalHeader>
            <ModalBody>
                <Row>
                    {WICKET_TYPE_LIST.map((wicketType, index) => (
                        <Col
                            key={index}
                            xs={6} md={4} lg={3}
                            onClick={() => { handleChange("wicketType", wicketType.value) }}
                        >
                            <CardComponent
                                title={wicketType.label}
                                selectIcon={"bx bxs-check-circle"}
                                onClickColor={"#099680"}
                                bgColor={"#55c6b4"}
                                check={wicketType.value === wicketData["wicketType"]}
                            />
                        </Col>
                    ))}
                </Row>
                {showFields["batterId"] && <>
                    <div className="wicket-section-header">Please select a Batsman :</div>
                    <Row>
                        <Col xs={6} md={6} lg={6} onClick={() => { handleChange("batterId", onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId) }}>
                            <CardComponent
                                title={onPitchPlayers?.[ON_STRIKE]?.playerName}
                                selectIcon={"bx bxs-check-circle"}
                                onClickColor={"#099680"}
                                bgColor={"#55c6b4"}
                                check={onPitchPlayers?.[ON_STRIKE]?.commentaryPlayerId === wicketData["batterId"]}
                            />
                        </Col>
                        <Col xs={6} md={6} lg={6} onClick={() => { handleChange("batterId", onPitchPlayers?.[NON_STRIKE]?.commentaryPlayerId) }}>
                            <CardComponent
                                title={onPitchPlayers?.[NON_STRIKE]?.playerName}
                                selectIcon={"bx bxs-check-circle"}
                                onClickColor={"#099680"}
                                bgColor={"#55c6b4"}
                                check={onPitchPlayers?.[NON_STRIKE]?.commentaryPlayerId === wicketData["batterId"]}
                            />
                        </Col>
                    </Row>
                </>}
                <Row>
                    {showFields["runs"] && <Col xs={6} md={6} lg={4} >
                        Runs
                        <input
                            className="form-control"
                            type="number"
                            value={wicketData["runs"]}
                            id={"runs"}
                            onChange={(e) => handleChange("runs", e.target.value)}
                            min={0}
                            max={99}
                            step={1} />
                    </Col>}
                    {showFields["fielder1"] && <Col xs={6} md={6} lg={4}>
                        Fielder 1
                        <Select
                            classNamePrefix="select2-selection"
                            id={"fielder1"}
                            name={"fielder1"}
                            value={bowlingPlayerList.filter(e => {
                                return compareNumStringValues(e?.value, wicketData["fielder1"])
                            })}
                            options={bowlingPlayerList}
                            onChange={(selectedOption) => { handleChange("fielder1", selectedOption?.value || null) }}
                        />
                    </Col>}
                    {showFields["fielder2"] && <Col xs={6} md={6} lg={4}>
                        Fielder 2
                        <Select
                            classNamePrefix="select2-selection"
                            id={"fielder2"}
                            name={"fielder2"}
                            value={bowlingPlayerList.filter(e => compareNumStringValues(e?.value, wicketData["fielder2"]))}
                            options={bowlingPlayerList}
                            onChange={(selectedOption) => { handleChange("fielder2", selectedOption?.value || null) }}
                        />
                    </Col>}
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="decision-Button" onClick={handleSubmit}>Wicket</Button>
                <Button color="danger" className="decision-Button text-right " onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal >
    )
}

export default WicketModal