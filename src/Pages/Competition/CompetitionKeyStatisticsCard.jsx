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
                            <div style={{ width: "8%" }}>Index</div>
                            <div style={{ width: "25%" }}>Team Name</div>
                            <div style={{ width: "25%" }}>Player Name</div>
                            <div style={{ width: "15%" }}>Display Order</div>
                            <div style={{ width: "15%" }}>Value</div>
                            <div style={{ width: "12%" }}>Active</div>
                        </div>
                    </div>
                </div>
                {sortedData?.map((stat, index) => (
                    <div key={stat.competitionStatisticsId} className="row d-flex align-items-center my-2">
                        <div style={{ width: "100%" }}>
                            <div className="row">
                                <div style={{ width: "8%" }} className="d-flex align-items-center">
                                    <span>{index + 1}</span>
                                </div>
                                <div style={{ width: "25%" }} className="d-flex align-items-center">
                                    {stat?.teamName || 'N/A'}
                                </div>
                                <div style={{ width: "25%" }} className="d-flex align-items-center">
                                    {stat?.playerName || 'N/A'}
                                </div>
                                <div style={{ width: "15%" }} className="d-flex align-items-center">
                                    {stat?.displayOrder}
                                </div>
                                <div style={{ width: "15%" }} className="d-flex align-items-center">
                                    {stat?.value}
                                </div>
                                <div style={{ width: "12%" }} className="d-flex align-items-center">
                                    <div className="form-check form-switch form-switch-lg">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={stat?.isActive}
                                            disabled
                                        />
                                    </div>
                                </div>
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