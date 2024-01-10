import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar } from "antd";
import {
  Button,
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
import classnames from "classnames";

const Index = ({data, next, save,exit,previous}) => {
  const finalizeRef = useRef(null);
  document.title = "Toss | ScoreCard - React Admin & Dashboard Template";
  // const [data, setData] = useState([]);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeams, setCommentaryTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab1, setactiveTab1] = useState("5");

  const toggle1 = (tab) => {
    if (activeTab1 !== tab) {
      setactiveTab1(tab);
    }
  };

  const handleWinBy = (shortName, teamId) =>{
    console.log(shortName ,"-", teamId)
    setCommentaryDetails((preValue)=>{
      return{
        ...preValue,
        tossWonBy : teamId,
        displayStatus: `Toss Won by ${shortName} choose to bat`,
      }
    })
  }

  const handleChoseTo = (val) =>{
    setCommentaryDetails((preValue)=>{
      return{
        ...preValue,
        choseTo: val
      }
    })
  }
  useEffect(() => {
    setCommentaryDetails(data?.commentaryDetails)
    setCommentaryTeams(data?.commentaryTeams);
    console.log("this is data", data)
    // fetchData()
  }, [data, next, save,]);
  useEffect(()=>{
console.log("this is after click data", commentaryDetails)
  },[commentaryDetails])
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
                        <div className="bg-info m-1 py-5 rounded">
                          <div className="form-check mb-2 d-flex align-items-center">
                            <input
                              type="radio"
                              name="teams"
                              style={{ transform: "scale(1.5)" }}
                              id="exampleRadios1"
                              defaultValue="option1"
                              onClick={()=>{handleWinBy(commentaryTeams && commentaryTeams[0]?.shortName, commentaryTeams && commentaryTeams[0]?.teamId)}}
                            />{" "}
                            <label
                              className="form-check-label"
                              htmlFor="exampleRadios1"
                              style={{
                                fontSize: "20px",
                                marginLeft: "10px",
                                color: "white",
                              }}
                            >
                              <img
                                width={40}
                                height={40}
                                src="CommentaryIcons/CricketTeam.png"
                              /> {" "}
                              {commentaryTeams && commentaryTeams[0]?.shortName}
                            </label>
                          </div>
                        </div>
                      </Col>
                      <Col xs="12" sm="6" className="">
                        <div className="bg-info m-1 py-5 rounded">
                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              name="teams"
                              className="mr-4"
                              id="exampleRadios1"
                              style={{ transform: "scale(1.5)" }}
                              defaultValue="option1"
                              onClick={()=>{handleWinBy(commentaryTeams && commentaryTeams[1]?.shortName, commentaryTeams && commentaryTeams[0]?.teamId)}}
                            />{" "}
                            <label
                              className="form-check-label"
                              htmlFor="exampleRadios1"
                              style={{
                                fontSize: "20px",
                                marginLeft: "10px",
                                color: "white",
                              }}
                            >
                              <img
                                width={40}
                                height={40}
                                src="CommentaryIcons/CricketTeam.png"
                              />{" "}
                              {commentaryTeams && commentaryTeams[1]?.shortName}
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
                              style={{ transform: "scale(1.5)" }}
                              defaultValue="option1"
                              onClick={()=>{handleChoseTo(1)}}
                            />{" "}
                            <label
                              className="form-check-label"
                              htmlFor="exampleRadios1"
                              style={{
                                fontSize: "20px",
                                marginLeft: "10px",
                                color: "white",
                              }}
                            >
                              <img
                                width={40}
                                height={40}
                                src="CommentaryIcons/bat.png"
                              /> {" "}
                              Select Batting
                            </label>
                          </div>
                        </div>
                      </Col>
                      <Col xs="12" sm="6" className="">
                        <div className="bg-warning m-1 py-5 rounded">
                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              name="tossRadio"
                              id="exampleRadios1"
                              defaultValue="option1"
                              style={{ transform: "scale(1.5)" }}
                              onClick={()=>{handleChoseTo(2)}}
                            />{" "}
                            <label
                              className="form-check-label"
                              htmlFor="exampleRadios1"
                              style={{
                                fontSize: "20px",
                                marginLeft: "10px",
                                color: "white",
                              }}
                            >
                              <img
                                width={40}
                                height={40}
                                src="CommentaryIcons/ball.png"
                              />{" "}
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
          <button className="btn btn-primary" onClick={() => { next() }}>Next</button> {" "}
          <button className="btn btn-success" onClick={() => { previous() }}>Previous</button>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
