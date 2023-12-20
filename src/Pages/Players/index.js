import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import {getToken} from '../../helpers/api_helper'
import {Avatar} from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import Toaster from '../../components/Toaster'
import axios from "axios";
// import Model
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from '../../components/Model/SpinnerModel';
import axiosInstance from "../../Features/axios";
const Index = () => {
  document.title = "Players | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  //handleSpinner
  const [isLoading, setIsLoading] = useState(false)
  // model state
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    color:"",
    header:""
  });
  const [toastStatus, setToastStatus] = useState(false);

  // checkbox state
  const [checkedAll, setCheckedAll] = useState(false);
  const [singleCheck, setSingleCheck] = useState([]);

  // fetch data
  const fetchData = async () => {
    await axios.post(
      `${process.env.REACT_APP_BASE_URL}/admin/player/all`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    ).then((response)=>{
      setData(response?.result);
      console.log(response)
      setIsLoading(false)
    }).catch((error)=>{
      console.log(error)
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
      if (singleCheck.includes(e.playerId)) {
        setSingleCheck(singleCheck.filter((item) => item !== e.playerId));
      } else {
        setSingleCheck([...singleCheck, e.playerId]);
      }
    }
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true)
    await axios.post(
      `${process.env.REACT_APP_BASE_URL}/admin/player/save`,
      {
        playerId: record.playerId,
        playerName: record.playerName,
        [pType]: cState?false:true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    ).then((response)=>{
      // const newArray = data.map(obj => (obj.playerId === record.playerId ? response.result : obj));

      fetchData()
      setToast({
        message: "Player Updated Successfully",
        color:"green",
        header:"Success"
      });
      setToastStatus(true)
    }).catch((error)=>{
      setIsLoading(false)
      setToast({
        message: "Error",
        color:"red",
        header:"Error"
      });
      setToastStatus(true)
    })
  };

  const handleDelete = async (e) => {
    setIsLoading(true)
    // e.preventDefault()
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_BASE_URL}/admin/player/delete`,
        {
          playerId: singleCheck,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      ).then((response)=>{
        fetchData();
        console.log("delete response: ",response)
        setDeleteModelVisable(false);
        setToast({
          message: "Player Deleted SuccessFully",
          color:"green",
          header:"Success"
        });
        setSingleCheck([])
        setToastStatus(true)
      }).catch((error)=>{
        console.log("delete error: ",error)
        setIsLoading(false)
        setToast({
          message: "Error",
          color:"red",
          header:"Error"
        });
        setToastStatus(true)
        setSingleCheck([])
      });
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
            checked={checkedAll || singleCheck.includes(record.playerId)}
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
            {
              text?<div>
              <img
                className="avatar-sm rounded-circle"
                alt=""
                src={process.env.REACT_APP_BASE_URL + text}
              />
            </div> : <Avatar src="#" alt="ET">Image</Avatar>
            }
          </div>
        ),
        key: "tabName",
        style: { width: "10%" },
    },
    {
      title: "Player Name",
      dataIndex: "playerName",
      render: (text,record) =>(<span style={{cursor:"pointer"}}>{text}</span>),
      key: "playerName",
      sort:true,
      style: { width: "10%" },
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      style: { width: "10%" },
      sort:true,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",

      style: { width: "10%" },
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
    title :  "Players",
    headerSelect: false,
    switch: false,
  };

  useEffect(() => {
    setIsLoading(true)
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Players" />
          {isLoading && <SpinnerModel/>}
          <Toaster toast={toast} setToast={setToast} toastStatus={toastStatus} setToastStatus={setToastStatus}/>
          <Table
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            addModelFunction={setAddModelVisable}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck = {singleCheck}
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
