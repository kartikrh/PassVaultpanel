import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_TEAMS } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_TEAMS
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Teams";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitionList, setCompetitionList] = useState([]);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filteredCompetitiondata = () => {
    if (eventTypeId && competitionId) {
      let res =  competitionList.filter(
        (comp) => comp.eventTypeId === parseInt(eventTypeId)
      );
      setData(res)
    }
  }
  useEffect(() => {
    filteredCompetitiondata()
  }, [competitionId]);

  // fetch data
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/team/all`, {
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.teamId - b?.teamId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.teamId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/team/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };

  const fetchCompetitionList = async () => {
    await axiosInstance
      .post(`/admin/team/competitionListByEventTypeId`, {
        isActive: true,
        eventTypeId: eventTypeId,
      })
      .then((response) => {
        setCompetitionList(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.teamId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.teamId);
    } else {
      updateSingleCheck = [...checekedList, e.teamId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handleTournament = (details) => {
    const url = new URL(window.location.origin + "/tournamentCompetitionPoints");
    sessionStorage.setItem('teamId', "" + details?.teamId);
    sessionStorage.setItem('teamDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/team/delete`, {
        teamId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        setCheckedList([])
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleEdit = (id) => {
    navigate("/addTeams", { state: { userId: id } });
  };
  const handleReset = (value) => {
    fetchData(value)
  }
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
            checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            onChange={() => {
              setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
              )
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
            checked={checekedList.includes(record.teamId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.teamId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs rounded-circle"
                alt=""
                src={text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "image",
      style: { width: "10%" },
    },
    {
      title: "Jersey Image",
      dataIndex: "jersey",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs rounded-circle"
                alt=""
                src={text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "jersey",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Short Name",
      dataIndex: "teamShortName",
      key: "teamShortName",
      style: { width: "20%" },
    },
    {
      title: "Country",
      dataIndex: "country",
      render: (text, record) => text !== null ? text : "N/A",
      key: "country",
      style: { width: "20%" },
    },
    {
      title: "Tournament",
      key: "teamId",
      render: (text, record) => (
        <>
          <Tooltip title={"Tournament"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => {
                handleTournament(record);
              }}
            >
              <i class='bx bxs-store' ></i>
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Teams",
    headerSelect: false,
    switch: false,
    eventTypeSelect: true,
    competitionsListSelect: true,
    resetButton: true,
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
    fetchEventTypeData()
  }, []);

  useEffect(() => {
    if (eventTypeId) {
      fetchCompetitionList();
    }
  }, [eventTypeId]);

  const handleReload = (value) => {
    fetchData();
    fetchEventTypeData()
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Teams" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            handleReset={handleReset}
            handleReload={handleReload}
            eventTypes={eventTypes}
            competitionList={competitionList}
            setEventTypeId={setEventTypeId}
            onAddNavigate={"/addTeams"}
            reFetchData={fetchData}
            setCompetitionId={setCompetitionId}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
