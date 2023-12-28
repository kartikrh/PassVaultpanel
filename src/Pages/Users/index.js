import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
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
const Index = () => {
  document.title = "Event Types | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // password
  const [password, setPassword] = useState("");
  //useId
  const [userId, setUserId] = useState("");
  // model state
  const [changePasswordVisible, setChangPasswordModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  //toast
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);
  //redirect
  const navigate = useNavigate();
  // fetch data
  const fetchData = async (isActive) => {
    await axiosInstance
      .post(`/admin/user/all`,{
        isActive:isActive === undefined? true : isActive
      })
      .then((response) => {
        setData(response.result);
        setIsLoading(false);
        setChangPasswordModelVisible(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  //checkbox function
  const handleCheckedAll = (e) => {
    if (e === "all") {
      if (checkedAll) {
        setCheckedAll(false);
        setSingleCheck([]);
      } else {
        setCheckedAll(true);
      }
    } else {
      if (singleCheck.includes(e.userId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.userId));
      } else {
        setSingleCheck([...singleCheck, e.userId]);
      }
    }
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
        fetchData();
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
        userId: singleCheck,
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
            onChange={() => {
              handleCheckedAll("all");
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
            checked={checkedAll || singleCheck.includes(record.userId)}
            onChange={() => {
              handleCheckedAll(record);
            }}
          />
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    {
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
          {record.parentId === "0" ? "Root" : null}
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
      render: (text, record) => <Tooltip title={text}> <span>*******</span> </Tooltip>,
      key: "password",
      sort: true,
      style: { width: "100%" },
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
    title: "Users",
    headerSelect: false,
    switch: true,
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, []);

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
            reFetchData={fetchData}
            setChangPasswordModelVisible={setChangPasswordModelVisible}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={singleCheck}
            onAddNavigate={"/addUsers"}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
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
