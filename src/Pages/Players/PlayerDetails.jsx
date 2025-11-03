import React, { useEffect, useState } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import "../Competition/tournament.css";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { Avatar, Tooltip } from "antd";

const PlayerDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState([]);

  const playerId = +sessionStorage.getItem("playerId") || "0";
  const playerDetails = JSON.parse(sessionStorage.getItem("playerDetails") || "{}");
  document.title = `${playerDetails?.playerName} Details`;
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchPlayer = async (playerId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/player/playerTeams", { playerId })
      .then((response) => {
        if (response?.result) {
          setPlayerData(response?.result);
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

  const handleHomeTeamUpdate = async (record, cState) => {
    if (cState) return; // do nothing if already true

    setIsLoading(true);
    await axiosInstance.post("/admin/player/updateHomeTeam", {
      playerId: record?.refPlayerId,
      homeTeamId: record?.teamId,
    }).then((response) => {
      fetchPlayer(record?.refPlayerId);
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    }).catch((error) => {
      dispatch(
        updateToastData({
          data: error?.message || "Unable to update home team",
          title: error?.title,
          type: ERROR,
        })
      );
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleBackClick = () => {
    navigate("/Players");
  };

  useEffect(() => {
    if (playerId !== "0") {
      fetchPlayer(playerId);
    }
  }, [playerId]);

  const columns = [
    {
      title: "Image",
      dataIndex: "jerseyPlayerImage",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-sm"
                alt=""
                src={text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "jerseyPlayerImage",
      style: { width: "10%", textAlign: "center" },
    },
    {
      title: "Team",
      dataIndex: "teamName",
      key: "teamName",
      sort: true,
      style: { width: "20%", verticalAlign: "middle" },
    },
    {
      title: "Home Team",
      dataIndex: "homeTeam",
      key: "homeTeam",
      style: { width: "70%", verticalAlign: "middle" },
      render: (text, record) => (
        // <input
        //   type="checkbox"
        //   checked={record.homeTeam}
        //   onChange={() => handleHomeTeamUpdate(record?.refPlayerId, record?.teamId, record?.homeTeam)}
        //   style={{
        //     width: "18px",
        //     height: "18px",
        //     accentColor: "green",
        //     cursor: "pointer",
        //   }}
        // />
        <Tooltip
          title={!record?.homeTeam ? "Set HomeTeam": ""}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.homeTeam ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleHomeTeamUpdate(record, record?.homeTeam);
            }}
          >
            <i
              className={`bx ${record?.homeTeam ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
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
                  {playerDetails && (
                    <Col className="col-sm-auto">
                      <h4 className="mb-0 font-size-18 modal-header-title">
                        {/* {playerDetails?.playerName} Details [Id:{" "} {playerDetails.playerId}] */}
                        {playerDetails?.playerName} Details: 
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
                    {playerData.length > 0 &&
                      playerData.map((item, index) => (
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
                {!playerData.length > 0 && (
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

export default PlayerDetails;
