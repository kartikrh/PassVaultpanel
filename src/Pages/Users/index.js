import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
import Table from "../../components/Common/Table";
import { getToken } from "../../helpers/api_helper";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import axios from "axios";
import { decryptData } from "../Utility/encryptionUtils";
import SpinnerModel from "../../components/Model/SpinnerModel";
// import Model
import ChangePasswordModel from '../../components/Model/changePassword'
import DeleteTabModel from "../../components/Model/DeleteModel";
const Index = () => {
  document.title = "Event Types | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // password
  const [password, setPassword] = useState("");
  //useId
  const [userId, setUserId] = useState("")
  // model state
  const [changePasswordVisible, setChangPasswordModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);

  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // fetch data
  const fetchData = async () => {
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/user/all`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      .then((response) => {
        setData(response.result);
        setIsLoading(false);
        setChangPasswordModelVisible(false)
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
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/user/save`,
        {
          userId: record.userId,
          [pType]: cState ? false : true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      .then((response) => {
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    // e.preventDefault()
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/user/delete`,
        {
          userId: singleCheck,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/user/save`,
        {
          password: password,
          userId: userId
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      .then((response) => {
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
      });
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
      render: (text, record) => <i className="bx bx-edit"></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "User Name[Full Name]",
      dataIndex: "userName",
      key: "userName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Parent Name",
      dataIndex: "parentName",
      render: (text, record) => (<span style={{ cursor: "pointer" }}>{record.parentId === "0" ? "Root" : null}</span>),
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
      render: (text, record) => (<span>*******</span>),
      key: "password",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Change Password",
      dataIndex: "cPassword",
      render: (text, record) => (<span style={{ cursor: "pointer" }} onClick={() => { setChangPasswordModelVisible(true); setUserId(record.userId) }}><i className=" bx bx-show-alt" style={{ fontSize: "25px" }} /></span>),
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
          <i className="bx bx-block"></i>
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
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            setChangPasswordModelVisible={setChangPasswordModelVisible}
            deleteModelFunction={setDeleteModelVisable}

          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={singleCheck}
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
