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
  TAB_ACTION_LOGS,
  TAB_ENTITY_UPDATE_LOGS,
} from "../../components/Common/Const";
import { useSelector } from "react-redux";
import { checkPermission, convertDateLocalToUTC, convertDateUtcFormat, convertDateUtcFormat24, convertDateUtcFormatWithSec24, convertDateUTCToLocal2, convertDateUTCToLocal2_24, convertDateUTCToLocalWithSec24 } from "../../components/Common/Reusables/reusableMethods";
import RequestModal from "./RequestModal";
import { isEmpty, isEqual } from "lodash";
import ResponseModal from "./ResponseModal";

const Index = () => {
  const pageName = TAB_ACTION_LOGS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary Action Logs";
  const ActionLogsId = sessionStorage.getItem("actionLogsId")
  const commentaryDetails = JSON.parse(sessionStorage.getItem('actionLogsDetails') || "{}");
  const globalPageSize = localStorage.getItem("pageSize")
  const globalDateType = JSON.parse(localStorage.getItem("DateType"))
  const [data, setData] = useState([]);
  const [resModelVisible, setResModelVisible] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [createdByList, setCreatedByList] = useState([]);
  const [competitionId, setCompetitionId] = useState(null);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [reqModelVisible, setReqModelVisible] = useState(false);
  const [resBodyData, setResBodyData] = useState({});
  const [reqBodyData, setReqBodyData] = useState(null);
  const [isSearch, setIsSearch] = useState(ActionLogsId ? false: true);
  const [dateType, setDateType] = useState(globalDateType || { label: "Local Timezone", value: 1 });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedTableElements, setSelectedTableElements] = useState({
    eventType: null,
    competition: null,
    commentary: null,
    createdById: null
  });
  const navigate = useNavigate();
  const [cloneValues, setCloneValues] = useState({
        eventName: "",
        eventRefId: "",
    });
  const [dataIndexList, setDataIndexList] = useState([]);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions
    let payload = {
      ...data,
      page: currentPage == 0 ? 1 : currentPage,
      limit: pageSize,
      eventTypeId: data?.eventTypeId || 0,
      competitionId: data?.eventTypeId !== eventTypeId ? 0 : data?.competitionId || 0,
      commentaryId: (data?.eventTypeId !== eventTypeId || data?.competitionId !== competitionId) ? 0 : data?.commentaryId || 0,
      createdById: data?.createdById || 0,
      // ...(ActionLogsId && { commentaryId : ActionLogsId })
    }
    if (ActionLogsId !== 0) {
      payload = {
        ...data,
        page: currentPage == 0 ? 1 : currentPage,
        limit: pageSize,
        commentaryId: ActionLogsId
      };
    }
    if (isSearch) {
      payload = {
        ...payload,
        startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
        endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      };
    }
    await axiosInstance
      .post(`/admin/log/actionLogs`, payload)
      .then((response) => {
        const logsData = response?.result?.data?.sort((a,b)=>b?.id - a?.id);
        let logsDataIdList = [];
        logsData.forEach((ele) => {
          logsDataIdList.push(ele?.id);
        });
        setDataIndexList(logsDataIdList)
        setData(logsData);
        setTotal(response?.result?.totalRecords || 0); 
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    if (data?.eventTypeId && latestValueFromTable) {
      fetchCompetitionData(data?.eventTypeId);
    }
    if (data?.competitionId && latestValueFromTable) {
      fetchCommentaryData(data?.competitionId);
    }
  };

  const fetchCreatedByListData = async () => {
    await axiosInstance
      .post(`/admin/list/userList`, { isActive: true })
      .then((response) => {
        const formattedList = response.result?.map(ele => { return { createdBy: ele.name, createdById: ele.userId } })
        setCreatedByList(formattedList);
      })
      .catch((error) => { });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.id
      );
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  //checkbox select
  const getSelectedItemsData = () => {
    return tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.id)
      : dataIndexList;
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    setCheckedList(
      isEqual(checekedList?.sort(), currentItems?.sort())
        ? []
        : currentItems
    );
  };

  const checkIfAllSelected = () => {
    const currentItems = getSelectedItemsData();
    return data?.length > 0 &&
      checekedList?.length > 0 &&
      isEqual(checekedList?.sort(), currentItems?.sort());
  };
  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
    setCheckedList([]);
  };

  useEffect(() => {
    if (ActionLogsId !== 0) {
      setEventTypeId(commentaryDetails.eventTypeId)
    }
  }, [])

  useEffect(() => {
    if (!eventTypeId) {
      setCompetitions([]);
      setCommentary([]);
    }
  }, [eventTypeId]);

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/log/eventTypeList`, { isActive: true })
      .then((response) => {
        setEventTypes(response.result);
      })
      .catch((error) => { });
  };
  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/log/competitionListByEventTypeId`, {
        eventTypeId: value,
      })
      .then((response) => {
        setCompetitions(response.result);
      })
      .catch((error) => { });
  };
  const fetchCommentaryData = async (value) => {
    await axiosInstance
      .post(`/admin/log/getComByCompetition`, {
        competitionId: value,
      })
      .then((response) => {
        setCommentary(response.result);
      })
      .catch((error) => { });
  };
  
  useEffect(() => {
    if (ActionLogsId !== 0 && commentaryDetails?.eventTypeId && commentaryDetails?.competitionId) {
      setIsSearch(false)
      fetchCompetitionData(commentaryDetails?.eventTypeId);
      fetchCommentaryData(commentaryDetails?.competitionId);
    } else {
      setIsSearch(true)
    }
  }, [ActionLogsId, commentaryDetails?.eventTypeId, commentaryDetails?.competitionId])

  useEffect(() => {
    const objectToSave = {}
    if (commentaryDetails?.eventTypeId && commentaryDetails?.competitionId && commentaryDetails?.commentaryId) {
      const event = eventTypes.find(e => e.eventTypeId === commentaryDetails.eventTypeId)
      const competition = competitions.find(c => c.competitionId === commentaryDetails.competitionId)
      const commentaryData = commentary.find(c => c.commentaryId === commentaryDetails.commentaryId)

      objectToSave['eventType'] = { value: event?.eventTypeId, label: event?.eventType }
      objectToSave['competition'] = { value: competition?.competitionId, label: competition?.competition }
      objectToSave['commentary'] = { value: commentaryData?.commentaryId, label: commentaryData && commentaryData?.eventName && commentaryData?.eventDate ? `${commentaryData.eventName} (${convertDateUTCToLocal2_24(commentaryData.eventDate, "index")})` : "" }
    }
    // if (createdUserId && createdUserId !== 0 && userDetailsToFind.createdById && userDetailsToFind.createdBy) {
    //   objectToSave['createdById'] = { value: userDetailsToFind?.createdById, label: userDetailsToFind.createdBy }
    // }
    if (!isEmpty(objectToSave))
      setSelectedTableElements(objectToSave);
  }, [commentaryDetails.eventTypeId, commentaryDetails.competitionId, commentaryDetails.commentaryId, eventTypes, competitions, commentary]);


  useEffect(() => {
    fetchEventTypeData();
    fetchCreatedByListData();
  }, []);

  //table columns
  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checkIfAllSelected()}
            onChange={handleSelectAllClick}
            // checked={
            //   data?.length > 0 &&
            //   isEqual(checekedList?.sort(), dataIndexList?.sort())
            // }
            // onChange={() => {
            //   setCheckedList(
            //     isEqual(checekedList?.sort(), dataIndexList?.sort())
            //       ? []
            //       : dataIndexList
            //   );
            // }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className={`form-check d-flex align-items-center justify-between ${
          checekedList.includes(record.id) ? "selected-row" : ""
        }`}>
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
              if (!checekedList.includes(record.id)) {
                setCloneValues({
                  eventName: record?.eventName,
                  eventRefId: record?.eventRefId,
                });
              }
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Commentary Id",
      dataIndex: "commentaryId",
      key: "commentaryId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {dateType?.value == 1
            ? convertDateUTCToLocal2_24(text, "index")
            : convertDateUtcFormat24(text, "index")
          }
        </span>
      ),
      key: "createDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      key: "event",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {`${record.eventTypeName || ""}/ ${record.competitionName || ""}/ ${
            record.eventName || ""
          }`}
        </span>
      ),
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "apiName",
      dataIndex: "apiName",
      key: "apiName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "createdBy",
      dataIndex: "createdBy",
      key: "createdBy",
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
              {typeof value === "object" ? JSON.stringify(value) : typeof value === "boolean" ? value.toString() : value}{" "}
            </span>
          ));
        return <div
          onClick={() => {
            setReqModelVisible(true);
                  setReqBodyData({
                    requestBody: record?.requestBody,id:record?.id,
                    commentaryId: record?.commentaryId,
                    createdBy: record?.createdBy,
                    createdAt: record?.createdAt
                  });
          }}
          style={{
            display: 'inline-block',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: "pointer"
          }}>{logItems}</div>;
      },
      key: "requestBody",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Response",
      dataIndex: "response",
      render: (text, record) => {
        const logObject = text;
        const logItems =
          logObject &&
          Object.entries(logObject).map(([key, value]) => (
            <span key={key}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : typeof value === "boolean" ? value.toString() : value}{" "}
            </span>
          ));
        console.log("record", record)
        return <div
          onClick={() => {
            setResModelVisible(true);
            setResBodyData({
              response: record?.requestBody,
              commentaryId: record?.commentaryId,
              createdBy: record?.createdBy,
              createdAt: record?.createdAt
            });
          }}
          style={{
            display: 'inline-block',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: "pointer"
          }}>{logItems}</div>;
      },
      key: "response",
      sort: true,
      style: { width: "20%" },
    },
  ];
  //elements required
  const tableElement = {
    title: !isEmpty(commentaryDetails) ? `Commentary Action Logs [ ${dateType?.value == 1 ? convertDateUTCToLocalWithSec24(commentaryDetails?.eventDate, "index") : convertDateUtcFormatWithSec24(commentaryDetails?.eventDate, "index")} ] ${commentaryDetails?.eventName}` : "Commentary Action Logs",
    isServerPagination: true,
    reloadButton: true,
    isDateRange: true,
    isDateTypeSelect: true,
    eventTypeSelect: true,
    competitionsSelect: true,
    commentarySelect: true,
    createdByIdSelect: true,
    resetButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  },[isSearch, currentPage, pageSize, permissionObj]);

  const handleReload = (value) => {
    // setIsSearch(true)
    fetchData();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary Action Logs" />
          {!isEmpty(commentaryDetails) && <>
              <div className='match-details-breadcrumbs'>{`${commentaryDetails?.eventType}/ ${commentaryDetails?.competition}/ ${commentaryDetails?.eventName}`}</div>
              <div>{`Ref: ${commentaryDetails?.eventRefId || ""} [ ${dateType?.value == 1 ? convertDateUTCToLocalWithSec24(commentaryDetails?.eventDate, "index") : convertDateUtcFormatWithSec24(commentaryDetails?.eventDate, "index")} ]`}</div>
          </>}
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            selectedTableElementsLogs={selectedTableElements}
            eventTypes={eventTypes}
            competitions={competitions}
            commentary={commentary}
            createdByList={createdByList}
            handleReload={handleReload}
            setDateRange={setDateRange}
            dateRange={dateRange}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            // setServerCurrentPage={setCurrentPage}
            // setServerPageSize={setPageSize}
            setServerCurrentPage={(value) => {
              setCheckedList([]);
              setTableSearchedData([]);
              setCurrentPage(value);
            }}
            setServerPageSize={(value) => {
              setCheckedList([]);
              setTableSearchedData([]);
              setPageSize(value);
            }}
            setParentSearchedData={handleTableSearchedDataChange}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            dateType={dateType}
            setDateType={setDateType}
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
          {resModelVisible && (
            <ResponseModal
              isOpen={resModelVisible}
              toggle={() => setResModelVisible(!resModelVisible)}
              data={resBodyData}
              fetchData={fetchData}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
