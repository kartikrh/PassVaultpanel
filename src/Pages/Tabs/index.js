import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { validateTabResponse } from "../../Layout/VerticalLayout/functions";
import { apiGetTabCleaner } from '../../helpers/helper'
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from '../../components/Model/SpinnerModel';
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";

const Index = () => {
  document.title = "Tabs | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false)
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);

  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);
  const navigate = useNavigate()
  // fetch data
  const fetchData = async () => {
    await axiosInstance.post('/admin/tabs/all')
      .then((response) => {
        const tabsDataDB = validateTabResponse(response?.data?.result);
        const first = apiGetTabCleaner(tabsDataDB)
        const sorted = [...first].sort((a, b) => a.displayOrder - b.displayOrder);
        setData(sorted);
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
      if (singleCheck.includes(e.encryptedTabId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.encryptedTabId));
      } else {
        setSingleCheck([...singleCheck, e.encryptedTabId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true)
    await axiosInstance.post('/admin/tabs/save', {
      id: record.tabId,
      tabName: record.tabName,
      parentId: record.parentId,
      [pType]: cState ? false : true,
    })
      .then((response) => {
        response = response?.data
        const newArray = data.map(obj => (obj.encryptedTabId === record.encryptedTabId ? response.result : obj));
        // setData(newArray)
        // setIsLoading(false)
        fetchData()
      }).catch((error) => {
        setIsLoading(false)
      })
  };

  const handleDelete = async (e) => {
    setIsLoading(true)
    await axiosInstance.post('/admin/tabs/delete', {
      encryptedTabIds: singleCheck,
    })
      .then((response) => {
        setDeleteModelVisable(false);
        fetchData();
      }).catch((error) => {
      });
  }

  const handleEdit = (id) => {
    navigate('/addTabs', { state: { userId: id } });
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
            checked={checkedAll || singleCheck.includes(record.encryptedTabId)}
            onChange={() => {
              handleCheckedAll(record);
            }}
          />
          <i className="bx bx-move ms-1 mt-1"></i>
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit" onClick={() => { handleEdit(record.tabId) }}></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Tab Name",
      dataIndex: "tabName",
      render: (text, record) => (<span style={{ cursor: "pointer" }}>{text}</span>),
      key: "tabName",
      style: { width: "10%" },
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Display Type",
      dataIndex: "displayType",
      key: "displayType",
      render: (text, record) => (<span>{text === 1 ? "Admin" : "Agent"}</span>),
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "WebPage Route",
      dataIndex: "webPage",
      key: "webPage",
      style: { width: "10%" },
    },
    {
      title: "No. of Child",
      dataIndex: "childrenCount",
      key: "childrenCount",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Is Add",
      key: "add",
      render: (text, record) => (
        <Button
          color={`${record.IsAdd ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isAdd", record, record.IsAdd);
          }}
        >
          <i className="bx bx-block"></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Edit",
      key: "isEdit",
      render: (text, record) => (
        <Button
          color={`${record.IsEdit ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isEdit", record, record.IsEdit);
          }}
        >
          {" "}
          <i className="bx bx-block"></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Delete",
      key: "delete",
      render: (text, record) => (
        <Button
          color={`${record.IsDelete ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isDelete", record, record.IsDelete);
          }}
        >
          <i className="bx bx-block"></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Tabs",
    dragDrop: true,
    headerSelect: true,
    switch: false,
    subTable: true,
  };

  useEffect(() => {
    setIsLoading(true)
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Tabs" />
          {isLoading && <SpinnerModel />}
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            onAddNavigate={"/addTabs"}
            changeOrderApiName="tabs"
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
