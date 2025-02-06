import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Container,
  Row,
} from "reactstrap";
import CardComponent from "./CardComponent";
import { useDispatch, useSelector } from "react-redux";
import { updateToastData } from "../../Features/toasterSlice";
import { CONNECT_COMMENTARY, ERROR } from "../../components/Common/Const";
import createSocket from "../../Features/socket";
import { isEmpty } from "lodash";

const Index = ({ data, next, save }) => {
  document.title = "Toss";
  const theme = useSelector((state) => state.layout.panelTheme);
  const [commentaryDetails, setCommentaryDetails] = useState({});
  const [commentaryTeams, setCommentaryTeams] = useState([]);
  const [winnerTeam, setWinnerTeam] = useState({});
  const [restTeams, setRestTeams] = useState([])
  const [currentInningTeams, setCurrentInningTeams] = useState([]);
  const [values, setValues] = useState({
    choseTo: null,
    tossWonBy: null,
  });
  const socket = createSocket();
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
      teamBattingOrder: values.choseTo,
    };
    const alternateStatus = updatedTeam?.teamStatus == 2 ? 1 : 2;
    const UpdatedCurrentInningTeams = currentInningTeams.map((team) =>
      team.teamId === values?.tossWonBy
        ? updatedTeam
        : { ...team, teamStatus: alternateStatus, teamBattingOrder: alternateStatus }
    );
    const newData = {
      commentaryId: commentaryDetails.commentaryId,
      commentaryDetails: {
        ...commentaryDetails,
        ...values,
        rmk: `Toss won by ${winnerTeam?.teamName} and choose to ${values.choseTo == 1 ? "Bat" : "Ball"
          }`,
        displayStatus: `Toss won by ${winnerTeam?.teamName} and choose to ${values.choseTo == 1 ? "Bat" : "Ball"
          }`,
        commentaryStatus: "2",
      },
      commentaryTeams: UpdatedCurrentInningTeams,
    }
    save(newData, 2, {
      ...data,
      ...newData,
      commentaryTeams: [...restTeams, ...UpdatedCurrentInningTeams],
    })
  };

  useEffect(() => {
    if (!isEmpty(commentaryDetails)) {
      if (socket) {
        socket.emit(CONNECT_COMMENTARY, { commentaryId: commentaryDetails?.commentaryId, eventRefId : commentaryDetails?.eventRefId });
      }
    }
  }, [commentaryDetails]);

  useEffect(() => {
    setCommentaryDetails(data?.commentaryDetails);
    //separating teams of the current inning
    const currentInning = data?.commentaryDetails.currentInnings;
    const currentInningTeams = data?.commentaryTeams.filter((val) => {
      return val.currentInnings === currentInning;
    });
    setCurrentInningTeams(currentInningTeams);
    const restTeams = data?.commentaryTeams.filter((val) => {
      return val.currentInnings !== currentInning;
    });
    setRestTeams(restTeams)
    setCommentaryTeams(data?.commentaryTeams);
    //setting values with the data comming from DB
    setValues({
      choseTo: data?.commentaryDetails?.choseTo,
      tossWonBy: data?.commentaryDetails?.tossWonBy,
    });
    if (data?.commentaryDetails?.tossWonBy !== null) {
      const winnerTeam = currentInningTeams.find((val) => {
        return data?.commentaryDetails?.tossWonBy === val?.teamId
      })
      setWinnerTeam(winnerTeam)
    }
  }, []);
  return (
    <React.Fragment>
      <div className="mt-5">
        <Container>
          <Card className="shadow-none toss-card p-4">
            <CardHeader className="toss-card-header p-0">
              <h2 >Toss Selection</h2>
            </CardHeader>
              <div style={{ borderBottom: "solid gray 2px" }}></div>
              <div className="mt-5">
                <div className="toss-card-title">
                  <h4>Toss Won by?</h4>
                </div>
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
                        bgColor={"#55c6b4"}
                        check={val.teamId === values?.tossWonBy}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
              {values?.tossWonBy !== null && (
                <div className="mt-2">
                  <h5 >Choose To?</h5>
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
                        onClickColor={"#FCB92C"}
                        bgColor={"#ffcd6b"}
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
                        onClickColor={"#FCB92C"}
                        bgColor={"#ffcd6b"}
                        check={values?.choseTo === 2}
                      />
                    </Col>
                  </Row>
                </div>
              )}
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
                <i className="bx bxs-right-arrow ms-1"></i>
              </Button>
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
