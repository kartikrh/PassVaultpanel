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
  document.title = "Players | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);

  //handleRun
  const [run, setRun] = useState(null);
  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // fetch data
  const fetchData = async () => {
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/paneltyRun/all`,
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
      if (singleCheck.includes(e.paneltyId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.paneltyId));
      } else {
        setSingleCheck([...singleCheck, e.paneltyId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/paneltyRun/save`,
        {
          paneltyId: record.paneltyId,
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
        // const newArray = data.map(obj => (obj.paneltyId === record.paneltyId ? response.result : obj));
        fetchData();
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    // e.preventDefault()
    const response = await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/paneltyRun/delete`,
        {
          paneltyId: singleCheck,
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

  const handleRuns = async (value) => {
    setIsLoading(true);
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/admin/paneltyRun/save`, value, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => {
        fetchData();
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
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
            checked={checkedAll || singleCheck.includes(record.paneltyId)}
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
            value={run === null ? text : run}
            onChange={(e) => {
              setRun(e.target.value);
            }}
          />
          <button
            className="btn btn-primary sm btn-sm"
            onClick={(e) => {
              handleRuns({
                paneltyId: record.paneltyId,
                run: run === null ? text : run,
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
    title: "Penalty Runs",
    headerSelect: false,
    switch: false,
    clone:false,
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Penalty Runs" />
          {isLoading && <SpinnerModel />}
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            addModelFunction={setAddModelVisable}
            deleteModelFunction={setDeleteModelVisable}
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
