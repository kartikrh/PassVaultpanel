import React, { useEffect, useState } from "react";
import { CardHeader, Col, Container, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import { ERROR } from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";

function MarketDataLogs() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const eventMarketId = +localStorage.getItem("EventMarketDataLogId") || "0";
  const [marketDetails, setMarketDetails] = useState(null);

  useEffect(() => {
    if (eventMarketId !== "0") {
      fetchData(eventMarketId);
      fetchMarketData(eventMarketId);
    }
  }, [eventMarketId]);

  const fetchData = async (eventMarketId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/eventMarket/getDSReport", { eventMarketId })
      .then((response) => {
        const apiData = response?.result;
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

  const fetchMarketData = async (id) => {
    await axiosInstance
      .post("/admin/eventMarket/byId", { eventMarketId: id })
      .then((response) => {
        setMarketDetails(response?.result);
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
        const logObject = JSON.parse(text)[0];
        const logItems = Object.entries(logObject).map(([key, value]) => (
          <>
            <strong>{key}:</strong> {value}
            {", "}
          </>
        ));
        return <div>{logItems}</div>;
      },
      key: "data",
      style: { width: "10%" },
    },
  ];
  const MarketDetailsDate = convertDateUTCToLocal(
    marketDetails?.eventDate,
    "index"
  );
  const tableElement = {
    title: `${marketDetails?.eventTypeName}/ ${marketDetails?.competitionName}/ ${marketDetails?.eventName}/ Ref: ${marketDetails?.eventRefId} [${MarketDetailsDate}]`,
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
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default MarketDataLogs;
