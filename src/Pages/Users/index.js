import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import ChangePasswordModel from "../../components/Model/changePassword";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { Tooltip } from 'antd';
import Toaster from "../../components/Toaster";
import { oldSchoolCopy } from "../../Hooks/useCopyToClipboard";
import { isEqual } from "lodash";
import { PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, TAB_USERS } from "../../components/Common/Const";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { useSelector } from "react-redux";

const Index = () => {
  const pageName = TAB_USERS
  document.title = "Event Types | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState()
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [changePasswordVisible, setChangPasswordModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  //toast
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const navigate = useNavigate();
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);

  const fetchData = async (value) => {
    setIsActive(value)
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/user/all`, {
        ...value
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.userId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setChangPasswordModelVisible(false);
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.userId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.userId);
    } else {
      updateSingleCheck = [...checekedList, e.userId];
    }
    setCheckedList(updateSingleCheck)
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/user/save`, {
        userId: record.userId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData(isActive);
        setToast({
          message: `${response.title} status updated successfully`,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error.error.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    // e.preventDefault()
    await axiosInstance
      .post(`/admin/user/delete`, {
        userId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        setToast({
          message: response?.result,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error.error.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/user/save`, {
        password: password,
        userId: userId,
      })
      .then((response) => {
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const getDecryptedPassword = async (userId, copy = false) => {
    await axiosInstance
      .post(`/admin/user/decryptPassword`, {
        userId: userId,
      })
      .then((response) => {
        const password = response?.result?.password || "";
        if (copy) {
          navigator.clipboard.writeText(password)
            .then(res => setClipboard({ [userId]: password }))
            .catch(err => oldSchoolCopy(password))
            .finally(() => setTimeout(() => setClipboard(null), 2000))
        } else {
          setDecryptedPasswords(prev => ({ ...prev, [userId]: password }));
        }
      })
      .catch((error) => {
        setToast({
          message: error?.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  }

  const passwordRecord = (userId) => (<div className="d-flex align-items-center justify-content-between me-1">
    <span onClick={() => getDecryptedPassword(userId)} >*******</span>
    {clipboard?.[userId] ? <Tooltip placement="bottomLeft" open={true} title={"Copied!"} >
      <i role="button" onClick={() => getDecryptedPassword(userId, true)} className='bx bxs-copy'></i>
    </Tooltip> :
      <i role="button" onClick={() => getDecryptedPassword(userId, true)} className='bx bxs-copy'></i>
    }
  </div>)

  const handleEdit = (id) => {
    navigate("/addUsers", { state: { userId: id } });
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
            checked={checekedList.includes(record.userId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
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
            handleEdit(record.userId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "User Name[Full Name]",
      dataIndex: "userName",
      render: (text, record) => (
        <span>
          {text} [{record?.name}]
        </span>
      ),
      key: "userName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Parent Name",
      dataIndex: "parentName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {record.parentId === "0" ? "Root" : (record?.parentName || null)}
        </span>
      ),
      key: "parentName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Password",
      dataIndex: "password",
      render: (text, record) => (
        decryptedPasswords?.[record.userId] ?
          <Tooltip title={decryptedPasswords?.[record.userId]}>{passwordRecord(record.userId)}</Tooltip> :
          passwordRecord(record.userId)
      ),
      key: "password",
      sort: true,
      style: { width: "100%" },
      printType: "ignore"
    },
    {
      title: "Change Password",
      dataIndex: "cPassword",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setChangPasswordModelVisible(true);
            setUserId(record.userId);
          }}
        >
          <i className=" bx bx-show-alt" style={{ fontSize: "25px" }} />
        </span>
      ),
      key: "cPassword",
      sort: true,
      style: { width: "100%", textAlign: "center" },
      printType: "ignore"
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

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    setIsLoading(true);
    fetchData({ isActive: true });
  }, []);
  //elements required
  const tableElement = {
    title: "Users",
    headerSelect: false,
    isActive: true,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Users" />
          {isLoading && <SpinnerModel />}
          {toastStatus && (
            <Toaster
              toast={toast}
              setToast={setToast}
              toastStatus={toastStatus}
              setToastStatus={setToastStatus}
            />
          )}
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            setIsActive={setIsActive}
            reFetchData={fetchData}
            setChangPasswordModelVisible={setChangPasswordModelVisible}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addUsers"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <ChangePasswordModel
            changePasswordVisible={changePasswordVisible}
            setChangPasswordModelVisible={setChangPasswordModelVisible}
            setPassword={setPassword}
            handleChangePassword={handleChangePassword}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
