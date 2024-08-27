import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { PERMISSION_VIEW, TAB_COMMENTARY } from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import "./CommentaryCss.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";

function PredictorApiLogs() {
  const pageName = TAB_COMMENTARY;
  const finalizeRef = useRef(null);
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  let navigate = useNavigate();
  const location = useLocation();
  // const commentaryId = location.state?.commentaryId || "0";
  const commentaryId = +localStorage.getItem('predictorApiLogsCommentaryId') || "0";

  const fetchData = async () => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/commentary/getPredictorlogsById", { commentaryId })
      .then(async (response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.wrId);
        });
        setData(apiData);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (commentaryId !== "0") {
      fetchData(commentaryId);
    }
  }, [commentaryId]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  const columns = [
    {
      title: "Date",
      dataIndex: "wrRequestStartTime",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "wrRequestStartTime",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Endpoint",
      dataIndex: "wrEndpoint",
      key: "wrEndpoint",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Response",
      dataIndex: "wrResponse",
      key: "wrResponse",
      render: (text, record) => {
        // const logObject = text;
        // const logItems =
        //   logObject &&
        //   Object.entries(logObject).map(([key, value]) => (
        //     <span key={key}>
        //       <strong>{key}:</strong>{" "}
        //       {typeof value === "object" ? JSON.stringify(value) : value}{" "}
        //     </span>
        //   ));
        const renderContent = () => {
          if (typeof text === 'string') {
            return <span>{text}</span>;
          }
    
          if (typeof text === 'object' && text !== null) {
            const logItems = Object.entries(text).map(([key, value]) => (
              <span key={key}>
                <strong>{key}:</strong>{" "}
                {typeof value === "object" ? JSON.stringify(value) : value}{" "}
              </span>
            ));
            return <div>{logItems}</div>;
          }
    
          return null;
        };
        return <div>{renderContent()}</div>;
      },
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Request Body",
      dataIndex: "wrRequestBody",
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
        return <div>{logItems}</div>;
      },
      key: "wrRequestBody",
      sort: true,
      style: { width: "20%" },
    },
  ];

  const handleBackClick = () => {
    navigate("/commentary");
  };

  //elements required
  const tableElement = {
    title: "Predictor Logs Api",
    headerSelect: false,
    isActive: false,
    clone: false,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          {isLoading && <SpinnerModel />}

          <Row>
            <Col className="mt-3 mt-lg-4 mt-md-4">
              <Breadcrumbs
                title="Commentary"
                breadcrumbItem="Predictor Api Logs"
              />
            </Col>
            <Col className="mt-3 mt-lg-3 mt-md-3">
              <button
                className="btn btn-danger text-right"
                onClick={handleBackClick}
              >
                Back
              </button>
            </Col>
          </Row>
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            reFetchData={fetchData}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default PredictorApiLogs;
