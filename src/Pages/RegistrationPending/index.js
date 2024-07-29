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
  TAB_CLIENT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";

const Index = () => {
  const pageName = TAB_CLIENT;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Registration Pending";
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
      .post(`/admin/client/all`, {
        ...(latestValueFromTable || tableActions),
        isUserActive: 0,
      })
      .then((response) => {
        const clientData = response?.result;
        let clientDataIdList = [];
        clientData.forEach((ele) => {
          clientDataIdList.push(ele?.clientId);
        });
        setData(clientData);
        setDataIndexList(clientDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/client/activeInactiveClient`, {
        clientId: record.clientId,
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.clientId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.clientId);
    } else {
      updateSingleCheck = [...checekedList, e.clientId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleEdit = (clientId) => {
    navigate("/addRegistrationPending", { state: { clientId } });
  };

  const getProviderType = (status) => {
    switch (status) {
      case 1:
        return "Manual";
      case 2:
        return "Google";
      case 3:
        return "Facebook";
      default:
        return "Unknown";
    }
  };

  const getUserStatus = (status) => {
    switch (status) {
      case 0:
        return "Inactive";
      case 1:
        return "Active";
      default:
        return "Unknown";
    }
  };

  const getProcessStatus = (status) => {
    switch (status) {
      case 1:
        return "Added User Details";
      case 2:
        return "Mobile/Email Verified";
      case 3:
        return "Password set";
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
            checked={checekedList.includes(record.clientId)}
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
            handleEdit(record.clientId);
          }}
        ></i>
      ),
      style: { width: "2%" },
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Allow Multi Login",
      dataIndex: "isAllowMultiLogin",
      key: "isAllowMultiLogin",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
          // onClick={() => {
          //   handlePermissions("isAllowMultiLogin", record, record.isAllowMultiLogin);
          // }}
        >
          {" "}
          <i className={`bx ${record.isAllowMultiLogin ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    }, 
    {
      title: "Delete",
      dataIndex: "isDelete",
      key: "isDelete",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
          // onClick={() => {
          //   handlePermissions("isDelete", record, record.isDelete);
          // }}
        >
          {" "}
          <i className={`bx ${record.isDelete ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    }, 
    {
      title: "Email Verified",
      dataIndex: "isEmailVerified",
      key: "isEmailVerified",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
          // onClick={() => {
          //   handlePermissions("isEmailVerified", record, record.isEmailVerified);
          // }}
        >
          {" "}
          <i className={`bx ${record.isEmailVerified ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    }, 
    {
      title: "Email Id",
      dataIndex: "emailId",
      key: "emailId",
      sort: true,
      style: { width: "10%" },
    }, 
    {
      title: "Mobile Verified",
      dataIndex: "isMobileVerified",
      key: "isMobileVerified",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
          // onClick={() => {
          //   handlePermissions("isMobileVerified", record, record.isMobileVerified);
          // }}
        >
          {" "}
          <i className={`bx ${record.isMobileVerified ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
      sort: true,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Process Status",
      dataIndex: "registrationProcessStatus",
      render: (text, record) => (
        <span>{getProcessStatus(record?.registrationProcessStatus)}</span>
      ),
      key: "registrationProcessStatus",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "User Status",
      dataIndex: "isUserActive",
      render: (text, record) => (
        <span>{getUserStatus(record?.isUserActive)}</span>
      ),
      key: "isUserActive",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Provider",
      dataIndex: "provider",
      render: (text, record) => (
        <span>{getProviderType(record?.provider)}</span>
      ),
      key: "provider",
      sort: true,
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Is Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          {" "}
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Registration Pending",
    headerSelect: false,
    isActive: true,
    clone: false,
  };

  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/client/delete`, {
        clientId: checekedList,
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

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Registration Pending" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            onAddNavigate={"/addRegistrationPending"}
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
