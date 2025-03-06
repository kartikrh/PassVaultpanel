import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { mapCommentaryStatus } from "../Commentary/functions";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { isEmpty, isEqual } from "lodash";
import {
  ERROR,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMMENTARY_HISTORY,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUTCToLocal,
  convertDateLocalToUTC,
  getDateRange,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import "../Commentary/CommentaryCss.css"
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_COMMENTARY_HISTORY;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary History";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [dateRange, setDateRange] = useState(() => getDateRange(5));
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tabelNoteDisplay = <>
    <b><i>Note :</i></b>
    {/* <div>Click on Event Id to open <b>Odds View</b> page  </div> */}
    <div>Click on Event Name to open <b>Open Market</b> page </div>
  </>

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions
    let payload = {
      ...data,
      startDate: convertDateLocalToUTC(dateRange?.startDate, "index"),
      endDate: convertDateLocalToUTC(dateRange?.endDate, "index"),
      eventTypeId: data?.eventTypeId || 0,
      competitionId: data?.eventTypeId !== eventTypeId ? 0 : data?.competitionId || 0,
    };
    await axiosInstance
      .post(`/admin/commentary/history`, payload)
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.commentaryId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
        // setEventTypes(eventTypes);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    if (data?.eventTypeId && latestValueFromTable) {
      fetchCompetitionData(data?.eventTypeId);
    }
  };
  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/commentary/eventTypeList`, { isActive: true })
      .then((response) => {
        setEventTypes(response.result);
      })
      .catch((error) => { });
  };
  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/commentary/competitionListByEventTypeId`, {
        eventTypeId: value,
      })
      .then((response) => {
        setCompetitions(response.result);
      })
      .catch((error) => { });
  };
  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.commentaryId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.commentaryId
      );
    } else {
      updateSingleCheck = [...checekedList, e.commentaryId];
    }
    setCheckedList(updateSingleCheck);
  };
  const handleEdit = (id) => {
    navigate("/addCommentary", { state: { userId: id } });
  };
  const handleScoringLogsClick = (details) => {
    const url = new URL(window.location.origin + "/scoringLogs");
    sessionStorage.setItem('scoringLogsId', "" + details?.commentaryId);
    sessionStorage.setItem('scoringLogsDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("scoringLogsId");
    sessionStorage.removeItem("scoringLogsDetails");
  };
  const handlePredictorDetailsClick = (details) => {
    const url = new URL(window.location.origin + "/predictorLogs");
    sessionStorage.setItem('predictorLogsId', "" + details?.commentaryId);
    sessionStorage.setItem('predictorLogsDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("predictorLogsId");
    sessionStorage.removeItem("predictorLogsDetails");
  };
  const handleCommentaryLogsClick = (details) => {
    const url = new URL(window.location.origin + "/commentaryLogs");
    sessionStorage.setItem('commentaryLogsId', "" + details?.commentaryId);
    sessionStorage.setItem('commentaryLogsDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("commentaryLogsId");
    sessionStorage.removeItem("commentaryLogsDetails");
  };
  const handleSessionResultClick = (details) => {
    const url = new URL(window.location.origin + "/setSessionResult");
    sessionStorage.setItem('sessionResultId', "" + details?.commentaryId);
    sessionStorage.setItem('sessionResultDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("sessionResultId");
    sessionStorage.removeItem("sessionResultDetails");
  };
  const handleMarketResultClick = (details) => {
    const url = new URL(window.location.origin + "/setMarketResult");
    sessionStorage.setItem('marketResultId', "" + details?.commentaryId);
    sessionStorage.setItem('marketResultDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("marketResultId");
    sessionStorage.removeItem("marketResultDetails");
  };
  const handleUndoLogsClick = (details) => {
    const url = new URL(window.location.origin + "/undoLogs");
    sessionStorage.setItem('undoLogsId', "" + details?.commentaryId);
    sessionStorage.setItem('undoLogsDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("undoLogsId");
    sessionStorage.removeItem("undoLogsDetails");
  };
  const handleEventMarketClick = (details) => {
    const url = new URL(window.location.origin + "/eventMarkets");
    sessionStorage.setItem('commentaryEventMarketId', "" + details?.commentaryId);
    sessionStorage.setItem('commentaryEventMarketDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("commentaryEventMarketId");
    sessionStorage.removeItem("commentaryEventMarketDetails");
  };
  const handleCommentaryEventSnapClick = (details) => {
    const url = new URL(window.location.origin + "/commentaryEventSnap");
    sessionStorage.setItem('eventSnapId', "" + details?.commentaryId);
    sessionStorage.setItem('eventSnapDetails', "" + JSON.stringify(details));
    sessionStorage.setItem('eventSnapCommentaryHistory', false);
    window.open(url.href, '_blank');
  };
  const handleActiveInactive = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/activeInactiveCommentary`, {
        commentaryId: record?.commentaryId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/updateShowClient`, {
        commentaryId: record?.commentaryId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/deleteCommHist`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleReset = (value) => {
    fetchData(value);
    fetchEventTypeData();
  };
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
            checked={checekedList.includes(record.commentaryId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleEdit(record.commentaryId);
          }}
        >
          <i
            className="bx bx-edit"

          ></i>
        </span>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      key: "eventRefId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      dataIndex: "eventName",
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      key: "matchType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "commentaryStatus",
      render: (text, record) => (
        <span>{mapCommentaryStatus(text)}</span>
      ),
      key: "commentaryStatus",
      sort: true,
      style: { width: "40%" },
    },
    {
      title: "Show",
      key: "isClientShow",
      render: (text, record) => (
        <Tooltip title={"Show/Hide Client"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isClientShow ? "primary" : "danger"}`}
            size="sm"
            disabled
            className="btn"
            onClick={() => {
              handlePermissions("isClientShow", record, record?.isClientShow);
            }}
          >
            <i
              className={`bx ${record?.isClientShow ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip title={"Active/Inactive Commentary"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            disabled
            className="btn"
            onClick={() => {
              handleActiveInactive("isActive", record, record?.isActive);
            }}
          >
            <i
              className={`bx ${record?.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Predict",
      key: "isPredictMarket",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          <Tooltip title={"Active/Inactive Predict Market"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color={`${record.isPredictMarket ? "primary" : "danger"}`}
              size="sm"
              className="btn"
              disabled
            >
              <i
                className={`bx ${record?.isPredictMarket ? "bx-check" : "bx-block"
                  }`}
              ></i>
            </Button>
          </Tooltip>
          <>
            <Tooltip title={"Predictor Api Logs"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
              <Button
                color={"primary"}
                size="sm"
                className="btn"
                onClick={() => {
                  handlePredictorDetailsClick(record);
                }}
              >
                <i class='bx bxs-up-arrow-square' ></i>
              </Button>
            </Tooltip>
            {record.isPredictMarket && <Tooltip
              title={"Event Market"}
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <Button
                color={"danger"}
                size="sm"
                className="bstn"
                onClick={() => {
                  handleEventMarketClick(record)
                }}
              >
                <i class="bx bxs-up-arrow-square"></i>
              </Button>
            </Tooltip>}

          </>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Logs",
      key: "commentaryId",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          <Tooltip
            title={"Commentary Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => {
                handleCommentaryLogsClick(record);
              }}
            >
              <i class="bx bxs-up-arrow-square"></i>
            </Button>
          </Tooltip>
          <Tooltip title={"Scoring Logs"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color={"info"}
              size="sm"
              className="btn"
              onClick={() => {
                handleScoringLogsClick(record);
              }}
            >
              <i class='bx bxs-up-arrow-square' ></i>
            </Button>
          </Tooltip>
          <Tooltip
            title={"Undo Logs"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={"warning"}
              size="sm"
              className="btn"
              onClick={() => {
                handleUndoLogsClick(record);
              }}
            >
              <i class="bx bxs-up-arrow-square"></i>
            </Button>
          </Tooltip>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "CP",
      key: "isCountInPoint",
      render: (text, record) => (
        <Tooltip title={"Active/Inactive Count In Point"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isCountInPoint ? "primary" : "danger"}`}
            disabled
            size="sm"
            className="btn"
          >
            <i
              className={`bx ${record?.isCountInPoint ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Win %",
      key: "isTeamPredictionOn",
      render: (text, record) => (
        <Tooltip title={"Active/Inactive Team Prediction"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isTeamPredictionOn ? "primary" : "danger"}`}
            disabled
            size="sm"
            className="btn"
          >
            <i className={`bx ${record.isTeamPredictionOn ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Delay",
      dataIndex: "delay",
      key: "delay",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Markets",
      key: "marketResult",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
        {record.isPredictMarket &&
        <>
          <Tooltip
            title={"Session Result"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => {
                handleSessionResultClick(record);
              }}
            >
              S
            </Button>
          </Tooltip>
          <Tooltip title={"Market Result"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color={"info"}
              size="sm"
              className="btn"
              onClick={() => {
                handleMarketResultClick(record);
              }}
            >
              M
            </Button>
          </Tooltip>
        </>}
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const getColumns = (data) => {
    const resultColumn = {
      title: "Change Result",
      dataIndex: "result",
      key: "result",
      sort: true,
      style: { width: "10%" },
    };
    const eventSnapColumn = {
      title: "Event Snap",
      dataIndex: "eventSnap",
      render: (text, record) => (
        <Tooltip title={"Event Snap"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={"primary"}
            size="sm"
            className="btn"
            onClick={() => {
              handleCommentaryEventSnapClick(record);
            }}
          >
            <i class='bx bxs-up-arrow-square' ></i>
          </Button>
        </Tooltip>
      ),
      key: "eventSnap",
      sort: true,
      style: { width: "2%", textAlign: "center" },
    };
    const updatedColumn = [...columns];

    if (data.some(record => record?.commentaryStatus === 4)) {
      updatedColumn.splice(7, 0, resultColumn);
      updatedColumn.splice(8, 0, eventSnapColumn);
    }
    return updatedColumn;
  };

  const updatedColumns = getColumns(data);
  //elements required
  const tableElement = {
    title: "Commentary History",
    headerSelect: false,
    eventTypeSelect: true,
    switch: false,
    commentaryStatus: true,
    competitionsSelect: true,
    resetButton: true,
    reloadButton: true,
    statusOptions: [
      {
        label: "All",
        value: 0,
      },
      {
        label: "Open",
        value: 1,
      },
      {
        label: "Toss Done",
        value: 2,
      },
      {
        label: "In Progress",
        value: 3,
      },
      {
        label: "End",
        value: 4,
      },
    ],
    dateRange: true,
    compToRender: tabelNoteDisplay
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    fetchData();
  }, [permissionObj]);

  useEffect(() => {
    fetchEventTypeData();
  }, [])

  useEffect(() => {
    if(!eventTypeId) {
      setCompetitions([]);
    }
  },[eventTypeId]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary History" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={updatedColumns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReset={handleReset}
            handleReload={handleReload}
            competitions={competitions}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            setDateRange={setDateRange}
            dateRange={dateRange}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;