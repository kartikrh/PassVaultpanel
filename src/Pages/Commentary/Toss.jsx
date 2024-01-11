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
  const [check, setCheck] = useState(false)
  const [toss, setToss] = useState({
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
  const onClick = () =>{
    setCheck(!check)
  }
  useEffect(() => {
    setCommentaryDetails(data?.commentaryDetails);
    setCommentaryTeams(data?.commentaryTeams);
  }, [data, next, save]);
  useEffect(() => {
    console.log("this is after click data", commentaryDetails);
  }, [commentaryDetails]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container>
          <Card className="shadow-none">
            <div>
              <h4 className={{fontWeight:600}}>Toss Selection</h4>
              <div style={{ borderBottom: "solid gray 2px" }}></div>
              <div className="mt-5">
                <h5>Toss Won by?</h5>
                <Row>
                  <Col xs={6}>
                    <CardComponent
                      title={commentaryTeams && commentaryTeams[0]?.teamName}
                      selectIcon={"bx bxs-check-circle"}
                      onClickColor={"#099680"}
                      bgColor={"#43a899"}
                      check={check}
                      onClick = {onClick}
                    />
                  </Col>
                  <Col xs={6}>
                    <CardComponent
                      title={commentaryTeams && commentaryTeams[1]?.teamName}
                      selectIcon={"bx bx-circle"}
                      onClickColor={"#099680"}
                      bgColor={"#43a899"}
                      check={check}
                      onClick = {onClick}
                    />
                  </Col>
                </Row>
              </div>
              {
                toss.wonBy !== "" && 
                <div className="mt-2">
                <h5>Choose To?</h5>
                <Row>
                  <Col xl="12" sm="6">
                    <CardComponent
                      title="Batting"
                      titleIcon = "CommentaryIcons/bat1.png"
                      selectIcon={"bx bxs-check-circle"}
                      onClickColor={"#099680"}
                      bgColor={"#43a899"}
                      check={check}
                      onClick = {onClick}
                    />
                  </Col>
                  <Col xl="12" sm="6">
                    <CardComponent
                      title="Bowling"
                      titleIcon = "CommentaryIcons/ball1.png"
                      selectIcon={"bx bx-circle"}
                      onClickColor={"#099680"}
                      bgColor={"#43a899"}
                      check={check}
                      onClick = {onClick}
                    />
                  </Col>
                </Row>
              </div>
              }
            </div>
          </Card>
            <Button
              className="d-flex align-items-center"
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
      </div>
    </React.Fragment>
  );
};

export default Index;
