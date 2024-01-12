import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, Container, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { COMMENTARY_MAIN_SCREEN, COMMENTARY_PLAYER_SELECTION_SCREEN, COMMENTARY_TOSS_SCREEN, ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEXT, TAB_COMMENTARY } from '../../components/Common/Const';
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import Toss from './Toss';
import PlayerSelection from './PlayerSelection';
import { Commentary } from './Commentary';
import { addCommentaryDetailsToDb, updateSavedState } from '../../Features/Tabs/commentarySlice';

const ALL_SCREENS = {
    1: COMMENTARY_TOSS_SCREEN,
    2: COMMENTARY_PLAYER_SELECTION_SCREEN,
    3: COMMENTARY_MAIN_SCREEN
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
            console.log(commentaryId)
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
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                const commentaryData = response?.result
                console.log("Commentary Data and MatchTypeId",
                    commentaryData, commentaryData?.commentaryDetails?.matchTypeId)
                setCommentaryData(commentaryData);
                setCurrentScreen(commentaryData?.commentaryDetails?.commentaryStatus || 1)
                await axiosInstance.post('/admin/matchType/byId', { matchTypeId: commentaryData?.commentaryDetails?.matchTypeId })
                    .then((response) => {
                        setMatchTypeData(response?.result);
                        setIsDataLoading(false)
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsDataLoading(false)
                    });
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
                                <Container className="d-flex justify-content-end">
                                    <button className="btn btn-danger mx-1" onClick={handleBackClick}>Exit</button>
                                </Container>
                                {ALL_SCREENS[currentScreen] === COMMENTARY_TOSS_SCREEN &&
                                    <Toss
                                        data={commentaryData}
                                        save={handleSaveClick}
                                        next={() => { setCurrentScreen(2) }}
                                    />}
                                {ALL_SCREENS[currentScreen] === COMMENTARY_PLAYER_SELECTION_SCREEN &&
                                    <PlayerSelection
                                        data={commentaryData}
                                        save={handleSaveClick}
                                        previous={() => { setCurrentScreen(1) }}
                                        next={() => { setCurrentScreen(3) }}
                                    />}
                                {ALL_SCREENS[currentScreen] === COMMENTARY_MAIN_SCREEN &&
                                    <Commentary
                                        data={{ commentaryData, matchTypeData }}
                                        save={handleSaveClick}
                                        previous={() => { setCurrentScreen(2) }}
                                    />}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default CommentaryMaster;