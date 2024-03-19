import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { COMMENTARY_MAIN_SCREEN, COMMENTARY_PLAYER_SELECTION_SCREEN, COMMENTARY_TOSS_SCREEN, ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEXT, TAB_COMMENTARY } from '../../components/Common/Const';
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission, convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import Toss from './Toss';
import PlayerSelection from './PlayerSelection';
import { addCommentaryDetailsToDb, updateSavedState } from '../../Features/Tabs/commentarySlice';
import Commentary from './Commentary';
import "./CommentaryCss.css"

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
    const [matchTypeData, setMatchTypeData] = useState({});
    const [currentScreen, setCurrentScreen] = useState(undefined)
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [nextScreen, setNextScreen] = useState(undefined);
    const [nextData, setNextData] = useState(undefined);
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.commentary);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const commentaryId = location.state?.commentaryId || "0";

    useEffect(() => {
        if (commentaryId !== "0") {
            fetchData(commentaryId);
        }
    }, [commentaryId]);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
    }, []);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined))
            setCurrentScreen(nextScreen);
            setCommentaryData(nextData)
        }
    }, [isSaved]);

    const fetchData = async () => {
        setIsDataLoading(true)
        let commentaryDataToUpdate = {}
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                commentaryDataToUpdate = response?.result
                setCurrentScreen(commentaryDataToUpdate?.commentaryDetails?.commentaryStatus || 1)
                setCommentaryData(commentaryDataToUpdate)
                setIsDataLoading(false)
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsDataLoading(false)
            });

    };

    const handleSaveClick = async (dataToSave, nextScreen, nextData) => {
        if (dataToSave) {
            dispatch(addCommentaryDetailsToDb(dataToSave))
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

    const isSaveOrEditPermission = checkPermission(permissionObj, pageName, PERMISSION_ADD) || checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody>
                                {(isLoading || isDataLoading) && <SpinnerModel />}
                                <Row className='mb-3'>
                                    {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                                        <Col>
                                            <div className='match-details-breadcrumbs'>{`${commentaryData.commentaryDetails.ety}/ ${commentaryData.commentaryDetails.com}/ ${commentaryData.commentaryDetails.en}`}</div>
                                            <div>{`Ref: ${commentaryData.commentaryDetails.eid} [ ${commentaryData.commentaryDetails.ed + " " + commentaryData.commentaryDetails.et} ]`}</div>
                                        </Col>}
                                    <Col>  <button className="btn btn-danger mx-1 text-right " onClick={handleBackClick}>Exit</button></Col>
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
                                            data={{ commentaryData, matchTypeData }}
                                            onInningsChange={handleInningsChange}
                                            isDataLoading={isDataLoading}
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
