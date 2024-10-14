import React, { useEffect, useState } from "react";
import { CardHeader, Col, Container, Row, Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { ERROR } from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Tooltip } from "antd";

function MarketDataLogs() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const eventMarketId = +sessionStorage.getItem('eventMarketDataLogId') || "0";
  const marketDetails = JSON.parse(sessionStorage.getItem('eventMarketDataLogDetails') || "{}");

  const fetchData = async (eventMarketId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/eventMarket/getDSReport", { 
        eventMarketId,
        page: currentPage+1,
        limit: pageSize,
      })
      .then((response) => {
        setTotal(response?.result?.totalRecords || 0); 
        const apiData = response?.result?.data;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.marketDataLogId);
        });
        setData(apiData);
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

  const fetchmMarketTypeCategoryId = async (id) => {
    await axiosInstance
      .post("/admin/eventMarket/getMarketTypeCategory", { marketTypeCategoryId: id })
      .then((response) => {
        if(response?.result[0]?.categoryName){
          setCategory(response?.result[0]?.displayName)
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

  useEffect(() => {
    if (eventMarketId !== "0") {
      fetchData(eventMarketId);
    }
  }, [eventMarketId, currentPage, pageSize]);

  useEffect(() => {
    if(marketDetails?.marketTypeCategoryId) {
    fetchmMarketTypeCategoryId(marketDetails?.marketTypeCategoryId);
    }
  }, [marketDetails?.marketTypeCategoryId]);

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Open";
      case 2:
        return "Inactive";
      case 3:
        return "Suspend";
      case 4:
        return "Close";
      case 5:
        return "Settled";
      case 6:
        return "Cancel";
      case 7:
        return "NotOpen";
      default:
        return "Unknown";
    }
  };

  const columns = marketDetails?.marketName?.toLowerCase() !== "match odds" ? [
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text) => <span style={{ cursor: "pointer" }}>{convertDateUTCToLocal(text, "index")}</span>,
      key: "createdDate",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "5%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Event Market"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Bet Allow",
      key: "isAllow",
      render: (text, record) => (
      <Tooltip title={"Allow/Disable Event Market"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isAllow ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
        >
          <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Lay Price",
      dataIndex: "layPrice",
      key: "layPrice",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Lay Size",
      dataIndex: "laySize",
      key: "laySize",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Back Price",
      dataIndex: "backPrice",
      key: "backPrice",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Back Size",
      dataIndex: "backSize",
      key: "backSize",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Line",
      dataIndex: "line",
      key: "line",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Over Rate",
      dataIndex: "overRate",
      key: "overRate",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Under Rate",
      dataIndex: "underRate",
      key: "underRate",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Created By",
      dataIndex: "userName",
      key: "userName",
      style: { width: "5%", textAlign: "center" },
    },
  ] : [
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "createdDate",
      style: { width: "5%" },
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
      style: { width: "5%" },
    },
    {
      title: "Log",
      dataIndex: "data",
      render: (text, record) => {
        const logObject = JSON.parse(text);
        const logItems = logObject && Object.entries(logObject).map(([key, value]) => (
          <span key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object" ? JSON.stringify(value) : value}{" "}
          </span>
        ));
        return <div>{logItems}</div>;
      },
      key: "data",
      style: { width: "10%" },
    },
  ];

  const MarketDetailsDate = marketDetails?.eventDate
    ? convertDateUTCToLocal(marketDetails.eventDate, "index")
    : "";

  const tableElement = {
    title: `${marketDetails?.eventTypeName}/ ${marketDetails?.competitionName}/ ${marketDetails?.eventName}/ Ref: ${marketDetails?.eventRefId} [${MarketDetailsDate}]`,
    isServerPagination: true,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="EventMarket" breadcrumbItem="Market Data Logs" />
          {isLoading && <SpinnerModel />}
          <CardHeader>
            <Row className="g-2">
              {marketDetails && (
                <Col className="col-sm-auto">
                  <div className="match-details-breadcrumbs">{`${marketDetails?.eventTypeName}/ ${marketDetails?.competitionName}/ ${marketDetails?.eventName}`}</div>
                  <div>{`Ref: ${marketDetails.eventRefId} [
                      ${MarketDetailsDate}
                    ]`}</div>
                </Col>
              )}
            </Row>
          </CardHeader>
          <Table
            columns={columns}
            dataSource={data.map((item) => {
              if (category === "Session") {
                const logObject = item?.data && JSON.parse(item.data);
                return {
                  ...item,
                  status: logObject?.status,
                  isActive: logObject?.isActive,
                  isAllow: logObject?.isAllow,
                  layPrice: logObject?.runner?.[0]?.layPrice || "",
                  laySize: logObject?.runner?.[0]?.laySize || "",
                  backPrice: logObject?.runner?.[0]?.backPrice || "",
                  backSize: logObject?.runner?.[0]?.backSize || "",
                  line: logObject?.runner?.[0]?.line || "",
                  overRate: logObject?.runner?.[0]?.overRate || "",
                  underRate: logObject?.runner?.[0]?.underRate || "",
                };
              }
              return item;
            })}
            tableElement={tableElement}
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

export default MarketDataLogs;
