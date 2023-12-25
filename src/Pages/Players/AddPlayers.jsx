import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { PlayerFields } from '../../constants/FieldConst/PlayerConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addPlayerToDb } from '../../Features/Tabs/playerSlice';
import axiosInstance from '../../Features/axios';

function AddPlayer() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.player);
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
                navigate("/Players")
            else if (currentSaveAction === SAVE_AND_NEW)
                finalizeRef.current.resetForm()
        }
    });

    const fetchData = async (id) => {
        await axiosInstance.post('/admin/player/byId', { id })
            .then((response) => {
                setInitialEditData(response?.result);
            }).catch((error) => {
                // setIsLoading(false)
            });
    };

    const fetchMasterData = async () => {
        axiosInstance.post('/admin/team/all')
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData, "teamId":
                        response?.result?.map(item => {
                            return { label: item.teamName, value: item.teamId }
                        })
                }));
            }).catch((error) => {
                // setIsLoading(false)
            });
        axiosInstance.post('/admin/eventType/all')
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData, "eventTypeId":
                        response?.result?.map(item => {
                            return { label: item.eventType, value: item.eventTypeId }
                        })
                }));
            }).catch((error) => {
                // setIsLoading(false)
            });
        axiosInstance.post('/admin/player/allPlayerTypes')
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData, "playerTypeId":
                        response?.result?.map(item => {
                            return { label: item.playerType, value: item.playerTypeId }
                        })
                }));
            }).catch((error) => {
                // setIsLoading(false)
            });
        axiosInstance.post('admin/player/allBowlingTypes')
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData,
                    "bowlingStyle":
                        response?.result?.map(item => {
                            return { label: item.bowlingType, value: item.bowlingTypeId }
                        })
                }));
            }).catch((error) => {
                // setIsLoading(false)
            });
    };

    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            const extraData = {
                playerId: id
            }
            setCurrentSaveAction(saveAction);
            dispatch(addPlayerToDb({ ...dataToSave, ...extraData }))
        }
    };

    const handleBackClick = () => {
        navigate("/Players");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Players </h3>
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
                                <FormBuilder
                                    ref={finalizeRef}
                                    fields={PlayerFields}
                                    editFormData={initialEditData}
                                    masterData={masterData}
                                    disabledFields={disabledFields}
                                />
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

export default AddPlayer;
