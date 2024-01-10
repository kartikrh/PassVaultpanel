import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchTypeFields } from '../../constants/FieldConst/MatchTypeConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { COMMENTARY_MAIN_SCREEN, COMMENTARY_PLAYER_SELECTION_SCREEN, COMMENTARY_TOSS_SCREEN, ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEXT, TAB_COMMENTARY } from '../../components/Common/Const';
import { addMatchTypeToDb } from '../../Features/Tabs/matchTypeSlice';
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import Toss from './Toss';
import { PlayerSelection } from './Playerselection';
import { Commentary } from './Commentary';

const navigateTo = "/commentary"
function CommentaryMaster() {
    const pageName = TAB_COMMENTARY
    const [drp_up, setDrp_up] = useState(false);
    const [commentaryData, setCommentaryData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [matchTypeData, setMatchTypeData] = useState({});
    const [currentScreen, setCurrentScreen] = useState(COMMENTARY_TOSS_SCREEN)
    const [isDataLoading, setIsDataLoading] = useState(false)
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.matchType);
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
            if (currentSaveAction === SAVE) { }
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate(navigateTo)
            else if (currentSaveAction === SAVE_AND_NEXT) {
                setCurrentScreen(currentScreen + 1)
            }
            setCurrentSaveAction(undefined)
        }
    });

    const fetchData = async () => {
        setIsDataLoading(true)
        await axiosInstance.post('/admin/commentary/detailsById', { commentaryId })
            .then(async (response) => {
                const commentaryData = response?.result
                console.log("Commentary Data and MatchTypeId",
                    commentaryData, commentaryData?.commentaryDetails?.matchTypeId)
                setCommentaryData(commentaryData);
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

    const handleSaveClick = async (dataToSave, saveAction) => {
        if (dataToSave) {
            setCurrentSaveAction(saveAction);
            dispatch(addMatchTypeToDb(dataToSave))
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
                                <Row>
                                    <Col className='mb-3' xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }}>
                                        <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
                                        <ButtonDropdown
                                            direction="down"
                                            isOpen={drp_up}
                                            toggle={() => setDrp_up(!drp_up)}
                                        >
                                            <Button
                                                disabled={!isSaveOrEditPermission}
                                                id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_NEXT) }}>
                                                Save & Next
                                            </Button>
                                            <DropdownToggle caret color="primary">
                                                <i className="mdi mdi-chevron-down" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {isSaveOrEditPermission && <DropdownItem onClick={() => { handleSaveClick(SAVE) }}>Save</DropdownItem>}
                                                {isSaveOrEditPermission && <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>Save & Close</DropdownItem>}
                                            </DropdownMenu>
                                        </ButtonDropdown>
                                    </Col>
                                </Row>
                                {currentScreen === COMMENTARY_TOSS_SCREEN &&
                                    <Toss
                                        data={commentaryData}
                                        save={handleSaveClick}
                                        next={() => { setCurrentScreen(COMMENTARY_PLAYER_SELECTION_SCREEN) }}
                                        exit={handleBackClick}
                                    />}
                                {currentScreen === COMMENTARY_PLAYER_SELECTION_SCREEN &&
                                    <PlayerSelection
                                        data={commentaryData}
                                        save={handleSaveClick}
                                        previous={() => { setCurrentScreen(COMMENTARY_TOSS_SCREEN) }}
                                        next={() => { setCurrentScreen(COMMENTARY_MAIN_SCREEN) }}
                                        exit={handleBackClick}
                                    />}
                                {currentScreen === COMMENTARY_MAIN_SCREEN &&
                                    <Commentary
                                        data={{ commentaryData, matchTypeData }}
                                        save={handleSaveClick}
                                        previous={() => { setCurrentScreen(COMMENTARY_PLAYER_SELECTION_SCREEN) }}
                                        exit={handleBackClick}
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