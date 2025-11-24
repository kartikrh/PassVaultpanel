import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../Features/axios.js"
import { updateToastData } from "../../Features/toasterSlice.js"
import { ERROR, PERMISSION_VIEW, SUCCESS, TAB_COMMENTARY } from "../../components/Common/Const.js"
import SpinnerModel from "../../components/Model/SpinnerModel/index.js";
import { checkPermission, convertDateUTCToLocalWithSec24, convertDateUtcFormatWithSec24 } from "../../components/Common/Reusables/reusableMethods.js"
import UpdateCommentaryModal from "./CommentaryModels/UpdateCommentaryModal.jsx";
import { clearLoadingAndError, deleteCommentaryFeatures, saveCommentaryFeatures } from "../../Features/Tabs/commentarySlice.js"
import { Card, Button, Row, Col, Container, CardBody, ButtonGroup } from 'reactstrap';
import { TeamFeature } from "./CommentaryFeatures/TeamFeature.jsx"
import { PartnershipFeature } from "./CommentaryFeatures/PartnershipFeature.jsx"
import { WicketFeature } from "./CommentaryFeatures/WicketFeature.jsx"
import _, { isEmpty } from "lodash"
import { PlayerFeature } from "./CommentaryFeatures/PlayerFeature.jsx"
import { OverBallByBallFeature } from "./CommentaryFeatures/OverBallByBallFeature.jsx"
import { CommentaryDetailsFeature } from "./CommentaryFeatures/CommentaryDetailsFeature.jsx"
import "./CommentaryCss.css";

const navigateTo = "/commentary"
export const CommentaryFeatures = () => {
    const pageName = TAB_COMMENTARY
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isToggleLoading, setIsToggleLoading] = useState(false)
    const [commentaryDetailsData, setCommentaryDetailsData] = useState({})
    const [teamsData, setTeamsData] = useState({})
    const [ballByBallData, setBallByBallData] = useState({})
    // const [deleteBallByBall, setDeleteBallByBall] = useState([])
    const [overData, setOverData] = useState({})
    // const [deleteOver, setDeleteOver] = useState([])
    const [wicketData, setWicketData] = useState({})
    // const [deleteWicket, setDeleteWicket] = useState([])
    const [partnershipData, setPartnershipData] = useState({})
    const [playerData, setPlayerData] = useState({})
    // const [deletePartnership, setDeletePartnership] = useState([])
    const [selectedInnings, setSelectedInnings] = useState(1)
    const [selectedBattingTeamId, setSelectedBattingTeamId] = useState(undefined)
    const [selectedBowlingTeamId, setSelectedBowlingTeamId] = useState(undefined)
    const [battingTeam, setBattingTeam] = useState({})
    const [bowlingTeam, setBowlingTeam] = useState({})
    const [battingTeamPlayers, setBattingTeamPlayers] = useState([])
    const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([])
    const [isDeleteRequest, setIsDeleteRequest] = useState(false)
    const [toDeleteObject, setToDeleteObject] = useState({});
    const [deleteType, setDeleteType] = useState("")

    const [selectedItems, setSelectedItems] = useState({
        details: {},
        teams: {},
        players: {},
        partnerships: {},
        wickets: {},
        overs: {},
        balls: {}
    });
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const { isLoading, isRedirect } = useSelector(state => state.tabsData.commentary);
    const commentaryId = +localStorage.getItem('updateCommentaryId') || "0";
    const dateTyp = JSON.parse(localStorage.getItem("DateType"));
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const eventDate = commentaryData?.commentaryDetails?.eventDate;
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [saveData, setSaveData] = useState({ objToSave: {}, deleteObjToSave: {} });
    if(commentaryData?.commentaryDetails){
        document.title = `S-Update [ ${dateTyp?.value == 1 ? convertDateUTCToLocalWithSec24(eventDate, "index") : convertDateUtcFormatWithSec24(eventDate, "index")} ] ${commentaryData.commentaryDetails?.en}`;
    } else {
        document.title = "S-Update";
    }
    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
            navigate("/dashboard")
        }
        dispatch(clearLoadingAndError())
        return () => {
            dispatch(clearLoadingAndError())
        }
    }, [permissionObj]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result;
                const updatedBallByBall = _.orderBy(commentaryDataToUpdate.commentaryBallByBall, ["commentaryBallByBallId"], ["desc"])
                const updatedOverHistory = _.orderBy(commentaryDataToUpdate.commentaryOvers, ["overId"], ["desc"])
                commentaryDataToUpdate["commentaryBallByBall"] = updatedBallByBall || []
                commentaryDataToUpdate["commentaryOvers"] = updatedOverHistory || []
                setCommentaryData(commentaryDataToUpdate);
                setSelectedInnings(commentaryDataToUpdate?.commentaryDetails?.currentInnings);
                setSelectedItems({
                    details: {},
                    teams: {},
                    players: {},
                    partnerships: {},
                    wickets: {},
                    overs: {},
                    balls: {}
                });
                setCommentaryDetailsData({})
                setTeamsData({})
                setBallByBallData({})
                // setDeleteBallByBall([])
                setOverData({})
                // setDeleteOver([])
                setWicketData({})
                // setDeleteWicket([])
                setPartnershipData({})
                setPlayerData({})
                // setDeletePartnership([])
                setIsDataLoading(false)
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
    };

    useEffect(() => {
        if (commentaryId !== "0") fetchData(commentaryId);
    }, [commentaryId]);

    // useEffect(() => {
    //     if (!isLoading && isRedirect) navigate(navigateTo);
    // }, [isRedirect]);

    const handleBackClick = () => {
        navigate(navigateTo);
    };

    const handleSaveClick = async () => {
        const objToSave = {}
        // const deleteObjToSave = {}
        if (!isEmpty(commentaryDetailsData)) objToSave["commentaryDetails"] = commentaryDetailsData;
        if (!isEmpty(teamsData)) objToSave["commentaryTeams"] = Object.values(teamsData)
        if (!isEmpty(playerData)) objToSave["commentaryPlayers"] = Object.values(playerData)
        if (!isEmpty(ballByBallData)) objToSave["commentaryBallByBall"] = Object.values(ballByBallData)
        // if (!isEmpty(deleteBallByBall)) deleteObjToSave["deleteBallByBall"] = Object.values(deleteBallByBall)
        if (!isEmpty(overData)) objToSave["commentaryOvers"] = Object.values(overData)
        // if (!isEmpty(deleteOver)) deleteObjToSave["deleteOvers"] = Object.values(deleteOver)
        if (!isEmpty(wicketData)) objToSave["commentaryWickets"] = Object.values(wicketData)
        // if (!isEmpty(deleteWicket)) deleteObjToSave["deleteWickets"] = Object.values(deleteWicket)
        if (!isEmpty(partnershipData)) objToSave["commentaryPartnership"] = Object.values(partnershipData)
        // if (!isEmpty(deletePartnership)) deleteObjToSave["deletePartnership"] = Object.values(deletePartnership)
        if (!isEmpty(teamsData)) {
            const invalidTeam = Object.values(teamsData).find(
                (team) => team?.teamStatus && team?.teamBattingOrder
            );
            if (!invalidTeam) {
                dispatch(updateToastData({
                    data: "Missing Team Batting Order or Team Status in teamsData",
                    title: "Teams Data Error",
                    type: ERROR,
                }));
                return;
            }
        }
        // setSaveData({ objToSave, deleteObjToSave });
        setSaveData({ objToSave });
        setIsUpdateModalOpen(true);
    };
    const handleConfirmUpdate = async () => {
        // const { objToSave, deleteObjToSave } = saveData;
        if (!password.trim()) {
            dispatch(
                updateToastData({
                    data: "Password is required",
                    title: "Validation Error",
                    type: ERROR,
                })
            );
            return;
        }
        const { objToSave } = saveData;
        setIsToggleLoading(true);
        try {
            let success = false;
            if (!isEmpty(objToSave)) {
                const response = await axiosInstance.post("/admin/commentary/saveCommentaryDetails", { ...objToSave, commentaryId, password });
                if (response?.result) {
                    success = true;
                    dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
                }
            }
            // if (!isEmpty(deleteObjToSave)) {
            //     const response = await axiosInstance.post("/admin/commentary/deleteCommentaryDetails", { ...deleteObjToSave, commentaryId, password });
            //     if (response?.result) {
            //         success = true;
            //         dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            //     }
            // }
            if (success) {
                fetchData(commentaryId);
            }
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            setIsToggleLoading(false);
            handleCloseModal();
        }
    };
    const handleSafeDelete = async () => {
        if (!password.trim()) {
            dispatch(
                updateToastData({
                    data: "Password is required",
                    title: "Validation Error",
                    type: ERROR,
                })
            );
            return;
        }
        setIsToggleLoading(true);
        try {
            let success = false;
            const response = await axiosInstance.post("/admin/commentary/deleteCommentaryDetails", { ...toDeleteObject, commentaryId, password });
            if (response?.result) {
                success = true;
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
                setIsDeleteRequest(false)
                setToDeleteObject({})
            }
            if (success) {
                fetchData(commentaryId);
            }
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            setIsToggleLoading(false);
            handleCloseModal();
        }
        // if (!isEmpty(objToSave) || !isEmpty(deleteObjToSave)) {
        //     if (!isEmpty(objToSave)) {
        //         dispatch(saveCommentaryFeatures({ ...objToSave, commentaryId }))
        //     }
        //     if (!isEmpty(deleteObjToSave)) {
        //         dispatch(deleteCommentaryFeatures({ ...deleteObjToSave, commentaryId }))
        //     }
        //     fetchData(commentaryId)
        // }
        // if (isEmpty(objToSave) && isEmpty(deleteObjToSave)) {
        //     handleBackClick()
        // }
    };

    const handleCloseModal = () => {
        setIsUpdateModalOpen(false);
        setPassword("");
        setIsDeleteRequest(false)
        setToDeleteObject({})
        // setSaveData({ objToSave: {}, deleteObjToSave: {} });
        setSaveData({ objToSave: {}});
    };

    useEffect(() => {
        const battingTeamData = commentaryData?.commentaryTeams?.filter((item)=> item.currentInnings == selectedInnings)?.find((item)=> item?.teamStatus == 1);
        setBattingTeam(battingTeamData);
        setSelectedBattingTeamId(battingTeamData?.teamId);
        const bowlingTeamData = commentaryData?.commentaryTeams?.filter((item)=> item.currentInnings == selectedInnings)?.find((item)=> item?.teamStatus == 2);
        setBowlingTeam(bowlingTeamData);
        setSelectedBowlingTeamId(bowlingTeamData?.teamId);
    },[commentaryData, selectedInnings])

    useEffect(() => {
        setIsToggleLoading(true);
        const battingTeamPlayersData = commentaryData?.commentaryPlayers?.filter((players)=> players.currentInnings == selectedInnings && players.teamId == selectedBattingTeamId);
        setBattingTeamPlayers(battingTeamPlayersData)
        const bowlingTeamPlayersData = commentaryData?.commentaryPlayers?.filter((players)=> players.currentInnings == selectedInnings && players.teamId == selectedBowlingTeamId);
        setBowlingTeamPlayers(bowlingTeamPlayersData)
        setTimeout(() => setIsToggleLoading(false), 2000);
    },[commentaryData, selectedInnings, selectedBattingTeamId, selectedBowlingTeamId])

    return <>
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row className="p-0">
                        <Card className="p-0">
                            <CardBody className="p-2">
                                {(isDataLoading || isToggleLoading || isLoading) && <SpinnerModel />}
                                <Row>
                                    {!isEmpty(commentaryData?.commentaryDetails) && <Col xs={5} md={5} lg={5}>
                                        <div className='match-details-breadcrumbs'>{`${commentaryData?.commentaryDetails.ety}/ ${commentaryData?.commentaryDetails.com}/ ${commentaryData?.commentaryDetails.en}`}</div>
                                        <div>{`Ref: ${commentaryData?.commentaryDetails.eid} [ ${dateTyp?.value == 1 ? convertDateUTCToLocalWithSec24(eventDate, "index") : convertDateUtcFormatWithSec24(eventDate, "index")} ]`}</div>
                                    </Col>}
                                    <Col xs={2} md={2} lg={2}>
                                        <ButtonGroup className="me-3">
                                            <Button color={selectedInnings === 1 ? "primary" : "secondary"} onClick={() => setSelectedInnings(1)}>Inning 1</Button>
                                            <Button color={selectedInnings === 2 ? "primary" : "secondary"} disabled={commentaryData?.commentaryDetails?.currentInnings === 1} onClick={() => setSelectedInnings(2)}>Inning 2</Button>
                                        </ButtonGroup>
                                    </Col>
                                    {battingTeam || bowlingTeam ? <Col xs={2} md={2} lg={2}>
                                        <ButtonGroup>
                                                <Button color={selectedBattingTeamId == battingTeam?.teamId ? "primary" : "secondary"} onClick={() => { setSelectedBattingTeamId(battingTeam?.teamId); setSelectedBowlingTeamId(bowlingTeam?.teamId); }}>{battingTeam?.teamName}</Button>
                                                <Button color={selectedBattingTeamId == bowlingTeam?.teamId ? "primary" : "secondary"} onClick={() => { setSelectedBattingTeamId(bowlingTeam?.teamId); setSelectedBowlingTeamId(battingTeam?.teamId); }}>{bowlingTeam?.teamName}</Button>
                                        </ButtonGroup>
                                    </Col> : null}
                                    <Col xs={3} md={3} lg={3}>
                                        <Button color='primary' className="table-header-button" onClick={handleSaveClick}>Save</Button>
                                        <Button color='danger' className="table-header-button" onClick={handleBackClick}>Exit</Button>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col lg={12}>
                                        <CommentaryDetailsFeature
                                            commentaryDetailsInfo={commentaryData?.commentaryDetails || {}}
                                            updatedData={commentaryDetailsData|| {}}
                                            handleValueChange={updatedData => setCommentaryDetailsData({ ...updatedData })}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            teamlist={commentaryData?.commentaryTeams?.filter((item)=> item?.currentInnings === selectedInnings)  || []}
                                        />
                                        <TeamFeature
                                            teamlist={commentaryData?.commentaryTeams?.filter((item)=> item?.currentInnings === selectedInnings)  || []}
                                            updatedData={teamsData|| {}}
                                            handleValueChange={updatedData => setTeamsData({ ...updatedData })}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                        />
                                        <PlayerFeature
                                            playerList={battingTeamPlayers || []}
                                            updatedData={playerData || {}}
                                            handleValueChange={updatedData => setPlayerData({ ...updatedData })}
                                            title="Player Batting"
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            bowlingPlayers={bowlingTeamPlayers}
                                            bowlingStyleList={commentaryData?.bowlingStyles}
                                        />
                                        <PlayerFeature
                                            playerList={bowlingTeamPlayers || []}
                                            updatedData={playerData || {}}
                                            handleValueChange={updatedData => setPlayerData({ ...updatedData })}
                                            title="Bowler Listing"
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            bowlingPlayers={bowlingTeamPlayers}
                                            bowlingStyleList={commentaryData?.bowlingStyles}
                                        />
                                        <PartnershipFeature
                                            partnershipList={commentaryData?.commentaryPartnership?.filter((item) => item?.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                            updatedData={partnershipData || {}}
                                            handleValueChange={updatedData => setPartnershipData({ ...updatedData })}
                                            // deletedList={deletePartnership}
                                            // handleDeleteChange={(partnershipId) => setDeletePartnership([].concat(deletePartnership, [partnershipId]))}
                                            handleDeleteChange={(partnershipId) => {
                                                setToDeleteObject({ "deletePartnership": [partnershipId] })
                                                setIsDeleteRequest(true);
                                                setDeleteType("partnership");
                                                setIsUpdateModalOpen(true);
                                            }}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingTeamPlayers}
                                            ballList={commentaryData?.commentaryBallByBall?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                        />
                                        <WicketFeature
                                            wicketList={commentaryData?.commentaryWicket?.filter((item)=> item?.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                            updatedData={wicketData || {}}
                                            handleValueChange={updatedData => setWicketData({ ...updatedData })}
                                            // deletedList={deleteWicket}
                                            // handleDeleteChange={(wicketId) => setDeleteWicket([].concat(deleteWicket, [wicketId]))}
                                            handleDeleteChange={(wicketId) => {
                                                setToDeleteObject({ "deleteWickets": [wicketId] })
                                                setIsDeleteRequest(true);
                                                setDeleteType("wicket");
                                                setIsUpdateModalOpen(true);
                                            }}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingTeamPlayers}
                                            bowlingPlayers={bowlingTeamPlayers}
                                            overList={commentaryData?.commentaryOvers?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                        />
                                        <OverBallByBallFeature
                                            overList={commentaryData?.commentaryOvers?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                            ballList={commentaryData?.commentaryBallByBall?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                            updatedData={overData || {}}
                                            handleValueChange={updatedData => setOverData({ ...updatedData })}
                                            // deletedList={deleteOver}
                                            // handleDeleteChange={(overId) => setDeleteOver([].concat(deleteOver, [overId]))}
                                            handleDeleteChange={(overId) => {
                                                setToDeleteObject({ "deleteOvers": [overId] })
                                                setIsDeleteRequest(true);
                                                setDeleteType("over");
                                                setIsUpdateModalOpen(true);
                                            }}
                                            ballByBallData={ballByBallData}
                                            setBallByBallData={setBallByBallData}
                                            // deleteBallByBall={deleteBallByBall}
                                            // setDeleteBallByBall={setDeleteBallByBall}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingTeamPlayers}
                                            bowlingPlayers={bowlingTeamPlayers}
                                            teamlist={commentaryData?.commentaryTeams?.filter((item)=> item?.currentInnings === selectedInnings)  || []}
                                            overTypeList={commentaryData?.overTypes || []}
                                            setToDeleteObject={setToDeleteObject}
                                            setIsDeleteRequest={setIsDeleteRequest}
                                            setIsUpdateModalOpen={setIsUpdateModalOpen}
                                            setDeleteType={setDeleteType}
                                        />
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                    <UpdateCommentaryModal
                        isOpen={isUpdateModalOpen}
                        toggle={handleCloseModal}
                        onYesClick={() => { isDeleteRequest ? handleSafeDelete() : handleConfirmUpdate() }}
                        onNoClick={handleCloseModal}
                        password={password}
                        setPassword={setPassword}
                        isDelete={isDeleteRequest}
                        deleteType={deleteType}
                    />
                </Container>
            </div>
        </React.Fragment >
    </>
}