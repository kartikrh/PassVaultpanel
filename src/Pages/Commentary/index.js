import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import {mapCommentaryStatus} from './functions'
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import Toaster from '../../components/Toaster'
const Index = () => {
  document.title = "Commentary | ScoreCard - React Admin & Dashboard Template";
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
  //get Event Types
  const [eventTypes, setEventTypes] = useState([]);
  //get Competition
  const [competitions, setCompetitions] = useState([]);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // fetch data
  const fetchData = async () => {
    await axiosInstance
      .post(`/admin/commentary/all`)
      .then((response) => {
        setData(response?.result);
        const eventTypes = Array.from(
          new Set(response?.result.map((item) => item.eventType))
        );
        setEventTypes(eventTypes);
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
      if (singleCheck.includes(e.commentaryId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.commentaryId));
      } else {
        setSingleCheck([...singleCheck, e.commentaryId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(
        `/admin/commentary/save`,
        {
          commentaryId: record.commentaryId,
          [pType]: cState ? false : true,
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
    const response = await axiosInstance
      .post(
        `/admin/commentary/delete`,
        {
          commentaryId: singleCheck,
        }
      )
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
            checked={checkedAll || singleCheck.includes(record.commentaryId)}
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
      render: (text, record) => <i className="bx bx-edit"></i>,
      style: { width: "2%", textAlign: "center" },
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
      sort:true,
      style: { width: "10%" },
    },

    {
      title: "Event Name",
      dataIndex: "eventName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventName",
      sort:true,
      style: { width: "10%" },
    },
    {
      title: "Team",
      dataIndex: "team1Name",
      key: "team1Name",
      sort:true,
      style: { width: "10%" },
    },
    {
      title: "Competitor",
      dataIndex: "team2Name",
      key: "team2Name",
      sort:true,
      style: { width: "10%" },
    },
    {
      title: "Status",
      dataIndex: "commentaryStatus",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{mapCommentaryStatus(text)}</span>
      ),
      key: "commentaryStatus",
      sort:true,
      style: { width: "40%" },
    },
    {
      title: "Commentary Details",
      key: "active",
      render: (text, record) => (
        <Button
          color={"primary"}
          size="sm"
          className="btn"
          onClick={() => {
            
          }}
        >
          <i className="bx bx-plus"></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Commentary",
    headerSelect: false,
    eventTypeSelect: false,
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary" />
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
            singleCheck = {singleCheck}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
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
