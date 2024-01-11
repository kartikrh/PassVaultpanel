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
  CardHeader,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import classnames from "classnames";
import CardComponent from "./CardComponent";

const Index = ({ data, next, save, exit, previous }) => {
  const finalizeRef = useRef(null);
  document.title = "Toss | ScoreCard - React Admin & Dashboard Template";
  // const [data, setData] = useState([]);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeams, setCommentaryTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab1, setactiveTab1] = useState("5");
  const [Toss, setToss] = useState({
    wonBy: "",
    chooseTo: "",
  });
  const toggle1 = (tab) => {
    if (activeTab1 !== tab) {
      setactiveTab1(tab);
    }
  };

  const handleWinBy = (shortName, teamId) => {
    console.log(shortName, "-", teamId);
    setCommentaryDetails((preValue) => {
      return {
        ...preValue,
        tossWonBy: teamId,
        displayStatus: `Toss Won by ${shortName} choose to bat`,
      };
    });
  };

  const handleChoseTo = (val) => {
    setCommentaryDetails((preValue) => {
      return {
        ...preValue,
        choseTo: val,
      };
    });
  };
  useEffect(() => {
    setCommentaryDetails(data?.commentaryDetails);
    setCommentaryTeams(data?.commentaryTeams);
    console.log("this is data", data);
    // fetchData()
  }, [data, next, save]);
  useEffect(() => {
    console.log("this is after click data", commentaryDetails);
  }, [commentaryDetails]);
  return (
    // <React.Fragment>
    //   <div className="page-content">
    //     <Container className="p-0" >
    //       <Breadcrumbs title="ScoreCard" breadcrumbItem="Toss" />
    //       {isLoading && <SpinnerModel />}
    //       <Col xl={12}>
    //         <div>
    //           <h4>Toss Selection</h4>
    //           <div style={{borderBottom:"solid gray 2px"}}></div>
    //           <div className="mt-5">
    //             <h5>Toss Won by?</h5>
    //             <Row>
    //             <Col xs={6}>
    //                 <div className="card">
    //                   <CardBody className="border border-primary rounded" style={{backgroundColor:"#099680"}}>
    //                     <div className="">
    //                       <div className="d-flex flex-column justify-content-center align-items-center">
    //                         <i className="bx bxs-check-circle" style={{fontSize:"25px", color:"white"}}></i>
    //                         <span className="" style={{fontWeight:600, fontSize:"20px", marginLeft:"15px", color:"white"}}>Pakistan</span>
    //                       </div>
    //                     </div>
    //                   </CardBody>
    //                 </div>
    //               </Col>
    //               <Col xs={6}>
    //                 <div className="card">
    //                   <CardBody className="border border-primary rounded" style={{backgroundColor:"#43a899"}}>
    //                     <div className="">
    //                       <div className="d-flex flex-column justify-content-center align-items-center">
    //                         <i className="bx bx-circle" style={{fontSize:"25px", color:"white"}}></i>
    //                         <span className="" style={{fontWeight:600, fontSize:"20px", marginLeft:"15px", color:"white"}}>India</span>
    //                       </div>
    //                     </div>
    //                   </CardBody>
    //                 </div>
    //               </Col>
    //               {/* <Col xs={5}>
    //                 <div className="card text-center">
    //                   <CardBody>
    //                   </CardBody>
    //                 </div>
    //               </Col> */}
    //             </Row>
    //           </div>
    //           <div className="mt-2">
    //             <h5>Choose To?</h5>
    //             <Row>
    //             <Col xs={6}>
    //                 <div className="card">
    //                   <CardBody className="border border-primary rounded" style={{backgroundColor:"#099680"}}>
    //                     <div className="">
    //                       <div className="d-flex flex-column justify-content-center align-items-center">
    //                         <i className="bx bxs-check-circle" style={{fontSize:"25px", color:"white"}}></i>
    //                         <span className="" style={{fontWeight:600, fontSize:"20px", marginLeft:"15px", color:"white"}}>Batting</span>
    //                       </div>
    //                     </div>
    //                   </CardBody>
    //                 </div>
    //               </Col>
    //               <Col xs={6}>
    //                 <div className="card">
    //                   <CardBody className="border border-primary rounded" style={{backgroundColor:"#43a899"}}>
    //                     <div className="">
    //                       <div className="d-flex flex-column justify-content-center align-items-center">
    //                         <i className="bx bx-circle" style={{fontSize:"25px", color:"white"}}></i>
    //                         <span className="" style={{fontWeight:600, fontSize:"20px", marginLeft:"15px", color:"white"}}>Bowling</span>
    //                       </div>
    //                     </div>
    //                   </CardBody>
    //                 </div>
    //               </Col>
    //               {/* <Col xs={5}>
    //                 <div className="card text-center">
    //                   <CardBody>
    //                   </CardBody>
    //                 </div>
    //               </Col> */}
    //             </Row>
    //           </div>
    //         </div>
    //       </Col>
    //       <button className="btn btn-success m-2" onClick={() => { previous() }}>Previous</button>
    //       <button className="btn btn-primary m-2" onClick={() => { next() }}>Next</button> {" "}
    //     </Container>
    //   </div>
    // </React.Fragment>
    <React.Fragment>
      <div className="page-content">
        <Container>
          <Card className="shadow-none">
            <div>
              <h4>Toss Selection</h4>
              <div style={{ borderBottom: "solid gray 2px" }}></div>
              <div className="mt-5">
                <h5>Toss Won by?</h5>
                <Row>
                  <Col xs={6}>
                    <CardComponent
                      name={commentaryTeams && commentaryTeams[0].teamName}
                      icon={"bx bxs-check-circle"}
                      bgColor={"#099680"}
                    />
                  </Col>
                  <Col xs={6}>
                    <CardComponent
                      name={commentaryTeams && commentaryTeams[1].teamName}
                      icon={"bx bx-circle"}
                      bgColor={"#43a899"}
                    />
                  </Col>
                </Row>
              </div>
              <div className="mt-2">
                <h5>Choose To?</h5>
                <Row>
                  <Col xl="12" sm="6">
                    <CardComponent
                      name={"Batting"}
                      icon={"bx bxs-check-circle"}
                      bgColor={"#099680"}
                    />
                  </Col>
                  <Col xl="12" sm="6">
                    <CardComponent
                      name={"Bowling"}
                      icon={"bx bx-circle"}
                      bgColor={"#43a899"}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
          <Container className="d-flex justify-content-between flex-wrap">
            <Button
              className="m-2"
              id="caret"
              color="primary"
              onClick={() => {
                previous();
              }}
            >
              <i class="bx bxs-left-arrow me-1"></i>
              <span>Previous</span>
            </Button>
            <Button
              className="m-2 d-flex align-items-center"
              id="caret"
              color="primary"
              onClick={() => {
                next();
              }}
            >
              <span>Save & Next</span>
              <i class="bx bxs-right-arrow ms-1"></i>
            </Button>
          </Container>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
