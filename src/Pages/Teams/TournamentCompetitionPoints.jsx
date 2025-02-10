import React, { useEffect, useState } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR } from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import "../Competition/tournament.css";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const TournamentCompetitionPoints = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tournamentData, setTournamentData] = useState([]);

  const teamId = +sessionStorage.getItem("teamId") || "0";
  const teamDetails = JSON.parse(sessionStorage.getItem("teamDetails") || "{}");
  document.title = `${teamDetails?.teamName} Competition Points`;
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchTournament = async (teamId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/team/getTeamPoint", { teamId })
      .then((response) => {
        if (response?.result) {
          setTournamentData(response?.result);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };

  const handleBackClick = () => {
    navigate("/Teams");
  };

  useEffect(() => {
    if (teamId !== "0") {
      fetchTournament(teamId);
    }
  }, [teamId]);

  const columns = [
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span>{convertDateUTCToLocal(text, "index")}</span>
      ),
      key: "eventDate",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event Id",
      dataIndex: "eventRefId",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-1">
          <span style={{ cursor: record.isPredictMarket && "pointer" }}>
            {text}
          </span>
        </div>
      ),
      key: "eventRefId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => <span>{text}</span>,
      key: "eventName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competitionName",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "competitionName",
      style: { width: "10%" },
    },
    {
      title: "Team1",
      dataIndex: "team1Name",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "team1Name",
      style: { width: "10%" },
    },
    {
      title: "Team2",
      dataIndex: "team2Name",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "team2Name",
      style: { width: "10%" },
    },
    {
      title: "Result",
      dataIndex: "commentaryResult",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "commentaryResult",
      style: { width: "10%" },
    },
    // {
    //   title: "Matches",
    //   dataIndex: "totalMatches",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "totalMatches",
    //   style: { width: "5%", textAlign: "center" },
    // },
    // {
    //   title: "Win",
    //   dataIndex: "totalWin",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "totalWin",
    //   style: { width: "5%", textAlign: "center" },
    // },
    // {
    //   title: "Lose",
    //   dataIndex: "totalLose",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "totalLose",
    //   style: { width: "5%", textAlign: "center" },
    // },
    // {
    //   title: "Tie",
    //   dataIndex: "totalTie",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "totalTie",
    //   style: { width: "5%", textAlign: "center" },
    // },
    // {
    //   title: "No Result",
    //   dataIndex: "noResult",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "noResult",
    //   style: { width: "10%", textAlign: "center" },
    // },
    // {
    //   title: "Points",
    //   dataIndex: "totalPoint",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "totalPoint",
    //   style: { width: "5%", textAlign: "center" },
    // },
    // {
    //   title: "Run Rate",
    //   dataIndex: "netRunRate",
    //   render: (text, record) => <span>{text ? text : "-"}</span>,
    //   key: "netRunRate",
    //   style: { width: "10%", textAlign: "center" },
    // },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row className="padding-row">
            <Card>
              <CardBody>
                {isLoading && <SpinnerModel />}
                <Row className="mt-3 mt-lg-3 mt-md-3 mb-3">
                  {teamDetails && (
                    <Col className="col-sm-auto">
                      <h4 className="mb-0 font-size-18 modal-header-title">
                        {teamDetails?.teamName} Competition Points [Ref:{" "}
                        {teamDetails.teamId}]
                      </h4>
                    </Col>
                  )}
                  <Col className="float-right">
                    <Button
                      className="btn btn-danger text-right mx-2"
                      onClick={handleBackClick}
                    >
                      {" "}
                      Back{" "}
                    </Button>
                  </Col>
                </Row>
                <Table responsive>
                  <thead className="table-light">
                    <tr>
                      {columns.map((column, index) => (
                        <th
                          className="px-2 py-2"
                          key={index}
                          style={column.style}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentData.length > 0 &&
                      tournamentData.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            {columns.map((column, colIndex) => (
                              <td
                                className="p-2"
                                key={colIndex}
                                style={column.style}
                              >
                                {column.render
                                  ? column.render(
                                      item[column.dataIndex],
                                      item,
                                      index
                                    )
                                  : item[column.dataIndex]}
                              </td>
                            ))}
                          </tr>
                        </React.Fragment>
                      ))}
                  </tbody>
                </Table>
                {!tournamentData.length > 0 && (
                  <div className="d-flex justify-content-center">
                    <span style={{ color: "lightgray" }}>
                      No Data Available
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TournamentCompetitionPoints;
