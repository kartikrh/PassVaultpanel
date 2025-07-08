import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchTypeFields } from '../../constants/FieldConst/MatchTypeConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, SWITCH, SELECT, TAB_MATCH_TYPE } from '../../components/Common/Const';
import { addMatchTypeToDb, updateSavedState } from '../../Features/Tabs/matchTypeSlice';
import axiosInstance from '../../Features/axios';
import { updateToastData } from '../../Features/toasterSlice';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';

function AddTabs() {
    const pageName = TAB_MATCH_TYPE
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [masterData, setMasterData] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.matchType);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [id, setId] = useState(location.state?.userId || "0")

    useEffect(() => {
        if (id !== "0") {
            fetchData(id);
        }
    }, [id]);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
        fetchMasterData()
    }, []);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined))
            if (currentSaveAction === SAVE) { }
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/matchType")
            else if (currentSaveAction === SAVE_AND_NEW) {
                setInitialEditData({})
                setId("0")
                finalizeRef.current.resetForm()
            }
            setCurrentSaveAction(undefined)
        }
    }, [isSaved]);

    const fetchData = async (id) => {
        await axiosInstance.post('/admin/matchType/byId', { matchTypeId: id })
            .then((response) => {
                setInitialEditData(response?.result);
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };


    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData()
        if (dataToSave) {
            let totalOvers;
            if (dataToSave["isLimitedOvers"])
                totalOvers = dataToSave["oversPerInings"] * (dataToSave["noOfIningsPerSide"] * 2)
            else
                totalOvers = -1
            const extraData = {
              matchTypeId: id,
              totalOversInMatch: totalOvers,
            //   isAutoChangeStriker: dataToSave?.isAutoChangeStriker || false,
            //   isHistory: dataToSave?.isHistory || false,
            };
            const completeData = {}
            MatchTypeFields.forEach((field) => {
              const { name, type } = field;
              if (!name) return; // Skip fields like DIVIDER that have no name

              const value = dataToSave.hasOwnProperty(name)
                ? dataToSave[name]
                : null;

              if ( type === SELECT) {
                completeData[name] = value ?? 0;
              } else if ( type === SWITCH) {
                completeData[name] = value ?? false;
              } else {
                completeData[name] = value ?? null
              }
            });

            setCurrentSaveAction(saveAction);
            dispatch(addMatchTypeToDb({ ...completeData, ...extraData }))
        }
    };

    const handleBackClick = () => {
        navigate("/matchType");
    };

    const fetchMasterData = async () => {
        setIsApiLoading(true);
        try {
            const response = await axiosInstance.post('/admin/list/matchType');
            const result = response?.result;

            if (result && typeof result === 'object') {
            const formattedData = Object.entries(result).map(([key, value]) => ({
                label: key,
                value: value
            }));

            setMasterData((preData) => ({
                ...preData,
                entityEnum: [
                { label: "Select Module Type", value: "0" },
                ...formattedData
                ]
            }));
            } else {
            console.error("Invalid response format", result);
            }
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            setIsApiLoading(false);
        }
    };


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3 className='modal-header-title'>Match Type </h3>
                        </Col>
                        <Card>
                            <CardBody>
                                {isLoading || isApiLoading && <SpinnerModel />}
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
                                    fields={MatchTypeFields}
                                    editFormData={initialEditData}
                                    masterData={masterData}
                                />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default AddTabs;
