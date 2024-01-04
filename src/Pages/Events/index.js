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
import { isEqual } from "lodash";
const Index = () => {
  document.title = "Events | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState();
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color: "",
    header: "",
  });
  const [toastStatus, setToastStatus] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();

  const fetchData = async (value) => {
    setIsActive(value)
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/events/all`, {
        ...value
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.eventTypeId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
    if (value?.eventTypeId) {
      await axiosInstance
        .post(`/admin/competition/byeventTypeId`, {
          eventTypeId: value?.eventTypeId
        })
        .then((response) => {
          setCompetitions(response.result);
          setIsLoading(false);
        })
        .catch((error) => { });
    }
  };
  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/eventType/all`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };
  const fetchCompetitionData = async (value) => {
    await axiosInstance
      .post(`/admin/competition/all`, {
        eventTypeId: value
      })
      .then((response) => {
        setCompetitions(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.eventId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.eventId);
    } else {
      updateSingleCheck = [...checekedList, e.eventId];
    }
    setCheckedList(updateSingleCheck)
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
        fetchData(isActive);
        setToast({
          message: response?.message,
          color: "green",
          header: response?.title || "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error?.message,
          color: "red",
          header: error?.title || "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    const response = await axiosInstance
      .post(`/admin/events/delete`, {
        eventId: checekedList,
      })
      .then((response) => {
        fetchData(isActive);
        setDeleteModelVisable(false);
        setToast({
          message: response?.message,
          color: "green",
          header: response?.title || "Success",
        });
        setToastStatus(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setToast({
          message: error?.message,
          color: "red",
          header: error?.title || "Warning",
        });
        setToastStatus(true);
      });
  };

  const handleEdit = (id) => {
    navigate("/addEvents", { state: { userId: id } });
  };
  const handleReset = () => {
    fetchData()
    fetchCompetitionData()
    fetchEventTypeData()
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
            checked={checekedList.includes(record.eventId)}
            onChange={() => {
              handleSingleCheck(record);
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
    title: "Events",
    headerSelect: false,
    eventTypeSelect: true,
    competitionsSelect: true,
    isActive: true,
    resetButton: true,
  };

  useEffect(() => {
    fetchData({ isActive: true });
    fetchEventTypeData();
    fetchCompetitionData();
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
            reFetchData={fetchData}
            reFetchEventTypeData={fetchEventTypeData}
            reFetchCompetitionData={fetchCompetitionData}
            singleCheck={checekedList}
            handleReset={handleReset}
            onAddNavigate={"/addEvents"}
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
