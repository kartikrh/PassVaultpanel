import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { videoLibraryFields } from "../../constants/FieldConst/VideoLibraryConst";
import {
    Button,
    ButtonDropdown,
    Card,
    CardBody,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
    ERROR,
    PERMISSION_ADD,
    PERMISSION_EDIT,
    PERMISSION_VIEW,
    SAVE,
    SAVE_AND_CLOSE,
    SAVE_AND_NEW,
    TAB_VIDEOLIBRARY,
} from "../../components/Common/Const";
import { addVideoLibraryToDb, updateSavedState } from "../../Features/Tabs/videoLibrarySlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { string } from "prop-types";

const AddVideoLibrary = () => {
    const pageName = TAB_VIDEOLIBRARY;
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading } = useSelector((state) => state.tabsData.videoLibrary);
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [videoLibraryId, setVideoLibraryId] = useState(location.state?.id || 0);
    const [fields, setFields] = useState(videoLibraryFields || [])
    useEffect(() => {
        if (videoLibraryId !== 0) {
            fetchData(videoLibraryId);
        }
    }, [videoLibraryId]);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard");
        }
    }, []);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined));
            if (currentSaveAction === SAVE_AND_CLOSE) {
                navigate("/videoLibrary");
            } else if (currentSaveAction === SAVE_AND_NEW) {
                setInitialEditData({});
                setVideoLibraryId("0");
                finalizeRef.current.resetForm();
            }
            setCurrentSaveAction(undefined);
        }
    }, [isSaved]);

    const fetchData = async (videoLibraryId) => {
        await axiosInstance
            .post("/admin/videoLibrary/byId", { id: videoLibraryId })
            .then((response) => {
                setInitialEditData(response?.result);
            })
            .catch((error) => {
                dispatch(
                    updateToastData({
                        data: error?.message,
                        title: error?.title,
                        type: ERROR,
                    })
                );
            });
    };

    const handleFormBDataChange = (val) => {
        let filteredFields = [...videoLibraryFields];
        if (val?.type === 1) {
            filteredFields = filteredFields.filter(obj => obj.label !== "Video URL");
        } else if (val?.type === 2) {
            filteredFields = filteredFields.filter(obj => obj.label !== "Video");
        }
        if (val?.isPermanent) {
            filteredFields = filteredFields.filter(obj => obj.name !== "from" && obj.name !== "to");
        }
        setFields(filteredFields);
    };

    const handleSaveClick = async (saveAction) => {
        let dataToSave = finalizeRef.current.finalizeData();
        if (dataToSave) {
            let extraData = {};
            if (typeof dataToSave?.video !== 'string') {
                extraData.id = videoLibraryId;
                extraData.videoURL = dataToSave.type === 2 ? dataToSave.videoURL : "";
                extraData.video = dataToSave.type === 1 ? dataToSave.video : "";
            } else {
                extraData.id = videoLibraryId;
                extraData.videoURL = dataToSave.type === 2 ? dataToSave.videoURL : "";
            }
            if (dataToSave.type === 1) {
                dispatch(
                    addVideoLibraryToDb(convertObjtoFormData({ ...dataToSave, ...extraData }))
                );
            } else {
                dispatch(
                    addVideoLibraryToDb({ ...dataToSave, ...extraData })
                );
            }
            setCurrentSaveAction(saveAction);
        }
    };
    const handleBackClick = () => {
        navigate("/videoLibrary");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Video Library</h3>
                        </Col>
                        <Card>
                            <CardBody>
                                {isLoading && <SpinnerModel />}
                                <Row>
                                    <Col
                                        className="mb-3"
                                        xs={12}
                                        md={{ span: 4, offset: 8 }}
                                        lg={{ span: 3, offset: 9 }}
                                    >
                                        <button
                                            className="btn btn-danger mx-1"
                                            onClick={handleBackClick}
                                        >
                                            Back
                                        </button>
                                        <ButtonDropdown
                                            direction="down"
                                            isOpen={drp_up}
                                            toggle={() => setDrp_up(!drp_up)}
                                        >
                                            <Button
                                                disabled={
                                                    !(
                                                        checkPermission(
                                                            permissionObj,
                                                            pageName,
                                                            PERMISSION_ADD
                                                        ) ||
                                                        checkPermission(
                                                            permissionObj,
                                                            pageName,
                                                            PERMISSION_EDIT
                                                        )
                                                    )
                                                }
                                                id="caret"
                                                color="primary"
                                                onClick={() => {
                                                    handleSaveClick(SAVE_AND_CLOSE);
                                                }}
                                            >
                                                Save & Close
                                            </Button>
                                            <DropdownToggle caret color="primary">
                                                <i className="mdi mdi-chevron-down" />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {checkPermission(
                                                    permissionObj,
                                                    pageName,
                                                    PERMISSION_EDIT
                                                ) && (
                                                        <DropdownItem
                                                            onClick={() => {
                                                                handleSaveClick(SAVE);
                                                            }}
                                                        >
                                                            Save
                                                        </DropdownItem>
                                                    )}
                                                {checkPermission(
                                                    permissionObj,
                                                    pageName,
                                                    PERMISSION_ADD
                                                ) && (
                                                        <DropdownItem
                                                            onClick={() => {
                                                                handleSaveClick(SAVE_AND_NEW);
                                                            }}
                                                        >
                                                            Save & New
                                                        </DropdownItem>
                                                    )}
                                            </DropdownMenu>
                                        </ButtonDropdown>
                                    </Col>
                                </Row>
                                <FormBuilder
                                    ref={finalizeRef}
                                    fields={fields}
                                    editFormData={initialEditData}
                                    onFormDataChange={handleFormBDataChange}
                                />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddVideoLibrary;
