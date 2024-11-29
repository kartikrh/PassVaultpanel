import React, { useEffect, useState } from "react";
import axiosInstance from "../../Features/axios";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  CardHeader,
  Table,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR, TAB_PLAYER_EVENT_HISTORY } from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const MatchHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  document.title = TAB_PLAYER_EVENT_HISTORY;
  const [battingHistory, setBattingHistory] = useState([]);
  const [bowlingHistory, setBowlingHistory] = useState([]);
  const playerId = +sessionStorage.getItem("playerId") || "0";
  const playerDetails = JSON.parse(
    sessionStorage.getItem("playerDetails") || "{}"
  );
  const matchTypeId = +sessionStorage.getItem("matchHistoryId") || "0";
  const matchTypeDetails = JSON.parse(
    sessionStorage.getItem("matchHistoryDetails") || "{}"
  );
  let navigate = useNavigate();
  const dispatch = useDispatch();
  
  const fetchPlayerBatHistory = async (playerId, matchTypeId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/playerHistory/getPlayerBatHist", {
        playerId,
        matchTypeId,
      })
      .then((response) => {
        if (response?.result) {
          setBattingHistory(
            response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId)
          );
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

  const fetchPlayerBallHistory = async (playerId, matchTypeId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/playerHistory/getPlayerBallHist", {
        playerId,
        matchTypeId,
      })
      .then((response) => {
        if (response?.result) {
          setBowlingHistory(
            response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId)
          );
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
    navigate("/playerHistory");
  };

  useEffect(() => {
    if (playerId !== "0" && matchTypeId !== "0") {
      fetchPlayerBatHistory(playerId, matchTypeId);
      fetchPlayerBallHistory(playerId, matchTypeId);
    }
  }, [playerId, matchTypeId]);

  const battingColumns = [
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {text ? convertDateUTCToLocal(text, "index") : "-"}
        </span>
      ),
      key: "eventDate",
      style: { width: "15%" },
      sort: true,
    },
    {
      title: "Mat",
      dataIndex: "matchCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "matchCount",
      style: { width: "5%" },
    },
    {
      title: "Inns",
      dataIndex: "inningsCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "inningsCount",
      style: { width: "5%" },
    },
    {
      title: "NO",
      dataIndex: "notOut",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "notOut",
      style: { width: "5%" },
    },
    {
      title: "Runs",
      dataIndex: "totalRuns",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "totalRuns",
      style: { width: "5%" },
    },
    {
      title: "HS",
      dataIndex: "highestScore",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "highestScore",
      style: { width: "5%" },
    },
    {
      title: "Ave",
      dataIndex: "average",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "average",
      style: { width: "5%" },
    },
    {
      title: "BF",
      dataIndex: "ballsFacedCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "ballsFacedCount",
      style: { width: "5%" },
    },
    {
      title: "SR",
      dataIndex: "strikeRate",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "strikeRate",
      style: { width: "5%" },
    },
    {
      title: "100s",
      dataIndex: "countOf100",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "countOf100",
      style: { width: "5%" },
    },
    {
      title: "50s",
      dataIndex: "countOf50",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "countOf50",
      style: { width: "5%" },
    },
    {
      title: "4s",
      dataIndex: "countOf4",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "countOf4",
      style: { width: "5%" },
    },
    {
      title: "6s",
      dataIndex: "countOf6",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "countOf6",
      style: { width: "5%" },
    },
    {
      title: "Ct",
      dataIndex: "catchCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "catchCount",
      style: { width: "5%" },
    },
    {
      title: "St",
      dataIndex: "stumpCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "stumpCount",
      style: { width: "5%" },
    },
  ];

  const bowlingColumns = [
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {text ? convertDateUTCToLocal(text, "index") : "-"}
        </span>
      ),
      key: "eventDate",
      style: { width: "15%" },
      sort: true,
    },
    {
      title: "Mat",
      dataIndex: "bowlerPlayedMatchCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "bowlerPlayedMatchCount",
      style: { width: "5%" },
    },
    {
      title: "Inns",
      dataIndex: "bowlerPlayedInningsCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "bowlerPlayedInningsCount",
      style: { width: "5%" },
    },
    {
      title: "Balls",
      dataIndex: "ballCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "ballCount",
      style: { width: "5%" },
    },
    {
      title: "Runs",
      dataIndex: "runsFromBowler",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "runsFromBowler",
      style: { width: "5%" },
    },
    {
      title: "Wkts",
      dataIndex: "wicketsCount",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "wicketsCount",
      style: { width: "5%" },
    },
    {
      title: "BBI",
      dataIndex: "bestBowlingInInnings",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "bestBowlingInInnings",
      style: { width: "5%" },
    },
    {
      title: "BBM",
      dataIndex: "bestBowlingInMatch",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "bestBowlingInMatch",
      style: { width: "5%" },
    },
    {
      title: "Ave",
      dataIndex: "bowlerAverage",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "bowlerAverage",
      style: { width: "5%" },
    },
    {
      title: "Econ",
      dataIndex: "economy",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "economy",
      style: { width: "5%" },
    },
    {
      title: "SR",
      dataIndex: "bowlerStrikeRate",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "bowlerStrikeRate",
      style: { width: "5%" },
    },
    {
      title: "4w",
      dataIndex: "wickets4",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "wickets4",
      style: { width: "5%" },
    },
    {
      title: "5w",
      dataIndex: "wickets5",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "wickets5",
      style: { width: "5%" },
    },
    {
      title: "10w",
      dataIndex: "wickets10",
      render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "wickets10",
      style: { width: "5%" },
    },
  ];

  const renderMainSections = () => {
    return (
      <>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 font-size-16 font-bold">
              Batting Career Summary
            </h5>
          </CardHeader>
          <CardBody className="p-1">
            <Table responsive>
              <thead>
                <tr>
                  {battingColumns.map((column, index) => (
                    <th className="px-2 py-0" key={index} style={column.style}>
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {battingHistory.length > 0 &&
                  battingHistory.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        {battingColumns.map((column, colIndex) => (
                          <td className="p-2" key={colIndex}>
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
            {!battingHistory.length > 0 && (
              <div className="d-flex justify-content-center">
                <span style={{ color: "lightgray" }}>No Data Available</span>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 font-size-16">Bowling Career Summary</h5>
          </CardHeader>
          <CardBody className="p-1">
            <Table responsive>
              <thead>
                <tr>
                  {bowlingColumns.map((column, index) => (
                    <th className="px-2 py-0" key={index} style={column.style}>
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bowlingHistory.length > 0 &&
                  bowlingHistory.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        {bowlingColumns.map((column, colIndex) => (
                          <td className="p-2" key={colIndex}>
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
            {!bowlingHistory.length > 0 && (
              <div className="d-flex justify-content-center">
                <span style={{ color: "lightgray" }}>No Data Available</span>
              </div>
            )}
          </CardBody>
        </Card>
      </>
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card>
              <CardBody className="p-1">
                {isLoading && <SpinnerModel />}
                <Row className="mt-3 mt-lg-3 mt-md-3 mb-3">
                  {playerDetails && (
                    <Col className="col-sm-auto d-flex align-items-center">
                      {playerDetails?.image ? (
                        <img
                          className="avatar-md rounded-circle"
                          alt=""
                          src={playerDetails?.image}
                        />
                      ) : (
                        <Avatar src="#" alt="ET">
                          Image
                        </Avatar>
                      )}
                      <div className="d-flex flex-column">
                        <h5 className="mx-2 mb-0">{`${playerDetails?.playerName} History`}</h5>
                        <span className="mx-2">
                          {playerDetails?.playerType}
                        </span>
                        <span className="mx-2">
                          {matchTypeDetails?.matchTypeName}
                        </span>
                      </div>
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
                {renderMainSections()}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MatchHistory;
