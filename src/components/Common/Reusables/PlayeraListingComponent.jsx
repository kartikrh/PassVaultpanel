import React from "react";
import "../Table/style.css"
import { Card, CardBody, Col, Row } from "reactstrap";
import { getStatusColor1, getStatusFontColor } from "../../../Pages/Commentary/CommentartConst";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export const PlayeraListingComponent = ({ columns, dataSource = [], tableElement, tableExtras, tableClassName, hideHeader = false, onSwitch, handleValueChange, handleSingleAction }) => {
    // console.log("columns", columns)
    const rDiffColumns = columns.filter(col => col.title === "R-Diff");
    // console.log("rateDiff", rDiffColumns[0].render)
    // document.title = `${tableElement?.title}`;
    const handleSwitch = (marketId) => {
        onSwitch(marketId);
    };
    // console.log("data", dataSource)
    return (
        <Row>
            <Col lg={12}>
                <Card className="mb-0">
                    <CardBody className={tableClassName}>
                        {dataSource.length > 0 ? <div id="customerList">
                                <div className="d-flex flex-wrap player-market-row">
                                    {dataSource.map((market) => {
                                        return (
                                        <div className="flex-33 player-market-card py-2" key={market.marketId}>
                                            <div className="first-col text-white px-1" style={{ width: '15%' }}>
                                                <div className={`${!market.isActive ? 'button-a' : 'button-b'} button-a fs-3 fw-bold`} style={{ height: '50%' }} onClick={() => {
                                                    // handleSingleAction(record, "isActive", !record.isActive);
                                                    handleValueChange(market, "isActive", !market.isActive);
                                                }}>
                                                    A
                                                </div>
                                                <div className={`${!market.isAllow ? 'button-a' : 'button-b'} button-a fs-3 fw-bold`} style={{ height: '50%' }} onClick={() => {
                                                    // handleSingleAction(record, "isAllow", !record.isAllow);
                                                    handleValueChange(market, "isAllow", !market.isAllow);
                                                }}>
                                                    B
                                                </div>
                                            </div>
                                            <div className="second-col px-1" style={{ width: '50%' }}>
                                                <div className="second-col-first-div" style={{height: '70%'}}>
                                                
                                                    <div className="second-col-line p-2" style={{width: '80%'}}>
                                                    <input
                                                        type="number"
                                                        className="absolute-input"
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            width: '50px',
                                                            height: '15px',
                                                            fontSize: '12px',
                                                            paddingLeft: '6px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ccc',
                                                            background: '#fff',
                                                        }}
                                                        value={market?.predefinedValue || ''}
                                                        onChange={(e) => handleValueChange(market, "predefinedValue", e.target.value)}
                                                        placeholder="PR"
                                                    />
                                                        <input 
                                                            type="number" 
                                                            className="line" 
                                                            // min={0}
                                                            value={market?.line} 
                                                            data-market-id={market.marketId}
                                                            onChange={(newValue) => handleValueChange(market, "line", parseFloat(newValue.target.value))}
                                                        />
                                                    </div>
                                                    <div className="second-col-buttons" style={{width: '20%'}}>
                                                        <div className="arrow-buttons" style={{height: '50%'}} onClick={() => handleValueChange(market, "line", (market?.line || 0) + 1)}>
                                                            <FaArrowUp className="up-arrow" />
                                                        </div>
                                                        <div className=" arrow-buttons" style={{height: '50%'}} onClick={() => handleValueChange(market, "line", (market?.line || 0) - 1)}>
                                                            <FaArrowDown className="down-arrow" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{height: '30%'}} className="second-col-second-div">
                                                    {/* <div className="second-col-back">
                                                    onChange={(newValue) => handleValueChange(record, "backPrice", newValue)}
                                                    </div>
                                                    <div className="second-col-lay">90</div> */}
                                                    <div className="second-col-lay">
                                                        <input
                                                            type="number"
                                                            className="laySize"
                                                            step="5"
                                                            min={0}
                                                            data-market-id={market.marketId}
                                                            value={market?.runner[0]?.laySize} 
                                                            onChange={(newValue) => handleValueChange(market, "laySize", newValue.target.value)}
                                                        />
                                                    </div>
                                                    <div className="second-col-back">
                                                        <input 
                                                            type="number" 
                                                            className="backSize"
                                                            step="5" 
                                                            min={0}
                                                            value={market?.runner[0]?.backSize} 
                                                            data-market-id={market.marketId}
                                                            onChange={(newValue) => handleValueChange(market, "backSize", newValue.target.value)}
                                                        />
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                            <div className="third-col p-2 fs-3 fw-bold" style={{ width: '15%' }} 
                                                onClick={() => {
                                                    handleSingleAction(market, "isSendData", !market.isSendData);
                                                }}
                                            >
                                                S
                                            </div>
                                            <div className="fourth-col text-black px-2" style={{ width: '15%' }}>
                                                <input 
                                                    style={{height: "50%"}}
                                                    type="number" 
                                                    min={0}
                                                    className="rate-dif-button" 
                                                    value={market?.rateDiff} 
                                                    onChange={(newValue) => handleValueChange(market, "rateDiff", newValue.target.value)}
                                                />
                                                <input style={{height: "50%"}} type="text" className="rate-dif-button" />
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