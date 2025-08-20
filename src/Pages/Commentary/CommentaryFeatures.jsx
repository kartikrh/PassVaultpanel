import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../Features/axios.js"
import { updateToastData } from "../../Features/toasterSlice.js"
import { ERROR, PERMISSION_VIEW, TAB_COMMENTARY, WARNING } from "../../components/Common/Const.js"
import SpinnerModel from "../../components/Model/SpinnerModel/index.js";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods.js"
import { clearLoadingAndError, deleteCommentaryFeatures, saveCommentaryFeatures } from "../../Features/Tabs/commentarySlice.js"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, Row, Col, Container, CardBody, ButtonGroup } from 'reactstrap';
import { BALL_FEATURE, OVER_FEATURE, PARTNERSHIP_FEATURE, PLAYER_FEATURE, TEAM_FEATURE, WICKET_FEATURE } from "./CommentartConst.js"
import Breadcrumbs from "../../components/Common/Breadcrumb.js"
import { BallFeature } from "./CommentaryFeatures/BallsFeature.jsx"
import { TeamFeature } from "./CommentaryFeatures/TeamFeature.jsx"
import { OverFeature } from "./CommentaryFeatures/OverFeature.jsx"
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
    const [activeTab, setActiveTab] = useState(TEAM_FEATURE);
    const [commentaryData, setCommentaryData] = useState(undefined);                                                                                                                                    
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isToggleLoading, setIsToggleLoading] = useState(false)
    const [commentaryDetailsData, setCommentaryDetailsData] = useState({})
    const [teamsData, setTeamsData] = useState({})
    const [ballByBallData, setBallByBallData] = useState({})
    const [deleteBallByBall, setDeleteBallByBall] = useState([])
    const [overData, setOverData] = useState({})
    const [deleteOver, setDeleteOver] = useState([])
    const [wicketData, setWicketData] = useState({})
    const [deleteWicket, setDeleteWicket] = useState([])
    const [partnershipData, setPartnershipData] = useState({})
    const [playerData, setPlayerData] = useState({})
    const [deletePartnership, setDeletePartnership] = useState([])
    const [selectedInnings, setSelectedInnings] = useState(1)
    const [selectedBattingTeamId, setSelectedBattingTeamId] = useState(undefined)
    const [battingTeam, setBattingTeam] = useState({})
    const [bowlingTeam, setBowlingTeam] = useState({})
    const [battingTeamPlayers, setBattingTeamPlayers] = useState([])
    const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState([])
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
    const location = useLocation();
    // const commentaryId = location.state?.commentaryId || "0";
    const commentaryId = +localStorage.getItem('updateCommentaryId') || "0";
    const dispatch = useDispatch();
    let navigate = useNavigate();

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
                setCommentaryData(commentaryDataToUpdate)
                setSelectedInnings(commentaryDataToUpdate?.commentaryDetails?.currentInnings);
                setIsDataLoading(false)
                // if (response?.result?.callPrediction?.predictioncallSuccess === false) {
                //     const predictionMessage = response?.result?.callPrediction?.predictionMessage;
                //     const endPoint = response?.result?.callPrediction?.endPoint;
                //     dispatch(
                //         updateToastData({
                //             data: `${endPoint}\n${predictionMessage}`,
                //             title: "Call Prediction",
                //             type: WARNING,
                //         })
                //     );
                // }
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
    };

    useEffect(() => {
        if (commentaryId !== "0") fetchData(commentaryId);
    }, [commentaryId]);

    useEffect(() => {
        if (!isLoading && isRedirect) navigate(navigateTo);
    }, [isRedirect]);

    const handleBackClick = () => {
        navigate(navigateTo);
    };

    const handleSaveClick = () => {
        const objToSave = { commentaryId: commentaryId }
        const deleteObjToSave = { commentaryId: commentaryId }
        if (!isEmpty(commentaryDetailsData)) objToSave["commentaryDetails"] = commentaryDetailsData;
        if (!isEmpty(teamsData)) objToSave["commentaryTeams"] = Object.values(teamsData)
        if (!isEmpty(playerData)) objToSave["commentaryPlayers"] = Object.values(playerData)
        if (!isEmpty(ballByBallData)) objToSave["commentaryBallByBall"] = Object.values(ballByBallData)
        if (!isEmpty(deleteBallByBall)) deleteObjToSave["deleteBallByBall"] = Object.values(deleteBallByBall)
        if (!isEmpty(overData)) objToSave["commentaryOvers"] = Object.values(overData)
        if (!isEmpty(deleteOver)) deleteObjToSave["deleteOvers"] = Object.values(deleteOver)
        if (!isEmpty(wicketData)) objToSave["commentaryWickets"] = Object.values(wicketData)
        if (!isEmpty(deleteWicket)) deleteObjToSave["deleteWickets"] = Object.values(deleteWicket)
        if (!isEmpty(partnershipData)) objToSave["commentaryPartnership"] = Object.values(partnershipData)
        if (!isEmpty(deletePartnership)) deleteObjToSave["deletePartnership"] = Object.values(deletePartnership)
        if (!isEmpty(objToSave)) {
            dispatch(saveCommentaryFeatures(objToSave))
        }
        if (!isEmpty(deleteObjToSave)) {
            dispatch(deleteCommentaryFeatures(deleteObjToSave))
        }
        if (isEmpty(objToSave) && isEmpty(deleteObjToSave)) {
            handleBackClick()
        }
    };

    // const handleSaveClick = () => {
    //     const objToSave = { commentaryId: commentaryId };
    //     const deleteObjToSave = { commentaryId: commentaryId };
    //     // Existing updated records
    //     if (!isEmpty(commentaryDetailsData)) objToSave["commentaryDetails"] = Object.values(commentaryDetailsData);
    //     if (!isEmpty(teamsData)) objToSave["commentaryTeams"] = Object.values(teamsData);
    //     if (!isEmpty(playerData)) objToSave["commentaryPlayers"] = Object.values(playerData);
    //     if (!isEmpty(ballByBallData)) objToSave["commentaryBallByBall"] = Object.values(ballByBallData);
    //     if (!isEmpty(overData)) objToSave["commentaryOvers"] = Object.values(overData);
    //     if (!isEmpty(wicketData)) objToSave["commentaryWickets"] = Object.values(wicketData);
    //     if (!isEmpty(partnershipData)) objToSave["commentaryPartnership"] = Object.values(partnershipData);

    //     // Existing deletes
    //     if (!isEmpty(deleteBallByBall)) deleteObjToSave["deleteBallByBall"] = Object.values(deleteBallByBall);
    //     if (!isEmpty(deleteOver)) deleteObjToSave["deleteOvers"] = Object.values(deleteOver);
    //     if (!isEmpty(deleteWicket)) deleteObjToSave["deleteWickets"] = Object.values(deleteWicket);
    //     if (!isEmpty(deletePartnership)) deleteObjToSave["deletePartnership"] = Object.values(deletePartnership);
    //     // ✅ New: collect selected records from each updatedData set
    //     const selectedDetails = Object.values(commentaryDetailsData).filter(t => t.isSelected);
    //     const selectedTeams = Object.values(teamsData).filter(t => t.isSelected);
    //     const selectedPlayers = Object.values(playerData).filter(p => p.isSelected);
    //     const selectedBalls = Object.values(ballByBallData).filter(b => b.isSelected);
    //     const selectedOvers = Object.values(overData).filter(o => o.isSelected);
    //     const selectedWickets = Object.values(wicketData).filter(w => w.isSelected);
    //     const selectedPartnerships = Object.values(partnershipData).filter(p => p.isSelected);
    //     if (
    //         selectedDetails.length ||
    //         selectedTeams.length ||
    //         selectedPlayers.length ||
    //         selectedBalls.length ||
    //         selectedOvers.length ||
    //         selectedWickets.length ||
    //         selectedPartnerships.length
    //     ) {
    //         objToSave["selectedRecords"] = {
    //             commentaryDetails: selectedDetails,
    //             teams: selectedTeams,
    //             players: selectedPlayers,
    //             balls: selectedBalls,
    //             overs: selectedOvers,
    //             wickets: selectedWickets,
    //             partnerships: selectedPartnerships
    //         };
    //     }
    //     // Dispatch save / delete
    //     if (!isEmpty(objToSave)) {
    //         dispatch(saveCommentaryFeatures(objToSave));
    //     }
    //     if (!isEmpty(deleteObjToSave)) {
    //         dispatch(deleteCommentaryFeatures(deleteObjToSave));
    //     }
    //     if (isEmpty(objToSave) && isEmpty(deleteObjToSave)) {
    //         handleBackClick();
    //     }
    // };


    useEffect(() => {
        // setIsToggleLoading(true);
        const battingTeamData = commentaryData?.commentaryTeams?.filter((item)=> item.currentInnings == selectedInnings)?.find((item)=> item?.teamStatus == 1);
        setBattingTeam(battingTeamData)
        setSelectedBattingTeamId(battingTeamData?.teamId)
        const bowlingTeamData = commentaryData?.commentaryTeams?.filter((item)=> item.currentInnings == selectedInnings)?.find((item)=> item?.teamStatus == 2);
        setBowlingTeam(bowlingTeamData)
        // setTimeout(() => setIsToggleLoading(false), 2000);
    },[commentaryData, selectedInnings])

    useEffect(() => {
        setIsToggleLoading(true);
        const battingTeamPlayersData = commentaryData?.commentaryPlayers?.filter((players)=> players.currentInnings == selectedInnings && players.teamId == selectedBattingTeamId);
        setBattingTeamPlayers(battingTeamPlayersData)
        const bowlingTeamPlayersData = commentaryData?.commentaryPlayers?.filter((players)=> players.currentInnings == selectedInnings && players.teamId != selectedBattingTeamId);
        setBowlingTeamPlayers(bowlingTeamPlayersData)
        setTimeout(() => setIsToggleLoading(false), 2000);
    },[commentaryData, selectedInnings, selectedBattingTeamId])

    return <>
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row className="p-0">
                        <Card className="p-0">
                            <CardBody className="p-2">
                                {(isDataLoading || isToggleLoading || isLoading) && <SpinnerModel />}
                                <Row>
                                    {/* <Col xs={6} md={8} lg={9} className="mt-3 mt-lg-4 mt-md-4">
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Update Commentary Features" page="updatecp" />
                                    </Col> */}
                                    {!isEmpty(commentaryData?.commentaryDetails) && <Col xs={5} md={5} lg={5}>
                                        <div className='match-details-breadcrumbs'>{`${commentaryData?.commentaryDetails.ety}/ ${commentaryData?.commentaryDetails.com}/ ${commentaryData?.commentaryDetails.en}`}</div>
                                        <div>{`Ref: ${commentaryData?.commentaryDetails.eid} [ ${commentaryData?.commentaryDetails.ed + " " + commentaryData?.commentaryDetails.et} ]`}</div>
                                    </Col>}
                                    <Col xs={2} md={2} lg={2}>
                                            <ButtonGroup className="me-3">
                                                <Button color={selectedInnings === 1 ? "primary" : "secondary"} onClick={() => setSelectedInnings(1)}>Inning 1</Button>
                                                <Button color={selectedInnings === 2 ? "primary" : "secondary"} disabled={commentaryData?.commentaryDetails?.currentInnings === 1} onClick={() => setSelectedInnings(2)}>Inning 2</Button>
                                            </ButtonGroup>
                                    </Col>
                                    {battingTeam || bowlingTeam ? <Col xs={2} md={2} lg={2}>
                                            <ButtonGroup>
                                                <Button color={selectedBattingTeamId == battingTeam?.teamId ? "primary" : "secondary"} onClick={() => setSelectedBattingTeamId(battingTeam?.teamId)}>{battingTeam?.teamName}</Button>
                                                <Button color={selectedBattingTeamId == bowlingTeam?.teamId ? "primary" : "secondary"} onClick={() => setSelectedBattingTeamId(bowlingTeam?.teamId)}>{bowlingTeam?.teamName}</Button>
                                            </ButtonGroup>
                                    </Col> : null}
                                    <Col xs={3} md={3} lg={3}>
                                        <Button color='primary' className="table-header-button" onClick={handleSaveClick}>Save</Button>
                                        <Button color='danger' className="table-header-button" onClick={handleBackClick}>Exit</Button>
                                    </Col>
                                </Row>
                                {/* <Row>
                                    {!isEmpty(commentaryData?.commentaryDetails) && <Col className='mb-3'>
                                        <div className='match-details-breadcrumbs'>{`${commentaryData?.commentaryDetails.ety}/ ${commentaryData?.commentaryDetails.com}/ ${commentaryData?.commentaryDetails.en}`}</div>
                                        <div>{`Ref: ${commentaryData?.commentaryDetails.eid} [ ${commentaryData?.commentaryDetails.ed + " " + commentaryData?.commentaryDetails.et} ]`}</div>
                                    </Col>}
                                </Row> */}
                                <Row className="mt-2">
                                    {/* <Col xs={12}>
                                        <ButtonGroup className="me-3">
                                            <Button color={selectedInnings === 1 ? "primary" : "secondary"} onClick={() => setSelectedInnings(1)}>Inning 1</Button>
                                            <Button color={selectedInnings === 2 ? "primary" : "secondary"} disabled={commentaryData?.commentaryDetails?.currentInnings === 1} onClick={() => setSelectedInnings(2)}>Inning 2</Button>
                                        </ButtonGroup>
                                    </Col>
                                    {battingTeam || bowlingTeam ? <Col xs={12} className="my-2">
                                        <ButtonGroup>
                                            <Button color={selectedBattingTeamId == battingTeam?.teamId ? "primary" : "secondary"} onClick={() => setSelectedBattingTeamId(battingTeam?.teamId)}>{battingTeam?.teamName}</Button>
                                            <Button color={selectedBattingTeamId == bowlingTeam?.teamId ? "primary" : "secondary"} onClick={() => setSelectedBattingTeamId(bowlingTeam?.teamId)}>{bowlingTeam?.teamName}</Button>
                                        </ButtonGroup>
                                    </Col> : null} */}

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
                                            playerList={battingTeamPlayers?.filter((item)=> item?.onStrike !== null && item?.isPlay !== null) || []}
                                            updatedData={playerData || {}}
                                            handleValueChange={updatedData => setPlayerData({ ...updatedData })}
                                            title="Player Batting"
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            bowlingPlayers={bowlingTeamPlayers}
                                        />
                                        <PlayerFeature
                                            playerList={bowlingTeamPlayers?.filter((item)=> item?.bowlerOrder !== null) || []}
                                            updatedData={playerData || {}}
                                            handleValueChange={updatedData => setPlayerData({ ...updatedData })}
                                            title="Bowler Listing"
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            bowlingPlayers={bowlingTeamPlayers}
                                        />
                                        <PartnershipFeature
                                            partnershipList={commentaryData?.commentaryPartnership?.filter((item)=> item?.currentInnings == selectedInnings && item?.teamId === selectedBattingTeamId) || []}
                                            updatedData={partnershipData || {}}
                                            handleValueChange={updatedData => setPartnershipData({ ...updatedData })}
                                            deletedList={deletePartnership}
                                            handleDeleteChange={(partnershipId) => setDeletePartnership([].concat(deletePartnership, [partnershipId]))}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingTeamPlayers}
                                            ballList={commentaryData?.commentaryBallByBall?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                        />
                                        <WicketFeature
                                            wicketList={commentaryData?.commentaryWicket?.filter((item)=> item?.currentInnings == selectedInnings && item?.teamId === selectedBattingTeamId) || []}
                                            updatedData={wicketData || {}}
                                            handleValueChange={updatedData => setWicketData({ ...updatedData })}
                                            deletedList={deleteWicket}
                                            handleDeleteChange={(wicketId) => setDeleteWicket([].concat(deleteWicket, [wicketId]))}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingTeamPlayers}
                                            bowlingPlayers={bowlingTeamPlayers}
                                            overList={commentaryData?.commentaryOvers?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId !== selectedBattingTeamId) || []}
                                        />
                                        <OverBallByBallFeature
                                            overList={commentaryData?.commentaryOvers?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId !== selectedBattingTeamId) || []}
                                            ballList={commentaryData?.commentaryBallByBall?.filter((item)=> item.currentInnings == selectedInnings && item?.teamId == selectedBattingTeamId) || []}
                                            updatedData={overData || {}}
                                            handleValueChange={updatedData => setOverData({ ...updatedData })}
                                            deletedList={deleteOver}
                                            handleDeleteChange={(overId) => setDeleteOver([].concat(deleteOver, [overId]))}
                                            ballByBallData={ballByBallData}
                                            setBallByBallData={setBallByBallData}
                                            deleteBallByBall={deleteBallByBall}
                                            setDeleteBallByBall={setDeleteBallByBall}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            battingPlayers={battingTeamPlayers}
                                            bowlingPlayers={bowlingTeamPlayers}
                                            teamlist={commentaryData?.commentaryTeams?.filter((item)=> item?.currentInnings === selectedInnings)  || []}
                                        />
                                    </Col>
                                </Row>
                                    {/* <Nav tabs>
                                        <NavItem>
                                            <NavLink role="button"
                                                onClick={() => { setActiveTab(TEAM_FEATURE) }}
                                            >
                                                {TEAM_FEATURE}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink role="button"
                                                onClick={() => { setActiveTab(OVER_FEATURE) }}
                                            >
                                                {OVER_FEATURE}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink role="button"
                                                onClick={() => { setActiveTab(BALL_FEATURE) }}
                                            >
                                                {BALL_FEATURE}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink role="button"
                                                onClick={() => { setActiveTab(WICKET_FEATURE) }}
                                            >
                                                {WICKET_FEATURE}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink role="button"
                                                onClick={() => { setActiveTab(PARTNERSHIP_FEATURE) }}
                                            >
                                                {PARTNERSHIP_FEATURE}
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink role="button"
                                                onClick={() => { setActiveTab(PLAYER_FEATURE) }}
                                            >
                                                {PLAYER_FEATURE}
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId={TEAM_FEATURE}>
                                            <TeamFeature
                                                teamlist={commentaryData?.commentaryTeams || []}
                                                updatedData={teamsData || {}}
                                                handleValueChange={updatedData => setTeamsData({ ...updatedData })}
                                            />
                                        </TabPane>
                                        <TabPane tabId={OVER_FEATURE}>
                                            <OverFeature
                                                overList={commentaryData?.commentaryOvers || []}
                                                updatedData={overData || {}}
                                                handleValueChange={updatedData => setOverData({ ...updatedData })}
                                                deletedList={deleteOver}
                                                handleDeleteChange={(overId) => setDeleteOver([].concat(deleteOver, [overId]))}
                                            />
                                        </TabPane>
                                        <TabPane tabId={BALL_FEATURE}>
                                            <BallFeature
                                                ballList={commentaryData?.commentaryBallByBall || []}
                                                updatedData={ballByBallData || {}}
                                                handleValueChange={updatedData => setBallByBallData({ ...updatedData })}
                                                deletedList={deleteBallByBall}
                                                handleDeleteChange={(ballId) => {
                                                    setDeleteBallByBall([].concat(deleteBallByBall, [ballId]))
                                                }}
                                            />
                                        </TabPane>
                                        <TabPane tabId={WICKET_FEATURE}>
                                            <WicketFeature
                                                wicketList={commentaryData?.commentaryWicket || []}
                                                updatedData={wicketData || {}}
                                                handleValueChange={updatedData => setWicketData({ ...updatedData })}
                                                deletedList={deleteWicket}
                                                handleDeleteChange={(wicketId) => setDeleteWicket([].concat(deleteWicket, [wicketId]))}
                                            />
                                        </TabPane>
                                        <TabPane tabId={PARTNERSHIP_FEATURE}>
                                            <PartnershipFeature
                                                partnershipList={commentaryData?.commentaryPartnership || []}
                                                updatedData={partnershipData || {}}
                                                handleValueChange={updatedData => setPartnershipData({ ...updatedData })}
                                                deletedList={deletePartnership}
                                                handleDeleteChange={(partnershipId) => setDeletePartnership([].concat(deletePartnership, [partnershipId]))}
                                            />
                                        </TabPane>
                                        <TabPane tabId={PLAYER_FEATURE}>
                                            <PlayerFeature
                                                playerList={commentaryData?.commentaryPlayers || []}
                                                updatedData={playerData || {}}
                                                handleValueChange={updatedData => setPlayerData({ ...updatedData })}
                                            />
                                        </TabPane>
                                    </TabContent> */}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    </>
}