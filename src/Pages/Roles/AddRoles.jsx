import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { RoleFields } from '../../constants/FieldConst/RoleConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW } from '../../components/Common/Const';
import { addRoleToDb } from '../../Features/Tabs/roleSlice';
import axiosInstance from '../../Features/axios';
import PermissionTable from './PermissionTable';
import { Columns } from './Columns';
import { rearrangeTabs, transformData } from './helpers';
import SpinnerModel from "../../components/Model/SpinnerModel";

function AddRoles() {
    const finalizeRef = useRef(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading, error } = useSelector(state => state.tabsData.role);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const roleId = location.state?.roleId || "0";
    const [permissions, setPermissions] = useState([]);
    const [newPermissionValue, setNewPermissionValue] = useState([]);
    const [displayType, setDisplayType] = useState("0")

    useEffect(() => {
        fetchData(roleId, true);
        if (roleId !== "0") {
            setDisabledFields({
                "displayType": true
            })
        }
    }, [roleId]);

    useEffect(() => {
        fetchData(roleId)
    }, [displayType])
    
    useEffect(() => {
        if (isSaved) {
            if (currentSaveAction === SAVE)
                setSnackbarMessage("Data saved successfully!");
            else if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/roles")
            else if (currentSaveAction === SAVE_AND_NEW){
                finalizeRef.current.resetForm()
                setDisabledFields({})
            }
        }
    });

    const fetchData = async (roleId, storeInitialData = false) => {
        await axiosInstance.post('/admin/roles/byId', { roleId, displayType: displayType })
            .then((response) => {
                if (storeInitialData) setInitialEditData(response?.result);
                const newPermission = rearrangeTabs(response?.result?.permissions || []);
                setPermissions(newPermission)
                setNewPermissionValue(transformData(newPermission));
            }).catch((error) => {
                // setIsLoading(false)
            });
    };

    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData();
        if (dataToSave) {
            const extraData = {
                roleId: roleId,
                permissions: newPermissionValue
            }
            dispatch(addRoleToDb({ ...dataToSave, ...extraData }))
            setCurrentSaveAction(saveAction);
        }
    };

    const handleFormDataChange = (newFormData) => {
        if (displayType !== newFormData.displayType) setDisplayType(newFormData?.displayType || 0)
    }

    const updatePagePermission = (value) => {
        // Update the data using map and find the item by tabId
        const updatedValue = newPermissionValue.map((val) =>
            val.tabId === value.tabId ? value : val
        );
        setNewPermissionValue(updatedValue);
    };

    const handleBackClick = () => {
        navigate("/roles");
    };
    const { columns } = Columns({ permissions, updatePagePermission });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Role</h3>
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
                                    fields={RoleFields}
                                    editFormData={initialEditData}
                                    disabledFields={disabledFields}
                                    onFormDataChange={handleFormDataChange}
                                />
                                <div>
                                    {/* <PermissionTable permissions={permissions} setPermissions={setPermissions} /> */}
                                    {permissions.length > 0 && <PermissionTable data={permissions} columns={columns} />}
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

export default AddRoles;
