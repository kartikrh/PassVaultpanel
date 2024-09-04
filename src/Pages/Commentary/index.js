import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { mapCommentaryStatus } from "./functions";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import DeleteTabModel from "../../components/Model/DeleteModel";
import LoadCommentaryModel from "../../components/Model/LoadCommentaryModel";
import SuspendTabModel from "../../components/Model/SuspendModel";
import CloseTabModel from "../../components/Model/CloseModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { CommentaryClone } from "../../components/Model/Clone";
import { isEqual } from "lodash";
import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMMENTARY,
  WARNING,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChnageMatchTypeModel } from "../../components/Model/ChangeMatchType";
import { ChangeDelayModel } from "../../components/Model/ChangeDelay";
import { ChangeResultModel } from "../../components/Model/ChangeResult";
import { ChangeEventRefIdModel } from "../../components/Model/ChangeEventRefId"
import { DlsModal } from "./CommentaryModels/DlsModal";
import "./CommentaryCss.css"
import { ChangeRunnerModel } from "../../components/Model/ChangeRunnerModel";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_COMMENTARY;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [changeModelVisible, setChangeModelVisible] = useState(false);
  const [resultModelVisible, setResultModelVisible] = useState(false);
  const [delayModelVisible, setDelayModelVisible] = useState(false);
  const [eventRefModelVisible, setEventRefModelVisible] = useState(false);
  const [matchType, setMatchType] = useState("");
  const [selectedCommentary, setSelectedCommentary] = useState({});
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedDelay, setSelectedDelay] = useState({});
  const [selectedEventRef, setSelectedEventRef] = useState({});
  const [dlsModalCommentary, setDlsModalCommentary] = useState(false)
  const [cloneValues, setCloneValues] = useState({
    eventName: "",
    eventRefId: "",
  });
  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date().toISOString().split("T")[0]}T23:59:00`,
  });
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [loadModelVisable, setLoadModelVisable] = useState(false);
  const [suspendModelVisable, setSuspendModelVisable] = useState(false);
  const [closeModelVisable, setCloseModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [runnerModelVisible, setRunnerModelVisible] = useState(false);
  const [selectedCommentaryRunner, setSelectedCommentaryRunner] = useState({});

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
    await axiosInstance
      .post(`/admin/commentary/all`, {
        ...(latestValueFromTable || tableActions),
        ...dateRange,
      })
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
    if (latestValueFromTable?.eventTypeId) {
      fetchCompetitionData(latestValueFromTable?.eventTypeId);
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
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/delete`, {
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
  const handleLoadCommentary = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/loadMultiCommentary`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setLoadModelVisable(false);
        if(response?.result?.callPredictions?.length > 0) {
          response.result.callPredictions.forEach((prediction) => {
           if(prediction?.predictioncallSuccess === false) {
            const predictionMessage = prediction?.predictionMessage;
            const endPoint = prediction?.endPoint;
            dispatch(
              updateToastData({
                data: `${endPoint}\n${predictionMessage}`,
                title: "Call Prediction",
                type: WARNING,
              })
            );
           }
          });
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
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
  const handleSuspend = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/suspendMarketByCId`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setSuspendModelVisable(false);
        if(response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage = response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
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
  const handleClose = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/closeCommentary`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setCloseModelVisable(false);
        if(response?.result?.callPredictions?.length > 0) {
          response.result.callPredictions.forEach((prediction) => {
           if(prediction?.predictioncallSuccess === false) {
            const predictionMessage = prediction?.predictionMessage;
            const endPoint = prediction?.endPoint;
            dispatch(
              updateToastData({
                data: `${endPoint}\n${predictionMessage}`,
                title: "Call Prediction",
                type: WARNING,
              })
            );
           }
          });
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
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
  const handleEdit = (id) => {
    navigate("/addCommentary", { state: { userId: id } });
  };
  const handleDetailsClick = (id) => {
    // navigate("/commentaryMaster", { state: { commentaryId: id } });
    localStorage.setItem('commentaryMasterId', "" + id);
    const url = new URL(window.location.origin + "/commentaryMaster");
    window.open(url.href, '_blank');
  };
  const handleUpdatePlayersClick = (details) => {
    // navigate("/updateCommentaryPlayer", {
    //   state: {
    //     commentaryId: details?.commentaryId,
    //     commentaryDetails: details,
    //   },
    // });
    localStorage.setItem('updatePlayerCommentaryId', "" + details?.commentaryId);
    localStorage.setItem('updatePlayerCommentaryDetails', "" + JSON.stringify(details));
    const url = new URL(window.location.origin + "/updateCommentaryPlayer");
    window.open(url.href, '_blank');
  };
  const handleScoringLogsClick = (details) => {
    localStorage.setItem('scoringLogsCommentaryId', "" + details?.commentaryId);
    const url = new URL(window.location.origin + "/scoringLogs");
    window.open(url.href, '_blank');
  };
  const handlePredictorDetailsClick = (commentaryId) => {
    // localStorage.setItem('predictorLogsId', "" + commentaryId);
    const url = new URL(window.location.origin + "/predictorLogs");
    url.searchParams.set('commentaryId', commentaryId);
    window.open(url.href, '_blank');
  };
  const handleCommentaryLogsClick = (commentaryId) => {
    // localStorage.setItem('commentaryLogsId', "" + commentaryId);
    const url = new URL(window.location.origin + "/commentaryLogs");
    url.searchParams.set('commentaryId', commentaryId);
    window.open(url.href, '_blank');
  };
  const handleUndoLogsClick = (commentaryId) => {
    // localStorage.setItem('undoLogsId', "" + commentaryId);
    const url = new URL(window.location.origin + "/undoLogs");
    url.searchParams.set('commentaryId', commentaryId);
    window.open(url.href, '_blank');
  };
  const handleCommentaryMarketTemplateClick = (id) => {
    // navigate("/commentaryMarketTemplate", { state: { commentaryId: id } });
    localStorage.setItem('marketTemplateCommentaryId', "" + id);
    const url = new URL(window.location.origin + "/commentaryMarketTemplate");
    window.open(url.href, '_blank');
  };
  const handleMarketEventActionClick = (id) => {
    localStorage.setItem('openMarketCommentaryId', "" + id);
    const url = new URL(window.location.origin + "/openMarket");
    // url.searchParams.append("commentaryId", id);
    window.open(url.href, '_blank');
  };
  const handleOddsViewClick = (id) => {
    localStorage.setItem('oddsViewCommentaryId', "" + id);
    const url = new URL(window.location.origin + "/oddsView");
    // url.searchParams.append("commentaryId", id);
    window.open(url.href, '_blank');
  };
  const handleShortCommentaryClick = (id) => {
    // navigate("/shortCommentary", { state: { commentaryId: id } });
    localStorage.setItem('shortCommentaryId', "" + id);
    const url = new URL(window.location.origin + "/shortCommentary");
    window.open(url.href, '_blank');
  };
  const handleUpdateCommentaryClick = (id) => {
    // navigate("/updateCommentaryFeature", { state: { commentaryId: id } });
    localStorage.setItem('updateCommentaryId', "" + id);
    const url = new URL(window.location.origin + "/updateCommentaryFeature");
    window.open(url.href, '_blank');
  };
  const handleClone = async () => {
    if (cloneValues.name !== "" && cloneValues.refrenceId !== "") {
      setIsLoading(true);
      await axiosInstance
        .post(`/admin/commentary/clone`, {
          commentaryId: checekedList?.[0],
          ...cloneValues,
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
          setCloneModelVisible(false);
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
    } else {
      dispatch(
        updateToastData({
          data: "Name and Reference Id are required",
          title: "Required",
          type: ERROR,
        })
      );
    }
  };
  const handleChange = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeMatchType`, {
        ...selectedCommentary,
      })
      .then((response) => {
        fetchData();
        if(response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage = response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
        setChangeModelVisible(false);
      })
      .catch((error) => {
        setChangeModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleChangeRunner = async () => {
    setIsLoading(true);
    const payload = [selectedCommentaryRunner?.team1, selectedCommentaryRunner?.team2]
    await axiosInstance
      .post(`/admin/ImportMarket/updateTeamId`, payload)
      .then((response) => {
        fetchData();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setRunnerModelVisible(false);
      })
      .catch((error) => {
        setRunnerModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      })
  };
  const handleChangeResult = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeResult`, {
        ...selectedResult,
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
        setResultModelVisible(false);
      })
      .catch((error) => {
        setResultModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleChangeDelay = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeDelay`, {
        ...selectedDelay,
      })
      .then((response) => {
        fetchData();
        if(response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage = response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
        setDelayModelVisible(false);
      })
      .catch((error) => {
        setDelayModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const handleChangeEventRef = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/changeEventRefId`, {
        ...selectedEventRef,
      })
      .then((response) => {
        fetchData();
        if(response?.result?.callPrediction?.predictioncallSuccess === false) {
          const predictionMessage = response?.result?.callPrediction?.predictionMessage;
          const endPoint = response?.result?.callPrediction?.endPoint;
          dispatch(
            updateToastData({
              data: `${endPoint}\n${predictionMessage}`,
              title: "Call Prediction",
              type: WARNING,
            })
          );
        } else {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
       }
        setEventRefModelVisible(false);
      })
      .catch((error) => {
        setEventRefModelVisible(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
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
  const handleTeamPredictionPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/commentary/updateTeamPrediction`, {
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
  const updatePredictMarket = async (pType, record, cState) => {
    await axiosInstance
      .post(`/admin/commentary/changePredictMarket`, {
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
              if (!checekedList.includes(record.commentaryId)) {
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
      // render: (text, record) => (
      //   <div className="d-flex align-items-center gap-1">
      //   <span
      //     style={{ cursor: record.isPredictMarket && "pointer" }}
      //     onClick={() => {
      //       if (record.isPredictMarket) {
      //         handleOddsViewClick(record.commentaryId);
      //       }
      //     }}
      //   >
      //     {text}
      //   </span>
      //   <a
      //   className="bx bx-edit-alt"
      //   style={{ cursor: "pointer" }}
      //   onClick={() => {
      //     setEventRefModelVisible(true);
      //     setSelectedEventRef(record);
      //   }}
      //   ></a>
      //   </div>
      // ),
      render: (text, record) => (
        <div className="d-flex align-items-center gap-1">
          <span
            style={{ cursor: record.isPredictMarket && "pointer" }}
          // onClick={() => {
          //   if (record.isPredictMarket) {
          //     handleOddsViewClick(record.commentaryId);
          //   }
          // }}
          >
            {text}
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEventRefModelVisible(true);
              setSelectedEventRef(record);
            }}> <Tooltip title="Edit Event Id" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>{<a className="bx bx-edit-alt"></a>}</Tooltip>
          </span>
        </div>
      ),
      key: "eventRefId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => (
        <span
          style={{ cursor: record.isPredictMarket && "pointer" }}
          onClick={() => {
            if (record.isPredictMarket) {
              handleMarketEventActionClick(record.commentaryId);
            }
          }}
        >
          {text}
        </span>
      ),
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
      title: "Scoring",
      key: "commentaryDetails",
      printType: "ignore",
      render: (text, record) => (
      <Tooltip title={"Go to scoring"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"warning"}
          size="sm"
          className="btn"
          onClick={() => {
            handleDetailsClick(record.commentaryId);
          }}
        >
          <i class='bx bxs-right-arrow' ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
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
      title: "DLS",
      dataIndex: "dls",
      render: (text, record) => (
      <Tooltip title={"Duckworth-Lewis-Stern"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          size="sm"
          className="dls-button btn"
          onClick={() => { setDlsModalCommentary(record) }}>
          <i class='bx bx-cloud-light-rain'></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "10%" },
    },
    {
      title: "Show",
      key: "isClientShow",
      render: (text, record) => (
      <Tooltip title={"Show/Hide Client"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isClientShow ? "primary" : "danger"}`}
          size="sm"
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
      <Tooltip title={"Active/Inactive Commentary"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
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
      title: "Player",
      key: "updatePlayers",
      printType: "ignore",
      render: (text, record) => (
      <Tooltip title={"Update Players"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"info"}
          size="sm"
          className="btn"
          onClick={() => {
            handleUpdatePlayersClick(record);
          }}
        >
          <i class='bx bxs-up-arrow-square' ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "Team",
    //   dataIndex: "team1Name",
    //   key: "team1Name",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    // {
    //   title: "Competitor",
    //   dataIndex: "team2Name",
    //   key: "team2Name",
    //   sort: true,
    //   style: { width: "10%" },
    // },
    {
      title: "Predict",
      key: "isPredictMarket",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
        <Tooltip title={"Active/Inactive Predict Market"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color={`${record.isPredictMarket ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              updatePredictMarket(
                "isPredictMarket",
                record,
                record?.isPredictMarket
              );
            }}
          >
            <i
              className={`bx ${record?.isPredictMarket ? "bx-check" : "bx-block"
                }`}
            ></i>
          </Button>
        </Tooltip>
          <>
            {record.isPredictMarket &&
            <Tooltip title={"Market Template"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
              <Button
                color={"primary"}
                size="sm"
                className="btn"
                onClick={() => {
                  handleCommentaryMarketTemplateClick(record.commentaryId);
                }}
              >
                <i class='bx bxs-store' ></i>
              </Button>
            </Tooltip>}
            <Tooltip title={"Predictor Api Logs"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => {
                handlePredictorDetailsClick(record.commentaryId);
              }}
            >
              <i class='bx bxs-up-arrow-square' ></i>
            </Button>
            </Tooltip>
          </>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "P-Market",
    //   key: "marketTemplate",
    //   printType: "ignore",
    //   render: (text, record) => (
    //     <Button
    //       color={"primary"}
    //       size="sm"
    //       disabled={
    //         !record.isPredictMarket || parseInt(record.commentaryStatus) !== 1
    //       }
    //       className="btn"
    //       onClick={() => {
    //         handleCommentaryMarketTemplateClick(record.commentaryId);
    //       }}
    //     >
    //       <i class='bx bxs-store' ></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "S-Score",
      key: "shortCommentary",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip title={"Short Score"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"secondary"}
          size="sm"
          className="btn"
          onClick={() => {
            handleShortCommentaryClick(record.commentaryId);
          }}
        >
          <i class='bx bxs-chevrons-right'></i>
        </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "S-Update",
      key: "updateCommentary",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip title={"Update Commentary"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"success"}
          size="sm"
          className="btn"
          onClick={() => {
            handleUpdateCommentaryClick(record.commentaryId);
          }}
        >
          <i class='bx bx-arrow-to-right' ></i>
        </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Delay",
      dataIndex: "delay",
      render: (text, record) => (
        <span
          onClick={() => {
            setDelayModelVisible(true);
            setSelectedDelay(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {text} {" "}
        <Tooltip title="Edit Delay" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>{<a className="bx bx-edit-alt"></a>}</Tooltip>
        </span>
      ),
      key: "delay",
      sort: true,
      style: { width: "10%" },
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
      title: "Match Type",
      dataIndex: "matchType",
      render: (text, record) => (
        <span
          onClick={() => {
            setChangeModelVisible(true);
            setSelectedCommentary(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {text} {" "}
          <Tooltip title="Edit Match Type" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>{<a className="bx bx-edit-alt"></a>}</Tooltip>
        </span>
      ),
      key: "matchType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Set Runner",
      dataIndex: "setRunner",
      render: (text, record) => (
      <Tooltip title={"Set Runner"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"warning"}
          size="sm"
          className="btn"
          onClick={() => {
            setRunnerModelVisible(true);
            setSelectedCommentaryRunner(record);
          }}
          style={{ cursor: "pointer" }}
        >
          <i class='bx bxs-up-arrow-square' ></i>
        </Button>
      </Tooltip>
      ),
      key: "setRunner",
      sort: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Is Team Prediction",
      key: "isTeamPredictionOn",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Team Prediction"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isTeamPredictionOn ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleTeamPredictionPermissions("isTeamPredictionOn", record, record.isTeamPredictionOn);
          }}
        >
          <i className={`bx ${record.isTeamPredictionOn ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      sort: true,
      style: { width: "5%", textAlign: "center" },
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
                handleCommentaryLogsClick(record.commentaryId);
              }}
            >
              <i class="bx bxs-up-arrow-square"></i>
            </Button>
          </Tooltip>
          <Tooltip title={"Scoring Logs"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
                handleUndoLogsClick(record.commentaryId);
              }}
            >
              <i class="bx bxs-up-arrow-square"></i>
            </Button>
          </Tooltip>
        </div>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const getColumns = (data) => {
    const resultColumn = {
      title: "Change Result",
      dataIndex: "result",
      render: (text, record) => (
        <span
          onClick={() => {
            setResultModelVisible(true);
            setSelectedResult(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {text} {<a className="bx bx-edit-alt"></a>}
        </span>
      ),
      key: "result",
      sort: true,
      style: { width: "10%" },
    };

    const updatedColumn = [...columns];

    if (data.some(record => record?.commentaryStatus === 4)) {
      updatedColumn.splice(7, 0, resultColumn);
    }

    return updatedColumn;
  };

  const updatedColumns = getColumns(data);
  //elements required
  const tableElement = {
    title: "Commentary",
    headerSelect: false,
    eventTypeSelect: true,
    switch: false,
    clone: true,
    loadCommentary: true,
    suspend: true,
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
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchEventTypeData();
  }, []);

  const handleReload = (value) => {
    fetchData();
    fetchEventTypeData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={updatedColumns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            loadModelFunction={setLoadModelVisable}
            suspendModelFunction={setSuspendModelVisable}
            closeModelFunction={setCloseModelVisable}
            cloneModelFunction={setCloneModelVisible}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReset={handleReset}
            handleReload={handleReload}
            onAddNavigate={"/addCommentary"}
            competitions={competitions}
            isAddPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_ADD
            )}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            isSuspendPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_EDIT
            )}
            isClosePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_EDIT
            )}
            setDateRange={setDateRange}
            dateRange={dateRange}
          />
          <SuspendTabModel
            suspendModelVisible={suspendModelVisable}
            setSuspendModelVisable={setSuspendModelVisable}
            handleSuspend={handleSuspend}
            singleCheck={checekedList}
          />
          <CloseTabModel
            closeModelVisible={closeModelVisable}
            setCloseModelVisable={setCloseModelVisable}
            handleClose={handleClose}
            singleCheck={checekedList}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <LoadCommentaryModel
            loadModelVisable={loadModelVisable}
            setLoadModelVisable={setLoadModelVisable}
            handleLoad={handleLoadCommentary}
          />
          <CommentaryClone
            cloneModelVisible={cloneModelVisible}
            setCloneModelVisible={setCloneModelVisible}
            handleClone={handleClone}
            setCloneValues={setCloneValues}
            cloneValues={cloneValues}
            singleCheck={checekedList}
          />
          {changeModelVisible && (
            <ChnageMatchTypeModel
              changeModelVisible={changeModelVisible}
              setChangeModelVisible={setChangeModelVisible}
              handleChange={handleChange}
              setMatchType={setMatchType}
              singleCheck={checekedList}
              selectedCommentary={selectedCommentary}
              setSelectedCommentary={setSelectedCommentary}
            />
          )}
          {resultModelVisible && (
            <ChangeResultModel
              resultModelVisible={resultModelVisible}
              setResultModelVisible={setResultModelVisible}
              handleChange={handleChangeResult}
              singleCheck={checekedList}
              selectedResult={selectedResult}
              setSelectedResult={setSelectedResult}
            />
          )}
          {delayModelVisible && (
            <ChangeDelayModel
              delayModelVisible={delayModelVisible}
              setDelayModelVisible={setDelayModelVisible}
              handleChange={handleChangeDelay}
              singleCheck={checekedList}
              selectedDelay={selectedDelay}
              setSelectedDelay={setSelectedDelay}
            />
          )}
          {eventRefModelVisible && (
            <ChangeEventRefIdModel
              eventRefModelVisible={eventRefModelVisible}
              setEventRefModelVisible={setEventRefModelVisible}
              handleChange={handleChangeEventRef}
              singleCheck={checekedList}
              selectedEventRef={selectedEventRef}
              setSelectedEventRef={setSelectedEventRef}
            />
          )}
          {runnerModelVisible && (
            <ChangeRunnerModel
              runnerModelVisible={runnerModelVisible}
              setRunnerModelVisible={setRunnerModelVisible}
              handleChange={handleChangeRunner}
              singleCheck={checekedList}
              selectedCommentaryRunner={selectedCommentaryRunner}
              setSelectedCommentaryRunner={setSelectedCommentaryRunner}
            />
          )}
          {dlsModalCommentary && <DlsModal
            commentaryDetails={dlsModalCommentary}
            toggle={() => { setDlsModalCommentary(false) }}
          />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
