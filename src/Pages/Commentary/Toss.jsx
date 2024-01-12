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
import { useDispatch } from "react-redux";
import { updateToastData } from "../../Features/toasterSlice";
import { ERROR, SAVE_AND_NEXT } from "../../components/Common/Const";
const Index = ({ data, next, save }) => {
  document.title = "Toss | ScoreCard - React Admin & Dashboard Template";
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeams, setCommentaryTeams] = useState([]);
  const [winnerTeam, setWinnerTeam] = useState({});
  const [restTeams, setRestTeams] = useState([])
  const [currentInningTeams, setCurrentInningTeams] = useState([]);
  const [values, setValues] = useState({
    choseTo: null,
    tossWonBy: null,
  });
  const dispatch = useDispatch();
  const handleDetails = (key, value) => {
    setValues((preValue) => {
      return {
        ...preValue,
        [key]: value,
      };
    });
  };
  const handleSave = () => {
    const updatedTeam = {
      ...winnerTeam,
      teamStatus: values.choseTo,
    };
    const alternateStatus = updatedTeam?.teamStatus == 2 ? 1 : 2;
    const UpdatedCurrentInningTeams = currentInningTeams.map((team) =>
      team.teamId === values?.tossWonBy
        ? updatedTeam
        : { ...team, teamStatus: alternateStatus }
    );
    const newData = {
      commentaryDetails: {
        ...commentaryDetails,
        ...values,
        rmk: `Toss won by ${winnerTeam?.teamName} and choose to ${
          values.choseTo == 1 ? "Bat" : "Ball"
        }`,
        displayStatus: `Toss won by ${winnerTeam?.teamName} and choose to ${
          values.choseTo == 1 ? "Bat" : "Ball"
        }`,
        commentaryStatus: "2",
      },
      commentaryTeams: UpdatedCurrentInningTeams,
    }
    save(newData, 2,{
      ...data,
      ...newData,
      commentaryTeams: [...restTeams, ...UpdatedCurrentInningTeams],
    })
  };

  useEffect(() => {
    setCommentaryDetails(data?.commentaryDetails);
    //separating teams of the current inning
    const currentInning = data?.commentaryDetails.currentInnings;
    const currentInningTeams = data?.commentaryTeams.filter((val) => {
      return val.currentInnings === currentInning;
    });
    const restTeams = data?.commentaryTeams.filter((val) => {
      return val.currentInnings !== currentInning;
    });
    setRestTeams(restTeams)
    setCurrentInningTeams(currentInningTeams);
    setCommentaryTeams(data?.commentaryTeams);
    //setting values with the data comming from DB
    setValues({
      choseTo: data?.commentaryDetails?.choseTo,
      tossWonBy: data?.commentaryDetails?.tossWonBy,
    });
  }, [data, next, save]);
  return (
    <React.Fragment>
      <div className="mt-5">
        <Container>
          <Card className="shadow-none">
            <div>
              <h4 className={{ fontWeight: 700 }}>Toss Selection</h4>
              <div style={{ borderBottom: "solid gray 2px" }}></div>
              <div className="mt-5">
                <h5>Toss Won by?</h5>
                <Row>
                  {currentInningTeams?.map((val, index) => (
                    <Col
                      key={index}
                      xs={6}
                      onClick={() => {
                        handleDetails("tossWonBy", val?.teamId);
                        setWinnerTeam(val);
                      }}
                    >
                      <CardComponent
                        title={val.teamName}
                        selectIcon={"bx bxs-check-circle"}
                        onClickColor={"#099680"}
                        bgColor={"#43a899"}
                        check={val.teamId === values?.tossWonBy}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
              {values?.tossWonBy !== null && (
                <div className="mt-2">
                  <h5>Choose To?</h5>
                  <Row>
                    <Col
                      // xl="12"
                      sm="6"
                      onClick={() => {
                        handleDetails("choseTo", 1);
                      }}
                    >
                      <CardComponent
                        title="Batting"
                        titleIcon="CommentaryIcons/bat1.png"
                        selectIcon={"bx bxs-check-circle"}
                        onClickColor={"#099680"}
                        bgColor={"#43a899"}
                        check={values?.choseTo === 1}
                      />
                    </Col>
                    <Col
                      // xl="12"
                      sm="6"
                      onClick={() => {
                        handleDetails("choseTo", 2);
                      }}
                    >
                      <CardComponent
                        title="Bowling"
                        titleIcon="CommentaryIcons/ball1.png"
                        selectIcon={"bx bx-circle"}
                        onClickColor={"#099680"}
                        bgColor={"#43a899"}
                        check={values?.choseTo === 2}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          </Card>
          {values?.choseTo != null && (
            <div className="d-flex align-items-center justify-content-end">
              <Button
                className="d-flex align-items-center"
                id="caret"
                color="primary"
                onClick={() => {
                  if ((values.choseTo != null) & (values.tossWonBy != null)) {
                    handleSave();
                  } else {
                    return dispatch(
                      updateToastData({
                        data: `Check The Required Fields`,
                        title: "Toss Selection",
                        type: ERROR,
                      })
                    );
                  }
                }}
              >
                <span>Save & Next</span>
                <i class="bx bxs-right-arrow ms-1"></i>
              </Button>
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
