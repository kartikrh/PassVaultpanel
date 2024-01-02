import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
// import Model
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
import { useNavigate } from "react-router-dom";

const Index = () => {
  document.title = "Event Types | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  //isActive
  const [isActive, setIsActive] = useState();
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
  const fetchData = async (value) => {
    setIsActive(value)
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventType/all`, {
      ...value,
      })
      .then((response) => {
        setData(response.result);
        setIsLoading(false);
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
      if (singleCheck.includes(e.eventTypeId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.eventTypeId));
      } else {
        setSingleCheck([...singleCheck, e.eventTypeId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventType/save`, {
        eventTypeId: record.eventTypeId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        setToast({
          message: response?.message,
          color: "green",
          header: "Success",
        });
        setToastStatus(true);
        fetchData(isActive);
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    // e.preventDefault()
    await axiosInstance
      .post(`/admin/eventType/delete`, {
        eventTypeId: singleCheck,
      })
      .then((response) => {
        fetchData();
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
        setDeleteModelVisable(false);
      });
  };

  const handleEdit = (eventTypeId) => {
    navigate("/addEventType", { state: { eventTypeId } });
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
            checked={checkedAll || singleCheck.includes(record.eventTypeId)}
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
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.eventTypeId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs rounded-circle"
                alt=""
                src={process.env.REACT_APP_BASE_URL + text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "image",
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      sort: true,
      style: { width: "100%" },
    },

    {
      title: "Is Highlights",
      key: "isHighlight",
      dataIndex: "isHighlight",
      render: (text, record) => (
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isHighlight", record, record.isHighlight);
          }}
        >
          <i
            className={`bx ${record.isHighlight ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
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
    title: "Event Types",
    headerSelect: false,
    isActive: true,
    dragDrop: true,
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData({isActive:true});
  }, []);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Event Types" />
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
            changeOrderApiName="eventType"
            singleCheck={singleCheck}
            setIsActive={setIsActive}
            reFetchData={fetchData}
            onAddNavigate={"/addEventType"}
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
