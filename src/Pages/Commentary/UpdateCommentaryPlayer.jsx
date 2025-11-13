import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMMENTARY,
} from "../../components/Common/Const";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from "reactstrap";
import Select from "react-select";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import TeamPlayerCard from "./TeamPlayerCard";
import { isEmpty } from "lodash";
import { Tooltip } from "antd";

const PlayerCommentary = () => {
  const pageName = TAB_COMMENTARY;
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const globalDateType = JSON.parse(localStorage.getItem("DateType"));
  const location = useLocation();
  let navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(false);
  const [open, setOpen] = useState([]);
  const commentaryId = +localStorage.getItem("updatePlayerCommentaryId") || "0";
  const commentaryDetails = JSON.parse(
    localStorage.getItem("updatePlayerCommentaryDetails")
  );
  // const commentaryId = location.state?.commentaryId || "0";
  // const commentaryDetails = location.state?.commentaryDetails;
  const [teams, setTeams] = useState([]);
  const [bowlerType, setBowlerType] = useState([]);
  const dispatch = useDispatch();
  const [commentaryData, setCommentaryData] = useState(null);
  const [openAccordions, setOpenAccordions] = useState("");
  const [updateAllInnings, setUpdateAllInnings] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [openInningsAccordions, setOpenInningsAccordions] = useState({});
  const [dateType, setDateType] = useState(globalDateType || { label: "Local Timezone", value: 1 });

  const toggle = (id) => {
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }
    if (commentaryId !== "0") {
      fetchData(commentaryId);
      fetchBowlingTypeData(commentaryId);
    }
  }, []);

  const fetchBowlingTypeData = async (commentaryId) => {
    setIsDataLoading(true);
    await axiosInstance
      .post("/admin/list/allBowlingTypes", { commentaryId })
      .then((response) => {
        const bowlerTypes = response?.result?.map(element=>{
          return {
            "label":element.bowlingType,
            "value":element.bowlingTypeId
          }
        })
        setBowlerType(bowlerTypes);
        setIsDataLoading(false);
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
        setApiResponse(response?.result || {});
        //setTeams(response?.result?.commentaryTeams);
        setIsDataLoading(false);
        setDataRefreshKey(prev => prev + 1);
        // console.log("data:", commentaryDetailsData);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
      dispatch(
        updateToastData({
          data: "API Response copied to clipboard!",
          title: "Success",
          type: SUCCESS, 
        })
      );
    } catch (err) {
      dispatch(
        updateToastData({
          data: "Failed to copy to clipboard",
          title: "Error",
          type: ERROR,
        })
      );
    }
  };

  const toggleInningsAccordion = (teamId, inningsNumber) => {
    const key = `${teamId}-${inningsNumber}`;
    setOpenInningsAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
                  <Col className="mt-3 mt-lg-3 mt-md-3 d-flex justify-content-end align-items-center gap-3">
                    <Select
                      value={dateType}
                      placeholder="Date Type"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: 200,
                        }),
                      }}
                      onChange={(e) => {
                        localStorage.setItem("DateType", JSON.stringify(e))
                        setDateType(e)
                      }}
                      options={[
                        { label: "Local Timezone", value: 1 },
                        { label: "UTC Timezone", value: 2 },
                      ]}
                      classNamePrefix="filter-dropdown"
                    />
                    {commentaryData?.totalInnings > 1 && (
                      <Tooltip
                        title={"Update Player in All Innings"}
                        color={"#e8e8ea"}
                        overlayInnerStyle={{ color: "#000" }}
                      >
                        <div className="form-check form-switch form-switch-lg me-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="updateAllInningsToggle"
                            checked={updateAllInnings}
                            onChange={(e) => setUpdateAllInnings(e.target.checked)}
                          />
                          {/* <label className="form-check-label" htmlFor="updateAllInningsToggle">
                            Update All Innings
                          </label> */}
                        </div>
                      </Tooltip>
                    )}
                    <button
                      className="btn btn-danger"
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
                  {teams.map((teamDetails, index) => (
                    <div
                      key={index}
                      className="col-12 col-lg-12 col-sm-12 col-md-12"
                    >
                      <Accordion open={open} toggle={toggle}>
                        <AccordionItem>
                          <AccordionHeader targetId={`details-accordion-${index}`} className="market-category-header">
                            {teamDetails?.teamName}
                          </AccordionHeader>
                          <AccordionBody accordionId={`details-accordion-${index}`} className="market-category-body p-2">
                            {teamDetails?.commentaryTeamPlayers &&
                              Object.keys(teamDetails.commentaryTeamPlayers)
                                .length > 0 &&
                              Object.keys(teamDetails.commentaryTeamPlayers)
                                .sort((a, b) => {
                                  const numA = Number(
                                    a.replace("currentInnings", "")
                                  );
                                  const numB = Number(
                                    b.replace("currentInnings", "")
                                  );
                                  return numA - numB;
                                })
                                .map((inningKey) => {
                                  const inningPlayers =
                                    teamDetails.commentaryTeamPlayers[inningKey];
                                  const currentInnings =
                                    inningPlayers[0]?.currentInnings ||
                                    (inningKey.startsWith("currentInnings")
                                      ? Number(
                                          inningKey.replace("currentInnings", "")
                                        )
                                      : "");
                                  // console.log("Current Innings: ", currentInnings);
                                  // return (
                                  //   <CardBody key={inningKey}>
                                  //     {commentaryData?.totalInnings > 1 ? (
                                  //       <h6> Innings : {currentInnings}</h6>
                                  //     ) : null}
                                  //     <TeamPlayerCard
                                  //       key={`${teamDetails.teamId}-${inningKey}-${dataRefreshKey}`}
                                  //       commentaryId={commentaryId}
                                  //       eventRefId={commentaryDetails?.eventRefId}
                                  //       teamDetails={teamDetails}
                                  //       inningPlayers={inningPlayers}
                                  //       currentInnings={currentInnings}
                                  //       fetchData={fetchData}
                                  //       bowlingType={bowlerType}
                                  //       allTeamPlayers={teams}
                                  //       updateAllInnings={updateAllInnings}
                                  //       commentaryData={commentaryData}
                                  //     />
                                  //     <hr className="my-3" />
                                  //   </CardBody>
                                  // );

                                  const accordionId = `${teamDetails.teamId}-${currentInnings}`;
                                  const isOpen = openInningsAccordions[accordionId];

                                  return commentaryData?.totalInnings > 1 ? (
                                    // With Accordion when totalInnings > 1
                                    <Accordion
                                      key={inningKey}
                                      open={isOpen ? accordionId : ""}
                                      toggle={() => toggleInningsAccordion(teamDetails.teamId, currentInnings)}
                                    >
                                      <AccordionItem>
                                        <AccordionHeader targetId={accordionId} className='market-category-header'>
                                          <strong>Innings : {currentInnings}</strong>
                                        </AccordionHeader>
                                        <AccordionBody accordionId={accordionId}>
                                          <TeamPlayerCard
                                            key={`${teamDetails.teamId}-${inningKey}-${dataRefreshKey}`}
                                            commentaryId={commentaryId}
                                            eventRefId={commentaryDetails?.eventRefId}
                                            teamDetails={teamDetails}
                                            inningPlayers={inningPlayers}
                                            currentInnings={currentInnings}
                                            fetchData={fetchData}
                                            bowlingType={bowlerType}
                                            allTeamPlayers={teams}
                                            updateAllInnings={updateAllInnings}
                                            commentaryData={commentaryData}
                                            dateType={dateType}
                                          />
                                        </AccordionBody>
                                      </AccordionItem>
                                    </Accordion>
                                  ) : (
                                    // Without Accordion when totalInnings <= 1
                                    <div key={inningKey}>
                                      <TeamPlayerCard
                                        key={`${teamDetails.teamId}-${inningKey}-${dataRefreshKey}`}
                                        commentaryId={commentaryId}
                                        eventRefId={commentaryDetails?.eventRefId}
                                        teamDetails={teamDetails}
                                        inningPlayers={inningPlayers}
                                        currentInnings={currentInnings}
                                        fetchData={fetchData}
                                        bowlingType={bowlerType}
                                        allTeamPlayers={teams}
                                        updateAllInnings={updateAllInnings}
                                        commentaryData={commentaryData}
                                        dateType={dateType}
                                      />
                                      <hr className="my-3" />
                                    </div>
                                  );
                              })}
                          </AccordionBody>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}
                </Row>
                <Row>
                  <Accordion
                    open={openAccordions ? "one-time" : ""}
                    toggle={(id) => {
                      setOpenAccordions(openAccordions === id ? "" : id);
                    }}
                  >
                    <AccordionItem className="rounded-0">
                      <AccordionHeader
                        className="market-category-header"
                        targetId="one-time"
                      >
                        <b>API Response Data</b>
                      </AccordionHeader>
                      <AccordionBody
                        className="market-category-body category-list bg-white"
                        accordionId="one-time"
                      >
                        <Card>
                          {/* <CardHeader className="d-flex justify-content-between align-items-center">
                            <span>
                              <strong>API Response Data</strong>
                            </span>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={copyToClipboard}
                              title="Copy to clipboard"
                            >
                              📋 Copy
                            </button>
                          </CardHeader> */}
                          <CardBody>
                            <div className="d-flex justify-content-end mb-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={copyToClipboard}
                                title="Copy to clipboard"
                              >
                                📋 Copy
                              </button>
                            </div>
                            <pre
                              style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "12px",
                                maxHeight: "400px",
                                overflowY: "auto",
                                backgroundColor: "#f8f9fa",
                                padding: "15px",
                                borderRadius: "4px",
                                margin: 0,
                              }}
                            >
                              {JSON.stringify(apiResponse, null, 2)}
                            </pre>
                          </CardBody>
                        </Card>
                      </AccordionBody>
                    </AccordionItem>
                  </Accordion>
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
