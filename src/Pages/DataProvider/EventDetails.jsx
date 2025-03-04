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
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../Features/axios";
import { updateToastData } from "../../Features/toasterSlice";
import {
  CONNECT,
  CONNECT_EVENT,
  ERROR,
  UPDATE_EVENT,
} from "../../components/Common/Const";
import { io } from "socket.io-client";
import { isEmpty } from "lodash";

const EventDetails = ({ event, apiURL, apiXkey, socketUrl }) => {
  const [eventInfo, setEventInfo] = useState([]);
  const [marketsGrouped, setMarketsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [marketTypes, setMarketTypes] = useState([]);
  const marketTypeObj = useSelector(
    (state) => state.marketType?.marketTypeList
  );
  const [openMarkets, setOpenMarkets] = useState([]);
  const [openCategories, setOpenCategories] = useState([]);

  const dispatch = useDispatch();
  const socket = useRef(null);

  useEffect(() => {
    if (!isEmpty(event))
      document.title = `View Market - ${event?.eventName} [${event?.eventId}]`;
  }, [event]);

  useEffect(() => {
    const fetchMarketCategoriesList = async () => {
      await axiosInstance
        .post("/admin/marketTemplate/mtAndCategories", {})
        .then((response) => {
          if (response?.result) {
            setCategories(response.result?.categories || []);
            setMarketTypes(response.result?.marketTypes || []);
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

    // Sorting marketTypes & categories by displayOrder
    const sortedMarketTypes = [...marketTypes].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    const sortedCategories = [...categories].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    sortedMarketTypes.forEach((type) => {
      const typeMarkets = markets.filter(
        (market) => market.marketType === type.marketTypeId
      );
      if (typeMarkets.length > 0) {
        groupedData[type.marketTypeId] = {
          typeInfo: type,
          categories: {},
        };

        sortedCategories.forEach((category) => {
          if (category.marketTypeId === type.marketTypeId) {
            const categoryMarkets = typeMarkets.filter(
              (market) =>
                market.marketTypeCategory === category.marketTypeCategoryId
            );
            if (categoryMarkets.length > 0) {
              groupedData[type.marketTypeId].categories[
                category.marketTypeCategoryId
              ] = {
                categoryInfo: category,
                markets: categoryMarkets,
              };
            }
          }
        });
      }
    });
    return groupedData;
  };

  useEffect(() => {
    const fetchData = async (eventId) => {
      try {
        const response = await fetch(`${apiURL}/api/eventInfo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Key": apiXkey,
          },
          body: JSON.stringify({ eventId }),
        });
        const data = await response.json();
        if (data.isSuccess && data.statusCode === 200) {
          const filteredMarkets = data?.result?.markets.filter(
            (market) => ![4, 5, 6].includes(market?.status)
          );
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
    if (apiURL && apiXkey && event?.eventId) {
      fetchData(event.eventId);
    }
  }, [apiURL, apiXkey, event?.eventId]);

  useEffect(() => {
    if (
      eventInfo.length > 0 &&
      marketTypes.length > 0 &&
      categories.length > 0
    ) {
      const data = groupMarkets(eventInfo);
      setMarketsGrouped(data);
    }
  }, [eventInfo, marketTypes, categories]);

  useEffect(() => {
    if (
      eventInfo.length > 0 &&
      marketTypes.length > 0 &&
      categories.length > 0
    ) {
      const data = groupMarkets(eventInfo);
      setMarketsGrouped(data);

      // Extract all marketTypeIds and categoryIds and set them as open
      const allMarketIds = Object.keys(data);
      const allCategoryIds = Object.values(data).flatMap((type) =>
        Object.keys(type.categories)
      );

      setOpenMarkets(allMarketIds);
      setOpenCategories(allCategoryIds);
    }
  }, [eventInfo, marketTypes, categories]);

  const configSocket = (eventId) => {
    socket.current.emit(CONNECT_EVENT, {
      eventIds: [eventId],
    });
    socket.current.on(UPDATE_EVENT, (data) => {
      //   console.log("Received updated event data:", data?.data);
      const markets = data?.data?.markets || [];

      setEventInfo((prevOpenMarket) => {
        const updatedEventInfo = [...prevOpenMarket];

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
    if (socketUrl) {
      socket.current = io.connect(socketUrl, {
        transports: ["websocket"],
      });

      if (event?.eventId) {
        if (socket.current?.connected) {
          configSocket(event.eventId);
        } else {
          socket.current.on(CONNECT, () => {
            configSocket(event.eventId);
          });
        }
      }
    }
    // return () => {
    //     if (socket.current) {
    //       socket.current.disconnect();
    //     }
    // };
  }, [socketUrl, event?.eventId]);

  // const toggleMarket = (marketTypeId) => {
  //     setOpenMarkets((prev) => ({
  //         ...prev,
  //         [marketTypeId]: !prev[marketTypeId],
  //     }));
  // };

  const toggleMarket = (id) => {
    setOpenMarkets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Function to toggle Category Accordion
  const toggleCategory = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
                    <h5>
                      {event?.eventName} [
                      {convertDateUTCToLocal(event?.eventDate, "index")}]
                    </h5>
                    <p>
                      {event?.eventType} / {event?.competition}
                    </p>
                  </Col>
                  <Col className="float-right">
                    <Button
                      className="btn btn-success text-right"
                      onClick={() => window.location.reload()}
                    >
                      {" "}
                      Back{" "}
                    </Button>
                  </Col>
                </Row>

                {Object.entries(marketsGrouped).map(
                  ([marketTypeId, typeData]) => (
                    <Accordion
                      open={openMarkets}
                      toggle={toggleMarket}
                      key={marketTypeId}
                    >
                      <AccordionItem className="rounded-0">
                        <AccordionHeader
                          className="market-category-header"
                          targetId={marketTypeId}
                        >
                          <b>{typeData?.typeInfo?.displayName}</b>
                        </AccordionHeader>
                        <AccordionBody
                          className="market-category-body category-list"
                          accordionId={marketTypeId}
                        >
                          {Object.entries(typeData?.categories).map(
                            ([categoryId, categoryData]) => {
                              const fancyLineMarkets =
                                categoryData.markets.filter(
                                  (market) =>
                                    market.marketType == marketTypeObj?.Fancy ||
                                    market.marketType ==
                                      marketTypeObj?.LineMarket
                                );
                              const otherMarkets = categoryData.markets.filter(
                                (market) =>
                                  market.marketType != marketTypeObj?.Fancy &&
                                  market.marketType != marketTypeObj?.LineMarket
                              );
                              return (
                                <Accordion
                                  open={openCategories}
                                  toggle={toggleCategory}
                                  key={categoryId}
                                >
                                  <AccordionItem className="rounded-0">
                                    <AccordionHeader
                                      className="market-category-header"
                                      targetId={categoryId}
                                    >
                                      <b>
                                        {
                                          categoryData?.categoryInfo
                                            ?.displayName
                                        }
                                      </b>
                                    </AccordionHeader>
                                    <AccordionBody
                                      className="market-category-body"
                                      accordionId={categoryId}
                                    >
                                      {fancyLineMarkets.length > 0 ? (
                                        <Table responsive className="mb-0">
                                          <tbody>
                                            {fancyLineMarkets
                                              .sort(
                                                (a, b) =>
                                                  a.marketId - b.marketId
                                              )
                                              .map((market) => (
                                                <tr
                                                  key={market.marketId}
                                                  className="position-relative"
                                                >
                                                  <td>
                                                    <span
                                                      style={{
                                                        backgroundColor:
                                                          market?.isAllow
                                                            ? "green"
                                                            : "red",
                                                      }}
                                                      className="active-css"
                                                    ></span>
                                                    {market?.marketName} [
                                                    {market?.marketId}]
                                                  </td>
                                                  {parseInt(market?.status) ===
                                                  1 ? (
                                                    <>
                                                      <td className="no-rate rate-width text-center py-0">
                                                        <div className="rate-font">
                                                          {market?.runner?.[0]
                                                            ?.layPrice || "0"}
                                                        </div>
                                                        <div className="point-font">
                                                          {market?.runner?.[0]
                                                            ?.laySize || "0"}
                                                        </div>
                                                      </td>
                                                      <td className="yes-rate rate-width text-center py-0">
                                                        <div className="rate-font">
                                                          {market?.runner?.[0]
                                                            ?.backPrice || "0"}
                                                        </div>
                                                        <div className="point-font">
                                                          {market?.runner?.[0]
                                                            ?.backSize || "0"}
                                                        </div>
                                                      </td>
                                                    </>
                                                  ) : (
                                                    <td className="p-0">
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
                                            .sort(
                                              (a, b) => a.marketId - b.marketId
                                            )
                                            .map((market) => (
                                              <Col md={6}>
                                                {market.runner &&
                                                  market.runner.length > 0 && (
                                                    <Table
                                                      responsive
                                                      className="mb-0"
                                                    >
                                                      <thead>
                                                        <tr>
                                                          <th className="p-2">
                                                            <span
                                                              style={{
                                                                backgroundColor:
                                                                  market?.isAllow
                                                                    ? "green"
                                                                    : "red",
                                                              }}
                                                              className="active-css"
                                                            ></span>
                                                            <b>
                                                              {
                                                                market?.marketName
                                                              }{" "}
                                                              [
                                                              {market?.marketId}
                                                              ]
                                                            </b>
                                                          </th>
                                                          {parseInt(
                                                            market?.status
                                                          ) === 1 ? (
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
                                                              <span className="px-4 odds-width">
                                                                Back
                                                              </span>
                                                              <span className="odds-width">
                                                                Lay
                                                              </span>
                                                            </th>
                                                          )}
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {market.runner.map(
                                                          (runner) => (
                                                            <tr
                                                              key={
                                                                runner.runnerId
                                                              }
                                                              className="position-relative"
                                                            >
                                                              <td>
                                                                {runner.runner}
                                                              </td>
                                                              {parseInt(
                                                                market?.status
                                                              ) === 1 ? (
                                                                <>
                                                                  <td className="yes-rate odds-width text-center py-0">
                                                                    <div className="rate-font">
                                                                      {runner?.backPrice ||
                                                                        "0"}
                                                                    </div>
                                                                    <div className="point-font">
                                                                      {runner?.backSize ||
                                                                        "0"}
                                                                    </div>
                                                                  </td>
                                                                  <td className="no-rate odds-width text-center py-0">
                                                                    <div className="rate-font">
                                                                      {runner?.layPrice ||
                                                                        "0"}
                                                                    </div>
                                                                    <div className="point-font">
                                                                      {runner?.laySize ||
                                                                        "0"}
                                                                    </div>
                                                                  </td>
                                                                </>
                                                              ) : (
                                                                <td className="p-0">
                                                                  <div className="d-flex justify-content-end market-suspended-container">
                                                                    <div className="no-rate-suspend odds-width"></div>
                                                                    <div className="yes-rate-suspend odds-width"></div>
                                                                    <div className="market-overlay">
                                                                      <span className="suspended-text">
                                                                        Market
                                                                        Suspend
                                                                      </span>
                                                                    </div>
                                                                  </div>
                                                                </td>
                                                              )}
                                                            </tr>
                                                          )
                                                        )}
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
                            }
                          )}
                        </AccordionBody>
                      </AccordionItem>
                    </Accordion>
                  )
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