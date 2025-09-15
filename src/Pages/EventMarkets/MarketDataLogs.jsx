import React, { useEffect, useRef, useState } from "react";
import { CardHeader, Col, Container, Row, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import Table from "../../components/Common/Table";
import axiosInstance from "../../Features/axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useNavigate } from "react-router-dom";
import {
  checkPermission,
  convertDateUtcFormat,
  convertDateUTCToLocal2,
} from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import NestedTable from "./NestedTable";
import { Tooltip } from "antd";
import { isEmpty, isEqual } from "lodash";
import CheckBackLayPrice from "./CheckBackLayPrice";
import {
  PERMISSION_VIEW,
  TAB_EVENT_MARKETS,
  TAB_MARKET_DATA_LOGS,
} from "../../components/Common/Const";
import { loadInit } from "../../config";
import axios from "axios";

function MarketDataLogs() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const pageName = TAB_EVENT_MARKETS;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Market Data Logs";
  const [category, setCategory] = useState(null);
  const [checekedList, setCheckedList] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const marketTypeObj = useSelector(
    (state) => state.marketType?.marketTypeList
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dateModelVisable, setDateModelVisable] = useState(false);
  const [datePriceValues, setDatePriceValues] = useState([]);
  const [dateType, setDateType] = useState({
    label: "Local Timezone",
    value: 1,
  });
  const [isSearch, setIsSearch] = useState(true);
  const eventMarketId = +sessionStorage.getItem("eventMarketDataLogId") || "0";
  const marketDetails = JSON.parse(
    sessionStorage.getItem("eventMarketDataLogDetails") || "{}"
  );
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  let wrongRateRqstUrl = loadInitData.find(item => item.key === loadInit.WRONGRATEREQUESTURL)?.value;
  let wrongRateRqstKey = loadInitData.find(item => item.key === loadInit.WRONGRATEREQUESTXKEY)?.value;

  const userDetails = JSON.parse(localStorage.getItem("userData") || "{}")

  // useEffect(() => {
  //   if(!isEmpty(marketDetails)){
  //     document.title = `${marketDetails.eventRefId} - ${marketDetails.eventName} logs`;
  //   }
  // }, [marketDetails])

  const finalizeRef = useRef(null);
  const navigate = useNavigate();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions;
    await axiosInstance
      .post("/admin/eventMarket/getDSReport", {
        ...data,
        eventMarketId,
        page: currentPage == 0 ? 1 : currentPage,
        limit: pageSize,
        isSendData: data?.isSendData,
        createdType: data?.createdType,
      })
      .then((response) => {
        setTotal(response?.result?.totalRecords || 0);
        const apiData = response?.result?.data;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.marketDataLogId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setDatePriceValues([]);
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
      .post("/admin/eventMarket/getMarketTypeCategory", {
        marketTypeCategoryId: id,
      })
      .then((response) => {
        if (response?.result[0]?.categoryName) {
          setCategory(response?.result[0]?.displayName);
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

  const sendWrongRateRequest = async (data) => {
    setIsLoading(true);
    const payload = {
        centrId: data.centrId,
        fromDate: data.startDate,
        toDate: data.endDate,
        rate: data.rate,
        remark: data.remark,
        operationById: 0,
        operationByName: userDetails.userName,
      }
    try {
      const response = await axios.post(
        wrongRateRqstUrl, // API URL
        payload,
        {
          headers: {
            "X-app": wrongRateRqstKey,
          },
        }
      );
       dispatch(
          updateToastData({
            data: response.data.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
        setDateModelVisable(false)
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);

      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventMarketId !== "0") {
      fetchData();
    }
  }, [eventMarketId, currentPage, pageSize]);

  useEffect(() => {
    if (marketDetails?.marketTypeCategoryId) {
      fetchmMarketTypeCategoryId(marketDetails?.marketTypeCategoryId);
    }
  }, [marketDetails?.marketTypeCategoryId]);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "NotOpen";
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
      default:
        return "Unknown";
    }
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
              const isChecked = checekedList.includes(record.marketDataLogId);
              handleSingleCheck(record);
              if (isChecked) {
                setDatePriceValues(
                  datePriceValues.filter(
                    (item) => item.marketDataLogId !== record.marketDataLogId
                  )
                );
              } else {
                setDatePriceValues([...datePriceValues, record]);
              }
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
      render: (text) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2(text, "index")
            : convertDateUtcFormat(text, "index")}
        </span>
      ),
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
      title: "Runner",
      dataIndex: "runner",
      key: "runner",
      style: { width: "5%", textAlign: "center" },
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
      title: "Predefined Value",
      dataIndex: "predefinedValue",
      key: "predefinedValue",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Event Market"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            disabled
          >
            <i
              className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Send Data",
      key: "isSendData",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Send Data"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record?.isSendData ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            disabled
          >
            <i
              className={`bx ${record?.isSendData ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Bet Allow",
      key: "isAllow",
      render: (text, record) => (
        <Tooltip
          title={"Allow/Disable Event Market"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
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
      title: "Created By",
      dataIndex: "userName",
      key: "userName",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Line Diff",
      dataIndex: "lineDiff",
      key: "lineDiff",
      style: { width: "5%", textAlign: "center" },
    },
  ];
  const customColumns = [
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
              const isChecked = checekedList.includes(record.marketDataLogId);
              handleSingleCheck(record);
              if (isChecked) {
                setDatePriceValues(
                  datePriceValues.filter(
                    (item) => item.marketDataLogId !== record.marketDataLogId
                  )
                );
              } else {
                setDatePriceValues([...datePriceValues, record]);
              }
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
      render: (text) => (
        <span style={{ cursor: "pointer" }}>
          {dateType?.value == 1
            ? convertDateUTCToLocal2(text, "index")
            : convertDateUtcFormat(text, "index")}
        </span>
      ),
      key: "createdDate",
      style: { width: "5%" },
      sort: true,
    },
    {
      title: "Market",
      dataIndex: "marketName",
      key: "marketName",
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "5%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Event Market"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            disabled
          >
            <i
              className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Send Data",
      key: "isSendData",
      render: (text, record) => (
        <Tooltip
          title={"Active/Inactive Send Data"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record?.isSendData ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            disabled
          >
            <i
              className={`bx ${record?.isSendData ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Bet Allow",
      key: "isAllow",
      render: (text, record) => (
        <Tooltip
          title={"Allow/Disable Event Market"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
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
      title: "Created By",
      dataIndex: "userName",
      key: "userName",
      style: { width: "5%", textAlign: "center" },
    },
  ];
  // marketDetails?.marketName?.toLowerCase() !== "match odds" ?
  //: [
  //   {
  //     title: "Date",
  //     dataIndex: "createdDate",
  //     render: (text, record) => (
  //       <span style={{ cursor: "pointer" }}>
  //         {convertDateUTCToLocal2(text, "index")}
  //       </span>
  //     ),
  //     key: "createdDate",
  //     style: { width: "5%" },
  //     sort: true,
  //   },
  //   {
  //     title: "Id",
  //     dataIndex: "marketDataLogId",
  //     key: "marketDataLogId",
  //     style: { width: "5%" },
  //     sort: true,
  //   },
  //   {
  //     title: "Market Name",
  //     dataIndex: "marketName",
  //     key: "marketName",
  //     style: { width: "5%" },
  //   },
  //   {
  //     title: "Log",
  //     dataIndex: "data",
  //     render: (text, record) => {
  //       const logObject = JSON.parse(text);
  //       const logItems = logObject && Object.entries(logObject).map(([key, value]) => (
  //         <span key={key}>
  //           <strong>{key}:</strong>{" "}
  //           {typeof value === "object" ? JSON.stringify(value) : value}{" "}
  //         </span>
  //       ));
  //       return <div>{logItems}</div>;
  //     },
  //     key: "data",
  //     style: { width: "10%" },
  //   },
  // ];

  const MarketDetailsDate = marketDetails?.eventDate
    ? convertDateUTCToLocal2(marketDetails.eventDate, "index")
    : marketDetails?.eventDay && marketDetails?.eventTime
    ? `${marketDetails?.eventDay} ${marketDetails?.eventTime}`
    : "";

  const tableElement = {
    title: `${marketDetails.eventRefId} - ${marketDetails.eventName} logs`,
    isServerPagination: true,
    isDatePrice: true,
    sendDataListSelect: true,
    createdTypeListSelect: true,
    resetButton: true,
    reloadButton: true,
    isDateTypeSelect: true,
  };

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }
    fetchData();
  }, [isSearch, currentPage, pageSize, permissionObj]);

  const sendDataList = [
    {
      sendDataType: "All",
      isSendData: null,
    },
    {
      sendDataType: "true",
      isSendData: true,
    },
    {
      sendDataType: "false",
      isSendData: false,
    },
  ];

  const createdTypeList = [
    {
      createdTypeName: "Both",
      createdType: null,
    },
    {
      createdTypeName: "Panel",
      createdType: 1,
    },
    {
      createdTypeName: "Python",
      createdType: 2,
    },
  ];

  const handleReset = (value) => {
    fetchData(value);
  };

  const handleReload = (value) => {
    fetchData();
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
                  <div className="match-details-breadcrumbs">{`${marketDetails?.eventTypeName}/ ${marketDetails?.competitionName}/ ${marketDetails?.eventName}/ ${marketDetails?.marketName}/ ${marketDetails?.eventMarketId}`}</div>
                  <div>{`Ref: ${marketDetails.eventRefId} [
                      ${MarketDetailsDate}
                    ]`}</div>
                </Col>
              )}
            </Row>
          </CardHeader>
          {marketDetails?.marketTypeId == marketTypeObj?.Fancy ||
          marketDetails?.marketTypeId == marketTypeObj?.LineMarket ? (
            <Table
              ref={finalizeRef}
              columns={columns}
              dataSource={data.map((item) => {
                const logObject = item?.data && JSON.parse(item.data);
                return {
                  ...item,
                  status: logObject?.status,
                  isActive: logObject?.isActive,
                  isAllow: logObject?.isAllow,
                  isSendData: item?.isSendData,
                  runner: logObject?.runner?.[0]?.runner || "",
                  layPrice: logObject?.runner?.[0]?.layPrice || "",
                  laySize: logObject?.runner?.[0]?.laySize || "",
                  backPrice: logObject?.runner?.[0]?.backPrice || "",
                  backSize: logObject?.runner?.[0]?.backSize || "",
                  line: logObject?.runner?.[0]?.line || "",
                  overRate: logObject?.runner?.[0]?.overRate || "",
                  underRate: logObject?.runner?.[0]?.underRate || "",
                };
              })}
              tableElement={tableElement}
              singleCheck={checekedList}
              reFetchData={fetchData}
              serverCurrentPage={currentPage}
              serverPageSize={pageSize}
              serverTotal={total}
              setServerCurrentPage={setCurrentPage}
              setServerPageSize={setPageSize}
              datePriceModelFunction={setDateModelVisable}
              sendDataList={sendDataList}
              createdTypeList={createdTypeList}
              handleReset={handleReset}
              handleReload={handleReload}
              dateType={dateType}
              setDateType={setDateType}
            />
          ) : (
            <Table
              ref={finalizeRef}
              columns={customColumns}
              tableElement={tableElement}
              singleCheck={checekedList}
              serverCurrentPage={currentPage}
              serverPageSize={pageSize}
              serverTotal={total}
              setServerCurrentPage={setCurrentPage}
              setServerPageSize={setPageSize}
              setServerTotal={setTotal}
              datePriceModelFunction={setDateModelVisable}
              dataSource={data.map((item) => {
                const logObject = item?.data ? JSON.parse(item.data) : {};
                const runners = logObject?.runner || [];
                return {
                  ...item,
                  createdDate: item?.createdDate,
                  userName: item?.userName,
                  marketName: logObject?.marketName,
                  status: logObject?.status,
                  isActive: logObject?.isActive,
                  isAllow: logObject?.isAllow,
                  isSendData: item?.isSendData,
                  nestedTable: <NestedTable data={runners} />, // Pass the entire runners array to the nested table
                };
              })}
              sendDataList={sendDataList}
              createdTypeList={createdTypeList}
              handleReset={handleReset}
              handleReload={handleReload}
              dateType={dateType}
              setDateType={setDateType}
            />
          )}
          {dateModelVisable && (
            <CheckBackLayPrice
              dateModelVisable={dateModelVisable}
              setDateModelVisable={setDateModelVisable}
              datePriceValues={datePriceValues}
              setDatePriceValues={setDatePriceValues}
              setCheckedList={setCheckedList}
              marketDetails={marketDetails}
              sendWrongRateRequest={sendWrongRateRequest}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}

export default MarketDataLogs;
