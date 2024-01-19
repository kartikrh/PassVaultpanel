import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from '../../components/Common/Reusables/FormBuilder';
import { RoleFields } from '../../constants/FieldConst/RoleConst';
import { Button, ButtonDropdown, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR, PERMISSION_ADD, PERMISSION_EDIT, PERMISSION_VIEW, SAVE, SAVE_AND_CLOSE, SAVE_AND_NEW, TAB_ROLES } from '../../components/Common/Const';
import { addRoleToDb, updateSavedState } from '../../Features/Tabs/roleSlice';
import axiosInstance from '../../Features/axios';
import PermissionTable from './PermissionTable';
import { Columns } from './Columns';
import { rearrangeTabs, transformData } from './helpers';
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from '../../components/Common/Reusables/reusableMethods';
import { updateToastData } from '../../Features/toasterSlice';

function AddRoles() {
    const pageName = TAB_ROLES
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const [disabledFields, setDisabledFields] = useState({});
    const { isSaved, isLoading } = useSelector(state => state.tabsData.role);
    const permissionObj = useSelector(state => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [roleId, setRoleId] = useState(location.state?.roleId || "0")
    const [permissions, setPermissions] = useState([]);
    const [newPermissionValue, setNewPermissionValue] = useState([]);
    const [displayType, setDisplayType] = useState("0")
    const [allCheckBoxes, setAllCheckBoxes] = useState({
        isEdit: true,
        isAdd: true,
        isDelete: true,
        isView: true,
    })
    useEffect(() => {
        fetchData(roleId, true);
        if (roleId !== "0") {
            setDisabledFields({
                "displayType": true
            })
        } else {
            setDisabledFields({})
        }
    }, [roleId]);

    useEffect(() => {
        fetchData(roleId)
    }, [displayType])

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard")
        }
    }, [])

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined))
            if (currentSaveAction === SAVE_AND_CLOSE)
                navigate("/roles")
            else if (currentSaveAction === SAVE_AND_NEW) {
                setDisabledFields({})
                setRoleId("0")
                finalizeRef.current.resetForm()
            }
            setCurrentSaveAction(undefined)
        }
    }, [isSaved]);

    useEffect(() => {
        if (permissions.length) {
            setNewPermissionValue(transformData(permissions));
        }
    }, [permissions])


    const fetchData = async (roleId, storeInitialData = false) => {
        await axiosInstance.post('/admin/roles/byId', { roleId, displayType: displayType })
            .then((response) => {
                if (storeInitialData) setInitialEditData(response?.result);
                const newPermission = rearrangeTabs(response?.result?.permissions || []);
                setPermissions(newPermission)
            }).catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData();
        if (dataToSave) {
            const extraData = {
                roleId: roleId,
                permissions: newPermissionValue
            }
            const defaultData = {
                description: ""
            }
            if (newPermissionValue.length) {
                dispatch(addRoleToDb({ ...defaultData, ...dataToSave, ...extraData }))
                setCurrentSaveAction(saveAction);
            } else {
                dispatch(updateToastData({ data: "No Permission Found", title: "Roles", type: ERROR }));
            }
        }
    };

    const handleFormDataChange = (newFormData) => {
        if (displayType !== newFormData.displayType) setDisplayType(newFormData?.displayType || 0)
    }

    const updatePagePermission = (value) => {
        // Update the data using map and find the item by tabId
        const updatedValue = permissions.map((val) =>
            val.tabId === value.tabId ? { ...val, ...value } : val
        );
        setPermissions(updatedValue);
    };

    const updateAllPermission = (name, data) => {
        const newData = permissions.map(value => {
            return {
                ...value,
                [name]: data
            }
        })
        setPermissions(newData)
    }

    const handlePermissionChangeAll = (key) => {
        setAllCheckBoxes((preValue) => {
            return {
                ...preValue,
                [key]: !allCheckBoxes[key]
            }
        })
        const newPermissionValuesUpdated = newPermissionValue.map((val) => {
            return { ...val, [key]: !allCheckBoxes[key] }
        })
        setNewPermissionValue(newPermissionValuesUpdated)
    }

    const handleBackClick = () => {
        navigate("/roles");
    };
    const { columns } = Columns({ permissions, updatePagePermission, updateAllPermission });

    useEffect(() => {
    }, [allCheckBoxes])
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
    );
}

export default AddRoles;
