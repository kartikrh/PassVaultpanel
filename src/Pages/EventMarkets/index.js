import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
// import { Avatar } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import {
  TAB_EVENT_MARKETS,
  // PERMISSION_ADD,
  PERMISSION_DELETE,
  // PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_EVENT_MARKETS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_EVENT_MARKETS;
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [EventTypeActive, setEventTypeActive] = useState(true);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/eventMarket/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.eventMarketId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/eventTypeList`, {
        isActive: EventTypeActive,
      })
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };
  const fetchCompetitionList = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/competitionListByEventTypeId`, {
        eventTypeId: eventTypeId,
      })
      .then((response) => {
        setCompetitionList(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };
  const fetchEventList = async () => {
    await axiosInstance
      .post(`/admin/eventMarket/eventListByCompetitionId`, {
        competitionId: competitionId,
      })
      .then((response) => {
        setEventList(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };
  // const fetchTeamsData = async () => {
  //   await axiosInstance
  //     .post(`/admin/player/teamList`, {})
  //     .then((response) => {
  //       setTeams(response.result);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {});
  // };
  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.eventMarketId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.eventMarketId
      );
    } else {
      updateSingleCheck = [...checekedList, e.eventMarketId];
    }
    setCheckedList(updateSingleCheck);
  };

  // const handlePermissions = async (pType, record, cState) => {
  //   setIsLoading(true);
  //   await axiosInstance
  //     .post(`/admin/eventMarket/save`, {
  //       eventMarketId: record.eventMarketId,
  //       playerName: record.playerName,
  //       [pType]: cState ? false : true,
  //     })
  //     .then((response) => {
  //       fetchData();
  //       dispatch(
  //         updateToastData({
  //           data: response?.message,
  //           title: response?.title,
  //           type: SUCCESS,
  //         })
  //       );
  //     })
  //     .catch((error) => {
  //       setIsLoading(false);
  //       dispatch(
  //         updateToastData({
  //           data: error?.message,
  //           title: error?.title,
  //           type: ERROR,
  //         })
  //       );
  //     });
  // };

  const handleAllowPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/updateAllowMarket`, {
        eventMarketId: record.eventMarketId,
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

  const handleActiveInactivePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventMarket/activeInactiveMarket`, {
        eventMarketId: record.eventMarketId,
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
      .post(`/admin/eventMarket/delete`, {
        eventMarketId: checekedList,
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
        setCheckedList([]);
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
        setCheckedList([]);
      });
  };
  const handleEdit = (id) => {
    navigate("/addEventMarkets", { state: { userId: id } });
  };
  const handleReset = (value) => {
    fetchData(value);
  };
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
            checked={checekedList.includes(record.eventMarketId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    // checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
    //   title: "Edit",
    //   key: "edit",
    //   render: (text, record) => (
    //     <i
    //       className="bx bx-edit"
    //       onClick={() => {
    //         handleEdit(record.eventMarketId);
    //       }}
    //     ></i>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Market Name",
      dataIndex: "marketName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "marketName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Event Ref ID",
      dataIndex: "eventRefId",
      key: "eventRefId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competition Name",
      dataIndex: "competitionName",
      key: "competitionName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Over",
      dataIndex: "over",
      key: "over",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Under",
      dataIndex: "under",
      key: "under",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Margin",
      dataIndex: "margin",
      key: "margin",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "20%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Is Allow",
      key: "isAllow",
      render: (text, record) => (
        <Button
          color={`${record.isAllow ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleAllowPermissions("isAllow", record, record.isAllow);
          }}
        >
          <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
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
            handleActiveInactivePermissions(
              "isActive",
              record,
              record.isActive
            );
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Event Markets",
    isActive: true,
    eventTypeSelect: true,
    competitionsListSelect: true,
    eventListSelect: true,
    resetButton: true,
    importExport: false,
    teamsList: false,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, []);

  useEffect(() => {
    fetchEventTypeData();
  }, [EventTypeActive]);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList();
    }
  }, [eventTypeId]);

  useEffect(() => {
    if (competitionId) {
      fetchEventList();
    } else {
      setEventList([]);
    }
  }, [competitionId]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Event Markets" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            competitionList={competitionList}
            eventList={eventList}
            setEventTypeActive={setEventTypeActive}
            setEventTypeId={setEventTypeId}
            setCompetitionId={setCompetitionId}
            onAddNavigate={"/addEventMarkets"}
            handleReset={handleReset}
            reFetchData={fetchData}
            // isAddPermission={checkPermission(
            //   permissionObj,
            //   pageName,
            //   PERMISSION_ADD
            // )}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            // teams={teams}
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
