import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import { TAB_PLAYERS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, ERROR, } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_PLAYERS
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Players | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/player/all`, {
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.playerId)
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
      .post(`/admin/eventType/all`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };
  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.playerId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.playerId);
    } else {
      updateSingleCheck = [...checekedList, e.playerId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/save`, {
        playerId: record.playerId,
        playerName: record.playerName,
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/delete`, {
        playerId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setCheckedList([]);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setCheckedList([]);
      });
  };
  const handleEdit = (id) => {
    navigate("/addPlayer", { state: { userId: id } });
  };
  const handleReset = () => {
    fetchData()
    fetchEventTypeData()
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
            checked={checekedList.includes(record.playerId)}
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
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.playerId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-sm rounded-circle"
                alt=""
                src={process.env.REACT_APP_BASE_URL + text}
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
      title: "Player Name",
      dataIndex: "playerName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "playerName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",

      style: { width: "10%" },
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
            handlePermissions("isActive", record, record.isActive);
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
    title: "Players",
    isActive: true,
    eventTypeSelect: true,
    resetButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
    fetchEventTypeData()
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Players" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            onAddNavigate={"/addPlayer"}
            handleReset={handleReset}
            reFetchData={fetchData}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
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
