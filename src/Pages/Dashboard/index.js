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
import { ERROR, MODULE_PLAYERS, MODULE_TEAMS, SUCCESS, TAB_PLAYERS, TAB_TEAMS, PERMISSION_EDIT, PERMISSION_VIEW } from "../../components/Common/Const";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";

const Dashboard = () => {
  const playerPage = TAB_PLAYERS
  const teamPage = TAB_TEAMS
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  const [playersData, setPlayersData] = useState([])
  const [dupPlayersData, setDupPlayersData] = useState([])
  const [teamsData, setteamsData] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [dataFetch, setDataFetch] = useState(false);
  document.title = "Dashboard ";
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handlePlayerList = async (playerName) => {
    navigate("/Players", { state: { playerName: playerName } });
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [res1, res2] = await Promise.all([
        axiosInstance.post(`/admin/dashboard/imgNullData`),
        axiosInstance.post(`/admin/dashboard/dupPlayers`),
      ]);

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
    if(dataFetch){
      fetchData();
    }
  }, [dataFetch]);

  const tableElement = {
    title: "Dashboard",
    
    // headerSelect: false,
    // isShowContent: true,
    // reloadButton: true,
    // loadData: true,
    // clone: false,
  };

  const handleEdit = (id) => {
    navigate("/addPlayer", { state: { userId: id } });
  };
  const handleTeamEdit = (id) => {
    navigate("/addTeams", { state: { userId: id } });
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
      style: { width: "10%" },
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
      style: { width: "10%" },
    },
    {
      title: "Set Images",
      dataIndex: "set",
      render: (text, record) => (
        <Tooltip title={"Set Images"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color="primary"
            size="sm"
            className="btn"
            onClick={() => {
              handleEdit(record.playerId);
            }}
            disabled={!checkPermission(permissionObj, playerPage, PERMISSION_EDIT)}
          >
            Set Image
          </Button>
        </Tooltip>
      ),
      key: "set",
      sort: true,
      style: { width: "10%" },
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
      style: { width: "10%" },
    },
    {
      title: "Total",
      dataIndex: "total",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "total",
      sort: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Remove",
      dataIndex: "Remove",
      render: (text, record) => (
        <Tooltip title={"Remove"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color="danger"
            size="sm"
            className="btn"
            onClick={() => {
              handlePlayerList(record.playername);
            }}
            disabled={!checkPermission(permissionObj, playerPage, PERMISSION_VIEW)}
          >
            Remove
          </Button>
        </Tooltip>
      ),
      key: "Remove",
      sort: true,
      style: { width: "10%" },
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
      style: { width: "10%" },
    },
    {
      title: "Set Images",
      dataIndex: "setImages",
      render: (text, record) => (
        <Tooltip title={"Set Images"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
          <Button
            color="primary"
            size="sm"
            className="btn"
            onClick={() => {
              handleTeamEdit(record.teamId);
            }}
            disabled={!checkPermission(permissionObj, teamPage, PERMISSION_EDIT)}
          >
            Set Image
          </Button>
        </Tooltip>
      ),
      key: "setImages",
      sort: true,
      style: { width: "10%", textAlign: "center" },
    },
  ]

  const handleLoadData = async (password) => {
    setDataFetch(true)
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Dashboard" isDashboard= {true} handleLoadData={handleLoadData}/>
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
          {/* <Row className='d-flex justify-content-end'>
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
          </Row> */}
          {dataFetch && <Row>
            <Col xs="12" lg="6" >
              <Card style={{ maxHeight: "510px", padding: '0px' }}>
                <CardHeader>
                    <h6 className="dashboard-headers">Missing Player Images</h6>
                </CardHeader>
                <CardBody style={{ maxHeight: "510px", overflowY: "auto",  }}>
                    <Table setStickHeader={true} isPagination={false} columns={missingPlayerColumns} dataSource={playersData}  tableElement={tableElement}/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" lg="6">
            <Card style={{ maxHeight: "510px", padding: '0px' }}>
                <CardHeader>
                    <h6 className="dashboard-headers">Duplicate Player</h6>
                </CardHeader>
                <CardBody style={{ maxHeight: "510px", overflowY: "auto", }}>
                    <Table isPagination={false} setStickHeader={true} columns={dupPlayerColumns} dataSource={dupPlayersData}  tableElement={tableElement}/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" lg="6">
                <Card style={{ maxHeight: "510px", padding: '0px' }}>
                <CardHeader>
                    <h6 className="dashboard-headers">Missing Team Images</h6>                
                </CardHeader>
                <CardBody style={{ maxHeight: "510px", overflowY: "auto",  }}>
                    <Table setStickHeader={true} isPagination={false} columns={teamColumns} dataSource={teamsData}  tableElement={tableElement}/>
                </CardBody>
              </Card>
            </Col>
          </Row>}
        </Container>
      </div>
      {/* {loadDataModelVisable && (
        <LoadDataModal
          loadDataModelVisable={loadDataModelVisable}
          setLoadDataModelVisable={setLoadDataModelVisable}
          handleLoadData={handleLoadData}
          moduleName={"Commentary"}
        />
      )} */}
    </React.Fragment>
  );
};

export default Dashboard;
