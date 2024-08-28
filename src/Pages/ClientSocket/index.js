import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_ClientSocket } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ChangeActionTypeModel } from "../../components/Model/ChangeActionType";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_ClientSocket
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Client Socket";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [changeModelVisible, setChangeModelVisible] = useState(false);
  const [selectedClientSocket, setSelectedClientSocket] = useState({});
  const [checekedList, setCheckedList] = useState([]); const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // fetch data
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/clientSocket/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.clientSocketId)
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
    if (checekedList.includes(e.clientSocketId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.clientSocketId);
    } else {
      updateSingleCheck = [...checekedList, e.clientSocketId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/clientSocket/activeInactive`, {
        clientSocketId: record.clientSocketId,
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

  const handleChange = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/clientSocket/changeActionType`, {
        ...selectedClientSocket,
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/clientSocket/delete`, {
        clientSocketId: checekedList,
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
    navigate("/addClientSocket", { state: { userId: id } });
  };
  const handleReset = (value) => {
    fetchData(value)
  }
  const actionTypeOptions = [
    { label: "Connect", value: 1 },
    { label: "Disconnect", value: 2 },
  ];
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
            checked={checekedList.includes(record.clientSocketId)}
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
          handleEdit(record.clientSocketId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
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
            setSelectedClientSocket(record);
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
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Client Socket"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
  ];

  //elements required
  const tableElement = {
    title: "Client Socket",
    resetButton: true,
    isActive: true,
    actionType: true,
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
  }, []);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Client Socket" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            handleReset={handleReset}
            onAddNavigate={"/addClientSocket"}
            reFetchData={fetchData}
            handleReload={handleReload}
            selectedClientSocket={selectedClientSocket}
            setSelectedClientSocket={setSelectedClientSocket}
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
              selectedClientSocket={selectedClientSocket}
              setSelectedClientSocket={setSelectedClientSocket}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
