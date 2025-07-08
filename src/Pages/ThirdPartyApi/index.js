import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import { ERROR, MODULE_THIRD_PARTY_APIS, PERMISSION_VIEW, SUCCESS, TAB_THIRD_PARTY_API } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_THIRD_PARTY_API;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Third Party Api";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // fetch data
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/thirdPartyApi/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.id)
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.id);
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/thirdPartyApi/activeInactive`, {
        id: record.id,
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

  const getType = (status) => {
    switch (status) {
      case 1:
        return "Socket";
      case 2:
        return "API";
      default:
        return "Unknown";
    }
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_THIRD_PARTY_APIS], password})
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

  const handleSocket = async (record) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/signalr/connection`, {
        id: record.id,
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
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Provider",
      dataIndex: "providerName",
      key: "providerName",
      style: { width: "10%" },
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
      title: "Type",
      dataIndex: "type",
      render: (text, record) => (
        <span>
          {getType(text)}
        </span>
      ),
      key: "type",
      sort: true,
      style: { width: "10%"},
    },
    {
      title: "Connect",
      key: "isConnect",
      render: (text, record) => (
      <Tooltip title={"Socket"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isConnect ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleSocket(record);
          }}
        >
          {record.isConnect ? "Connected" : "Disconnected"}
        </Button>
      </Tooltip>
      ),
      style: { width: "2%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Client Socket"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
    title: "Third Party Api",
    isActive: true,
    reloadButton: true,
    loadData: true,
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Third Party Api" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
          />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Third Party Api"}
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
