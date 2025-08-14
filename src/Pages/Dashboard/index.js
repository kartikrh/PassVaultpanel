import React, { useEffect, useState } from "react";
// import UsePanel from "./UserPanel";
// import OrderStatus from "./OrderStatus";
// import Notifications from "./Notifications";
// import SocialSource from "./SocialSource";
// import OverView from "./OverView";
// import RevenueByLocation from "./RevenueByLocation";
// import LatestTransation from "./LatestTransation";
import LoadDataModal from "../../components/Model/LoadDataModal";

import { Row, Container, Col, Card, CardHeader, CardBody, Button } from "reactstrap";
import Table from "../../components/Common/Table";
import SpinnerModel from "../../components/Model/SpinnerModel";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axiosInstance from "../../Features/axios";
import { ERROR, MODULE_COMMENTARY, SUCCESS } from "../../components/Common/Const";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";

const Dashboard = () => {
  const [playersData, setPlayersData] = useState([])
  const [dupPlayersData, setDupPlayersData] = useState([])
  const [teamsData, setteamsData] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  document.title = "Dashboard ";

  const dispatch = useDispatch();

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [res1, res2] = await Promise.all([
        axiosInstance.post(`/admin/dashboard/imgNullData`),
        axiosInstance.post(`/admin/dashboard/dupPlayers`),
      ]);

      // Store results in state
      console.log(res2.result.playersData)
      setPlayersData(res1.result.players);
      setteamsData(res1.result.teams);
      setDupPlayersData(res2.result.playersData);
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data", error);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tableElement = {
    title: "Dashboard",
    
    // headerSelect: false,
    // isShowContent: true,
    // reloadButton: true,
    // loadData: true,
    // clone: false,
  };

  const missingPlayerColumns = [
    {
      title: "Player Name",
      dataIndex: "playerName",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "playerName",
      sort: true,
      style: { width: "33%" },
    },
    {
      title: "Short Name",
      dataIndex: "displayName",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "displayName",
      sort: true,
      style: { width: "33%" },
    },
    {
      title: "Set",
      dataIndex: "set",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "set",
      sort: true,
      style: { width: "33%" },
    },
  ]
  const dupPlayerColumns = [
    {
      title: "Player Name",
      dataIndex: "playername",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "playername",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Short Name",
      dataIndex: "displayname",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "displayname",
      sort: true,
      style: { width: "33%" },
    },
    {
      title: "Remove",
      dataIndex: "Remove",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "Remove",
      sort: true,
      style: { width: "33%" },
    },
  ]
  const teamColumns = [
    {
      title: "Team Name",
      dataIndex: "teamName",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "teamName",
      sort: true,
      style: { width: "50%" },
    },
    {
      title: "Set Images",
      dataIndex: "setImages",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "setImages",
      sort: true,
      style: { width: "50%" },
    },
  ]

  const handleLoadData = async (password) => {
      setIsLoading(true);
      await axiosInstance
        .post(`/loadPanelData`, { module: [MODULE_COMMENTARY], password })
        .then((response) => {
          fetchData();
          setLoadDataModelVisable(false);
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        })
        .catch((error) => {
          setIsLoading(false);
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
        });
    };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Dashboard" />
          {isLoading && <SpinnerModel />}
          {/* User Panel Charts */}
          {/* <UsePanel /> */}

          {/* <Row> */}
          {/* Overview Chart */}
          {/* <OverView /> */}
          {/* Social Source Chart */}
          {/* <SocialSource /> */}
          {/* </Row> */}

          {/* <Row> */}
          {/* Order Stats */}
          {/* <OrderStatus /> */}
          {/* Notifications */}
          {/* <Notifications /> */}
          {/* Revenue by Location Vector Map */}
          {/* <RevenueByLocation /> */}
          {/* </Row> */}

          {/* Latest Transaction Table */}
          {/* <LatestTransation /> */}
          <Row className='d-flex justify-content-end'>
            <Button
              color="warning"
              onClick={() => {
                setLoadDataModelVisable(true);
              }}
              className="d-flex align-items-center gap-1 w-auto"
            >
              <i className="ri-refresh-line"></i>
              Load Data
            </Button>
          </Row>
          <Row>
            <Col xs="12" lg="6" >
              <Card style={{ maxHeight: "510px", padding: '0px' }}>
                <CardHeader>
                    <h6>Missing Player Images</h6>
                </CardHeader>
                <CardBody style={{ maxHeight: "510px", overflowY: "auto",  }}>
                    <Table setStickHeader={true} isPagination={false} columns={missingPlayerColumns} dataSource={playersData}  tableElement={tableElement}/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" lg="6">
            <Card style={{ maxHeight: "510px", padding: '0px' }}>
                <CardHeader>
                    <h6>Duplicate Player</h6>
                </CardHeader>
                <CardBody style={{ maxHeight: "510px", overflowY: "auto", }}>
                    <Table isPagination={false} setStickHeader={true} columns={dupPlayerColumns} dataSource={dupPlayersData}  tableElement={tableElement}/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" lg="6">
                <Card style={{ maxHeight: "510px", padding: '0px' }}>
                <CardHeader>
                    <h6>Missing Team Images</h6>                
                </CardHeader>
                <CardBody style={{ maxHeight: "510px", overflowY: "auto",  }}>
                    <Table setStickHeader={true} isPagination={false} columns={teamColumns} dataSource={teamsData}  tableElement={tableElement}/>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {loadDataModelVisable && (
        <LoadDataModal
          loadDataModelVisable={loadDataModelVisable}
          setLoadDataModelVisable={setLoadDataModelVisable}
          handleLoadData={handleLoadData}
          moduleName={"Commentary"}
        />
      )}
    </React.Fragment>
  );
};

export default Dashboard;
