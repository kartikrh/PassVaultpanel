import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import * as XLSX from "xlsx";

const MatchTypePredictor = () => {
  const pageName = TAB_MATCH_TYPE;
  const finalizeRef = useRef(null);
  const finalizeRefTable = useRef(null);
  const [drp_up, setDrp_up] = useState(false);
  const [initialEditData, setInitialEditData] = useState(undefined);
  const [data, setData] = useState([]);
  const [disabledFields, setDisabledFields] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [currentSaveAction, setCurrentSaveAction] = useState(undefined);
  const { isSaved, isLoading, error } = useSelector(
    (state) => state.tabsData.matchType
  );
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const [id, setId] = useState(+sessionStorage.getItem('matchTypePredictorId') || "0");
  const [predictorData, setPredictorData] = useState([]);

  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    const generateOversAndBallsData = async () => {
      try {
        if (!initialEditData) return;

        const oversAndBallsData = [];

        const ballsPerOver = initialEditData?.ballsPerOver;
        const formOvers = initialEditData?.isLimitedOvers ? initialEditData?.oversPerInings : initialEditData?.maxOversInFirstInings;

        const predictorMaxOver = predictorData?.length > 0
          ? Math.max(...predictorData.map(p => Number(p.over)))
          : 0;

        const oversPerMatch = Math.max(formOvers || 0, predictorMaxOver || 0);

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

        const updatedData = oversAndBallsData.map((item) => {
          const predictorItem = predictorData.find(p => p.order === item.order);
          return {
            ...item,
            runPerBall: predictorItem?.runPerBall === 0 ? null : predictorItem?.runPerBall ?? null,
          };
        });
        setData(updatedData);
      } catch (error) {
        console.error("Error generating overs and balls data:", error);
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
  }, [initialEditData?.oversPerInings, predictorData]);

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
    try {
      const response = await axiosInstance.post("/admin/matchTypePredictor/getByMatchTypeId", {
        matchTypeId: id,
      });

      const result = response?.result || {};
      const predictorList = result?.predictorData || [];

      const predictorMaxOver = predictorList.length > 0
        ? Math.max(...predictorList.map(p => Number(p.over)))
        : 0;
      
      const oversPerIningsData = predictorMaxOver > 0
          ? predictorMaxOver
          : result?.isLimitedOvers
            ? result?.oversPerInings
            : result?.maxOversInFirstInings;

      const newData = {
        ...result,
        oversPerInings: oversPerIningsData,
        balls: 6,
      };
      setInitialEditData(newData);
      setPredictorData(result?.predictorData || []);

      setDisabledFields({ generate: result?.isLimitedOvers });
    } catch (error) {
      dispatch(updateToastData({
        data: error?.message,
        title: error?.title,
        type: ERROR,
      }));
    }
  };
  const handleSaveClick = async (saveAction) => {
    try {
      const isValidData = data.every(
        (item) => item.runPerBall !== null && item.runPerBall !== ""
      );
      if (!isValidData) {
        dispatch(
          updateToastData({
            data: "Please enter Run Per Ball for all overs and balls before saving.",
            title: "Match Type Predictor Error",
            type: ERROR,
          })
        );
        return;
      }

      if (isValidData) {
        const payload = {
          matchTypeId: id,
          predictorData: data,
        };
        const response = await axiosInstance.post(
          `/admin/matchTypePredictor/save`,
          payload
        );

        // console.log("Save & Close successful:", response);
        if(response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage = response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        }
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
              width: "70px",
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

      const updatedData = oversAndBallsData.map((item) => {
        const predictorItem = predictorData.find(p => p.order === item.order);
        return {
          ...item,
          runPerBall: predictorItem?.runPerBall === 0 ? null : predictorItem?.runPerBall ?? null,
        };
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

  const handleExport = () => {
    const exportData = data.map((row) => ({
      Order: row.order,
      Over: row.over,
      Ball: row.ball,
      RunPerBall: row.runPerBall,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Predictor");

    XLSX.writeFile(wb, "match_type_predictor.xlsx");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) return;

      const importedData = rows.map((r, index) => ({
        over: Number(r.Over),
        ball: r.Ball,
        runPerBall:
          r.RunPerBall === "" || r.RunPerBall === 0 ? null : r.RunPerBall,
        order: Number(r.Order ?? index + 1),
      }));

      setData(importedData);

      const maxOver = Math.max(...importedData.map((i) => i.over));
      finalizeRef.current?.updateFormFromParent({
        oversPerInings: maxOver,
      });
    };

    reader.readAsBinaryString(file);
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
                <FormBuilder
                  ref={finalizeRef}
                  fields={MatchTypePredictorFields}
                  editFormData={initialEditData}
                  generateAlias={onGenerateClick}
                  onFormDataChange={onFormDataChange}
                  disabledFields={disabledFields}
                  onExport={handleExport}
                  onImport={handleImport}  
                />
                {initialEditData && (
                  <PredictorTable
                    ref={finalizeRefTable}
                    columns={columns}
                    dataSource={data}
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

export default MatchTypePredictor;
