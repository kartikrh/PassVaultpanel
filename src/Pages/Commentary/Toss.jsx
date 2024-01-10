import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar } from "antd";
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";
const Index = () => {
  const finalizeRef = useRef(null);
  document.title = "Toss | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab1, setactiveTab1] = useState("5");

  const toggle1 = (tab) => {
    if (activeTab1 !== tab) {
      setactiveTab1(tab);
    }
  };
  // fetch data
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/team/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.teamId);
        });
        setData(apiData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
    //   navigate("/dashboard")
    // }
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Toss" />
          {isLoading && <SpinnerModel />}
          <Col xl={12}>
            <Card>
              <CardBody>
                <CardTitle className="h4">
                  Toss And Player Selection For Current Innings
                </CardTitle>

                <Nav pills className="nav nav-pills mt-4">
                  <NavItem style={{ cursor: "pointer", width: "50%" }}>
                    <NavLink
                      style={{ textAlign: "center" }}
                      className={classnames({
                        active: activeTab1 === "5",
                      })}
                      onClick={() => {
                        toggle1("5");
                      }}
                    >
                      <i className="dripicons-home me-1 align-middle"> </i>{" "}
                      Select Toss
                    </NavLink>
                  </NavItem>
                  <NavItem style={{ cursor: "pointer", width: "50%" }}>
                    <NavLink
                      style={{ textAlign: "center" }}
                      className={classnames({
                        active: activeTab1 === "6",
                      })}
                      onClick={() => {
                        toggle1("6");
                      }}
                    >
                      <i className="dripicons-user me-1 align-middle"></i>{" "}
                      Batter - Bowler
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab1} className="p-3 ">
                  <TabPane tabId="5">
                    <Row className="">
                    <Col xs="12" sm="6" className="">
                        <div className="bg-primary m-1 py-5 rounded" >
                        <div className="form-check mb-2 d-flex align-items-center">
                          <input
                            type="radio"
                            name="teams"
                            style={{transform: "scale(1.5)"}}
                            id="exampleRadios1"
                            defaultValue="option1"
                            defaultChecked
                          />
                          {" "}
                          <label
                            className="form-check-label"
                            htmlFor="exampleRadios1"
                            style={{fontSize:"20px", marginLeft:"10px", color:"white"}}
                          >
                            <i className="mdi mdi-cricket" ></i>{" "}
                            IND
                          </label>
                        </div>
                        </div>
                      </Col>
                      <Col xs="12" sm="6" className="">
                        <div className="bg-primary m-1 py-5 rounded">
                        <div className="form-check mb-2">
                          <input
                            type="radio"
                            name="teams"
                            className="mr-4"
                            id="exampleRadios1"
                            style={{transform: "scale(1.5)"}}
                            defaultValue="option1"
                            defaultChecked
                          />
                          {" "}
                          <label
                            className="form-check-label"
                            htmlFor="exampleRadios1"
                            style={{fontSize:"20px", marginLeft:"10px", color:"white"}}
                          >
                             <i className="mdi mdi-cricket" ></i>{" "}
                            PAK
                          </label>
                        </div>
                        </div>
                      </Col>
                      <Col xs="12" sm="6" className="">
                        <div className="bg-danger m-1 py-5 rounded">
                        <div className="form-check mb-2">
                          <input
                            type="radio"
                            name="tossRadio"
                            id="exampleRadios1"
                            style={{transform: "scale(1.5)"}}
                            defaultValue="option1"
                            defaultChecked
                          />
                          {" "}
                          <label
                            className="form-check-label"
                            htmlFor="exampleRadios1"
                            style={{fontSize:"20px", marginLeft:"10px", color:"white"}}
                          >
                            
                            Select Batting
                          </label>
                        </div>
                        </div>
                      </Col>
                      <Col xs="12" sm="6" className="">
                        <div className="bg-success m-1 py-5 rounded">
                        <div className="form-check mb-2">
                          <input
                            type="radio"
                            name="tossRadio"
                            id="exampleRadios1"
                            defaultValue="option1"
                            style={{transform: "scale(1.5)"}}
                            defaultChecked
                          />
                          {" "}
                          <label
                            className="form-check-label"
                            htmlFor="exampleRadios1"
                            style={{fontSize:"20px", marginLeft:"10px", color:"white"}}
                          >
                            Select Bowling
                          </label>
                        </div>
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="6">
                    <Row>
                      <Col sm="12">
                        <CardText className="mb-0">
                          Raw denim you probably haven't heard of them jean
                          shorts Austin. Nesciunt tofu stumptown aliqua, retro
                          synth master cleanse. Mustache cliche tempor,
                          williamsburg carles vegan helvetica. Reprehenderit
                          butcher retro synth. Cosby sweater eu banh mi, qui
                          irure terry richardson ex squid. Aliquip placeat
                          salvia cillum iphone. Seitan aliquip quis cardigan
                          american apparel, butcher voluptate nisi qui.
                        </CardText>
                      </Col>
                    </Row>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
