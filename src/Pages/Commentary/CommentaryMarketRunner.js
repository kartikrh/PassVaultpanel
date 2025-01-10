import React, { useState, useEffect } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table, CardHeader } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "lodash";
import "../../components/Common/Reusables/CustomCss.css";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

export const CommentaryMarketRunner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  document.title = "commentaryMarketRunner";

  let navigate = useNavigate();
  const commentaryId =
    +sessionStorage.getItem("marketRunnerCommentaryId") || "0";
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("marketRunnerCommentaryDetails") || "{}"
  );

  useEffect(() => {
    if (!isEmpty(commentaryDetails))
      document.title = `MR ${commentaryDetails?.eventRefId} ${commentaryDetails?.eventName}`;
  }, [commentaryDetails]);

  useEffect(() => {
    fetchData(commentaryId);
  }, []);

  const fetchData = async (commentaryId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        "/admin/commentary/eventMarkets",
        { commentaryId }
      );
      if (response?.result) {
        setMarketData(response?.result);
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/commentary");
  };

  const MarketDetailsDate = commentaryDetails?.eventDate
    ? convertDateUTCToLocal(commentaryDetails.eventDate, "index")
    : "";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card>
              <CardBody className="p-1">
                {isLoading && <SpinnerModel />}
                <Row className="d-flex align-items-center">
                  {!isEmpty(commentaryDetails) && (
                    <Col className="mt-3 mt-lg-3 mt-md-3">
                      <div className="match-details-breadcrumbs">
                        {`${commentaryDetails.eventType}/ ${commentaryDetails.competition}/ `}{" "}
                        <strong>{`${commentaryDetails.eventName}`}</strong>
                        {`/ Ref: `}{" "}
                        <strong>{`${commentaryDetails.eventRefId}`}</strong>{" "}
                        {`[ ${MarketDetailsDate} ]`}
                      </div>
                    </Col>
                  )}
                  <Col
                    className="mt-3 mt-lg-3 mt-md-3 float-right"
                    xs={2}
                    md={1}
                    lg={1}
                  >
                    <Button
                      className="btn btn-danger text-right"
                      onClick={handleBackClick}
                    >
                      {" "}
                      Back{" "}
                    </Button>
                  </Col>
                </Row>
                {!isEmpty(marketData) && (
                  <>
                    {marketData?.length > 0 && marketData.sort((a,b)=>a.eventMarketId - b.eventMarketId).map((market, index) => (
                      <div key={market.eventMarketId} className="mt-3">
                          <Table  
                            className="table"
                            responsive
                            // bordered
                            // style={{ border: "1px black" }}
                          >
                            <thead>
                              <tr>
                                <th className="market-runner">{market.marketName}</th>
                                <th> Back </th>
                                <th> Lay </th>
                              </tr>
                            </thead>
                            <tbody>
                              {market?.runner && market.runner?.length > 0 && market.runner.sort((a,b)=>a.runnerId - b.runnerId).map((runner) => (
                                <tr key={runner.runnerId}>
                                  <td>{runner.runner}</td>
                                  <td className="yes-rate text-center py-0">
                                        <div className="rate-font">{runner.backPrice || "0"}</div>
                                        <div className="point-font">{runner.backSize || "0"}</div>
                                  </td>
                                  <td className="no-rate text-center py-0"> 
                                        <div className="rate-font">{runner.layPrice || "0"}</div>
                                        <div className="point-font">{runner.laySize || "0"}</div>
                                </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                      </div>
                    ))}
                  </>
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};