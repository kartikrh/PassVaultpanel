import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { MatchTypePredictorFields } from "../../constants/FieldConst/MatchTypePredictorConst";
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
} from "../../components/Common/Const";
import {
  addMatchTypeToDb,
  updateSavedState,
} from "../../Features/Tabs/matchTypeSlice";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import PredictorTable from "./PredictorTable";

const MatchTypePredictor = () => {
  const pageName = TAB_MATCH_TYPE;
  const finalizeRef = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [disabledFields, setDisabledFields] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const [masterData, setMasterData] = useState({});
  const [predictorData, setPredictorData] = useState([]);
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.matchType
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState(location.state?.userId || "0");
  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    const generateOversAndBallsData = async () => {
      try {
        const oversAndBallsData = [];

        const ballsPerOver = initialEditData?.ballsPerOver;
        const oversPerMatch = initialEditData?.oversPerInings;

        for (let i = 1; i <= oversPerMatch; i++) {
          for (let j = 1; j <= ballsPerOver; j++) {
            oversAndBallsData.push({
              over: i,
              ball: `${i - 1}.${j}`,
              runPerBall: null,
              order: oversAndBallsData.length + 1,
            });
          }
        }
        const response = await axiosInstance.post(
          "/admin/matchTypePredictor/getByMatchTypeId",
          { matchTypeId: id }
        );
        const predictorData = response?.result?.predictorData || [];

        const updatedData = oversAndBallsData.map((item) => {
          const predictorItem = predictorData.find(
            (predictor) => predictor.order === item.order
          );
          if (predictorItem) {
            return {
              ...item,
              runPerBall:
                predictorItem.runPerBall === 0
                  ? null
                  : predictorItem.runPerBall,
            };
          }
          return item;
        });
        setData(updatedData);
      } catch (error) {
        console.error("Error fetching predictor data:", error);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      }
    };

    generateOversAndBallsData();
  }, [initialEditData?.oversPerInings]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

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
      .post("/admin/matchType/byId", { matchTypeId: id })
      .then((response) => {
        let newData = {};
        if (!response?.result?.isLimitedOvers) {
          newData = { ...response?.result, oversPerInings: null, balls: 6 };
        } else {
          newData = { ...response?.result, balls: 6 };
        }
        setInitialEditData(newData);
        if (response?.result?.isLimitedOvers) {
          setDisabledFields({ generate: true });
        } else {
          setDisabledFields({ generate: false });
        }
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
    try {
      const isValidData = data.every(
        (item) => item.runPerBall !== null && item.runPerBall !== ""
      );

      if (isValidData) {
        const payload = {
          matchTypeId: id,
          predictorData: data,
        };
        const response = await axiosInstance.post(
          `/admin/matchTypePredictor/save`,
          payload
        );

        console.log("Save & Close successful:", response);
        if (saveAction === SAVE_AND_CLOSE) {
          navigate("/matchType");
        }
      }
    } catch (error) {
      console.error("Error saving data:", error);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const handleBackClick = () => {
    navigate("/matchType");
  };

  const handleInputChange = (e, order) => {
    const newValue = e.target.value;
    const updatedData = data.map((item) => {
      if (item.order === order) {
        return { ...item, runPerBall: newValue };
      }
      return item;
    });
    setData(updatedData);
  };

  const columns = [
    {
      title: "Over",
      dataIndex: "over",
      key: "over",
      style: { width: "30%" },
      sort: false,
    },
    {
      title: "Ball",
      dataIndex: "ball",
      key: "ball",
      style: { width: "30%" },
      sort: false,
    },
    {
      title: "Run Per Ball",
      dataIndex: "runPerBall",
      key: "runPerBall",
      style: { width: "40%" },
      sort: false,
      render: (text, record) => (
        <div className="d-flex">
          <Input
            type="text"
            style={{
              width: "50px",
              border: "solid lightgray 1px",
              borderRadius: "5px",
            }}
            value={record.runPerBall}
            onChange={(e) => handleInputChange(e, record.order)}
            invalid={!record.runPerBall || +record.runPerBall === 0}
          />
        </div>
      ),
    },
  ];
  const onFormDataChange = (newFormData) => {
    setNewFormData(newFormData);
  };

  const onGenerateClick = async () => {
    try {
      const oversAndBallsData = [];

      const ballsPerOver = newFormData?.ballsPerOver;
      const oversPerMatch = newFormData?.oversPerInings;

      for (let i = 1; i <= oversPerMatch; i++) {
        for (let j = 1; j <= ballsPerOver; j++) {
          oversAndBallsData.push({
            over: i,
            ball: `${i - 1}.${j}`,
            runPerBall: null,
            order: oversAndBallsData.length + 1,
          });
        }
      }
      const response = await axiosInstance.post(
        "/admin/matchTypePredictor/getByMatchTypeId",
        { matchTypeId: id }
      );
      const predictorData = response?.result?.predictorData || [];

      const updatedData = oversAndBallsData.map((item) => {
        const predictorItem = predictorData.find(
          (predictor) => predictor.order === item.order
        );
        if (predictorItem) {
          return {
            ...item,
            runPerBall:
              predictorItem.runPerBall === 0 ? null : predictorItem.runPerBall,
          };
        }
        return item;
      });
      setData(updatedData);
    } catch (error) {
      console.error("Error fetching predictor data:", error);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const tableElement = {
    title: "Match Type",
    headerSelect: false,
    switch: false,
    clone: true,
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Col xs={12} md={8} lg={9}>
              <h3>{initialEditData?.matchType} Predictor</h3>
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
                  fields={MatchTypePredictorFields}
                  editFormData={initialEditData}
                  masterData={masterData}
                  generateAlias={onGenerateClick}
                  onFormDataChange={onFormDataChange}
                  disabledFields={disabledFields}
                />
                {initialEditData && (
                  <PredictorTable
                    ref={finalizeRef}
                    columns={columns}
                    dataSource={data}
                    tableElement={tableElement}
                    reFetchData={fetchData}
                    singleCheck={checekedList}
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

export default MatchTypePredictor;
