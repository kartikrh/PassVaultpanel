import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { mapCommentaryStatus } from "./functions";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import DeleteTabModel from "../../components/Model/DeleteModel";
import LoadCommentaryModel from "../../components/Model/LoadCommentaryModel";
import SuspendTabModel from "../../components/Model/SuspendModal";
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
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChnageMatchTypeModel } from "../../components/Model/ChangeMatchType";

const Index = () => {
  const pageName = TAB_COMMENTARY;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Commentary";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [changeModelVisible, setChangeModelVisible] = useState(false);
  const [matchType, setMatchType] = useState("");
  const [selectedCommentary, setSelectedCommentary] = useState({});
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
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        setEventTypes(eventTypes);
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
      .post(`/admin/commentary/eventTypeList`, {})
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
    console.log(checekedList);
    await axiosInstance
      .post(`/admin/commentary/loadMultiCommentary`, {
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
  const handleSuspend = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/suspendMarketByCId`, {
        commentaryId: checekedList,
      })
      .then((response) => {
        fetchData();
        setSuspendModelVisable(false);
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
  const handleEdit = (id) => {
    navigate("/addCommentary", { state: { userId: id } });
  };
  const handleDetailsClick = (id) => {
    navigate("/commentaryMaster", { state: { commentaryId: id } });
  };
  const handleUpdatePlayersClick = (details) => {
    navigate("/updateCommentaryPlayer", {
      state: {
        commentaryId: details?.commentaryId,
        commentaryDetails: details,
      },
    });
  };
  const handleCommentaryMarketTemplateClick = (id) => {
    navigate("/commentaryMarketTemplate", { state: { commentaryId: id } });
  };
  const handleMarketEventActionClick = (id) => {
    localStorage.setItem('openMarketCommentaryId', "" + id);
    const url = new URL(window.location.origin + "/marketEventAction");
    url.searchParams.append("commentaryId", id);
    window.open(url.href, '_blank');
  };
  const handleShortCommentaryClick = (id) => {
    navigate("/shortCommentary", { state: { commentaryId: id } });
  };
  const handleUpdateCommentaryClick = (id) => {
    navigate("/updateCommentaryFeature", { state: { commentaryId: id } });
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
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
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
              setCloneValues({
                eventName: record?.eventName,
                eventRefId: record?.eventRefId,
              });
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
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.commentaryId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventRefId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleMarketEventActionClick(record.commentaryId);
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
      title: "Team",
      dataIndex: "team1Name",
      key: "team1Name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competitor",
      dataIndex: "team2Name",
      key: "team2Name",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "commentaryStatus",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{mapCommentaryStatus(text)}</span>
      ),
      key: "commentaryStatus",
      sort: true,
      style: { width: "40%" },
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
          {text} {<a className="bx bx-edit-alt"></a>}
        </span>
      ),
      key: "matchType",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Scoring",
      key: "commentaryDetails",
      printType: "ignore",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "S-Score",
      key: "shortCommentary",
      printType: "ignore",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "S-Update",
      key: "updateCommentary",
      printType: "ignore",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "P-Update",
      key: "updatePlayers",
      printType: "ignore",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "P-Market",
      key: "marketTemplate",
      printType: "ignore",
      render: (text, record) => (
        <Button
          color={"primary"}
          size="sm"
          disabled={
            !record.isPredictMarket || parseInt(record.commentaryStatus) !== 1
          }
          className="btn"
          onClick={() => {
            handleCommentaryMarketTemplateClick(record.commentaryId);
          }}
        >
          <i class='bx bxs-store' ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is P-Market",
      key: "isPredictMarket",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is C-Show",
      key: "isClientShow",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
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
    statusOptions: [
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
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchEventTypeData();
  }, []);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            loadModelFunction={setLoadModelVisable}
            suspendModelFunction={setSuspendModelVisable}
            cloneModelFunction={setCloneModelVisible}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReset={handleReset}
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
            setDateRange={setDateRange}
            dateRange={dateRange}
          />
          <SuspendTabModel
            suspendModalVisible={suspendModelVisable}
            setSuspendModelVisable={setSuspendModelVisable}
            handleSuspend={handleSuspend}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
