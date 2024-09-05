import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { PERMISSION_VIEW, TAB_SCORING_LOGS } from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import "./CommentaryCss.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";

function ScoringLogs() {
  const pageName = TAB_SCORING_LOGS;
  const finalizeRef = useRef(null);
  const [data, setData] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  let navigate = useNavigate();
  const location = useLocation();
  // const commentaryId = location.state?.commentaryId || "0";
  const commentaryId = +localStorage.getItem('scoringLogsCommentaryId') || "0";

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    let payload = {
      ...(latestValueFromTable || tableActions),
      page: currentPage+1,
      limit: pageSize,
      commentaryId: commentaryId
    }
    await axiosInstance
      .post("/admin/commentaryScoringLogs/all", payload)
      .then(async (response) => {
        const apiData = response?.result?.data;
        console.log("apiData",apiData);
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.id);
        });
        setData(apiData);
        setTotal(response?.result?.totalPages || 0);
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
  }, [commentaryId, currentPage, pageSize]);

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
  }, []);

  const columns = [
    {
      title: "Commentary Id",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "15%" },
    },
    {
      title: "User Id",
      dataIndex: "userId",
      key: "userId",
      sort: true,
      style: { width: "15%" },
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "70%" },
    },
  ];

  const handleBackClick = () => {
    navigate("/commentary");
  };

  //elements required
  const tableElement = {
    title: "Scoring Logs",
    headerSelect: false,
    isActive: false,
    clone: false,
    isServerPagination: true,
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
                breadcrumbItem="Scoring Logs"
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
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={setCurrentPage}
            setServerPageSize={setPageSize}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default ScoringLogs;
