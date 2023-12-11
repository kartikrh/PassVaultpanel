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
  document.title = "Teams | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false);
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);

  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // fetch data
  const fetchData = async () => {
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/team/all`,
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
        console.log(response);
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
      if (singleCheck.includes(e.teamId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.teamId));
      } else {
        setSingleCheck([...singleCheck, e.teamId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/admin/player/save`,
        {
          teamId: record.teamId,
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
        // const newArray = data.map(obj => (obj.teamId === record.teamId ? response.result : obj));
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
        `${process.env.REACT_APP_BASE_URL}/admin/team/delete`,
        {
          teamId: singleCheck,
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
            checked={checkedAll || singleCheck.includes(record.teamId)}
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
      render: (text, record) => <i className="bx bx-edit"></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      render: (text, record) => (
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
      style: { width: "5%" },
    },
    {
      title: "Jersey Image",
      dataIndex: "jersey",
      render: (text, record) => (
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
      key: "jersey",
      style: { width: "15%",textAlign:"left" },
    },
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      style: { width: "40%" },
      sort: true,
    },
    {
      title: "Short Name",
      dataIndex: "teamShortName",
      key: "teamShortName",
      style: { width: "10%" },
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      style: { width: "10%" },
    },
    // {
    //   title: "Is Active",
    //   key: "active",
    //   render: (text, record) => (
    //     <Button
    //       color={`${record.isActive ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //       onClick={() => {
    //         handlePermissions("isActive", record, record.isActive);
    //       }}
    //     >
    //       <i className="bx bx-block"></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
  ];

  //elements required
  const tableElement = {
    title: "Teams",
    headerSelect: false,
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Teams" />
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
