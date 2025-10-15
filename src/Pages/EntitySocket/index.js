import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual, isEmpty } from "lodash";
import { ERROR, MODULE_ENTITY_SOCKET, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_ClientSocket, TAB_EntitySocket } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChangeActionTypeModel } from "../../components/Model/ChangeActionType";
import { Avatar, Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";
import axios from "axios";

const Index = () => {
  // const pageName = TAB_ClientSocket
  const pageName = TAB_EntitySocket
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Entity Socket";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [changeModelVisible, setChangeModelVisible] = useState(false);
  const [selectedEntitySocket, setSelectedEntitySocket] = useState({});
  const [checekedList, setCheckedList] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [viewCounts, setViewCounts] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // fetch data
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/entitySocket/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.entitySocketId - b?.entitySocketId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.entitySocketId)
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

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "N.A";
      case 1:
        return "Connected";
      case 2:
        return "Disconnected";
      case 3:
        return "Reconnecting";
      default:
        return "Unknown";
    }
  };

  const getActionType = (status) => {
    switch (status) {
      case 0:
        return "N.A";
      case 1:
        return "Connect";
      case 2:
        return "Disconnect";
      default:
        return "Unknown";
    }
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.entitySocketId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.entitySocketId);
    } else {
      updateSingleCheck = [...checekedList, e.entitySocketId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    let endPoint = pType == "isActive" ? '/admin/entitySocket/activeInactive' : pType == "isAutoScoreUpdate" ? '/admin/entitySocket/autoScoreUpdate' : pType == "isAutoUpdateCommentary" ? '/admin/entitySocket/autoUpdateCommentary' : '/admin/entitySocket/activeInactive'
    // if(pType)
    await axiosInstance
      .post(endPoint, {
        entitySocketId: record.entitySocketId,
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

  const fetchViewCount = async (url, entitySocketId) => {
    setIsLoading(true);
    await axios
      .post(`${url}/api/socketEntitysCountV1`,"",
        {
          headers: {
            "Content-Type": "application/json",
          },
        })
      .then((response) => {
        const count = response?.data?.result?.totalCount ?? 0;
        setViewCounts((prev) => ({
          ...prev,
          [entitySocketId]: count,
        }));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleChange = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/entitySocket/changeActionType`, {
        ...selectedEntitySocket,
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

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_ENTITY_SOCKET], password})
      .then((response) => {
        fetchData();
        setLoadDataModelVisable(false);
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
      .post(`/admin/entitySocket/delete`, {
        entitySocketId: checekedList,
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
    navigate("/addEntitySocket", { state: { userId: id } });
  };
  const handleReset = (value) => {
    setViewCounts({});
    fetchData(value)
  }
  const actionTypeOptions = [
    { label: "Connect", value: 1 },
    { label: "Disconnect", value: 2 },
  ];
  
  //table columns
  const columns = [
    {
      // title: (
      //   <div className="form-check">
      //     <input
      //       className="form-check-input"
      //       type="checkbox"
      //       name="chk_child"
      //       value="option1"
      //       checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
      //       onChange={() => {
      //         setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
      //         )
      //       }}
      //     />
      //   </div>
      // ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.entitySocketId)}
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
          handleEdit(record.entitySocketId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Player Image",
      dataIndex: "defaultPlayerImage",
      // printType: "ignore",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div className=""
            >
              <img
                className="avatar-sm "
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
      // key: "tabName",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Team Image",
      dataIndex: "defaultTeamImage",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div className=""
            >
              <img
                className="avatar-sm "
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
      // key: "tabName",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Jersey Image",
      dataIndex: "defaultJerseyImage",
      // printType: "ignore",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div className=""
            >
              <img
                className="avatar-sm"
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
      // key: "tabName",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Server",
      dataIndex: "serverName",
      key: "serverName",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Url",
      dataIndex: "url",
      key: "url",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Reconnect Count",
      dataIndex: "reconnectCount",
      key: "reconnectCount",
      style: { width: "20%" },
    },
    {
      title: "Action Type",
      dataIndex: "actionType",
      render: (text, record) => (
        <span
          onClick={() => {
            setChangeModelVisible(true);
            setSelectedEntitySocket(record);
          }}
          style={{ cursor: "pointer" }}
        >
          {getActionType(text)} {<a className="bx bx-edit-alt"></a>}
        </span>
      ),
      key: "actionType",
      sort: true,
      style: { width: "20%"},
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      style: { width: "20%" },
      render: (text, record) => <span>{getStatusText(record.status)}</span>,
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Entity Socket"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
    // {
    //   title: "Viewers",
    //   key: "viewers",
    //   render: (text, record) => (
    //   <Tooltip title={"Viewers"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
    //     <Button
    //       color={
    //         viewCounts[record.entitySocketId] !== undefined
    //           ? "info"
    //           : "primary"
    //       }
    //       style={{ minWidth: "70px" }}
    //       disabled={!record?.isActive}
    //       size="sm"
    //       className="btn"
    //       onClick={() => fetchViewCount(record?.url, record?.entitySocketId)}
    //     >
    //        {viewCounts[record.entitySocketId] !== undefined
    //         ? `V: ${viewCounts[record.entitySocketId]}`
    //         : "Viewers"}
    //     </Button>
    //   </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "Auto Score Update",
      key: "isAutoScoreUpdate",
      render: (text, record) => (
      <Tooltip title={"Entity Socket"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isAutoScoreUpdate ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isAutoScoreUpdate", record, record.isAutoScoreUpdate);
          }}
        >
          <i className={`bx ${record.isAutoScoreUpdate ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Auto Update Commentary",
      key: "isAutoUpdateCommentary",
      render: (text, record) => (
      <Tooltip title={"Entity Socket"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isAutoUpdateCommentary ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isAutoUpdateCommentary", record, record.isAutoUpdateCommentary);
          }}
        >
          <i className={`bx ${record.isAutoUpdateCommentary ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Entity Socket",
    resetButton: true,
    isActive: true,
    actionType: true,
    reloadButton: true,
    loadData: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
  }, [permissionObj]);

  const handleReload = (value) => {
    setViewCounts({});
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Entity Socket" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            handleReset={handleReset}
            onAddNavigate={"/addEntitySocket"}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            selectedClientSocket={selectedEntitySocket}
            setSelectedClientSocket={setSelectedEntitySocket}
            isEntitySocket = {true}
            handleClientSocketChange={handleChange}
            actionTypeOptions={actionTypeOptions}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
          />
            {changeModelVisible && (
            <ChangeActionTypeModel
              changeModelVisible={changeModelVisible}
              setChangeModelVisible={setChangeModelVisible}
              handleChange={handleChange}
              singleCheck={checekedList}
              selectedClientSocket={selectedEntitySocket}
              setSelectedClientSocket={setSelectedEntitySocket}
              isEntity={true}
            />
          )}
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Entity Socket"}
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
