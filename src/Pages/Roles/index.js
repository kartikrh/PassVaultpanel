import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { validateTabResponse } from "../../Layout/VerticalLayout/functions";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from '../../components/Model/SpinnerModel';
// import Model
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
import { useNavigate } from "react-router-dom";

const Index = () => {
  document.title = "Roles | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false)
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  //toaster
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  const navigate = useNavigate();

  // fetch data
  const fetchData = async () => {
    await axiosInstance.post(`/admin/roles/all`)
      .then((response) => {
        //   const tabsDataDB = validateTabResponse(response?.result);
        setData(response?.result);
        setIsLoading(false)
      }).catch((error) => {
        setIsLoading(false)
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
      if (singleCheck.includes(e.roleId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.roleId));
      } else {
        setSingleCheck([...singleCheck, e.roleId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true)
    await axiosInstance.post(
      `/admin/tabs/save`,
      {
        id: record.roleId,
        tabName: record.tabName,
        parentId: record.parentId,
        [pType]: cState ? false : true,
      }).then((response) => {
      const newArray = data.map(obj => (obj.roleId === record.roleId ? response.result : obj));
      setToast({
        message: response?.message,
        color: "green",
        header: "Success",
      });
      setToastStatus(true);
      // setData(newArray)
      // setIsLoading(false)
      fetchData()
    }).catch((error) => {
      setIsLoading(false);
      setToast({
        message: error?.message,
        color: "red",
        header: "Warning",
      });
      setToastStatus(true);
    })
  };

  const handleDelete = async (e) => {
    setIsLoading(true)
    // e.preventDefault()
    await axiosInstance.post(
      `/admin/roles/delete`,
      {
        roleIds: singleCheck,
      }).then((response) => {
      setDeleteModelVisable(false);
      fetchData();
      setToast({
        message: response?.message,
        color: "green",
        header: "Success",
      });
      setToastStatus(true);
    }).catch((error) => {
      setDeleteModelVisable(false);
      setToast({
        message: error?.message,
        color: "red",
        header: "Warning",
      });
      setToastStatus(true);
    });
  }

  const handleEdit = (roleId) => {
    navigate('/addRoles', { state: { roleId } });
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
            checked={checkedAll || singleCheck.includes(record.roleId)}
            onChange={() => {
              handleCheckedAll(record);
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit" onClick={() => { handleEdit(record.roleId) }}></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sort: true,
      style: { width: "90%" },
    },

  ];

  //elements required
  const tableElement = {
    title: "Roles",
    headerSelect: false,
    switch: false,
  };

  useEffect(() => {
    setIsLoading(true)
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Roles" />
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
            deleteModelFunction={setDeleteModelVisable}
            singleCheck = {singleCheck}
            reFetchData={fetchData}
            onAddNavigate={"/addRoles"}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={singleCheck}
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
