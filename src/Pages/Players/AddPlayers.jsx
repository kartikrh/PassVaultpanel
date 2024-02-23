import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { PlayerFields } from '../../constants/FieldConst/PlayerConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_PLAYERS } from '../../components/Common/Const';
import { addPlayerToDb, updateSavedState } from '../../Features/Tabs/playerSlice';
import axiosInstance from '../../Features/axios';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from '../../Features/toasterSlice';
import { convertObjtoFormData } from '../../components/Common/utilities';
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';

const formatMultiSelectDataTeams = (inputList) => {
    const outputList = [];
    inputList.forEach((item) =>
        outputList.push(item.teamId)
    );
    return outputList.filter(element => element);
};
function AddPlayer() {
    const pageName = TAB_PLAYERS
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.player);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [id, setId] = useState(location.state?.userId || "0");

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
                "parentId": true,
                "displayType": true
            })
        }
    }, [id]);

    useEffect(() => {
        if (isSaved) {
    alert(isSaved)
            dispatch(updateSavedState(undefined))
            if (currentSaveAction === SAVE) { }
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/Players")
            else if (currentSaveAction === SAVE_AND_NEW) {
                setDisabledFields({})
                setInitialEditData({})
                setId("0")
                finalizeRef.current.resetForm()
            }
            setCurrentSaveAction(undefined)
        }
    }, [isSaved]);


    const fetchData = async (id) => {
        await axiosInstance.post('/admin/player/byId', { playerId: id })
            .then((response) => {
                setInitialEditData({
                    ...response?.result,
                    teamId: formatMultiSelectDataTeams(response?.result?.teams)
                });
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const fetchMasterData = async () => {
        axiosInstance.post('/admin/player/teamList', {})
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData, "teamId":
                        response?.result?.map(item => {
                            return { label: item.teamName, value: item.teamId }
                        })
                }));
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
        axiosInstance.post('/admin/player/eventTypeList', {})
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData, "eventTypeId":
                        response?.result?.map(item => {
                            return { label: item.eventType, value: item.eventTypeId }
                        })
                }));
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
        axiosInstance.post('/admin/player/allPlayerTypes', {})
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData,
                    "playerTypeId":
                        response?.result?.map(item => {
                            return { label: item.playerType, value: item.playerTypeId }
                        })
                }));
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
        axiosInstance.post('admin/player/allBowlingTypes', {})
            .then((response) => {
                setMasterData((prevData) => ({
                    ...prevData,
                    "bowlingTypeId":
                        response?.result?.map(item => {
                            return { label: item.bowlingType, value: item.bowlingTypeId }
                        })
                }));
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            const extraData = {
                playerId: id
            }
            setCurrentSaveAction(saveAction);
            dispatch(addPlayerToDb(convertObjtoFormData({ ...dataToSave, ...extraData })))
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
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    <Col className='mb-3' xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }}>
                                        <button className="btn btn-danger mx-1" onClick={handleBackClick}>Back</button>
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
    );
}

export default AddPlayer;
