import React, { useEffect, useState } from "react";
import { CardHeader, Col, Container, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import { ERROR } from "../../components/Common/Const";
import axiosInstance from "../../Features/axios";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";

function MarketLogs() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const eventMarketId = +sessionStorage.getItem('eventMarketLogId') || "0";
  const marketDetails = JSON.parse(sessionStorage.getItem('eventMarketLogDetails') || "{}");

  useEffect(() => {
    if (eventMarketId !== "0") {
      fetchData(eventMarketId);
    }
  }, [eventMarketId]);

  const fetchData = async (eventMarketId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/eventMarket/getSLReport", { eventMarketId })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.logId);
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

  const columns = [
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
      dataIndex: "logId",
      key: "logId",
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
      title: "Action",
      dataIndex: "actionType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{mapActionType(text)}</span>
      ),
      key: "actionType",
      style: { width: "5%" },
    },
    {
      title: "Action Value",
      dataIndex: "value",
      key: "value",
      style: { width: "5%" },
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      style: { width: "5%" },
    },
  ];
  const MarketDetailsDate = marketDetails?.eventDate
    ? convertDateUTCToLocal(marketDetails.eventDate, "index")
    : "";
  const tableElement = {
    title: `${marketDetails?.eventTypeName}/ ${marketDetails?.competitionName}/ ${marketDetails?.eventName}/ Ref: ${marketDetails?.eventRefId} [${MarketDetailsDate}]`,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="EventMarket" breadcrumbItem="Market Logs" />
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
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default MarketLogs;
