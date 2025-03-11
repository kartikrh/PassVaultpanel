import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Input,
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
  TAB_MATCH_TYPE,
  WARNING,
} from "../../components/Common/Const";
import {
  updateSavedState,
} from "../../Features/Tabs/matchTypeSlice";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import PredictorTable from "./PredictorTable";
import { isEmpty } from "lodash";

const BowlingPredictor = () => {
  const pageName = TAB_MATCH_TYPE;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [id, setId] = useState(+sessionStorage.getItem('bowlingPredictorId') || "0");
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.matchType
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
  }, [permissionObj]);

  useEffect(() => {
    if (isSaved) {
      dispatch(updateSavedState(undefined));
      if (currentSaveAction === SAVE) {
      } else if (currentSaveAction === SAVE_AND_CLOSE) navigate("/matchType");
      else if (currentSaveAction === SAVE_AND_NEW) {
        setInitialEditData({});
        setId("0");
        finalizeRef.current.resetForm();
      }
      setCurrentSaveAction(undefined);
    }
  }, [isSaved]);
  
  const fetchData = async (id) => {
    await axiosInstance
      .post("/admin/matchTypeBowlingPredictor/byMatchType", { matchTypeId: id })
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

  const tableElement = {
    title: "Match Type",
    headerSelect: false,
    switch: false,
    clone: true,
  };

  const columns = [
      {
        title: "Bowlig Type",
        dataIndex: "bowlingType",
        key: "bowlingType",
        style: { width: "50%" },
        sort: false,
      },
      {
        title: "possibility",
        dataIndex: "possibility",
        key: "possibility",
        style: { width: "50%" },
        sort: false,
        render: (text, record) => (
            <div className="d-flex">
              <Input
                type="text"
                style={{
                  width: "70px",
                  border: "solid lightgray 1px",
                  borderRadius: "5px",
                }}
                value={record?.possibility ?? ""}
                onChange={(e) => handleInputChange(e, record)}
              />
            </div>
          ),
          
      },
    ];

  const handleBackClick = () => {
    navigate("/matchType");
  };

  const handleInputChange = (e, record) => {
    const { value } = e.target;
  
    if (!record || !record.bowlingTypeId) {
      console.error("Invalid record in handleInputChange:", record);
      return;
    }
  
    setInitialEditData((prevData) =>
      prevData.map((item) =>
        item.bowlingTypeId === record.bowlingTypeId
          ? { ...item, possibility: value }
          : item
      )
    );
  };
  
  const handleSaveClick = async (saveAction) => {
    try {
  
      if (!initialEditData || initialEditData.length === 0) {
        dispatch(
          updateToastData({
            data: "No data available to save.",
            title: "Error",
            type: ERROR,
          })
        );
        return;
      }
  
      // Ensure all possibility values are valid (not null or empty)
      const isValidData = initialEditData.every(
        (item) => item.possibility !== null && item.possibility !== ""
      );
  
      if (!isValidData) {
        dispatch(
          updateToastData({
            data: "Please fill all possibility fields before saving.",
            title: "Validation Error",
            type: ERROR,
          })
        );
        return;
      }
  
      const payload = {
        matchTypeData: initialEditData.map(({ id, matchTypeId, bowlingTypeId, possibility }) => ({
          id: id ?? 0, // Replace null with 0
          matchTypeId,
          bowlingTypeId,
          possibility: Number(possibility), // Ensure possibility is a number
        })),
      };
  
      const response = await axiosInstance.post(
        `/admin/matchTypeBowlingPredictor/save`,
        payload
      );
  
      if (saveAction === SAVE_AND_CLOSE) {
        navigate("/matchType");
      }
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };
  
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3 className="modal-header-title">{initialEditData?.matchType} Predictor</h3>
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
                {initialEditData && (
                  <PredictorTable
                    ref={finalizeRef}
                    columns={columns}
                    dataSource={initialEditData}
                    tableElement={tableElement}
                    reFetchData={fetchData}
                  />
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default BowlingPredictor;
