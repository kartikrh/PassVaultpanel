import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../Features/axios.js"
import { updateToastData } from "../../Features/toasterSlice.js"
import { ERROR, PERMISSION_VIEW, TAB_COMMENTARY, WARNING } from "../../components/Common/Const.js"
import SpinnerModel from "../../components/Model/SpinnerModel/index.js";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods.js"
import { clearLoadingAndError, deleteCommentaryFeatures, saveCommentaryFeatures } from "../../Features/Tabs/commentarySlice.js"
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, Row, Col, Container, CardBody } from 'reactstrap';
import { BALL_FEATURE, OVER_FEATURE, PARTNERSHIP_FEATURE, PLAYER_FEATURE, TEAM_FEATURE, WICKET_FEATURE } from "./CommentartConst.js"
import Breadcrumbs from "../../components/Common/Breadcrumb.js"
import { BallFeature } from "./CommentaryFeatures/BallsFeature.jsx"
import { TeamFeature } from "./CommentaryFeatures/TeamFeature.jsx"
import { OverFeature } from "./CommentaryFeatures/OverFeature.jsx"
import { PartnershipFeature } from "./CommentaryFeatures/PartnershipFeature.jsx"
import { WicketFeature } from "./CommentaryFeatures/WicketFeature.jsx"
import _, { isEmpty } from "lodash"
import { PlayerFeature } from "./CommentaryFeatures/PlayerFeature.jsx"

const navigateTo = "/commentary"
export const CommentaryFeatures = () => {
    const pageName = TAB_COMMENTARY
    const [activeTab, setActiveTab] = useState(TEAM_FEATURE);
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [isDataLoading, setIsDataLoading] = useState(false)
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
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const { isLoading, isRedirect } = useSelector(state => state.tabsData.commentary);
    const location = useLocation();
    // const commentaryId = location.state?.commentaryId || "0";
    const commentaryId = +localStorage.getItem('updateCommentaryId') || "0";
    const dispatch = useDispatch();
    let navigate = useNavigate();

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        dispatch(clearLoadingAndError())
        return () => {
            dispatch(clearLoadingAndError())
        }
    }, []);

    useEffect(() => {
        if (commentaryId !== "0") fetchData(commentaryId);
    }, [commentaryId]);

    useEffect(() => {
        if (!isLoading && isRedirect) navigate(navigateTo);
    }, [isRedirect]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result
                const updatedBallByBall = _.orderBy(commentaryDataToUpdate.commentaryBallByBall, ["commentaryBallByBallId"], ["desc"])
                const updatedOverHistory = _.orderBy(commentaryDataToUpdate.commentaryOvers, ["overId"], ["desc"])
                commentaryDataToUpdate["commentaryBallByBall"] = updatedBallByBall || []
                commentaryDataToUpdate["commentaryOvers"] = updatedOverHistory || []
                setCommentaryData(commentaryDataToUpdate)
                setIsDataLoading(false)
                if (response?.result?.callPrediction?.predictioncallSuccess === false) {
                    const predictionMessage = response?.result?.callPrediction?.predictionMessage;
                    const endPoint = response?.result?.callPrediction?.endPoint;
                    dispatch(
                        updateToastData({
                            data: `${endPoint}\n${predictionMessage}`,
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
    const handleBackClick = () => {
        navigate(navigateTo);
    };

    const handleSaveClick = () => {
        const objToSave = { commentaryId: commentaryId }
        const deleteObjToSave = { commentaryId: commentaryId }
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
    return <>
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col xs={6} md={8} lg={9} className="mt-3 mt-lg-4 mt-md-4">
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Update Commentary Features" page="updatecp" />
                                    </Col>
                                    <Col xs={6} md={4} lg={3} className="mt-3 mt-lg-2 mt-md-2">
                                        <Button color='primary' className="table-header-button" onClick={handleSaveClick}>Save</Button>
                                        <Button color='danger' className="table-header-button" onClick={handleBackClick}>Exit</Button>
                                    </Col>
                                </Row>
                                <Row>
                                    {!isEmpty(commentaryData?.commentaryDetails) && <Col className='mb-3'>
                                        <div className='match-details-breadcrumbs'>{`${commentaryData?.commentaryDetails.ety}/ ${commentaryData?.commentaryDetails.com}/ ${commentaryData?.commentaryDetails.en}`}</div>
                                        <div>{`Ref: ${commentaryData?.commentaryDetails.eid} [ ${commentaryData?.commentaryDetails.ed + " " + commentaryData?.commentaryDetails.et} ]`}</div>
                                    </Col>}
                                </Row>
                                <Row>
                                    {(isDataLoading || isLoading) && <SpinnerModel />}
                                    <Nav tabs>
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
                                                    console.log(ballId)
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
                                    </TabContent>
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    </>
}
