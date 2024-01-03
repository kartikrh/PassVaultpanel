import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";

const Index = () => {
  document.title = "Players | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [run, setRun] = useState(null);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (value) => {
    setIsLoading(true);
    setIsActive(value)
    await axiosInstance
      .post(`/admin/paneltyRun/all`, { ...value })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.paneltyId)
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
    if (checekedList.includes(e.paneltyId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.paneltyId);
    } else {
      updateSingleCheck = [...checekedList, e.paneltyId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/paneltyRun/save`, {
        paneltyId: record.paneltyId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData(isActive);
        setToast({
          message: response?.message,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error?.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };
  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    const response = await axiosInstance
      .post(`/admin/paneltyRun/delete`, {
        paneltyId: checekedList,
      })
      .then((response) => {
        fetchData(isActive);
        setDeleteModelVisable(false);
        setToast({
          message: response?.message,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error?.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };
  //chnage Penalty Run
  const handleRuns = async (value) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/paneltyRun/save`, value)
      .then((response) => {
        fetchData();
        setToast({
          message: response?.message,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error?.message,
          color: "red",
          header: "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleEdit = (paneltyId) => {
    navigate("/addPenalty", { state: { paneltyId } });
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
            checked={checekedList.includes(record.paneltyId)}
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
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.paneltyId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Description",
      dataIndex: "desc",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "desc",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Runs",
      dataIndex: "run",
      key: "run",
      render: (text, record) => (
        <div className="d-flex">
          <input
            type="text "
            className="text-center"
            style={{
              width: "70px",
              border: "solid lightgray 1px",
              borderRadius: "5px",
            }}
            value={run?.[record.paneltyId] === undefined ? text : run[record.paneltyId]}
            onChange={(e) => {
              setRun(prev => ({ ...prev, [record.paneltyId]: e.target.value }));
            }}
          />
          <button
            className="btn btn-primary sm btn-sm"
            onClick={(e) => {
              handleRuns({
                paneltyId: record.paneltyId,
                run: run?.[record.paneltyId] === undefined ? text : run[record.paneltyId]
              });
            }}
          >
            <i className="bx bxs-like" />
          </button>
        </div>
      ),
      style: { width: "80%", textAlign: "center" },
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
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
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Penalty Runs",
    headerSelect: false,
    isActive: true,
    clone: false,
  };

  useEffect(() => {
    setIsLoading({ isActive: true });
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Penalty Runs" />
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
            setIsActive={setIsActive}
            reFetchData={fetchData}
            onAddNavigate={"/addPenalty"}
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
