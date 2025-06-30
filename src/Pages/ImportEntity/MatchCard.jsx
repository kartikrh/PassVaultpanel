import React from "react";
import { Card, Row, Col, Tag, Avatar, Divider } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
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
    <>
      <div className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <h2 className="mt-1 mb-1 text-primary h4">{title}</h2>
          </Col>
          <Col>
            {status_str && (
              <Tag color={getStatusColor(status)} className="px-3 py-1 mx-5">
                {status_str.toUpperCase()}
              </Tag>
            )}
          </Col>
        </Row>
      </div>
      <Divider style={{ marginTop: "-20px", marginBottom: "8px" }} />

      {/* Teams Section */}
      <Row gutter={[24, 24]} className="mb-2">
        <Col xs={24} sm={11}>
          <Card
            className="text-center bg-light border"
            bodyStyle={{ padding: 5 }}
            style={{ minHeight: 215 }}
          >
            <Avatar size={75} src={teama?.logo_url} className="bg-primary mb-3">
              {teama?.short_name}
            </Avatar>
            <h3 className="my-2 h5">{teama?.name}</h3>
            <p className="m-0 text-muted">({teama?.short_name})</p>
            {teama?.scores_full && (
              <div className="mt-3">
                <Tag color="blue" className="px-4 py-2">
                  {teama.scores_full}
                </Tag>
              </div>
            )}
          </Card>
        </Col>

        <Col
          xs={24}
          sm={2}
          className="d-flex align-items-center justify-content-center"
        >
          <div className="text-center">
            <h2 className="m-0 text-primary">VS</h2>
          </div>
        </Col>

        <Col xs={24} sm={11}>
          <Card
            className="text-center bg-light border"
            bodyStyle={{ padding: 5 }}
            style={{ minHeight: 215 }}
          >
            <Avatar
              size={75}
              src={teamb?.logo_url}
              className="mb-3"
              style={{ backgroundColor: "#ff7875" }}
            >
              {teamb?.short_name}
            </Avatar>
            <h3 className="my-2 h5">{teamb?.name}</h3>
            <p className="m-0 text-muted">({teamb?.short_name})</p>
            {teamb?.scores_full && (
              <div className="mt-3">
                <Tag color="blue" className="px-4 py-2">
                  {teamb.scores_full}
                </Tag>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Result Section */}
      {status_note && status === 2 && (
        <div className="text-center mb-3">
          <Card
            className="bg-light-success border border-success rounded p-2"
            bodyStyle={{ padding: "0px 10px" }} // Reduce internal padding
          >
            <TrophyOutlined className="fs-4 text-success me-2" />
            <span className="fs-5 fw-bold text-success">{result}</span>
            {status_note && (
              <p className="mt-2 mb-0 text-muted">{status_note}</p>
            )}
          </Card>
        </div>
      )}

      <Divider style={{ marginTop: "-10px", marginBottom: "8px" }} />

      {/* Match Details */}
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Card title="Match Information" size="small" className="h-100">
            <div className="d-flex align-items-center mb-2">
              <CalendarOutlined className="me-2 text-primary" />
              <span>
                <strong>Start:</strong> {formatDateTime(date_start_ist)}
              </span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <CalendarOutlined className="me-2 text-primary" />
              <span>
                <strong>End:</strong> {formatDateTime(date_end_ist)}
              </span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <EnvironmentOutlined className="me-2 text-primary" />
              <span>
                <strong>Venue:</strong> {venue?.name}, {venue?.location}
              </span>
            </div>
            {toss && (
              <div className="mt-3">
                <strong>Toss:</strong> {toss.text}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Competition Details" size="small" className="h-100">
            <div className="mb-2">
              <strong>Tournament:</strong> {competition?.title}
            </div>
            <div className="mb-2">
              <strong>Season:</strong> {competition?.season}
            </div>
            <div className="mb-2">
              <strong>Category:</strong>{" "}
              {competition?.category
                ? competition.category.toUpperCase()
                : "N/A"}
            </div>
            {umpires && (
              <div className="mt-3">
                <strong>Umpires:</strong>
                <p className="mt-1 mb-0 small text-muted">{umpires}</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default MatchCard;
