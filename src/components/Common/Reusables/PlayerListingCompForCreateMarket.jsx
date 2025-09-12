import React, { useMemo } from "react";
import "../Table/style.css";
import { Card, CardBody, Col, Row } from "reactstrap";
import { getStatusColor } from "../../../Pages/Commentary/CommentartConst";

export const PlayerListingCompForCreateMarket = React.memo(
  ({ columns, dataSource = [], tableClassName, handleValueChange }) => {
    /** ✅ Determine expected market types only when dataSource changes */
    const expectedMarketTypes = useMemo(() => {
      if (dataSource.length > 0 && dataSource[0]?.wicketNo) {
        return ["Wickets", "Boundaries", "Balls"];
      }
      return ["Runs", "Boundaries", "Balls"];
    }, [dataSource]);

    /** ✅ Memoized function to get market type */
    const getMarketType = (market) => {
      const id = +market?.marketTypeCategoryId;
      if (id === 12) return "Runs";
      if (id === 29 || id === 32) return "Boundaries";
      if (id === 30 || id === 33) return "Balls";
      if (id === 31) return "Wickets";
      return null;
    };

    /** ✅ Group markets by type only when dataSource changes */
    const marketsByType = useMemo(() => {
      const markets = {};
      expectedMarketTypes.forEach((type) => (markets[type] = null));

      dataSource.forEach((market) => {
        const type = getMarketType(market);
        if (type && expectedMarketTypes.includes(type)) {
          markets[type] = market;
        }
      });

      return markets;
    }, [dataSource, expectedMarketTypes]);

    /** ✅ Map column titles to quickly access them instead of repeated .find() */
    const columnMap = useMemo(() => {
      const map = {};
      columns?.forEach((col) => {
        map[col.title] = col;
      });
      return map;
    }, [columns]);

    /** ✅ Top-level handler for value changes */
    const handleMarketValueChange = (market, key, value) => {
      handleValueChange(market, key, value);
    };

    return (
      <Row>
        <Col lg={12}>
          <Card className="mb-0">
            <CardBody className={tableClassName}>
              {dataSource.length === 0 ? (
                <div className="m-4 text-center">No record found</div>
              ) : (
                <div id="customerList">
                  <div className="d-flex flex-wrap player-market-row">
                    {expectedMarketTypes.map((marketType, index) => {
                      const market = marketsByType[marketType];

                      if (!market) {
                        return (
                          <div
                            key={`empty-${marketType}`}
                            className="flex-33 player-market-card py-2"
                          />
                        );
                      }

                      /** ✅ Per-row handler (normal function, safe inside map) */
                      const handleChange = (key, value) =>
                        handleMarketValueChange(market, key, value);

                      return (
                        <div
                          key={market.marketId}
                          className="flex-33 player-market-template-card py-2"
                          style={{
                            backgroundColor: getStatusColor(+market?.status),
                          }}
                        >
                          {/* === First Column === */}
                          <div
                            style={{
                              width: "5%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <div> {columns?.[0] && (columns[0].render ? columns[0].render( market[columns[0].dataIndex], market, index, (key, value) => handleValueChange(market, key, value) ) : market[columns[0].dataIndex])} </div>
                          </div>

                          {/* === Active & Market Allow === */}
                          <div
                            className="first-col text-white px-1"
                            style={{
                              width: "15%",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignContent: "center",
                            }}
                          >
                            {columnMap["Is Active"]?.render?.(
                              market["isActive"],
                              market,
                              index,
                              handleChange
                            ) ?? (
                              <div
                                className={`${
                                  !market.isActive ? "button-a" : "button-b"
                                } button-a fs-5 fw-bold`}
                                style={{ height: "50%" }}
                                onClick={() =>
                                  handleChange("isActive", !market.isActive)
                                }
                              >
                                A
                              </div>
                            )}
                            {columnMap["Market Allow"]?.render?.(
                              market["marketAllow"],
                              market,
                              index,
                              handleChange
                            ) ?? (
                              <div
                                className={`${
                                  !market.marketAllow ? "button-a" : "button-b"
                                } button-a fs-5 fw-bold`}
                                style={{ height: "50%" }}
                                onClick={() =>
                                  handleChange("marketAllow", !market.marketAllow)
                                }
                              >
                                M
                              </div>
                            )}
                          </div>

                          {/* === Main Column (Pre, Line, Points, Market Name) === */}
                          <div className="second-col px-1" style={{ width: "50%" }}>
                            <div
                              className="d-flex flex-column"
                              style={{ width: "80%" }}
                            >
                              <div
                                className="second-col-first-div"
                                style={{ height: "50%" }}
                              >
                                <div className="second-col-line p-2">
                                  {columnMap["Pre"]?.render?.(
                                    market["predefinedValue"],
                                    market,
                                    index,
                                    handleChange
                                  ) ?? market["predefinedValue"]}
                                  {columnMap["Line"]?.render?.(
                                    market["line"],
                                    market,
                                    index,
                                    handleChange
                                  ) ?? market["line"]}
                                </div>
                              </div>

                              <div
                                style={{ height: "25%" }}
                                className="second-col-second-div pb-1 px-2"
                              >
                                <div className="second-col-lay">
                                  {columnMap["No Point"]?.render?.(
                                    market["noPoint"],
                                    market,
                                    index,
                                    handleChange
                                  ) ?? market["noPoint"]}
                                </div>
                                <div className="second-col-back">
                                  {columnMap["Yes Point"]?.render?.(
                                    market["yesPoint"],
                                    market,
                                    index,
                                    handleChange
                                  ) ?? market["yesPoint"]}
                                </div>
                              </div>

                              <div
                                style={{ height: "25%" }}
                                className="second-col-second-div p-2"
                              >
                                {columnMap["Market"]?.render?.(
                                  market["marketName"],
                                  market,
                                  index,
                                  handleChange
                                ) ?? market["marketName"]}
                              </div>
                            </div>

                            {/* === Buttons Column (Margin, Rate Diff) === */}
                            <div className="second-col-buttons" style={{ width: "20%" }}>
                              <div
                                style={{ height: "50%" }}
                                onClick={() =>
                                  handleChange("line", (market?.line || 0) + 1)
                                }
                              >
                                {columnMap["Margin"]?.render?.(
                                  market["margin"],
                                  market,
                                  index,
                                  handleChange
                                ) ?? market["margin"]}
                              </div>
                              <div
                                style={{ height: "50%" }}
                                onClick={() =>
                                  handleChange("line", (market?.line || 0) - 1)
                                }
                              >
                                {columnMap["Rate Diff"]?.render?.(
                                  market["rateDiff"],
                                  market,
                                  index,
                                  handleChange
                                ) ?? market["rateDiff"]}
                              </div>
                            </div>
                          </div>

                          {/* === Over & YesRate === */}
                          <div className="third-col pe-1" style={{ width: "10%" }}>
                            <div style={{ height: "50%" }}>
                              {columnMap["Over"]?.render?.(
                                market["over"],
                                market,
                                index,
                                handleChange
                              ) ?? market["over"]}
                            </div>
                            <div style={{ height: "50%" }}>
                              {columnMap["Yes Rate"]?.render?.(
                                market["yesRate"],
                                market,
                                index,
                                handleChange
                              ) ?? market["yesRate"]}
                            </div>
                          </div>

                          {/* === Under & NoRate === */}
                          <div className="third-col" style={{ width: "10%" }}>
                            <div style={{ height: "50%" }}>
                              {columnMap["Under"]?.render?.(
                                market["under"],
                                market,
                                index,
                                handleChange
                              ) ?? market["under"]}
                            </div>
                            <div style={{ height: "50%" }}>
                              {columnMap["No Rate"]?.render?.(
                                market["noRate"],
                                market,
                                index,
                                handleChange
                              ) ?? market["noRate"]}
                            </div>
                          </div>

                          <div style={{ width: "3%" }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
);
