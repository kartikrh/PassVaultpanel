import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { COMMENTARY_MAIN_SCREEN, COMMENTARY_PLAYER_SELECTION_SCREEN, COMMENTARY_TOSS_SCREEN, ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEXT, SUCCESS, TAB_COMMENTARY, WARNING } from '../../components/Common/Const';
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import Toss from './Toss';
import PlayerSelection from './PlayerSelection';
import { addCommentaryScreenData, loadCommentaryFeature, updateCommentaryDisplayStatus, updateSavedState } from '../../Features/Tabs/commentarySlice';
import Commentary from './Commentary';
import "./CommentaryCss.css"
import ChangeStatusModal from "./CommentaryModels/ChangeStatusModal"
import NetworkStatus from '../../components/Common/Reusables/NetworkStatus';
import { isEmpty } from 'lodash';

const ALL_SCREENS = {
    1: COMMENTARY_TOSS_SCREEN,
    2: COMMENTARY_PLAYER_SELECTION_SCREEN,
    3: COMMENTARY_MAIN_SCREEN,
    4: COMMENTARY_MAIN_SCREEN
}

const getScreenNumber = (screen) => {
    for (const key in ALL_SCREENS) {
        if (ALL_SCREENS[key] === screen) return key;
    }
    return undefined
}

const navigateTo = "/commentary"
function CommentaryMaster() {
    const pageName = TAB_COMMENTARY
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [currentScreen, setCurrentScreen] = useState(undefined)
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [nextScreen, setNextScreen] = useState(undefined);
    const [nextData, setNextData] = useState(undefined);
    const [statusPopup, setStatusPopup] = useState(undefined)
    const [statusList, setStatusList] = useState([])
    const { isCommentaryDataUpdated, isCommentaryBallLoading } = useSelector(state => state.tabsData.commentary);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    // const commentaryId = location.state?.commentaryId || "0";
    const commentaryId = +localStorage.getItem('commentaryMasterId') || "0";
    const scoreCardUrl = process.env.REACT_APP_SCORECARD_URL || "https://deployed.live";

    const updateDisplayStatus = (displayStatus) => {
        dispatch(updateCommentaryDisplayStatus({
            "commentaryId": commentaryId,
            "displayStatus": displayStatus
        }))
    }
    useEffect(() => {
        if (!isEmpty(commentaryData))
            document.title = `CM ${commentaryData.commentaryDetails.eid} ${commentaryData.commentaryDetails.en}`;
    }, [commentaryData])

    const saveUserInfo = async () => {
        setIsDataLoading(true)
        await axiosInstance.post('/admin/commentaryScoringLogs/save', { commentaryId })
            .then(async (response) => {
                setIsDataLoading(false)
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });
    };

    useEffect(() => {
        if (commentaryId !== "0") {
            fetchData(commentaryId);
            saveUserInfo();
        }
    }, [commentaryId]);


    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
    }, []);

    useEffect(() => {
        if (isCommentaryDataUpdated && currentScreen !== 3) {
            dispatch(updateSavedState(undefined))
            setCurrentScreen(nextScreen);
            setCommentaryData(nextData)
        }
    }, [isCommentaryDataUpdated]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result
                setCurrentScreen(commentaryDataToUpdate?.commentaryDetails?.commentaryStatus || 1)
                setCommentaryData(commentaryDataToUpdate)
                setStatusList(commentaryDataToUpdate.commentaryDisplayStatus)
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

    const openIframePopup = () => {
        const url = `${scoreCardUrl}/scoreboard2?id=${commentaryData?.commentaryDetails?.eid}&color=000`
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleSaveClick = async (dataToSave, nextScreen, nextData) => {
        if (dataToSave) {
            dispatch(addCommentaryScreenData(dataToSave))
            setNextData(nextData)
            setNextScreen(nextScreen)
        }
    };
    const handleInningsChange = () => {
        if (commentaryId !== "0") {
            fetchData(commentaryId);
        }
    };
    const handleBackClick = () => {
        navigate(navigateTo);
    };
    const handleLoadCommentaryClick = () => {
        dispatch(loadCommentaryFeature({ commentaryId }))
    };

    // const isSaveOrEditPermission = checkPermission(permissionObj, pageName, PERMISSION_ADD) || checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {(
                                    (isCommentaryBallLoading && currentScreen !== 3)
                                    || isDataLoading) && <SpinnerModel />}
                                <Row className='mb-3'>
                                    <Col className="pt-2" xs={12} md={6} lg={6} >
                                        {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                                            <>
                                                <div className='match-details-breadcrumbs'>{`${commentaryData.commentaryDetails.ety}/ ${commentaryData.commentaryDetails.com}/ ${commentaryData.commentaryDetails.en}`}</div>
                                                <div>{`Ref: ${commentaryData.commentaryDetails.eid} [ ${commentaryData.commentaryDetails.ed + " " + commentaryData.commentaryDetails.et} ]`}</div>
                                            </>}
                                    </Col>
                                    <Col className="pt-2" xs={12} md={6} lg={6}>
                                        <Button color="danger" className=" mx-1 text-right" onClick={handleBackClick}>Exit</Button>
                                        {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                                            <>
                                                <NetworkStatus />
                                                <Button color="primary" className="mx-1 text-right" onClick={handleLoadCommentaryClick}>Load Commentary</Button>
                                                <Button color="primary" className="mx-1 text-right" onClick={openIframePopup}>Scorecard</Button>
                                            </>}
                                    </Col>
                                </Row>
                                <Row>
                                    {ALL_SCREENS[currentScreen] === COMMENTARY_TOSS_SCREEN &&
                                        <Toss
                                            data={commentaryData}
                                            save={handleSaveClick}
                                            next={() => { setCurrentScreen(getScreenNumber(COMMENTARY_PLAYER_SELECTION_SCREEN)) }}
                                        />}
                                    {ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN &&
                                        <PlayerSelection
                                            data={commentaryData}
                                            save={handleSaveClick}
                                            previous={() => { setCurrentScreen(getScreenNumber(COMMENTARY_TOSS_SCREEN)) }}
                                            next={() => { setCurrentScreen(getScreenNumber(COMMENTARY_MAIN_SCREEN)) }}
                                        />}
                                    {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                                        <Commentary
                                            data={{ commentaryData }}
                                            shotTypes={commentaryData?.shotTypes}
                                            onInningsChange={handleInningsChange}
                                            isDataLoading={isDataLoading}
                                            statusPopup={statusPopup}
                                            saveUserInfo={saveUserInfo}
                                        />}
                                    <Col xs={12} md={6} lg={6}>
                                        <img role="button" className="sticky-button"
                                            onClick={() => setStatusPopup(true)}
                                            src="icons/commentary.png" alt="Icon" />
                                    </Col>
                                    {statusPopup && <ChangeStatusModal
                                        statusList={statusList}
                                        toggle={() => setStatusPopup(undefined)}
                                        onSubmit={(displayStatus) => {
                                            setStatusPopup(undefined)
                                            updateDisplayStatus(displayStatus)
                                        }}
                                    />}
                                </Row>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default CommentaryMaster;
