import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_API_ENDPOINTS,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_API_ENDPOINTS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "API Endpoints";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/apiEndpoint/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.apiEndPointId - b?.apiEndPointId);
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.apiEndPointId);
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.apiEndPointId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.apiEndPointId
      );
    } else {
      updateSingleCheck = [...checekedList, e.apiEndPointId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleEdit = (apiEndPointId) => {
    navigate("/addApiEndpoint", { state: { apiEndPointId } });
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/apiEndpoint/activeInactiveApiEndpoints`, {
        apiEndPointId: record.apiEndPointId,
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
  const getServiceType = (status) => {
    switch (status) {
      case 1:
        return "clientAPI";
      case 2:
        return "dataProviderAPI";
      default:
        return "Unknown";
    } 
  };
  const getModuleType = (status) => {
    switch (status) {
      case 1:
        return "commentaryUpdate";
      case 2:
        return "vendorUpdate";
      case 3:
        return "vendorIpUpdate";
      case 4:
        return "updateConfig";
      case 5:
        return "updateBanner";
      case 6:
        return "updateSeoModule";
      case 7:
        return "updateMenuList";
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
            checked={checekedList.includes(record.apiEndPointId)}
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
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.apiEndPointId);
          }}
        ></i>
      ),
      style: { width: "2%" },
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      render: (text, record) => (
        <span>{getServiceType(record?.serviceType)}</span>
      ),
      key: "serviceType",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Endpoint",
      dataIndex: "endPoint",
      key: "endPoint",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "Module Type",
      dataIndex: "moduleType",
      render: (text, record) => (
        <span>{getModuleType(record?.moduleType)}</span>
      ),
      key: "moduleType",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "TimeOut",
      dataIndex: "timeOut",
      key: "timeOut",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive API Endpoint"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
    title: "API Endpoints",
    headerSelect: false,
    reloadButton: true,
    isActive: true,
    clone: false,
  };

  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/apiEndpoint/delete`, {
        apiEndPointId: checekedList,
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
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="API Endpoints" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            onAddNavigate={"/addApiEndpoint"}
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
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
