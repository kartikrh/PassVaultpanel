import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import Toaster from "../../components/Toaster";
const Index = () => {
  document.title = "Events | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  //toast
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  //get Events Types
  const [eventTypes, setEventTypes] = useState([]);
  // get competitions
  const [competitions, setCompetitions] = useState([]);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);
  //redirect
  const navigate = useNavigate();
  // fetch data
  const fetchData = async () => {
    await axiosInstance
      .post(`/admin/events/all`)
      .then((response) => {
        setData(response?.result);
        const eventTypes = Array.from(
          new Set(response?.result.map((item) => item.eventType))
        );
        const competitions = Array.from(
          new Set(response?.result.map((item) => item.competition))
        );
        setEventTypes(eventTypes);
        setCompetitions(competitions);
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
      if (singleCheck.includes(e.eventId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.eventId));
      } else {
        setSingleCheck([...singleCheck, e.eventId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/events/save`, {
        eventId: record.eventId,
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
    const response = await axiosInstance
      .post(`/admin/events/delete`, {
        eventId: singleCheck,
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

  const handleEdit = (id) => {
    navigate("/addEvents", { state: { userId: id } });
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
            checked={checkedAll || singleCheck.includes(record.eventId)}
            onChange={() => {
              handleCheckedAll(record);
            }}
          />
        </div>
      ),
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
            handleEdit(record.eventId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventType",
      style: { width: "10%" },
    },
    {
      title: "Event Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {new Intl.DateTimeFormat("en-US", {
            year: "2-digit",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          }).format(new Date(text))}
        </span>
      ),
      key: "eventDate",
      style: { width: "10%" },
    },
    {
      title: "Venue",
      dataIndex: "venue",
      key: "venue",
      style: { width: "10%" },
    },
    {
      title: "Reference Id",
      dataIndex: "refId",
      key: "refId",
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      style: { width: "40%" },
    },
    {
      title: "Is Active",
      key: "active",
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
    title: "Events",
    headerSelect: false,
    eventTypeSelect: true,
    competitionsSelect: true,
    switch: false,
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Events" />
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
            addModelFunction={setAddModelVisable}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
            competitions={competitions}
            singleCheck={singleCheck}
            onAddNavigate={"/addEvents"}
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
