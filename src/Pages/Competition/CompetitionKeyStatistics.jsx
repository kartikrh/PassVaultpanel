import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
} from "../../components/Common/Const";
import {
  checkPermission,
  convertDateUTCToLocalWithoutSec24,
} from "../../components/Common/Reusables/reusableMethods";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Card,
  CardBody,
  Col,
  Container,
  Row,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import axiosInstance from "../../Features/axios";
import CompetitionKeyStatisticsCard from "./CompetitionKeyStatisticsCard";
import { isEmpty } from "lodash";

const CompetitionKeyStatistics = () => {
  const pageName = "Competition Statistics";
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  let navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [openMatchTypeAccordions, setOpenMatchTypeAccordions] = useState({});
  const [openTypeAccordions, setOpenTypeAccordions] = useState({});
  const [openStatsAccordions, setOpenStatsAccordions] = useState({});
  const competitionId = +localStorage.getItem("keyStatscompetitionId") || "0";
  const competitionDetails = JSON.parse(
    localStorage.getItem("competitionStatisticsDetails")
  );
  const [statisticsData, setStatisticsData] = useState([]);
  const dispatch = useDispatch();

  const toggleMatchTypeAccordion = (matchTypeId) => {
    setOpenMatchTypeAccordions(prev => ({
      ...prev,
      [matchTypeId]: !prev[matchTypeId]
    }));
  };

  const toggleTypeAccordion = (matchTypeId, typeId) => {
    const key = `${matchTypeId}-${typeId}`;
    setOpenTypeAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleStatsAccordion = (matchTypeId, typeId, statsTypeId) => {
    const key = `${matchTypeId}-${typeId}-${statsTypeId}`;
    setOpenStatsAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }
    if (competitionId !== "0") {
      fetchData(competitionId);
    }
  }, []);

  const fetchData = async (competitionId) => {
    setIsDataLoading(true);
    await axiosInstance
      .post("/admin/competitionStatistics/getByCompetitionId", { competitionId })
      .then((response) => {
        const data = response?.result || [];
        setStatisticsData(data);
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

  const handleBackClick = () => {
    navigate("/competition");
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
                      title="Competition Statistics"
                      breadcrumbItem="Key Stats"
                      page="updatecs"
                    />
                  </Col>
                  <Col className="mt-3 mt-lg-3 mt-md-3 d-flex justify-content-end align-items-center gap-3">
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
                    <strong>Competition Name:</strong>{" "}
                    <span>{competitionDetails?.competition}</span>
                  </div>
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>Competition TPID:</strong>{" "}
                    <span>{competitionDetails?.tpId}</span>
                  </div>
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>Start Date:</strong>{" "}
                    <span>
                      {convertDateUTCToLocalWithoutSec24(
                        competitionDetails?.startDate,
                        "index"
                      )}
                    </span>
                  </div>
                  <div className="ml-2" style={{ marginRight: "20px" }}>
                    <strong>End Date:</strong>{" "}
                    <span>
                      {convertDateUTCToLocalWithoutSec24(
                        competitionDetails?.endDate,
                        "index"
                      )}
                    </span>
                  </div>
                </div>
                <Row>
                  {statisticsData && statisticsData.length > 0 ? (
                    statisticsData.map((matchTypeGroup) => {
                      const matchTypeId = matchTypeGroup?.matchTypeId;
                      const matchTypeName = matchTypeGroup?.matchType;
                      const competitionStatisticsData = matchTypeGroup?.competitionStatisticsData;
                      const isMatchTypeOpen = openMatchTypeAccordions[matchTypeId];

                      if (!competitionStatisticsData || competitionStatisticsData.length < 1) {
                        return null;
                      }

                      return (
                        <div key={matchTypeId} className="col-12">
                          <Accordion
                            open={isMatchTypeOpen ? `matchType-${matchTypeId}` : ""}
                            toggle={() => toggleMatchTypeAccordion(matchTypeId)}
                          >
                            <AccordionItem>
                              <AccordionHeader
                                targetId={`matchType-${matchTypeId}`}
                                className="market-category-header"
                              >
                                <strong>{matchTypeName}</strong>
                              </AccordionHeader>
                              <AccordionBody accordionId={`matchType-${matchTypeId}`}>
                                {competitionStatisticsData
                                  .sort((a, b) => a.typeId - b.typeId)
                                  .map((typeGroup) => {
                                    const typeId = typeGroup?.typeId;
                                    const typeName = typeGroup?.type;
                                    const competitionStatistics = typeGroup?.competitionStatistics;
                                    const typeKey = `${matchTypeId}-${typeId}`;
                                    const isTypeOpen = openTypeAccordions[typeKey];

                                    if (!competitionStatistics || competitionStatistics.length < 1) {
                                      return null;
                                    }

                                    return (
                                      <div key={typeKey} className="mb-2">
                                        <Accordion
                                          open={isTypeOpen ? `type-${typeKey}` : ""}
                                          toggle={() => toggleTypeAccordion(matchTypeId, typeId)}
                                        >
                                          <AccordionItem>
                                            <AccordionHeader
                                              targetId={`type-${typeKey}`}
                                              className="market-category-header"
                                            >
                                              {typeName}
                                            </AccordionHeader>
                                            <AccordionBody accordionId={`type-${typeKey}`}>
                                              {competitionStatistics.map((statsType) => {
                                                const statsTypeId = statsType?.competitionStatisticsTypeId;
                                                const accordionKey = `${matchTypeId}-${typeId}-${statsTypeId}`;
                                                const isStatsOpen = openStatsAccordions[accordionKey];

                                                return (
                                                  <Accordion
                                                    key={accordionKey}
                                                    open={isStatsOpen ? accordionKey : ""}
                                                    toggle={() => toggleStatsAccordion(matchTypeId, typeId, statsTypeId)}
                                                  >
                                                    <AccordionItem>
                                                      <AccordionHeader
                                                        targetId={accordionKey}
                                                        className="market-category-header"
                                                      >
                                                        <strong>{statsType?.name}</strong>
                                                      </AccordionHeader>
                                                      <AccordionBody accordionId={accordionKey}>
                                                        <CompetitionKeyStatisticsCard
                                                          statisticsType={statsType}
                                                          statisticsData={statsType?.data}
                                                        />
                                                      </AccordionBody>
                                                    </AccordionItem>
                                                  </Accordion>
                                                );
                                              })}
                                            </AccordionBody>
                                          </AccordionItem>
                                        </Accordion>
                                      </div>
                                    );
                                  })}
                              </AccordionBody>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-3 text-muted">
                      No statistics data available
                    </div>
                  )}
                </Row>
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CompetitionKeyStatistics;