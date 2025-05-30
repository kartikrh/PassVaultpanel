import React from "react";
import { Card, Row, Col, Tag, Avatar, Divider } from "antd";
import { CalendarOutlined, EnvironmentOutlined, TrophyOutlined } from "@ant-design/icons";
import moment from "moment";

const MatchCard = ({ matchData }) => {
  if (!matchData) return null;

  const {
    title,
    short_title,
    subtitle,
    match_number,
    format_str,
    status,
    status_str,
    status_note,
    teama,
    teamb,
    date_start_ist,
    date_end_ist,
    venue,
    competition,
    result,
    toss,
    umpires,
  } = matchData;

  // Status color mapping
  const getStatusColor = (status) => {
    switch (parseInt(status)) {
      case 1:
        return "processing"; // Live
      case 2:
        return "success"; // Completed
      case 3:
        return "warning"; // Upcoming
      default:
        return "default";
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("DD MMM YYYY, HH:mm");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        className="match-card"
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid #e8e8e8",
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: "20px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0, color: "#1890ff", fontSize: "24px" }}>
                {title}
              </h2>
              {/* <p style={{ margin: "4px 0", color: "#666", fontSize: "16px" }}>
                • Match Number {match_number}  •  {format_str}
              </p> */}
            </Col>
            <Col>
              <Tag
                color={getStatusColor(status)}
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {status_str.toUpperCase()}
              </Tag>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Teams Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={11}>
            <Card
              style={{
                textAlign: "center",
                backgroundColor: "#fafafa",
                border: "1px solid #e8e8e8",
              }}
            >
              <Avatar
                size={80}
                src={teama?.logo_url}
                style={{ backgroundColor: "#1890ff", marginBottom: "12px" }}
              >
                {teama?.short_name}
              </Avatar>
              <h3 style={{ margin: "8px 0", fontSize: "18px" }}>
                {teama?.name}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>({teama?.short_name})</p>
              {teama?.scores_full && (
                <div style={{ marginTop: "12px" }}>
                  <Tag
                    color="blue"
                    style={{ fontSize: "16px", padding: "8px 16px" }}
                  >
                    {teama.scores_full}
                  </Tag>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={2} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#1890ff" }}>VS</h2>
            </div>
          </Col>

          <Col xs={24} sm={11}>
            <Card
              style={{
                textAlign: "center",
                backgroundColor: "#fafafa",
                border: "1px solid #e8e8e8",
              }}
            >
              <Avatar
                size={80}
                src={teamb?.logo_url}
                style={{ backgroundColor: "#ff7875", marginBottom: "12px" }}
              >
                {teamb?.short_name}
              </Avatar>
              <h3 style={{ margin: "8px 0", fontSize: "18px" }}>
                {teamb?.name}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>({teamb?.short_name})</p>
              {teamb?.scores_full && (
                <div style={{ marginTop: "12px" }}>
                  <Tag
                    color="blue"
                    style={{ fontSize: "16px", padding: "8px 16px" }}
                  >
                    {teamb.scores_full}
                  </Tag>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Result Section */}
        {result && status === 2 && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Card
              style={{
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "8px",
              }}
            >
              <TrophyOutlined
                style={{ fontSize: "24px", color: "#52c41a", marginRight: "8px" }}
              />
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#389e0d" }}>
                {result}
              </span>
              {status_note && (
                <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                  {status_note}
                </p>
              )}
            </Card>
          </div>
        )}

        <Divider />

        {/* Match Details */}
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Match Information"
              size="small"
              style={{ height: "100%" }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <CalendarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                <span>
                  <strong>Start:</strong> {formatDateTime(date_start_ist)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <CalendarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                <span>
                  <strong>End:</strong> {formatDateTime(date_end_ist)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <EnvironmentOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                <span>
                  <strong>Venue:</strong> {venue?.name}, {venue?.location}
                </span>
              </div>
              {toss && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Toss:</strong> {toss.text}
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="Competition Details"
              size="small"
              style={{ height: "100%" }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong>Tournament:</strong> {competition?.title}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Season:</strong> {competition?.season}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Category:</strong> {competition?.category?.toUpperCase()}
              </div>
              {/* <div style={{ marginBottom: "8px" }}>
                <strong>Format:</strong> {competition?.match_format?.toUpperCase()}
              </div> */}
              {umpires && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Umpires:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                    {umpires}
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MatchCard;