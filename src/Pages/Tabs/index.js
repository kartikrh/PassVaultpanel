import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { validateTabResponse } from "../../Layout/VerticalLayout/functions";
import { apiGetTabCleaner } from "../../helpers/helper";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
import { isEqual } from "lodash";
const Index = () => {
  const location = useLocation();
  const selectedTabId = location.state?.selectedTabId
  document.title = "Tabs | ScoreCard - React Admin & Dashboard Template";
  const [currentParentTab, setCurrentParentTab] = useState(undefined)
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const [displayTypes, setDisplayTypes] = useState([]);
  const [isActive, setIsActive] = useState(true)
  const [checkedAll, setCheckedAll] = useState(false);
  let sorted = []
  const [checekedList, setCheckedList] = useState([]);
  const navigate = useNavigate();
  const fetchData = async (value) => {
    setIsLoading(true)
    setIsActive(value)
    await axiosInstance
      .post("/admin/tabs/tablist", { ...value })
      .then((response) => {
        const tabsDataDB = validateTabResponse(response?.result);
        const first = apiGetTabCleaner(tabsDataDB);
        let apiDataIdList = []
        sorted = [...first].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        sorted.forEach((item) => {
          if (item.children && Array.isArray(item.children)) {
            apiDataIdList.push(item?.tabId)
            item.children.sort((x, y) => x.displayOrder - y.displayOrder);
          }
          apiDataIdList.push(item?.tabId)
        });
        setData(sorted);
        setDataIndexList(apiDataIdList)
        if (selectedTabId) {
          setCurrentParentTab(sorted.filter((element) => {
            return element?.tabId === selectedTabId
          })?.[0])
        }
        const displayType = Array.from(
          new Set(response?.result.map((item) => item.displayType))
        );
        setDisplayTypes(displayType);
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.tabId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.tabId);
    } else {
      updateSingleCheck = [...checekedList, e.tabId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/tabs/save", {
        id: record.tabId,
        tabName: record.tabName,
        parentId: record.parentId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        setToast({
          message: `${response.title} status updated successfully`,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
        fetchData(isActive);
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
  const resetJumpToChild = () => {
    setCurrentParentTab(undefined)
  }
  const handleDelete = async (e) => {
    if (checekedList.length > 0) {
      setIsLoading(true);
      await axiosInstance
        .post("/admin/tabs/delete", {
          encryptedTabIds: checekedList,
        })
        .then((response) => {
          setDeleteModelVisable(false);
          setToast({
            message: `${response.title} deleted successfully`,
            color: "green",
            header: "Success",
          });
          setToastStatus(true);
          fetchData(isActive);
        })
        .catch((error) => {
          setToast({
            message: error.error.message,
            color: "red",
            header: "Warning",
          });
          setToastStatus(true);
        });
    }
  };

  const handleEdit = (id) => {
    navigate("/addTabs", { state: { userId: id } });
  };
  const handleReset =() =>{
    fetchData({})
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
            checked={checekedList.includes(record.tabId)}
            onChange={() => {
              handleSingleCheck(record);
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
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.tabId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Tab Name",
      dataIndex: "tabName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
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
      render: (text, record) => <span>{text === 1 ? "Admin" : "Agent"}</span>,
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
      title: "Is Active",
      key: "isActive",
      dataIndex: "IsActive",
      render: (text, record) => (
        <Button
          color={`${record.IsActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.IsActive);
          }}
        >
          <i className={`bx ${record.IsActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Add",
      key: "IsAdd",
      render: (text, record) => (
        <Button
          color={`${record.IsAdd ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isAdd", record, record.IsAdd);
          }}
        >
          <i className={`bx ${record.IsAdd ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Edit",
      key: "IsEdit",
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
          <i className={`bx ${record.IsEdit ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Is Delete",
      key: "IsDelete",
      render: (text, record) => (
        <Button
          color={`${record.IsDelete ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isDelete", record, record.IsDelete);
          }}
        >
          <i className={`bx ${record.IsDelete ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Tabs",
    dragDrop: true,
    displayTypeDropDown: true,
    switch: false,
    subTable: true,
    resetButton: true,
    isActive: true
  };

  useEffect(() => {
    setIsLoading({ isActive: true });
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Tabs" />
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
            onAddNavigate={"/addTabs"}
            changeOrderApiName="tabs"
            displayTypes={displayTypes}
            singleCheck={checekedList}
            jumpToChild={currentParentTab}
            resetJumpToChild={resetJumpToChild}
            reFetchData={fetchData}
            handleReset = {handleReset}
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
