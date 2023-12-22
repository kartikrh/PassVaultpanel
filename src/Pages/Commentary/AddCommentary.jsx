import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchDetailFields, TeamDetailsFields } from '../../constants/FieldConst/CommentaryConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addTabToDb } from '../../Features/Tabs/tabsSlice';
import axiosInstance from '../../Features/axios';
import classnames from "classnames";

function AddTabs() {
    const finalizeRef1 = useRef(null);
    const finalizeRef2 = useRef(null);
    const [teamDetails, setTeamDetails] = useState({});
    const [activeTab, setactiveTab] = useState(1);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.tab);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.userId || "0";

    useEffect(() => {
        fetchMasterData()
    }, []);

    useEffect(() => {
        if (id !== "0") {
            fetchData(id);
            setDisabledFields({
                "parentId": true,
                "displayType": true
            })
        }
    }, [id]);

    useEffect(() => {
        if (isSaved) {
            if (currentSaveAction === SAVE)
                setSnackbarMessage("Data saved successfully!");
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/commentary")
            else if (currentSaveAction === SAVE_AND_NEW) {
                finalizeRef1.current.resetForm()
                finalizeRef2.current.resetForm()
            }
        }
    });

    const handleFormDataChange = (newFormData) => {
        console.log(newFormData)
        setTeamDetails(newFormData);
        // if both data are not same then do API call and fetch data
        if (newFormData["team1Id"] !== teamDetails["team1Id"]) {
            if (newFormData["team1Id"] !== "0") {
                axiosInstance.post('/admin/player/byTeamId', { teamId: newFormData["team1Id"] })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item.playerName, value: item.playerId }
                        })
                        setMasterData((preData) => ({
                            ...preData,
                            "team1Captain": formattedData,
                            "team1Kipper": formattedData,
                            "team1Players": formattedData
                        }));
                    }).catch((error) => {
                        // setIsLoading(false)
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
        } else if (newFormData["team2Id"] !== teamDetails["team2Id"]) {
            if (newFormData["team2Id"] !== "0") {
                axiosInstance.post('/admin/player/byTeamId', { teamId: newFormData["team2Id"] })
                    .then((response) => {
                        const formattedData = response?.result?.map(item => {
                            return { label: item.playerName, value: item.playerId }
                        })
                        setMasterData((preData) => ({
                            ...preData,
                            "team2Captain": formattedData,
                            "team2Kipper": formattedData,
                            "team2Players": formattedData
                        }));
                    }).catch((error) => {
                        // setIsLoading(false)
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
        axiosInstance.post('/admin/tabs/byId', { id })
            .then((response) => {
                setInitialEditData(response?.result);
            }).catch((error) => {
                // setIsLoading(false)
            });
    };

    const fetchMasterData = async () => {
        axiosInstance.post('/admin/matchType/all')
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item.matchType, value: item.matchTypeId }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "matchTypeId": formattedData

                }));
            }).catch((error) => {
                // setIsLoading(false)
            });
        axiosInstance.post('/admin/team/all')
            .then((response) => {
                const formattedData = response?.result?.map(item => {
                    return { label: item.teamName, value: item.teamId }
                })
                setMasterData((preData) => ({
                    ...preData,
                    "team1Id": formattedData,
                    "team2Id": formattedData
                }));

            }).catch((error) => {
                // setIsLoading(false)
            });
    };


    const handleSaveClick = async (saveAction) => {
        setCurrentSaveAction(saveAction);
        dispatch(addTabToDb({ ...finalizeRef1.current.finalizeData(), ...finalizeRef2.current.finalizeData(), commentaryId: id, }))
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

                        <Card>
                            <CardBody>
                                <Row>
                                    <Col className='mb-3' xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }}>
                                        <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
                                        <ButtonDropdown
                                            direction="down"
                                            isOpen={drp_up}
                                            toggle={() => setDrp_up(!drp_up)}
                                        >
                                            <Button id="caret" color="primary" onClick={() => { handleSaveClick(SAVE_AND_CLOSE) }}>
                                                Save & Close
                                            </Button>
                                            <DropdownToggle caret color="primary">
                                                <i className="mdi mdi-chevron-down" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => { handleSaveClick(SAVE) }}>Save</DropdownItem>
                                                <DropdownItem onClick={() => { handleSaveClick(SAVE_AND_NEW) }}>Save & New</DropdownItem>
                                            </DropdownMenu>
                                        </ButtonDropdown>
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
                                            />
                                        </TabPane>
                                        <TabPane tabId={2}>
                                            <FormBuilder
                                                ref={finalizeRef2}
                                                fields={TeamDetailsFields}
                                                editFormData={initialEditData}
                                                masterData={masterData}
                                                disabledFields={disabledFields}
                                                onFormDataChange={handleFormDataChange}
                                            />
                                        </TabPane>
                                    </TabContent>
                                    <ul className="pager wizard twitter-bs-wizard-pager-link">
                                        <li className={activeTab === 1 ? "previous disabled me-2" : "previous me-2"} >
                                            <Link to="#"
                                                onClick={() => {
                                                    toggleTab(activeTab - 1);
                                                }}>Previous</Link>
                                        </li>
                                        <li className={activeTab === 2 ? "next disabled" : "next"}>
                                            <Link to="#"
                                                onClick={() => {
                                                    toggleTab(activeTab + 1);
                                                }}>
                                                Next
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
        //         {
        //     snackbarMessage && (
        //         <div className="alert alert-success" role="alert" style={{ position: 'fixed', bottom: '20px', right: '20px' }} onClick={handleCloseSnackbar}>
        //             {snackbarMessage}
        //         </div>
        //     )
        // }
        // </div >
    );
}

export default AddTabs;
