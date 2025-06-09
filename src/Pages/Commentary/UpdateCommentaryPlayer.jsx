import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ERROR,
  PERMISSION_VIEW,
  TAB_COMMENTARY,
} from "../../components/Common/Const";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import TeamPlayerCard from "./TeamPlayerCard";
import { isEmpty } from "lodash";

const PlayerCommentary = () => {
  const pageName = TAB_COMMENTARY;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const location = useLocation();
  let navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const commentaryId = +localStorage.getItem("updatePlayerCommentaryId") || "0";
  const commentaryDetails = JSON.parse(
    localStorage.getItem("updatePlayerCommentaryDetails")
  );
  // const commentaryId = location.state?.commentaryId || "0";
  // const commentaryDetails = location.state?.commentaryDetails;
  const dispatch = useDispatch();
  const [teams, setTeams] = useState([]);
  const [commentaryData, setCommentaryData] = useState(null);
  
  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
    if (commentaryId !== "0") {
      fetchData(commentaryId);
    }
  }, [permissionObj]);

  const fetchData = async (commentaryId) => {
    setIsDataLoading(true);
    await axiosInstance
      .post("/admin/commentary/getTeamAndPlayerByIdV1", { commentaryId })
      .then((response) => {
        // const teams = response?.result?.commentaryTeams?.map((team) => {
        //   // Sort team players by playerName in alphabetical order

        //   const sortedPlayers = team.commentaryTeamPlayers.sort((a, b) =>
        //     a.playerName?.trim().localeCompare(b.playerName?.trim(), undefined, { sensitivity: 'base' })
        //   );
        //   // Return team with sorted players
        //   return { ...team, commentaryTeamPlayers: sortedPlayers };
        // });
        const teams = response?.result?.commentaryTeams;
        const commentaryDetailsData = response?.result?.commentaryDetails;
        setTeams(teams);
        setCommentaryData(commentaryDetailsData);
        //setTeams(response?.result?.commentaryTeams);
        setIsDataLoading(false);
        console.log("data:", commentaryDetailsData)
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsDataLoading(false);
      });
  };

  const handleBackClick = () => {
    navigate("/commentary");
  };
  
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card>
              <CardBody>
                {isDataLoading && <SpinnerModel />}
                <Row className="mb-3">
                  <Col className="mt-3 mt-lg-4 mt-md-4">
                    <Breadcrumbs
                      title="ScoreCard"
                      breadcrumbItem="Update Team Players"
                      page="updatecp"
                    />
                  </Col>
                  <Col className="mt-3 mt-lg-3 mt-md-3">
                    <button
                      className="btn btn-danger text-right"
                      onClick={handleBackClick}
                    >
                      Back
                    </button>
                  </Col>
                </Row>
                <div className="py-2 px-3 mb-2 d-flex flex-column flex-md-row bg-light">
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>Event Ref Id:</strong>{" "}
                    <span>{commentaryDetails?.eventRefId}</span>
                  </div>
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>Event Type:</strong>{" "}
                    <span>{commentaryDetails?.eventType}</span>
                  </div>
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>Event Name:</strong>{" "}
                    <span>{commentaryDetails?.eventName}</span>
                  </div>
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>Event Date:</strong>{" "}
                    <span>
                      {convertDateUTCToLocal(
                        commentaryDetails?.eventDate,
                        "",
                        "DD/MM/YY HH:mm"
                      )}
                    </span>
                  </div>
                </div>
                {/* <div className="py-2 px-3 mb-2 d-flex flex-column flex-md-row bg-light">
                <div className="ml-2">
                    <span>[{commentaryDetails?.eventRefId}]</span> 
                  </div> {" / "}
                  <div className="ml-2">
                    <span>{commentaryDetails?.eventType}</span>
                  </div> {" / "}
                  <div className="ml-2">
                    <span>{commentaryDetails?.eventName}</span>
                  </div> {" / "}
                  <div className="ml-2">
                    <span>
                      {convertDateUTCToLocal(
                        commentaryDetails?.eventDate,
                        "",
                        "DD/MM/YY HH:mm"
                      )}
                    </span>
                  </div>
                </div> */}
                <Row>
                  <Row>
                    {teams.map((teamDetails, index) => (
                      <div
                        key={index}
                        class="col-12 col-lg-6 col-sm-6 col-md-6"
                      >
                        <Card>
                          <CardHeader>{teamDetails?.teamName}</CardHeader>
                          {teamDetails?.commentaryTeamPlayers &&
                            Object.keys(teamDetails.commentaryTeamPlayers).length > 0 &&
                            Object.keys(teamDetails.commentaryTeamPlayers).map(
                              (inningKey) => {
                                const inningPlayers = teamDetails.commentaryTeamPlayers[inningKey];
                                return (
                                  <CardBody key={inningKey}>
                                    {commentaryData?.totalInnings > 1 ? <h6> Innings : {inningPlayers[0]?.currentInnings}</h6> : null}
                                    <TeamPlayerCard
                                      commentaryId={commentaryId}
                                      teamDetails={teamDetails}
                                      inningPlayers={inningPlayers}
                                      currentInnings={commentaryDetails?.currentInnings}
                                      fetchData={fetchData}
                                    />
                                  </CardBody>
                                );
                              }
                            )}
                        </Card>
                      </div>
                    ))}
                  </Row>
                </Row>
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PlayerCommentary;
