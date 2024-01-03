import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import SpinnerModel from '../../components/Model/SpinnerModel';
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";

const Index = () => {
  document.title = "Roles | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    await axiosInstance.post(`/admin/roles/all`)
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.roleId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setIsLoading(false)
      }).catch((error) => {
        setIsLoading(false)
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.roleId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.roleId);
    } else {
      updateSingleCheck = [...checekedList, e.roleId];
    }
    setCheckedList(updateSingleCheck)
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
        roleIds: checekedList,
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
        setIsLoading(false)
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
            checked={isEqual(checekedList?.sort(), dataIndexList?.sort())}
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
            checked={checekedList.includes(record.roleId)}
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
            singleCheck={checekedList}
            reFetchData={fetchData}
            // addModelFunction={setAddModelVisable}
            onAddNavigate={"/addRoles"}
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
