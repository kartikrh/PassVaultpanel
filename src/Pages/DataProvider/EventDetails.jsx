import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  CardBody,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import {
  CONNECT,
  CONNECT_EVENT,
  ERROR,
  PERMISSION_VIEW,
  TAB_DATA_PROVIDER,
  UPDATE_EVENT,
} from "../../components/Common/Const";
import { io } from "socket.io-client";
import { isEmpty } from "lodash";
import Switch from "react-switch";
import { loadInit } from "../../config";
import { useNavigate } from "react-router-dom";

const EventDetails = () => {
  const pageName = TAB_DATA_PROVIDER;
  const [eventInfo, setEventInfo] = useState([]);
  const [eventInfoDetails, setEventInfoDetails] = useState({});
  const [marketsGrouped, setMarketsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const marketTypeObj = useSelector(
    (state) => state.marketType?.marketTypeList
  );
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [openInactiveMarkets, setOpenInactiveMarkets] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);
  const [isScorecardShow, setIsScorecardShow] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    socketUrl: null,
    apiXkey: null,
    apiURL: null
  });
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const eventId = +sessionStorage.getItem("dataproviderEventId") || "0";
  const eventDetails = JSON.parse(
    sessionStorage.getItem("dataproviderEventDetails") || "{}"
  );
  let scorecardFrameUrl = loadInitData.find(
    (item) => item.key === loadInit.SCORECARD_FRAME_URL
  )?.value;
  if (scorecardFrameUrl) {
    scorecardFrameUrl = scorecardFrameUrl.replace("{commentaryId}", eventInfoDetails?.id);
  }
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(110); //default height if scorecard doesn't send height info

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard");
    }
  }, [permissionObj]);

  useEffect(() => {
    if (!isEmpty(eventDetails))
      document.title = `View Market - ${eventDetails?.eventName} [${eventDetails?.eventRefId ? eventDetails?.eventRefId : eventDetails?.eventId}]`;
  }, [eventDetails]);

  useEffect(() => {
    if (loadInitData) {
      setApiConfig({
        socketUrl: loadInitData.find((config) => config.key === "DPSOCKETURL")?.value,
        apiXkey: loadInitData.find((config) => config.key === "DPAPIXKEY")?.value,
        apiURL: loadInitData.find((config) => config.key === "DPAPIURL")?.value
      });
    }
  }, [loadInitData]);

  useEffect(() => {
    const handleScoreboardMessage = (event) => {
      if (event.data && event.data.scoreWidgetHeight) {
        setIframeHeight(event.data.scoreWidgetHeight);
      }
    };
    window.addEventListener('message', handleScoreboardMessage);
    return () => {
      window.removeEventListener('message', handleScoreboardMessage);
    };
  }, []);

  useEffect(() => {
    const fetchMarketCategoriesList = async () => {
      await axiosInstance
        .post("/admin/marketTemplate/mtAndCategories", {})
        .then((response) => {
          if (response?.result) {
            setCategories(response.result?.categories || []);
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
        });
    };
    fetchMarketCategoriesList();
  }, []);

  const groupMarkets = (markets) => {
    const groupedData = {};

    const sortedCategories = [...categories].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    sortedCategories.forEach((category) => {
      const categoryMarkets = markets.filter(
        (market) => market.marketTypeCategory === category.marketTypeCategoryId
      );
      if (categoryMarkets.length > 0) {
        groupedData[category.displayOrder] = {
          categoryInfo: category,
          markets: categoryMarkets,
        };
      }
    });
    return groupedData;
  };

  useEffect(() => {
    const fetchData = async (eventId) => {
      try {
        const response = await fetch(`${apiConfig.apiURL}/api/eventInfo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Key": apiConfig.apiXkey,
          },
          body: JSON.stringify({ eventId }),
        });
        const data = await response.json();
        if (data.isSuccess && data.statusCode === 200) {
          const filteredMarkets = data?.result?.markets.filter(
            (market) => ![4, 5, 6].includes(market?.status)
          );
          setEventInfoDetails(data?.result);
          setEventInfo(filteredMarkets);
        } else {
          console.log("Failed to fetch data");
        }
      } catch (err) {
        console.log("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (apiConfig.apiURL && apiConfig.apiXkey && eventId) {
      fetchData(eventId);
    }
  }, [apiConfig.apiURL, apiConfig.apiXkey, eventId]);

  useEffect(() => {
    if (
      eventInfo?.length > 0 &&
      categories?.length > 0
    ) {
      const data = groupMarkets(eventInfo);
      setMarketsGrouped(data);
      const allCategoryIds = Object.keys(data);
      setOpenCategories(allCategoryIds);
      // setOpenInactiveMarkets(allCategoryIds);
    }
  }, [eventInfo, categories]);

  const configSocket = (eventId) => {
    socket.current.emit(CONNECT_EVENT, {
      eventIds: [eventId],
    });
    socket.current.on(UPDATE_EVENT, (data) => {
      //   console.log("Received updated event data:", data?.data);
      const markets = data?.data?.markets || [];

      setEventInfo((prevOpenMarket) => {
        const safePrev = Array.isArray(prevOpenMarket) ? prevOpenMarket : [];
        const updatedEventInfo = [...safePrev];

        markets?.forEach((marketData) => {
          const marketIndex = updatedEventInfo.findIndex(
            (item) => item.marketId == marketData?.marketId
          );
          if (marketIndex !== -1) {
            if (
              marketData?.status == 4 ||
              marketData?.status == 5 ||
              marketData?.status == 6
            ) {
              updatedEventInfo.splice(marketIndex, 1);
            } else {
              updatedEventInfo[marketIndex] = { ...marketData };
            }
          } else {
            if (
              marketData?.runner &&
              marketData?.status != 4 &&
              marketData?.status != 5 &&
              marketData?.status != 6
            ) {
              updatedEventInfo.push(marketData);
            }
          }
        });
        return updatedEventInfo;
      });
    });
  };

  useEffect(() => {
    if (apiConfig.socketUrl) {
      socket.current = io.connect(apiConfig.socketUrl, {
        transports: ["websocket"],
      });

      // if (eventId) {
      //   if (socket.current?.connected) {
      //     configSocket(eventId);
      //   } else {
      //     socket.current.on(CONNECT, () => {
      //       configSocket(eventId);
      //     });
      //   }
      // }
      if (eventId) {
        socket.current.on(CONNECT, () => configSocket(eventId));
      }
    }
    // return () => {
    //     if (socket.current) {
    //       socket.current.disconnect();
    //     }
    // };
  }, [apiConfig.socketUrl, eventId]);
  const toggleInactiveMarket = (id) => {
    setOpenInactiveMarkets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Function to toggle Category Accordion
  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBackClick = () => {
    sessionStorage.removeItem("selectedMatch");
    navigate("/dataprovider");
  };

  const OffsymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          paddingRight: "10px",
        }}
      >
        {" "}
        ScoreCard
      </div>
    );
  };
  const OnSymbolStatus = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 10,
          color: "#fff",
          paddingLeft: "11px",
        }}
      >
        {" "}
        ScoreCard
      </div>
    );
  };

  const renderCategoryMarkets = (
    categoryId,
    categoryData,
    openAccordion,
    toggleAccordion,
    fancyLineMarkets,
    otherMarkets
  ) => (
    <Accordion open={openAccordion} toggle={toggleAccordion} key={categoryId}>
      <AccordionItem className="rounded-0">
        <AccordionHeader
          className="market-category-header"
          targetId={categoryId}
        >
          <b>{categoryData?.categoryInfo?.displayName}</b>
        </AccordionHeader>
        <AccordionBody
          className="market-category-body"
          accordionId={categoryId}
        >
          {fancyLineMarkets.length > 0 ? (
            <Table responsive className="mb-0">
              <tbody>
                {fancyLineMarkets
                  .sort((a, b) => a.marketId - b.marketId)
                  .map((market) => (
                    <tr key={market.marketId} className="position-relative">
                      <td>
                        <span
                          style={{
                            backgroundColor: market?.isAllow ? "green" : "red",
                          }}
                          className="active-css"
                        ></span>
                        {market?.marketName} [{market?.marketId}]
                      </td>
                      {parseInt(market?.status) === 1 ? (
                        <>
                          <td className="no-rate rate-width text-center py-0">
                            <div className="rate-font">
                              {market?.runner?.[0]?.layPrice || "0"}
                            </div>
                            <div className="point-font">
                              {market?.runner?.[0]?.laySize || "0"}
                            </div>
                          </td>
                          <td className="yes-rate rate-width text-center py-0">
                            <div className="rate-font">
                              {market?.runner?.[0]?.backPrice || "0"}
                            </div>
                            <div className="point-font">
                              {market?.runner?.[0]?.backSize || "0"}
                            </div>
                          </td>
                        </>
                      ) : (
                        <td className="p-0" colSpan={2}>
                          <div className="d-flex justify-content-end market-suspended-container">
                            <div className="no-rate-suspend rate-width"></div>
                            <div className="yes-rate-suspend rate-width"></div>
                            <div className="market-overlay">
                              <span className="suspended-text">
                                Market suspend
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : null}
          {otherMarkets.length > 0 ? (
            <Row>
              {otherMarkets
                .sort((a, b) => a.marketId - b.marketId)
                .map((market) => (
                  <Col md={6}>
                    {market.runner && market.runner.length > 0 && (
                      <Table responsive className="mb-0">
                        <thead>
                          <tr>
                            <th className="p-2">
                              <span
                                style={{
                                  backgroundColor: market?.isAllow
                                    ? "green"
                                    : "red",
                                }}
                                className="active-css"
                              ></span>
                              <b>
                                {market?.marketName} [{market?.marketId}]
                              </b>
                            </th>
                            {parseInt(market?.status) === 1 ? (
                              <>
                                <th className="p-2 text-end">
                                  <b>Back</b>
                                </th>
                                <th className="p-2">
                                  <b>Lay</b>
                                </th>{" "}
                              </>
                            ) : (
                              <th className="p-2 text-center">
                                <span className="px-4 odds-width">Back</span>
                                <span className="odds-width">Lay</span>
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {market.runner.map((runner) => (
                            <tr
                              key={`${market.marketId}-${runner.runner}`}
                              //  key={runner.runnerId}
                              className="position-relative"
                            >
                              <td>{runner.runner}</td>
                              {parseInt(market?.status) === 1 ? (
                                <>
                                  <td className="yes-rate odds-width text-center py-0">
                                    <div className="rate-font">
                                      {runner?.backPrice || "0"}
                                    </div>
                                    <div className="point-font">
                                      {runner?.backSize || "0"}
                                    </div>
                                  </td>
                                  <td className="no-rate odds-width text-center py-0">
                                    <div className="rate-font">
                                      {runner?.layPrice || "0"}
                                    </div>
                                    <div className="point-font">
                                      {runner?.laySize || "0"}
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <td className="p-0" colSpan={2}>
                                  <div className="d-flex justify-content-end market-suspended-container">
                                    <div className="no-rate-suspend odds-width"></div>
                                    <div className="yes-rate-suspend odds-width"></div>
                                    <div className="market-overlay">
                                      <span className="suspended-text">
                                        Market Suspend
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Col>
                ))}{" "}
            </Row>
          ) : null}
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );

  return (
    <>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card className="p-0">
              <CardBody className="p-3">
                {loading && <SpinnerModel />}
                <Row>
                  <Col>
                    <h5 className="event-header">
                      {eventDetails?.eventName} [
                      {convertDateUTCToLocal(eventDetails?.eventDate, "index")}]
                    </h5>
                    <p>
                      {eventDetails?.eventType} / {eventDetails?.competition}
                    </p>
                  </Col>
                  <Col className="d-flex justify-content-end align-items-center">
                    <Switch
                      width={80}
                      uncheckedIcon={<OffsymbolStatus />}
                      checkedIcon={<OnSymbolStatus />}
                      className="mx-2"
                      onColor="#02a499"
                      onChange={() => {
                        setIsScorecardShow(!isScorecardShow);
                      }}
                      checked={isScorecardShow}
                    />
                    <Button
                      className="btn btn-success text-right"
                      onClick={handleBackClick}
                    >
                      {" "}
                      Back{" "}
                    </Button>
                  </Col>
                </Row>

                {isScorecardShow && (
                  <Row>
                    <Col xs={12}>
                      <iframe
                        title="YouTube video player"
                        width="100%"
                        // height="auto"
                        height={iframeHeight}
                        src={scorecardFrameUrl}
                        frameborder="0"
                        className="mb-0"
                      ></iframe>
                    </Col>
                  </Row>
                )}

                {Object.entries(marketsGrouped).map(
                  ([categoryId, categoryData]) => {
                    const allActiveMarkets =
                      categoryData?.markets?.filter(
                        (market) => market?.isActive
                      ) || [];

                    // show only the currentBall of Market 
                    let activeMarkets = allActiveMarkets;
                    if (allActiveMarkets.length > 0) {
                      let maxDelivery = -1;
                      let currentBallMarket = null;
                      allActiveMarkets.forEach((market) => {
                        const match = market.marketName?.trim().match(/(\d+\.\d+)/g);
                        if (match && match.length > 0) {
                          const deliveryNum = parseFloat(match[match.length - 1]);
                          if (deliveryNum > maxDelivery) {
                            maxDelivery = deliveryNum;
                            currentBallMarket = market;
                          }
                        }
                      });
                      if (currentBallMarket) {
                        activeMarkets = [currentBallMarket];
                      }
                    }
                    const fancyLineMarkets = activeMarkets?.filter(
                      (market) =>
                        market?.marketType == marketTypeObj?.Fancy ||
                        market?.marketType == marketTypeObj?.LineMarket
                    );
                    const otherMarkets = activeMarkets?.filter(
                      (market) =>
                        market?.marketType != marketTypeObj?.Fancy &&
                        market?.marketType != marketTypeObj?.LineMarket
                    );

                    if (activeMarkets.length === 0) {
                      return null;
                    }

                    return renderCategoryMarkets(
                      categoryId,
                      categoryData,
                      openCategories,
                      toggleCategory,
                      fancyLineMarkets,
                      otherMarkets
                    );
                  }
                )}

                {Object.values(marketsGrouped).some((categoryData) =>
                  categoryData?.markets?.some((market) => !market?.isActive)
                ) && <h5 className="mb-0 mt-3">Inactive Markets</h5>}
                {Object.entries(marketsGrouped).map(
                  ([categoryId, categoryData]) => {
                    const allInActiveMarkets =
                      categoryData?.markets?.filter(
                        (market) => !market?.isActive
                      ) || [];

                    // show only the currentBall of Market 
                    let inActiveMarkets = allInActiveMarkets;
                    if (allInActiveMarkets.length > 0) {
                      let maxDelivery = -1;
                      let currentBallMarket = null;
                      allInActiveMarkets.forEach((market) => {
                        const match = market.marketName?.trim().match(/(\d+\.\d+)/g);
                        if (match && match.length > 0) {
                          const deliveryNum = parseFloat(match[match.length - 1]);
                          if (deliveryNum > maxDelivery) {
                            maxDelivery = deliveryNum;
                            currentBallMarket = market;
                          }
                        }
                      });
                      if (currentBallMarket) {
                        inActiveMarkets = [currentBallMarket];
                      }
                    }
                    const fancyLineMarkets = inActiveMarkets?.filter(
                      (market) =>
                        market?.marketType == marketTypeObj?.Fancy ||
                        market?.marketType == marketTypeObj?.LineMarket
                    );
                    const otherMarkets = inActiveMarkets?.filter(
                      (market) =>
                        market?.marketType != marketTypeObj?.Fancy &&
                        market?.marketType != marketTypeObj?.LineMarket
                    );

                    if (inActiveMarkets.length === 0) {
                      return null;
                    }

                    return renderCategoryMarkets(
                      categoryId,
                      categoryData,
                      openInactiveMarkets,
                      toggleInactiveMarket,
                      fancyLineMarkets,
                      otherMarkets
                    );
                  }
                )}
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default EventDetails;
