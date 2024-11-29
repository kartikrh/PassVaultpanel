import React, { useEffect, useState } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR } from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import "../Competition/tournament.css";

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
      title: "Competition",
      dataIndex: "competitionName",
      key: "competitionName",
      style: { width: "20%" },
    },
    {
      title: "Matches",
      dataIndex: "totalMatches",
      key: "totalMatches",
      style: { width: "10%" },
    },
    {
      title: "Win",
      dataIndex: "totalWin",
      key: "totalWin",
      style: { width: "10%" },
    },
    {
      title: "Lose",
      dataIndex: "totalLose",
      key: "totalLose",
      style: { width: "10%" },
    },
    {
      title: "Tie",
      dataIndex: "totalTie",
      key: "totalTie",
      style: { width: "10%" },
    },
    {
      title: "No Result",
      dataIndex: "noResult",
      key: "noResult",
      style: { width: "10%" },
    },
    {
      title: "Points",
      dataIndex: "totalPoint",
      key: "totalPoint",
      style: { width: "10%" },
    },
    {
      title: "Run Rate",
      dataIndex: "netRunRate",
      key: "netRunRate",
      style: { width: "10%" },
    },
    {
      title: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      key: "isActive",
      style: { width: "2%", textAlign: "center" },
    },
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
                      <h4 className="mb-0 font-size-18">
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
                {tournamentData && tournamentData.length > 0 && (
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
                      {tournamentData.map((item, index) => (
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
