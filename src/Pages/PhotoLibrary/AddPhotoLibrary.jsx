import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { photoLibraryFields } from "../../constants/FieldConst/PhotoLibraryConst";
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
// import { addPhotoLibraryToDb, updateSavedState } from "../../Features/Tabs/newsSlice";
import { addPhotoLibraryToDb, updateSavedState } from "../../Features/Tabs/photoLibrarySlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission, convertDateForBackend } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { isEmpty } from "lodash";

const AddPhotoLibrary = () => {
    const pageName = TAB_PHOTOLIBRARY;
    const finalizeRef = useRef(null);
    const [drp_up, setDrp_up] = useState(false);
    const [initialEditData, setInitialEditData] = useState(undefined);
    const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
    const { isSaved, isLoading } = useSelector((state) => state.tabsData.photoLibrary);
    const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
    const dateType = useSelector((state) => state.layout.dateType);
    const dispatch = useDispatch();
    let navigate = useNavigate();
    const location = useLocation();
    const [photoLibraryId, setPhotoLibraryId] = useState(location.state?.photoLibraryId || 0);
    const [fields, setFields] = useState(photoLibraryFields || [])
    const [masterData, setMasterData] = useState({});
    useEffect(() => {
        if (photoLibraryId !== 0) {
            fetchData(photoLibraryId);
        }
    }, [photoLibraryId]);

    useEffect(() => {
        if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
            navigate("/dashboard");
        }
        fetchMasterData();
    }, [permissionObj]);

    useEffect(() => {
        if (isSaved) {
            dispatch(updateSavedState(undefined));
            if (currentSaveAction === SAVE_AND_CLOSE) {
                navigate("/photoLibrary");
            } else if (currentSaveAction === SAVE_AND_NEW) {
                setInitialEditData({});
                setPhotoLibraryId("0");
                finalizeRef.current.resetForm();
            }
            setCurrentSaveAction(undefined);
        }
    }, [isSaved]);

    const fetchData = async (photoLibraryId) => {
        await axiosInstance
            .post("/admin/photoLibrary/byId", { photoLibraryId })
            .then((response) => {
                // setInitialEditData(response?.result);
                const data = response?.result;

                setInitialEditData({
                    ...data,
                    whitelabelId: data?.whitelabelId?.map((item) => item.id),
                    startDate: data?.startDate ? convertDateForBackend(data.startDate, dateType) : null,
                    endDate: data?.endDate ? convertDateForBackend(data.endDate, dateType) : null,
                });
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

    const fetchMasterData = async () => {
        await axiosInstance
            .post("/admin/whitelabel/all", { isActive: true })
            .then((response) => {
                setMasterData((preData) => ({
                    ...preData,
                    whitelabelId: response.result?.map((item) => {
                        return { label: item.domain, value: item.id };
                    }),
                }));
            })
            .catch((error) => {
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
    };

    const handleFormBDataChange = (val) => {
        if (val?.isPermanent) {
            const filteredFields = photoLibraryFields.filter(obj => obj.name !== "startDate" && obj.name !== "endDate")
            setFields(filteredFields)
        } else if (!val?.isPermanent) {
            setFields(photoLibraryFields)
        }
    };

    const handleSaveClick = async (saveAction) => {
        let dataToSave = finalizeRef.current.finalizeData();
            // if(dataToSave.isPermanent){
            //     dataToSave = {
            //         SEO : dataToSave.SEO,
            //         title : dataToSave.title,
            //         description : dataToSave.description,
            //         isPermanent : dataToSave.isPermanent,
            //         isActive: !!dataToSave?.isActive,
            //         whitelabelId : dataToSave?.whitelabelId,
            //         commentaryId : dataToSave?.commentaryId,
            //         startDate : null,
            //         endDate : null
            //     }
            // }
        if (dataToSave) {
            const extraData = {
                photoLibraryId: photoLibraryId,
                isPermanent: !!dataToSave?.isPermanent,
                startDate: !dataToSave.isPermanent ? convertDateForBackend(dataToSave?.startDate, dateType) : null,
                endDate: !dataToSave.isPermanent ? convertDateForBackend(dataToSave?.endDate, dateType) : null,
            };
            dispatch(
                addPhotoLibraryToDb({ ...dataToSave, ...extraData })
            );
            setCurrentSaveAction(saveAction);
        }
    };
    const handleBackClick = () => {
        navigate("/photoLibrary");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Row>
                        <Col xs={12} md={8} lg={9}>
                            <h3 className="modal-header-title">Photo Library</h3>
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
                                    masterData={masterData}
                                />
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddPhotoLibrary;
