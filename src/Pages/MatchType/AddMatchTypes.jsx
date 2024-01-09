import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { MatchTypeFields } from '../../constants/FieldConst/MatchTypeConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_MATCH_TYPE } from '../../components/Common/Const';
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
                totalOversInMatch: totalOvers
            }
            setCurrentSaveAction(saveAction);
            dispatch(addMatchTypeToDb({ ...dataToSave, ...extraData }))
        }
    };

    const handleBackClick = () => {
        navigate("/matchType");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Match Type </h3>
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
                                                {(checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                                                    checkPermission(permissionObj, pageName, PERMISSION_EDIT))
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
