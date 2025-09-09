// Modified PlayerListingCompForCreateMarket to preserve market positions
import React from "react";
import "../Table/style.css"
import { Card, CardBody, Col, Row } from "reactstrap";
import { getStatusColor, getStatusColor1, getStatusFontColor, OPEN_MARKET_STATUS } from "../../../Pages/Commentary/CommentartConst";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export const PlayerListingCompForCreateMarket = ({ columns, dataSource = [], tableElement, tableExtras, tableClassName, hideHeader = false, onSwitch, handleValueChange, handleSingleAction, backgroundColor, updateRecordsFunc, handleDS, commentaryInfo }) => {
    const rDiffColumns = columns.filter(col => col.title === "R-Diff");
    const handleSwitch = (marketId) => {
        onSwitch(marketId);
    };
    // Define the expected market types and their order based on category
    // Default for Players
    let expectedMarketTypes = ['Runs', 'Boundaries', 'Balls'];

    // Check if we're dealing with Wickets category based on the first market
    if (dataSource.length > 0 && dataSource[0]?.wicketNo) {
        expectedMarketTypes = ['Wickets', 'Boundaries', 'Balls'];
    }
    // console.log("columns", columns)

    // Function to get market type from market object
    const getMarketType = (market) => {
        // Determine market type based on runnerName or other properties
        const marketCategoryId = market?.marketTypeCategoryId
        // console.log({ marketCategoryId, name: market.marketName })
        if (+marketCategoryId === 12) return 'Runs'
        else if (+marketCategoryId === 29) return 'Boundaries'
        else if (+marketCategoryId === 32) return 'Boundaries'
        else if (+marketCategoryId === 30) return 'Balls'
        else if (+marketCategoryId === 33) return 'Balls'
        else if (+marketCategoryId === 31) return 'Wickets'
        return null; // Unknown market type
    };

    // Organize markets by their type
    const organizeMarketsByType = () => {
        const marketsByType = {};

        // Initialize with null for each expected type
        expectedMarketTypes.forEach(type => {
            marketsByType[type] = null;
        });

        // Assign markets to their respective types
        dataSource.forEach(market => {
            const marketType = getMarketType(market);
            if (marketType && expectedMarketTypes.includes(marketType)) {
                marketsByType[marketType] = market;
            }
        });

        return marketsByType;
    };

    const marketsByType = organizeMarketsByType();

    return (
        <Row>
            <Col lg={12}>
                <Card className="mb-0">
                    <CardBody className={tableClassName}>
                        {dataSource.length > 0 ? <div id="customerList">
                            <div className="d-flex flex-wrap player-market-row">
                                {/* Map through expected market types instead of dataSource directly */}
                                {expectedMarketTypes.map((marketType, index) => {
                                    const market = marketsByType[marketType];

                                    // If market doesn't exist, render an empty placeholder with the same width
                                    if (!market) {
                                        return (
                                            <div className="flex-33 player-market-card py-2" key={`empty-${marketType}`}>
                                                {/* Empty placeholder */}
                                            </div>
                                        );
                                    }

                                    // Otherwise, render the market normally
                                    return (
                                        <div className="flex-33 player-market-card py-2" key={market.marketId} style={{ backgroundColor: getStatusColor(+market?.status) }}>
                                            <div style={{ width: '5%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <div>
                                                    {columns?.[0] && (
                                                        columns[0].render
                                                        ? columns[0].render(
                                                            market[columns[0].dataIndex],
                                                            market,
                                                            index,
                                                            (key, value) => handleValueChange(market, key, value)
                                                            )
                                                        : market[columns[0].dataIndex]
                                                    )}
                                                </div>
                                            </div>
                                            <div className="first-col text-white px-1" style={{ width: '15%', height: '100%', display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                                                {columns
                                                    ?.find(col => col.title === "Is Active")
                                                    ?.render?.(
                                                        market["isActive"],
                                                        market,
                                                        index,
                                                        (key, value) => handleValueChange(market, key, value)
                                                    ) ?? (
                                                        <div
                                                            className={`${!market.isActive ? 'button-a' : 'button-b'} button-a fs-5 fw-bold`}
                                                            style={{ height: '50%' }}
                                                            onClick={() => handleValueChange(market, "isActive", !market.isActive)}
                                                        >
                                                            A
                                                        </div>
                                                    )
                                                }
                                                {columns
                                                    ?.find(col => col.title === "Market Allow")
                                                    ?.render?.(
                                                        market["marketAllow"],
                                                        market,
                                                        index,
                                                        (key, value) => handleValueChange(market, key, value)
                                                    ) ?? (
                                                        <div
                                                            className={`${!market.marketAllow ? 'button-a' : 'button-b'} button-a fs-5 fw-bold`}
                                                            style={{ height: '50%' }}
                                                            onClick={() => handleValueChange(market, "marketAllow", !market.marketAllow)}
                                                        >
                                                            M
                                                        </div>
                                                    )
                                                }

                                            </div>
                                            <div className="second-col px-1" style={{ width: '50%' }}>
                                                <div className="d-flex flex-column" style={{ width: '80%' }}>
                                                    <div className="second-col-first-div" style={{ height: '50%' }}>
                                                        <div className="second-col-line p-2">
                                                            {/* <input
                                                                type="number"
                                                                className="line"
                                                                value={market?.predefinedValue || ''}
                                                                onChange={(e) => handleValueChange(market, "predefinedValue", e.target.value)}
                                                                placeholder="PR"
                                                            /> */}
                                                            {columns
                                                                ?.find(col => col.title === "Pre")
                                                                ?.render?.(
                                                                    market["predefinedValue"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["predefinedValue"]
                                                            }
                                                            {/* <input
                                                                type="number"
                                                                placeholder="Line"
                                                                className="line"
                                                                value={market?.line}
                                                                data-market-id={market.marketId}
                                                                onChange={(newValue) => handleValueChange(market, "line", parseFloat(newValue.target.value))}
                                                            /> */}
                                                            {columns
                                                                ?.find(col => col.title === "Line")
                                                                ?.render?.(
                                                                    market["line"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["line"]
                                                            }
                                                        </div>
                                                    </div>
                                                    <div style={{ height: '25%' }} className="second-col-second-div">
                                                        <div className="second-col-lay">
                                                            {columns
                                                                ?.find(col => col.title === "No Point")
                                                                ?.render?.(
                                                                    market["noPoint"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["noPoint"]
                                                            }
                                                        </div>
                                                        <div className="second-col-back">
                                                            {columns
                                                                ?.find(col => col.title === "Yes Point")
                                                                ?.render?.(
                                                                    market["yesPoint"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["yesPoint"]
                                                            }
                                                        </div>
                                                    </div>
                                                    <div style={{ height: '25%' }} className="second-col-second-div">
                                                        <div className="">
                                                            {/* <input
                                                                type="text"
                                                                className="laySize"
                                                                step="5"
                                                                min={0}
                                                                data-market-id={market.marketName}
                                                                value={market?.marketName}
                                                                onChange={(newValue) => handleValueChange(market, "laySize", newValue.target.value)}
                                                            /> */}
                                                            {columns
                                                                ?.find(col => col.title === "Market")
                                                                ?.render?.(
                                                                    market["marketName"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["marketName"]
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="second-col-buttons" style={{ width: '20%' }}>
                                                    <div className="arrow-buttons" style={{ height: '50%' }} onClick={() => handleValueChange(market, "line", (market?.line || 0) + 1)}>
                                                        {/* <FaArrowUp className="up-arrow" /> */}
                                                        {columns
                                                                ?.find(col => col.title === "Margin")
                                                                ?.render?.(
                                                                    market["margin"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["margin"]
                                                            }
                                                    </div>
                                                    <div className=" arrow-buttons" style={{ height: '50%' }} onClick={() => handleValueChange(market, "line", (market?.line || 0) - 1)}>
                                                        {/* <FaArrowDown className="down-arrow" /> */}
                                                        {columns
                                                            ?.find(col => col.title === "Rate Diff")
                                                            ?.render?.(
                                                                market["rateDiff"],
                                                                market,
                                                                index,
                                                                (key, value) => handleValueChange(market, key, value)
                                                            ) ?? market["rateDiff"]
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="third-col pe-1" style={{ width: '10%' }}>
                                                <div className="arrow-buttons" style={{ height: '50%' }} onClick={() => handleValueChange(market, "line", (market?.line || 0) + 1)}>
                                                        {/* <FaArrowUp className="up-arrow" /> */}
                                                        {columns
                                                                ?.find(col => col.title === "Over")
                                                                ?.render?.(
                                                                    market["over"],
                                                                    market,
                                                                    index,
                                                                    (key, value) => handleValueChange(market, key, value)
                                                                ) ?? market["over"]
                                                            }
                                                    </div>
                                                    <div className=" arrow-buttons" style={{ height: '50%' }} onClick={() => handleValueChange(market, "line", (market?.line || 0) - 1)}>
                                                        {/* <FaArrowDown className="down-arrow" /> */}
                                                        {columns
                                                            ?.find(col => col.title === "Under")
                                                            ?.render?.(
                                                                market["under"],
                                                                market,
                                                                index,
                                                                (key, value) => handleValueChange(market, key, value)
                                                            ) ?? market["under"]
                                                        }
                                                    </div>
                                            </div>
                                            <div className="third-col" style={{ width: '10%' }}>
                                                <div className="arrow-buttons" style={{ height: '50%' }} onClick={() => handleValueChange(market, "line", (market?.line || 0) + 1)}>
                                                    {/* <FaArrowUp className="up-arrow" /> */}
                                                    {columns
                                                            ?.find(col => col.title === "Yes Rate")
                                                            ?.render?.(
                                                                market["yesRate"],
                                                                market,
                                                                index,
                                                                (key, value) => handleValueChange(market, key, value)
                                                            ) ?? market["yesRate"]
                                                        }
                                                </div>
                                                <div className=" arrow-buttons" style={{ height: '50%' }} onClick={() => handleValueChange(market, "line", (market?.line || 0) - 1)}>
                                                    {/* <FaArrowDown className="down-arrow" /> */}
                                                    {columns
                                                        ?.find(col => col.title === "No Rate")
                                                        ?.render?.(
                                                            market["noRate"],
                                                            market,
                                                            index,
                                                            (key, value) => handleValueChange(market, key, value)
                                                        ) ?? market["noRate"]
                                                    }
                                                </div>
                                            </div>
                                            <div style={{ width: '3%' }}>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div> : <div className=" m-4 text-center">No record found</div>}
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
}