import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import {
  ERROR,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_MARKET_TEMPLATE,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import FormBuilder from "../../components/Common/Reusables/FormBuilder";
import { MarketTemplateRunnerFileds } from "../../constants/FieldConst/MarketTemplateRunnerConst";

const MarketTemplateRunner = () => {
  const pageName = TAB_MARKET_TEMPLATE;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Market Template Runner";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [newFormData, setNewFormData] = useState({});
  const [isLineEdited, setIsLineEdited] = useState(false);
  const [marketTemplateId, setMarketTemplateId] = useState(
    +sessionStorage.getItem('marketTemplateRunnerId') || "0"
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (id) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/marketTemplateRunner/getByTemplateId", {
        marketTemplateId: id,
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.marketTemplateRunnerId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.marketTemplateRunnerId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.marketTemplateRunnerId
      );
    } else {
      updateSingleCheck = [...checekedList, e.marketTemplateRunnerId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplateRunner/delete`, {
        marketTemplateRunnerId: checekedList,
      })
      .then((response) => {
        fetchData(marketTemplateId);
        setDeleteModelVisable(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleEdit = async (id) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplateRunner/byId`, {
        marketTemplateRunnerId: id,
      })
      .then((response) => {
        const selectedMarketTemplateRunner = response?.result;
        finalizeRef.current.updateFormFromParent({
          ...selectedMarketTemplateRunner,
        });
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleReset = () => {
    fetchData(marketTemplateId);
    setIsLineEdited(false);
  };
  const handleBackClick = () => {
    navigate("/marketTemplate");
  };
  const onFormDataChange = (newFormData) => {
    if (newFormData?.predefinedValue != newFormData?.line && !isLineEdited) {
      const updatedFormData = { ...newFormData, line: newFormData?.predefinedValue };
      setNewFormData(updatedFormData);
      finalizeRef.current.updateFormFromParent(updatedFormData);
    } else {
      setNewFormData(newFormData);
    }
  };

  const onGenerateClick = async () => {
    try {
      const payload = {
        marketTemplateRunnerId: newFormData?.marketTemplateRunnerId
          ? newFormData.marketTemplateRunnerId
          : 0,
        marketTemplateId: +marketTemplateId,
        runner: newFormData?.runner,
        predefinedValue: newFormData?.predefinedValue,
        line: +newFormData?.line,
        overRate: +newFormData?.overRate,
        underRate: +newFormData?.underRate,
        backPrice: +newFormData?.backPrice,
        layPrice: +newFormData?.layPrice,
        backSize: +newFormData?.backSize,
        laySize: +newFormData?.laySize,
      };
      const dataToSave = finalizeRef.current.finalizeData();
      if (dataToSave) {
        setIsLoading(true);
        const finalData = {
          ...payload,
          ...dataToSave,
        };
        const response = await axiosInstance.post(
          "/admin/marketTemplateRunner/save",
          finalData
        );
        const marketTemplateRunnerData = response?.result;
        setData([...data, marketTemplateRunnerData]);
        fetchData(marketTemplateId);
        finalizeRef.current.resetForm();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching Market Template Runner data:", error);
      setIsLoading(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === "line") {
      setIsLineEdited(true);
    } else if (field === "predefinedValue") {
      setIsLineEdited(false);
    }
  };
  
  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={
              data?.length > 0 &&
              isEqual(checekedList?.sort(), dataIndexList?.sort())
            }
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
            }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.marketTemplateRunnerId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.marketTemplateRunnerId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Id",
      dataIndex: "marketTemplateRunnerId",
      key: "marketTemplateRunnerId",
      style: { width: "5%" },
    },
    {
      title: "Runner",
      dataIndex: "runner",
      key: "runner",
      style: { width: "10%" },
    },
    {
      title: "Predefine",
      dataIndex: "predefinedValue",
      key: "predefinedValue",
      style: { width: "10%" },
    },
    {
      title: "Line",
      dataIndex: "line",
      key: "line",
      style: { width: "10%" },
    },
    {
      title: "Over Rate",
      dataIndex: "overRate",
      key: "overRate",
      style: { width: "10%" },
    },
    {
      title: "Under Rate",
      dataIndex: "underRate",
      key: "underRate",
      style: { width: "10%" },
    },
    {
      title: "No Rate",
      dataIndex: "layPrice",
      key: "layPrice",
      style: { width: "10%" },
    },
    {
      title: "No Point",
      dataIndex: "laySize",
      key: "laySize",
      style: { width: "10%" },
    },
    {
      title: "Yes Rate",
      dataIndex: "backPrice",
      key: "backPrice",
      style: { width: "10%" },
    },
    {
      title: "Yes Point",
      dataIndex: "backSize",
      key: "backSize",
      style: { width: "10%" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Market Template Runner",
    resetButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    if (marketTemplateId !== "0") {
      fetchData(marketTemplateId);
    }
  }, [setMarketTemplateId]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs
            title="ScoreCard"
            breadcrumbItem="Market Template Runner"
          />
          {isLoading && <SpinnerModel />}
          <Row>
            <Col
              className="mb-3"
              xs={12}
              md={{ span: 4, offset: 11 }}
              lg={{ span: 3, offset: 11 }}
            >
              <button className="btn btn-danger mx-1" onClick={handleBackClick}>
                Back
              </button>
            </Col>
          </Row>
          <Card>
            <CardBody>
              <FormBuilder
                ref={finalizeRef}
                fields={MarketTemplateRunnerFileds}
                onFormDataChange={onFormDataChange}
                generateAlias={onGenerateClick}
                handleFieldChange={handleFieldChange}
              />
            </CardBody>
          </Card>
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            reFetchData={fetchData}
            singleCheck={checekedList}
            handleReset={handleReset}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MarketTemplateRunner;
