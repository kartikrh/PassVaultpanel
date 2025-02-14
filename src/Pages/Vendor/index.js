import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import { ERROR, MODULE_VENDORS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_VENDOR } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_VENDOR
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title = "Vendors";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (value) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/vendor/all`, {
        ...(value || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.vendorId - b?.vendorId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.vendorId)
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
    if (checekedList.includes(e.vendorId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.vendorId);
    } else {
      updateSingleCheck = [...checekedList, e.vendorId];
    }
    setCheckedList(updateSingleCheck)
  };
  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/vendor/activeInactiveVendor`, {
        vendorId: record.vendorId,
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

  const handleLoadData = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_VENDORS]})
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
      .post(`/admin/vendor/delete`, {
        vendorId: checekedList,
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
  const handleEdit = (id) => {
    navigate("/addVendor", { state: { vendorId: id } });
  };
  const handleVendorIpList = (details) => {
    const url = new URL(window.location.origin + "/vendorIpList");
    sessionStorage.setItem('vendorIpListId', "" + details?.vendorId);
    sessionStorage.setItem('vendorIpListDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    // navigate("/vendorIpList", { state: { vendorId: id } });
  };
  const updateIpCheckValue = async (pType, record, cState) => {
    await axiosInstance
      .post(`/admin/vendor/isIPCheck`, {
        vendorId: record?.vendorId,
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
    fetchData(value)
  }

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
            checked={checekedList.includes(record.vendorId)}
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
      render: (text, record) => (
        <i
          className="bx bx-edit"
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleEdit(record.vendorId);
          }}
        ></i>
      ),
      style: { width: "2%" },
    },
    {
      title: "Vendor",
      dataIndex: "name",
      key: "name",
      style: { width: "5%" },
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      style: { width: "5%" },
    },
    {
      title: "Subscription",
      dataIndex: "subscriptionDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "subscriptionDate",
      style: { width: "5%" },
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      render: (text, record) => (
        <span>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "expiryDate",
      style: { width: "5%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Vendor"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
      title: "Allow Ip",
      key: "isIPCheck",
      render: (text, record) => (
      <Tooltip title={"Allow/Disable Ip"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isIPCheck ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            updateIpCheckValue(
              "isIPCheck",
              record,
              record?.isIPCheck
            );
          }}
        >
          <i
            className={`bx ${record?.isIPCheck ? "bx-check" : "bx-block"
              }`}
          ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Vendor IP",
      key: "venderIpList",
      printType: "ignore",
      render: (text, record) => (
      <Tooltip title={"View Vendor Ip List"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"primary"}
          size="sm"
          disabled={
            !record.isIPCheck
          }
          className="btn"
          onClick={() => {
            handleVendorIpList(record);
          }}
        >
          <i class='bx bxs-store' ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Vendors",
    isActive: true,
    reloadButton: true,
    loadData: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData({ isActive: true });
  }, []);

  const handleReload = (value) => {
    fetchData({ isActive: true });
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Vendors" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            reFetchData={fetchData}
            singleCheck={checekedList}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={handleLoadData}
            onAddNavigate={"/addVendor"}
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
