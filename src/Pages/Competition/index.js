import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_COMPETITION } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_COMPETITION
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title =
    "Competitions";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [isDrag, setIsDrag] = useState(true);
  const [eventTypes, setEventTypes] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    const isDragValue = latestValueFromTable?.isTrending !== undefined ? latestValueFromTable?.isTrending : isDrag;
    setIsDrag(isDragValue);
    await axiosInstance
      .post(`/admin/competition/all`, {
        ...(latestValueFromTable || tableActions),
        isTrending: latestValueFromTable?.isTrending !== undefined ? latestValueFromTable?.isTrending : tableActions?.isTrending !== undefined ? tableActions?.isTrending : true
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.competitionId)
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
      .post(`/admin/competition/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.competitionId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.competitionId);
    } else {
      updateSingleCheck = [...checekedList, e.competitionId];
    }
    setCheckedList(updateSingleCheck)
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/save`, {
        competitionId: record.competitionId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  const handleIsTrending = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/isTrending`, {
        competitionId: record.competitionId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  //delete function
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/delete`, {
        competitionId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  //edit
  const handleEdit = (id) => {
    navigate("/addCompetition", { state: { userId: id } });
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
            checked={checekedList.includes(record.competitionId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          {isDrag ? <i className="bx bx-move ms-1 mt-1"></i> : null}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.competitionId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        // <img src={text}/>
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
      key: "tabName",
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventType",
      style: { width: "10%" },
    },
    {
      title: "Reference Id",
      dataIndex: "refId",
      key: "refId",
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      style: { width: "60%" },
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Competition"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "IsTrending",
      key: "isTrending",
      render: (text, record) => (
        <Button
          color={`${record.isTrending ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsTrending("isTrending", record, record.isTrending);
          }}
        >
          <i className={`bx ${record.isTrending ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const handleReset = (value) => {
    fetchData(value)
  }
  //elements required
  const tableElement = {
    title: "Competition",
    dragDrop: isDrag,
    headerSelect: false,
    eventTypeSelect: true,
    isActive: true,
    resetButton: true,
    reloadButton: true,
    isTrending: true,
  };


  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Competition" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            onAddNavigate={"/addCompetition"}
            handleReset={handleReset}
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
