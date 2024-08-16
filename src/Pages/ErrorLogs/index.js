import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  PERMISSION_VIEW,
  TAB_ERROR_LOGS,
} from "../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import RequestModal from "./RequestModal";

const Index = () => {
  const pageName = TAB_ERROR_LOGS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Error Logs";
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [reqModelVisible, setReqModelVisible] = useState(false);
  const [reqBodyData, setReqBodyData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const navigate = useNavigate();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/log/errorLogs`, {
        ...(latestValueFromTable || tableActions),
        ...dateRange,
      })
      .then((response) => {
        const logsData = response?.result?.data;
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.errId);
        });
        setData(logsData);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  //table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "createdDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Err Message",
      dataIndex: "errMessage",
      key: "errMessage",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Err Stack",
      dataIndex: "errStack",
      key: "errStack",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "UserId",
      dataIndex: "userId",
      key: "userId",
      sort: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Api",
      dataIndex: "api",
      key: "api",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Request Body",
      dataIndex: "requestBody",
      render: (text, record) => {
        const logObject = text;
        const logItems =
          logObject &&
          Object.entries(logObject).map(([key, value]) => (
            <span key={key}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : value}{" "}
            </span>
          ));
        return <div 
        onClick={() => {
          setReqModelVisible(true);
          setReqBodyData(record?.requestBody);
        }}
        style={{ 
          display: 'inline-block', 
          maxWidth: '400px',
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>{logItems}</div>;
      },
      key: "requestBody",
      sort: true,
      style: { width: "20%" },
    }
  ];
  //elements required
  const tableElement = {
    title: "Error Logs",
    dateRange: true
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Error Logs" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            setDateRange={setDateRange}
            dateRange={dateRange}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
          {reqModelVisible && (
            <RequestModal
              isOpen={reqModelVisible}
              toggle={() => setReqModelVisible(!reqModelVisible)}
              data={reqBodyData}
              fetchData={fetchData}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
