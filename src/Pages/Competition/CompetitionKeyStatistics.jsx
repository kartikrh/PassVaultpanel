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
  const [open, setOpen] = useState([]);
  const competitionId = +localStorage.getItem("keyStatscompetitionId") || "0";
  const competitionDetails = JSON.parse(
    localStorage.getItem("competitionStatisticsDetails")
  );
  const [statisticsData, setStatisticsData] = useState([]);
  const dispatch = useDispatch();

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
                  {statisticsData.map((statsType, index) => (
                    <div
                      key={index}
                      className="col-12 col-lg-12 col-sm-12 col-md-12"
                    >
                      <Accordion open={open} toggle={toggle}>
                        <AccordionItem>
                          <AccordionHeader
                            targetId={`stats-accordion-${index}`}
                            className="market-category-header"
                          >
                            {statsType?.competitionStatisticsType?.name || `Statistics Type ${index + 1}`}
                          </AccordionHeader>
                          <AccordionBody
                            accordionId={`stats-accordion-${index}`}
                            className="market-category-body p-2"
                          >
                            <CompetitionKeyStatisticsCard
                              statisticsType={statsType?.competitionStatisticsType}
                              statisticsData={statsType?.competitionStatisticsData}
                            />
                          </AccordionBody>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}
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