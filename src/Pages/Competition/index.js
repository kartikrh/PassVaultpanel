import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { validateTabResponse } from "../../Layout/VerticalLayout/functions";
import Table from "../../components/Common/Table";
import { getToken } from "../../helpers/api_helper";
import { Avatar } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import axios from "axios";
import SpinnerModel from "../../components/Model/SpinnerModel";
// import Model
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
const Index = () => {
  document.title =
    "Competitions | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  //get Event Types
  const [eventTypes, setEventTypes] = useState([]);
  //get Competition
  const [competitions, setCompetitions] = useState([]);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // fetch data
  const fetchData = async () => {
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/competition/all`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
      .then((response) => {
        setData(response?.result);
        const eventTypes = Array.from(new Set(response?.result.map(item => item.eventType)));
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
      if (singleCheck.includes(e.competitionId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.competitionId));
      } else {
        setSingleCheck([...singleCheck, e.competitionId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/competition/save`,
        {
          competitionId: record.competitionId,
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
        console.log(error);
        setIsLoading(false);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    const response = await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/competition/delete`,
        {
          competitionId: singleCheck,
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
        console.log(error);
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
            checked={checkedAll || singleCheck.includes(record.competitionId)}
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
      title: "Image",
      dataIndex: "image",
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
      key: "tabName",
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
      title: "Reference Id",
      dataIndex: "refId",
      key: "refId",
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      style: { width: "60%" },
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
          <i className="bx bx-block"></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Competition",
    headerSelect: false,
    eventTypeSelect: true,

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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Competition" />
          {isLoading && <SpinnerModel />}
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            addModelFunction={setAddModelVisable}
            deleteModelFunction={setDeleteModelVisable}
            eventTypes={eventTypes}
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
