import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  ERROR,
  PERMISSION_VIEW,
  TAB_EVENT_MARKETS,
} from "../../components/Common/Const";
import axiosInstance from "../../Features/axios";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { isEqual } from "lodash";
import Breadcrumbs from "../../components/Common/Breadcrumb";

function MarketLogs() {
  const pageName = TAB_EVENT_MARKETS;
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState(location.state?.userId || "0");
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  useEffect(() => {
    if (id !== "0") {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (id) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/eventMarket/getSLReport", { eventMarketId: id })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.logId);
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

  const handleBackClick = () => {
    navigate("/eventMarkets");
  };

  function mapActionType(status) {
    switch (parseInt(status)) {
      case 1:
        return "isresultSet";
      case 2:
        return "setResult";
      case 3:
        return "marketCancel";
      case 4:
        return "closeMarket";
      case 5: 
        return "closeMarketOnTossWin";
      default:
        return "-";
    }
  }

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.logId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.logId);
    } else {
      updateSingleCheck = [...checekedList, e.logId];
    }
    setCheckedList(updateSingleCheck);
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
            checked={checekedList.includes(record.logId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "createdDate",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Id",
      dataIndex: "logId",
      key: "logId",
      style: { width: "5%" },
      sort: true,
    },
    {
      title: "Market Name",
      dataIndex: "marketName",
      key: "marketName",
      style: { width: "10%" },
    },
    {
      title: "Action",
      dataIndex: "actionType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{mapActionType(text)}</span>
      ),
      key: "actionType",
      style: { width: "10%" },
    },
    {
      title: "Action Value",
      dataIndex: "value",
      key: "value",
      style: { width: "10%" },
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      style: { width: "10%" },
    },
  ];
  const tableElement = {
    title: "Market Logs",
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="EventMarket" breadcrumbItem="Market Data Logs" />
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
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
            singleCheck={checekedList}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default MarketLogs;
