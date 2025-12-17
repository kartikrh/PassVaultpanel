import React from 'react';
import { Row } from 'reactstrap';
import "../Commentary/CommentaryCss.css";

const CompetitionStatisticsCard = ({ statisticsType, statisticsData }) => {
    // Sort data by displayOrder
    const sortedData = [...statisticsData].sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <>
            <Row className="rounded py-3">
                <div className="row d-flex align-items-center my-2">
                    <div style={{ width: "100%" }}>
                        <div className="row fw-bold">
                            <div style={{ width: "10%" }}>Order</div>
                            <div style={{ width: "20%" }}>Team Name</div>
                            {(statisticsType?.typeId === 1 || statisticsType?.typeId === 2) ? <div style={{ width: "20%" }}>Player Name</div> : null}
                            <div style={{ width: "10%" }}>Value</div>
                            {/* <div style={{ width: "12%" }}>Active</div> */}
                        </div>
                    </div>
                </div>
                {sortedData?.map((stat, index) => (
                    <div key={stat.competitionStatisticsId} className="row d-flex align-items-center my-2">
                        <div style={{ width: "100%" }}>
                            <div className="row">
                                <div style={{ width: "10%" }} className="d-flex align-items-center">
                                    {stat?.displayOrder}
                                </div>
                                <div style={{ width: "20%" }} className="d-flex align-items-center">
                                    {stat?.teamName || 'N/A'}
                                </div>
                                {(statisticsType?.typeId === 1 || statisticsType?.typeId === 2) ?<div style={{ width: "20%" }} className="d-flex align-items-center">
                                    {stat?.playerName || 'N/A'}
                                </div> : null}
                                <div style={{ width: "10%" }} className="d-flex align-items-center">
                                    {stat?.value}
                                </div>
                                {/* <div style={{ width: "12%" }} className="d-flex align-items-center">
                                    <div className="form-check form-switch form-switch-lg">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={stat?.isActive}
                                            disabled
                                        />
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                ))}
                {sortedData?.length === 0 && (
                    <div className="text-center py-3 text-muted">
                        No statistics data available
                    </div>
                )}
            </Row>
        </>
    );
};

export default CompetitionStatisticsCard;