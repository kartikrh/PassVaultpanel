import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchDetailFields, TeamDetailsFields } from '../../constants/FieldConst/CommentaryConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_COMMENTARY } from '../../components/Common/Const';
import { addCommentaryToDb, updateSavedState } from '../../Features/Tabs/commentarySlice';
import axiosInstance from '../../Features/axios';
import classnames from "classnames";
import { convertDateLocalToUTC, convertDateUTCToLocal } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';

const fetchResult = (response) => {
    return Array.isArray(response.result) ? response?.result : [response?.result]
}
const formatMultiSelectDataPlayers = (inputList) => {
    const outputList = [];

    inputList.forEach((item) =>
        item?.displayOrder !== undefined
            ? (outputList[item?.displayOrder - 1] = item?.playerId)
            : outputList.push(item?.playerId)
    );

    return outputList;
};
function AddCommentary() {
    const pageName = TAB_COMMENTARY
    const finalizeRef1 = useRef(null);
    const finalizeRef2 = useRef(null);
    const [savedFormState, setSavedFormState] = useState({});
    const [activeTab, setactiveTab] = useState(1);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [isFetchApiLoading, setIsFetchApiLoading] = useState(false);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.commentary);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [id, setId] = useState(location.state?.userId || "0");
    const [competitionId, setCompetitionId] = useState(0);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        fetchMasterData()
    }, []);

    useEffect(() => {
        if (id !== "0") {
            fetchData(id);
            setDisabledFields({
                "eventTypeId": true,
                "competitionId": true,
                "eventId": true,
                "team1Id": true,
                "team2Id": true,
                "team1Captain": true,
                "team2Captain": true,
                "team1Kipper": true,
                "team2Kipper": true,
                "team1Players": true,
                "team2Players": true,
                "matchTypeId": true,
                "addSystemPlayer": true,
            })
        }
    }, [id]);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined))
            if (currentSaveAction === SAVE) { }
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/commentary")
            else if (currentSaveAction === SAVE_AND_NEW) {
                setDisabledFields({})
                setSavedFormState({})
                setId("0");
                finalizeRef1.current.resetForm()
                finalizeRef2.current.resetForm()
            }
            setCurrentSaveAction(undefined)
        }
    }, [isSaved]);

    const handleFormADataChange = (newFormData) => {
        setSavedFormState(newFormData);
        setCompetitionId(newFormData["competitionId"]);
        if (newFormData["eventTypeId"] !== savedFormState["eventTypeId"]) {
            setMasterData((preData) => ({
                ...preData,
                "competitionId": [],
            }));
            if (newFormData["eventTypeId"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/commentary/competitionListByEventTypeId', { eventTypeId: newFormData["eventTypeId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label: item?.competition, value: item?.competitionId }
                        })
                        setMasterData((preData) => ({
                            ...preData,
                            "competitionId": formattedData,
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    "competitionId": [],
                }));
            }
        } else if (newFormData["competitionId"] !== savedFormState["competitionId"]) {
            setMasterData((preData) => ({
                ...preData,
                "eventId": [],
            }));
            if (newFormData["competitionId"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/commentary/eventListByCompetitionId', { competitionId: newFormData["competitionId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label:  `${item?.eventName} - ${convertDateUTCToLocal(item?.eventDate, "index")}`, value: item?.eventId }
                        })
                        setMasterData((preData) => ({
                            ...preData,
                            "eventId": formattedData,
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    "eventId": [],
                }));
            }
        } else if (newFormData["eventId"] !== savedFormState["eventId"]) {
            const resetData = {
                "eventRefId": undefined,
                "eventName": undefined,
                "eventDate": undefined,
                "location": undefined,
            }
            setMasterData((preData) => ({
                ...preData,
                ...resetData
            }));
            if (newFormData["eventId"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/commentary/eventDataById', { eventId: newFormData["eventId"] })
                    .then((response) => {
                        const updatedData = {
                            "eventRefId": response?.result?.refId,
                            "eventName": response?.result?.eventName,
                            "eventDate": convertDateLocalToUTC(response?.result?.eventDate),
                            "location": response?.result?.venue,
                        }
                        setMasterData((preData) => ({
                            ...preData,
                            ...updatedData
                        }));
                        finalizeRef1.current.updateFormFromParent(updatedData)
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    ...resetData
                }));
                finalizeRef1.current.updateFormFromParent(resetData)
            }
        }
    }
    const handleFormBDataChange = (newFormData) => {
        setSavedFormState(newFormData);
        // if both data are not same then do API call and fetch data
        if (newFormData["team1Id"] !== savedFormState["team1Id"]) {
            if (newFormData["team1Id"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/player/byTeamIdv1', { teamId: newFormData["team1Id"], competitionId })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        setMasterData((preData) => ({
                            ...preData,
                            "team1Captain": formattedData,
                            "team1Kipper": formattedData,
                            "team1Players": formattedData
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            }
            else {
                setMasterData((preData) => ({
                    ...preData,
                    "team1Captain": [],
                    "team1Kipper": [],
                    "team1Players": []
                }));
            }
        } else if (newFormData["team2Id"] !== savedFormState["team2Id"]) {
            if (newFormData["team2Id"] !== "0") {
                setIsApiLoading(true);
                axiosInstance.post('/admin/player/byTeamIdv1', { teamId: newFormData["team2Id"], competitionId })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        setMasterData((preData) => ({
                            ...preData,
                            "team2Captain": formattedData,
                            "team2Kipper": formattedData,
                            "team2Players": formattedData
                        }));
                        setIsApiLoading(false);
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                        setIsApiLoading(false);
                    });
            } else {
                setMasterData((preData) => ({
                    ...preData,
                    "team2Captain": [],
                    "team2Kipper": [],
                    "team2Players": []
                }));
            }
        }
    };

    const fetchData = async (id) => {
        let updateScreenData = {}
        let newMasterData = {}
        // setInitialEditData(response?.result);
        setIsFetchApiLoading(true);
        await axiosInstance.post('/admin/commentary/byId', { commentaryId: id })
            .then(async (response) => {
                updateScreenData = {
                    ...response?.result,
                    team1Players: formatMultiSelectDataPlayers(response?.result?.team1Players),
                    team2Players: formatMultiSelectDataPlayers(response?.result?.team2Players),
                    eventDate: convertDateLocalToUTC(response?.result?.eventDate),
                    addSystemPlayer: +response?.result?.systemPlayerCount > 0
                }
                // Fetch Competition Options based on EventTypeId
                await axiosInstance.post('/admin/commentary/competitionListByEventTypeId', { eventTypeId: updateScreenData["eventTypeId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label: item?.competition, value: item?.competitionId }
                        })
                        newMasterData = { ...newMasterData, competitionId: formattedData }
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                // Fetch Events based on Competition
                await axiosInstance.post('/admin/commentary/eventListByCompetitionId', { competitionId: updateScreenData["competitionId"] })
                    .then((response) => {
                        const resultData = fetchResult(response)
                        const formattedData = resultData?.map(item => {
                            return { label:  `${item?.eventName} - ${convertDateUTCToLocal(item?.eventDate, "index")}`, value: item?.eventId }
                        })
                        newMasterData = { ...newMasterData, eventId: formattedData }
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                await axiosInstance.post('/admin/commentary/playerListByTeamId', { teamId: updateScreenData["team1Id"] })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        newMasterData = {
                            ...newMasterData,
                            "team1Captain": formattedData,
                            "team1Kipper": formattedData,
                            "team1Players": formattedData
                        };
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                await axiosInstance.post('/admin/commentary/playerListByTeamId', { teamId: updateScreenData["team2Id"] })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item?.playerName, value: item?.playerId }
                        }).filter(element => element.value);
                        newMasterData = {
                            ...newMasterData,
                            "team2Captain": formattedData,
                            "team2Kipper": formattedData,
                            "team2Players": formattedData
                        };
                    }).catch((error) => {
                        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                    });
                setIsFetchApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsFetchApiLoading(false);
            });
        setMasterData((preData) => ({
            ...preData,
            ...newMasterData
        }));
        setInitialEditData((preData) => ({
            ...preData,
            ...updateScreenData
        }));
    };

    const fetchMasterData = async () => {
        setIsApiLoading(true);
        axiosInstance.post('/admin/commentary/matchTypeList')
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.matchType, value: item?.matchTypeId }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "matchTypeId": formattedData

                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        setIsApiLoading(true);
        axiosInstance.post('/admin/commentary/teamList', {})
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.teamName, value: item?.teamId }
                }).filter(element => element.value);
                setMasterData((preData) => ({
                    ...preData,
                    "team1Id": formattedData,
                    "team2Id": formattedData
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
        setIsApiLoading(true);
        axiosInstance.post('/admin/commentary/eventTypeList', {})
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item?.eventType, value: item?.eventTypeId }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "eventTypeId": formattedData,
                }));
                setIsApiLoading(false);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
                setIsApiLoading(false);
            });
    };



    const handleSaveClick = async (saveAction) => {
        const dataToSave1 = finalizeRef1.current.finalizeData()
        const dataToSave2 = finalizeRef2.current.finalizeData()
        if (dataToSave1 && dataToSave2) {
            const dataToSave = {
                ...dataToSave1,
                "isActive": dataToSave1?.isActive ? dataToSave1.isActive : false,
                "isClientShow": dataToSave1?.isClientShow ? dataToSave1.isClientShow : false,
                "team1Id": dataToSave2.team1Id,
                "team2Id": dataToSave2.team2Id,
                "team1Captain": dataToSave2.team1Captain,
                "team2Captain": dataToSave2.team2Captain,
                "team1Kipper": dataToSave2.team1Kipper,
                "team2Kipper": dataToSave2.team2Kipper,
                "team1Players": dataToSave2.team1Players,
                "team2Players": dataToSave2.team2Players,
                "addSystemPlayer" : dataToSave2?.addSystemPlayer ? dataToSave2.addSystemPlayer : false,
                "systemPlayerCount" :dataToSave2.addSystemPlayer?dataToSave2.systemPlayerCount : "0" 
            }
            const extraData = {
                commentaryId: id,
                eventDate: convertDateLocalToUTC(dataToSave1.eventDate)
                // marketId: "0", tpId: "0", matchTypeId: "0"
                // , currentInnings: 0
            }
            setCurrentSaveAction(saveAction);
            dispatch(addCommentaryToDb({ ...dataToSave, ...extraData }))
        }
    };


    function toggleTab(tab) {
        if (activeTab !== tab) {
            var modifiedSteps = [...passedSteps, tab];
            if (tab >= 1 && tab <= 2) {
                setactiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    const handleBackClick = () => {
        navigate("/commentary");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Commentary </h3>
                        </Col>
                        {(isLoading || isApiLoading || isFetchApiLoading) && <SpinnerModel />}
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col className='mb-3 text-end' xs={12}>
                                        <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
                                        {activeTab !== 1 &&
                                            <ButtonDropdown
                                                direction="down"
                                                isOpen={drp_up}
                                                toggle={() => setDrp_up(!drp_up)}
                                            >
                                                <Button
                                                    disabled={
                                                        !(checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                                                            checkPermission(permissionObj, pageName, PERMISSION_EDIT))}
                                                    id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>
                                                    Save & Close
                                                </Button>
                                                <DropdownToggle caret color="primary">
                                                    <i className="mdi mdi-chevron-down" />
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {checkPermission(permissionObj, pageName, PERMISSION_EDIT)
                                                        && <DropdownItem onClick={() => { handleSaveClick(SAVE) }}>Save</DropdownItem>
                                                    }
                                                    {checkPermission(permissionObj, pageName, PERMISSION_ADD)
                                                        && <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_NEW) }}>Save & New</DropdownItem>
                                                    }
                                                </DropdownMenu>
                                            </ButtonDropdown>
                                        }
                                    </Col>
                                </Row>
                                <div id="basic-pills-wizard" className="twitter-bs-wizard">
                                    <ul className="twitter-bs-wizard-nav nav nav-pills nav-justified">
                                        <NavItem className={classnames({ active: activeTab === 1 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                className={classnames({ active: activeTab === 1 })}
                                                onClick={() => {
                                                    setactiveTab(1);
                                                }}
                                            >
                                                <span className="step-number">01</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Match Details</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className={classnames({ active: activeTab === 2 })}>
                                            <NavLink
                                                data-toggle="tab"
                                                className={classnames({ active: activeTab === 2 })}
                                                onClick={() => {
                                                    setactiveTab(2);
                                                }}
                                            >
                                                <span className="step-number">02</span>
                                                <span className="step-title" style={{ paddingLeft: "10px" }}>Team Detail</span>
                                            </NavLink>
                                        </NavItem>
                                    </ul>
                                    <TabContent activeTab={activeTab} className="twitter-bs-wizard-tab-content">
                                        <TabPane tabId={1}>
                                            <FormBuilder
                                                ref={finalizeRef1}
                                                fields={MatchDetailFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                disabledFields={disabledFields}
                                                onFormDataChange={handleFormADataChange}
                                            />
                                        </TabPane>
                                        <TabPane tabId={2}>
                                            <FormBuilder
                                                ref={finalizeRef2}
                                                fields={TeamDetailsFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                disabledFields={disabledFields}
                                                onFormDataChange={handleFormBDataChange}
                                            />
                                        </TabPane>
                                    </TabContent>
                                    <ul className="pager wizard twitter-bs-wizard-pager-link">
                                        {activeTab !== 1 && <li className="previous me-2" >
                                            <Link to="#"
                                                onClick={() => {
                                                    toggleTab(activeTab - 1);
                                                }}>Previous</Link>
                                        </li>}
                                        {activeTab !== 2 && <li className="next">
                                            <Link to="#"
                                                onClick={() => {
                                                    toggleTab(activeTab + 1);
                                                }}>
                                                Next
                                            </Link>
                                        </li>}
                                    </ul>
                                </div>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default AddCommentary;
