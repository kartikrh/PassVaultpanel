import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { photoFields } from "../../constants/FieldConst/PhotoLibraryConst";
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
    TAB_PHOTOLIBRARY,
} from "../../components/Common/Const";
import { addPhotoToDb, updateSavedState } from "../../Features/Tabs/photosSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const AddPhotos = () => {
    const pageName = TAB_PHOTOLIBRARY;
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading } = useSelector((state) => state.tabsData.photos);
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [PhotosId, setPhotosId] = useState(location.state?.PhotosId || 0);
    const [fields, setFields] = useState(photoFields || [])
    const id = localStorage.getItem("photoLibraryId")
    useEffect(() => {
        if (PhotosId !== 0) {
            fetchData(PhotosId);
        }
    }, [PhotosId]);

    useEffect(() => {
        if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard");
        }
    }, []);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined));
            if (currentSaveAction === SAVE_AND_CLOSE) {
                navigate("/photos");
            } else if (currentSaveAction === SAVE_AND_NEW) {
                setInitialEditData({});
                setPhotosId("0");
                finalizeRef.current.resetForm();
            }
            setCurrentSaveAction(undefined);
        }
    }, [isSaved]);

    const fetchData = async (PhotosId) => {
        await axiosInstance
            .post("/admin/libraryImages/byId", { id: PhotosId })
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

    const handleSaveClick = async (saveAction) => {
        const dataToSave = finalizeRef.current.finalizeData();
        if (dataToSave) {
            const extraData = {
                id : PhotosId,
                photoLibraryId: id
            };
            dispatch(
                addPhotoToDb(convertObjtoFormData({ ...dataToSave, ...extraData }))
            );
            setCurrentSaveAction(saveAction);
        }
    };
    const handleBackClick = () => {
        navigate("/photos");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3>Photo</h3>
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
                                    fields={photoFields}
                                    editFormData={initialEditData}
                                    // onFormDataChange={handleFormBDataChange}
                                />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddPhotos;
