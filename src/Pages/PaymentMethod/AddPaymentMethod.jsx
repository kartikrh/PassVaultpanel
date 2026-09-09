import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { getPaymentMethodFieldsForType } from "../../constants/FieldConst/PaymentMethodConst";
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
  TAB_PAYMENT_METHOD,
} from "../../components/Common/Const";
import { addPaymentMethodToDb, updateSavedState } from "../../Features/Tabs/paymentMethodSlice";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { convertObjtoFormData } from "../../components/Common/utilities";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { isEmpty } from "lodash";

const AddPaymentMethod = () => {
  const pageName = TAB_PAYMENT_METHOD;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading } = useSelector((state) => state.tabsData.paymentMethod);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [paymentMethodId, setPaymentMethodId] = useState(location.state?.paymentMethodId || "0");
  const [fields, setFields] = useState(getPaymentMethodFieldsForType());

  useEffect(() => {
    if (paymentMethodId !== "0" && paymentMethodId !== 0) {
      fetchData(paymentMethodId);
    }
  }, [paymentMethodId]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
  }, [permissionObj]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE_AND_CLOSE) {
        navigate("/paymentMethod");
      } else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setPaymentMethodId("0");
        setFields(getPaymentMethodFieldsForType());
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);

  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/paymentMethod/byId", { id })
      .then((response) => {
        const result = response?.result;
        setInitialEditData(result);
        if (result?.type) {
          setFields(getPaymentMethodFieldsForType(result.type));
        }
      })
      .catch((error) => {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  // Swaps the visible field set as soon as the admin picks QR vs Bank
  // Transfer -- same technique AddPackage.jsx uses for isPermanent's
  // startDate/endDate.
  const handleFormBDataChange = (val) => {
    setFields(getPaymentMethodFieldsForType(val?.type));
  };

  const handleSaveClick = async (saveAction) => {
    const dataToSave = finalizeRef.current.finalizeData();
    if (dataToSave) {
      dispatch(addPaymentMethodToDb(convertObjtoFormData({ ...dataToSave, id: paymentMethodId })));
      setCurrentSaveAction(saveAction);
    }
  };
  const handleBackClick = () => {
    navigate("/paymentMethod");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">Payment Method</h3>
            </Col>
            <Card>
              <CardBody>
                {isLoading && <SpinnerModel />}
                <Row>
                  <Col className="mb-3" xs={12} md={{ span: 4, offset: 8 }} lg={{ span: 3, offset: 9 }}>
                    <button className="btn btn-danger mx-1" onClick={handleBackClick}>
                      Back
                    </button>
                    <ButtonDropdown direction="down" isOpen={drp_up} toggle={() => setDrp_up(!drp_up)}>
                      <Button
                        disabled={
                          !(
                            checkPermission(permissionObj, pageName, PERMISSION_ADD) ||
                            checkPermission(permissionObj, pageName, PERMISSION_EDIT)
                          )
                        }
                        id="caret"
                        color="primary"
                        onClick={() => handleSaveClick(SAVE_AND_CLOSE)}
                      >
                        Save & Close
                      </Button>
                      <DropdownToggle caret color="primary">
                        <i className="mdi mdi-chevron-down" />
                      </DropdownToggle>
                      <DropdownMenu>
                        {checkPermission(permissionObj, pageName, PERMISSION_EDIT) && (
                          <DropdownItem onClick={() => handleSaveClick(SAVE)}>Save</DropdownItem>
                        )}
                        {checkPermission(permissionObj, pageName, PERMISSION_ADD) && (
                          <DropdownItem onClick={() => handleSaveClick(SAVE_AND_NEW)}>Save & New</DropdownItem>
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

export default AddPaymentMethod;
