import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  ERROR,
  PERMISSION_VIEW,
  TAB_EVENT_MARKETS,
} from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { isEqual } from "lodash";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import LogDataModel from '../../components/Model/LogDataModel'

function MarketDataLogs() {
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
  const [logData, setLogData] = useState([])
  const [logModelVisable, setLogModelVisable] = useState(false);

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
      .post("/admin/eventMarket/getDSReport", { eventMarketId: id })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.marketDataLogId);
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.marketDataLogId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.marketDataLogId
      );
    } else {
      updateSingleCheck = [...checekedList, e.marketDataLogId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleLog = async (data) => {
    setLogData(data)
    setLogModelVisable(true)
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
            checked={checekedList.includes(record.marketDataLogId)}
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
      dataIndex: "marketDataLogId",
      key: "marketDataLogId",
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
      title: "Log",
      dataIndex: "data",
      key: "data",
      render: (text, record) => (
        <span style={{ cursor: "pointer", }} onClick={()=>{handleLog(text)}}>
          <i className="fas fa-eye"></i>
        </span>
      ),
      style: { width: "5%"},
      sort: true,
    },
  ];
  const tableElement = {
    title: "Market Data Logs",
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
           <LogDataModel
            logModelVisable={logModelVisable}
            setLogModelVisable={setLogModelVisable}
            logData = {logData}
            handleLog={handleLog}
            />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default MarketDataLogs;
