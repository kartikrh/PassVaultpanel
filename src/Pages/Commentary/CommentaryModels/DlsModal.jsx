import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { COMMENTARY_STATUS_OPEN, ERROR, WARNING } from "../../../components/Common/Const";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { isEqual } from "lodash";
import { BAT, BATTING_TEAM, BOWL, BOWLING_TEAM } from "../CommentartConst";
import SpinnerModel from "../../../components/Model/SpinnerModel";

export const DlsModal = ({ commentaryDetails, toggle }) => {
    const [commentaryData, setCommentaryData] = useState({})
    const [teams, setTeams] = useState({})
    const [showTarget, setShowTarget] = useState(false)
    const [maxOvers, setMaxOvers] = useState("")
    const [newTarget, setNewTarget] = useState("")
    const [matchTypeeMaxOvers, setMatchTypeMaxOver] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(false)
    const dispatch = useDispatch();

    const fetchData = async () => {
        setIsDataLoading(true)
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId: commentaryDetails.commentaryId })
            .then(async (response) => {
                formatDataInitialize(response?.result)
                setIsDataLoading(false)
                if(response?.result?.callPrediction?.predictioncallSuccess === false) {
                    dispatch(
                      updateToastData({
                        data: response?.result?.callPrediction?.predictionMessage,
                        title: "Call Prediction",
                        type: WARNING,
                      })
                    );
                }
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
    };

    const formatDataInitialize = (data) => {
        const teamData = {}
        if (+data.commentaryDetails.commentaryStatus === COMMENTARY_STATUS_OPEN) setShowTarget(false)
        else {
            data.commentaryTeams.forEach(teamDetails => {
                if (isEqual(teamDetails.currentInnings, commentaryDetails.currentInnings)) {
                    const isBattingTeam = teamDetails.teamStatus === BAT
                    teamData[isBattingTeam ? BATTING_TEAM : BOWLING_TEAM] = teamDetails
                }
            });
            if (teamData[BOWLING_TEAM]?.isBattingComplete) setShowTarget(true)
            else setShowTarget(false)
        }
        setTeams(teamData)
        if (data.matchTypeDetails?.isLimitedOvers) setMatchTypeMaxOver(data.matchTypeDetails?.oversPerInings)
        setCommentaryData(data)
    }

    const handleSaveClick = () => {
        if (!maxOvers || maxOvers === 0) dispatch(updateToastData({ data: "Please Enter Max Overs", title: "Required Error", type: ERROR }));
        else if (showTarget && (!newTarget || newTarget === 0)) dispatch(updateToastData({ data: "Please Enter Target", title: "Required Error", type: ERROR }));
        else {
            const updatedTeamData = teams
            if (+commentaryData.commentaryDetails.commentaryStatus === COMMENTARY_STATUS_OPEN) {
                const updatedTeam = []
                commentaryData.commentaryTeams?.forEach(team => updatedTeam.push({
                    ...team,
                    teamMaxOver: maxOvers
                }))
                saveDataAPi({ commentaryTeams: updatedTeam })
            }
            else {
                if (!showTarget) {
                    updatedTeamData[BATTING_TEAM] = {
                        ...updatedTeamData[BATTING_TEAM],
                        teamMaxOver: maxOvers
                    }
                    updatedTeamData[BOWLING_TEAM] = {
                        ...updatedTeamData[BOWLING_TEAM],
                        teamMaxOver: maxOvers
                    }
                    saveDataAPi({ commentaryTeams: Object.values(teams) })
                }
                else {
                    if ((+(teams[BATTING_TEAM]?.teamOver || 0) < maxOvers)) {
                        updatedTeamData[BATTING_TEAM] = {
                            ...updatedTeamData[BATTING_TEAM],
                            teamTrialRuns: newTarget,
                            teamMaxOver: maxOvers
                        }
                        updatedTeamData[BOWLING_TEAM] = {
                            ...updatedTeamData[BOWLING_TEAM],
                            teamMaxOver: maxOvers
                        }
                        saveDataAPi({ commentaryTeams: Object.values(teams) })
                    }
                    else {
                        const updatedCommData = commentaryData.commentaryDetails
                        const newPlayerList = []
                        updatedCommData["commentaryStatus"] = 2
                        updatedTeamData[BATTING_TEAM] = {
                            ...updatedTeamData[BATTING_TEAM],
                            teamMaxOver: maxOvers,
                            teamStatus: BOWL,
                            isBattingComplete: true
                        }
                        updatedTeamData[BOWLING_TEAM] = {
                            ...updatedTeamData[BOWLING_TEAM],
                            teamMaxOver: maxOvers,
                            teamStatus: BAT,
                            teamTrialRuns: newTarget,
                        }
                        commentaryData.commentaryPlayers?.forEach(player => newPlayerList.push({
                            ...player,
                            isPlay: null,
                            onStrike: null
                        }))
                        saveDataAPi({
                            commentaryDetails: updatedCommData,
                            commentaryTeams: Object.values(teams),
                            commentaryPlayers: newPlayerList
                        })
                    }
                }
            }
        }
    }

    const saveDataAPi = async (dataToSave) => {
        setIsDataLoading(true)
        await axiosInstance.post('/admin/commentary/saveDetails', { ...dataToSave, commentaryId: commentaryData.commentaryDetails?.commentaryId })
            .then(async (response) => {
                setIsDataLoading(false)
                toggle()
                if(response?.result?.callPredictions.length > 0) {
                    response.result.callPredictions.forEach((prediction) => {
                     if(prediction?.predictioncallSuccess === false) {
                      dispatch(
                        updateToastData({
                          data: prediction?.predictionMessage,
                          title: prediction?.predictioonAPI,
                          type: WARNING,
                        })
                      );
                     }
                    });
                }
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
    }

    const handleMaxOver = (over) => {
        let updatedOvers = +over
        if (matchTypeeMaxOvers && updatedOvers > +matchTypeeMaxOvers) updatedOvers = +matchTypeeMaxOvers
        if (!teams[BOWLING_TEAM]?.isBattingComplete) {
            if ((updatedOvers < (+teams[BATTING_TEAM]?.teamOver || 0))) {
                setShowTarget(true)
            } else setShowTarget(false)
        }
        setMaxOvers(updatedOvers)
    }

    useEffect(() => {
        if (commentaryDetails.commentaryId) fetchData()
    }, [])

    return (
        <Modal backdrop="static" className="commentary-modal" zIndex={1000} isOpen={true} toggle={toggle} >
            <ModalHeader toggle={toggle}>
                DLS
            </ModalHeader>
            <ModalBody>
                {isDataLoading && <SpinnerModel />}
                <Row>
                    <Col xs={6} md={4} lg={3} className={`d-flex p-0`}>
                        <div className="lablediv small-label-div ">
                            <label
                                htmlFor={"maxOver"}
                                className="dynamic-label-right form-label-class small-labels">
                                Max Overs: </label>
                        </div>
                    </Col>
                    <Col className={`mb-4`} xs={6} md={8} lg={9}>
                        <Input
                            className="form-control small-text-fields"
                            type="number"
                            step={1}
                            id={"maxOver"}
                            placeholder={matchTypeeMaxOvers}
                            name={"maxOver"}
                            value={maxOvers || ""}
                            onChange={(e) => handleMaxOver(+e.target.value)}
                        />
                    </Col>
                </Row>
                {showTarget && <Row>
                    <Col xs={6} md={4} lg={3} className={`d-flex p-0`}>
                        <div className="lablediv small-label-div ">
                            <label
                                htmlFor={"newTarget"}
                                className="dynamic-label-right form-label-class small-labels">
                                New Target: </label>
                        </div>
                    </Col>
                    <Col className={`mb-4`} xs={6} md={8} lg={9}>
                        <Input
                            className="form-control small-text-fields"
                            type="number"
                            step={1}
                            id={"newTarget"}
                            placeholder={"New Target"}
                            name={"newTarget"}
                            value={newTarget || ""}
                            onChange={(e) => setNewTarget(+e.target.value)}
                        />
                    </Col>
                </Row>}
                {teams[BATTING_TEAM]?.teamMaxOver &&
                    <Row>
                        <i>Current max overs : <b>{teams[BATTING_TEAM]?.teamMaxOver} Overs</b></i>
                        <i>Current match type : <b>{commentaryData?.commentaryDetails?.matchType}</b></i>
                    </Row>}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" className="decision-Button" onClick={handleSaveClick}>Save</Button>
            </ModalFooter>
        </Modal>
    )
}