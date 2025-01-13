import React, { useState, useEffect } from "react";
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, Container, Row, Col, Table, CardHeader } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "lodash";
import "../../components/Common/Reusables/CustomCss.css";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import createSocket from "../../Features/socket";
import { MARKET_RUNNER_CONNECT, MARKET_RUNNER_DATA } from "../../components/Common/Const";

export const CommentaryMarketRunner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  document.title = "commentaryMarketRunner";
  const socket = createSocket();

  let navigate = useNavigate();
  const commentaryId =
    +sessionStorage.getItem("marketRunnerCommentaryId") || 0;
  const commentaryDetails = JSON.parse(
    sessionStorage.getItem("marketRunnerCommentaryDetails") || "{}"
  );

  useEffect(() => {
    if (!isEmpty(commentaryDetails))
      document.title = `MR ${commentaryDetails?.eventRefId} ${commentaryDetails?.eventName}`;
  }, [commentaryDetails]);
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

  useEffect(() => {
          if (commentaryId && commentaryDetails?.eventRefId) {
              fetchData(commentaryId);
              if (socket) {
                  socket.emit(MARKET_RUNNER_CONNECT, [ commentaryDetails.eventRefId ]);
                  setIsSocketConnected(true)
                  socket.on(MARKET_RUNNER_DATA, (socketData) => {
                    const socketDataValue = socketData?.value;
                    if(socketDataValue && socketDataValue.length > 0) {
                    setMarketData((prevMarketData) => {
                      // For each market in the socket data
                      return socketDataValue.map((socketMarket) => {
                        // Check if the eventMarketId exists in the previous marketData
                        const existingMarket = prevMarketData && prevMarketData.length > 0 && prevMarketData.find(
                          (market) => market.eventMarketId == socketMarket.eventMarketId
                        );
            
                        if (existingMarket) {
                          // If the market exists, update the runners
                          existingMarket.runner = existingMarket.runner.map((runner) => {
                            const socketRunner = socketMarket?.runners && socketMarket.runners.length > 0 && socketMarket.runners.find(
                              (socketRunner) => socketRunner.runnerId == runner.runnerId
                            );
            
                            if (socketRunner) {
                              // Update runner information if the runnerId exists
                              return {
                                ...runner,
                                backPrice: socketRunner.backPrice,
                                layPrice: socketRunner.layPrice,
                                backSize: socketRunner.backSize,
                                laySize: socketRunner.laySize,
                              };
                            }
                            return runner; // If no update, return the original runner
                          });
            
                          // Check if there are any new runners from the socket that do not exist in the current market
                          socketMarket?.runners && socketMarket.runners.forEach((socketRunner) => {
                            const existingRunner = existingMarket.runner.find(
                              (runner) => runner.runnerId == socketRunner.runnerId
                            );
            
                            // If the runner doesn't exist in the current market, add it
                            if (!existingRunner) {
                              existingMarket.runner.push(socketRunner);
                            }
                          });
            
                          return existingMarket; // Return the updated market
                        } else {
                          // If the market doesn't exist in the current marketData, add it
                          return socketMarket; // Add the new market with all its runners
                        }
                      });
                    });
                    }
                  });
              } else setIsSocketConnected(false)
          }
          return () => {
              socket.off(MARKET_RUNNER_DATA);
          };
      }, [commentaryId, commentaryDetails?.eventRefId]);

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
                      <div key={market.eventMarketId} className="mt-3 runner-table">
                          <Table  
                            className="table"
                            responsive
                            // bordered
                            // style={{ border: "1px black" }}
                          >
                            <thead>
                              <tr>
                                <th>{market?.marketName}</th>
                                <th className="market-back-lay text-end"> Back </th>
                                <th className="market-back-lay"> Lay </th>
                              </tr>
                            </thead>
                            <tbody>
                              {market?.runner && market.runner?.length > 0 && market.runner.sort((a,b)=>a.runnerId - b.runnerId).map((runner) => (
                                <tr key={runner.runnerId}>
                                  <td>{runner.runner}</td>
                                  <td className="yes-rate text-center py-0">
                                        <div className="rate-font">{runner?.backPrice || "0"}</div>
                                        <div className="point-font">{runner?.backSize || "0"}</div>
                                  </td>
                                  <td className="no-rate text-center py-0"> 
                                        <div className="rate-font">{runner?.layPrice || "0"}</div>
                                        <div className="point-font">{runner?.laySize || "0"}</div>
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