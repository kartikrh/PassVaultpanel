import React from "react";
import { Card, Row, Col, Tag, Avatar, Divider } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import moment from "moment";

const MatchCard = ({ matchData, onClose }) => {
  if (!matchData || !matchData.match_info) {
    return null;
  }

  // Extract match_info from the nested structure
  const {
    title,
    match_id,
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
    weather,
    pitch,
  } = matchData.match_info;

  // const {} = matchData.match-playing11

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
            <h2 className="mt-1 mb-1 text-primary h4">
              {title} ({match_id})
            </h2>
          </Col>
          <Col>
            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
              {status_str && (
                <Tag color={getStatusColor(status)} className="px-3 py-1">
                  {status_str.toUpperCase()}
                </Tag>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    lineHeight: "1",
                    color: "inherit",
                    marginRight: "5px"
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>
          </Col>
        </Row>
      </div>
      <Divider style={{ marginTop: "-20px", marginBottom: "8px" }} />

      {/* Teams Section */}
      <Row gutter={[24, 24]} className="mb-2">
        <Col xs={24} sm={11}>
          <Card
            className="text-center team-card border"
            bodyStyle={{ padding: 5 }}
            style={{ minHeight: 215 }}
          >
            <Avatar size={75} src={teama?.logo_url} className="bg-primary mb-3">
              {teama?.short_name}
            </Avatar>
            <h3 className="matchCardText my-2 h5">
              {teama?.name} ({teama?.team_id})
            </h3>
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
            className="text-center team-card border"
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
            <h3 className="matchCardText my-2 h5">
              {teamb?.name} ({teamb?.team_id})
            </h3>
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
      {result && status === 2 && (
        <div className="text-center mb-3">
          <Card
            className="team-card border border-success rounded p-2"
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

      <Divider style={{ marginTop: "5px", marginBottom: "8px" }} />

      {/* Match Details */}
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={<span className="matchCardText">Match Information: </span>}
            size="small"
            className="team-card h-100"
          >
            <div className="d-flex align-items-center mb-2 matchCardText">
              <CalendarOutlined className="me-2 text-primary" />
              <span>
                <strong>Start:</strong> {formatDateTime(date_start_ist)}
              </span>
            </div>
            <div className="d-flex align-items-center mb-2 matchCardText">
              <CalendarOutlined className="me-2 text-primary" />
              <span>
                <strong>End:</strong> {formatDateTime(date_end_ist)}
              </span>
            </div>
            <div className="d-flex align-items-center mb-2 matchCardText">
              <EnvironmentOutlined className="me-2 text-primary" />
              <span>
                <strong>Venue:</strong> {venue?.name}, {venue?.location}
              </span>
            </div>
            {toss && (status === 2 || status === 3) && (
              <div className="mt-3 matchCardText">
                <strong>Toss:</strong> {toss.text}
              </div>
            )}
          </Card>
        </Col>

        {/* Competition Details */}
        <Col xs={24} md={12}>
          <Card
            title={<span className="matchCardText">Competition Details: </span>}
            size="small"
            className="team-card h-100"
          >
            <div className="mb-2 matchCardText">
              <strong>Tournament:</strong> {competition?.title}
            </div>
            <div className="mb-2 matchCardText">
              <strong>Season:</strong> {competition?.season}
            </div>
            <div className="mb-2 matchCardText">
              <strong>Category:</strong>{" "}
              {competition?.category
                ? competition.category.toUpperCase()
                : "N/A"}
            </div>
            {umpires && (
              <div className="mt-3 matchCardText">
                <strong>Umpires:</strong>
                <p className="mt-1 mb-0 small text-muted">{umpires}</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ marginTop: "5px", marginBottom: "8px" }} />

      {/* Weather Details */}
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={<span className="matchCardText">Weather Details: </span>}
            size="small"
            className="team-card h-100"
          >
            {weather?.weather ||
            weather?.weather_desc ||
            weather?.temp ||
            weather?.humidity ||
            weather?.visibility ||
            weather?.wind_speed ||
            weather?.clouds ? (
              <>
                {weather?.weather && (
                  <div className="mb-2 matchCardText">
                    <strong>Weather: </strong> {weather.weather}
                  </div>
                )}
                {weather?.weather_desc && (
                  <div className="mb-2 matchCardText">
                    <strong>Weather Description: </strong>{" "}
                    {weather.weather_desc}
                  </div>
                )}
                {weather?.temp && (
                  <div className="mb-2 matchCardText">
                    <strong>Temperature: </strong> {weather.temp}
                  </div>
                )}
                {weather?.humidity && (
                  <div className="mb-2 matchCardText">
                    <strong>Humidity: </strong> {weather.humidity}
                  </div>
                )}
                {weather?.visibility && (
                  <div className="mb-2 matchCardText">
                    <strong>Visibility: </strong> {weather.visibility}
                  </div>
                )}
                {weather?.wind_speed && (
                  <div className="mb-2 matchCardText">
                    <strong>Wind Speed: </strong> {weather.wind_speed}
                  </div>
                )}
                {weather?.clouds && (
                  <div className="mb-2 matchCardText">
                    <strong>Clouds: </strong> {weather.clouds}
                  </div>
                )}
              </>
            ) : (
              <div className="mb-2 matchCardText">No data available</div>
            )}
          </Card>
        </Col>

        {/* Pitch Details */}
        <Col xs={24} md={12}>
          <Card
            title={<span className="matchCardText">Pitch Details: </span>}
            size="small"
            className="team-card h-100"
          >
            {pitch?.pitch_condition ||
            pitch?.batting_condition ||
            pitch?.pace_bowling_condition ||
            pitch?.spine_bowling_condition ? (
              <>
                {pitch?.pitch_condition && (
                  <div className="mb-2 matchCardText">
                    <strong>Pitch Condition: </strong> {pitch.pitch_condition}
                  </div>
                )}
                {pitch?.batting_condition && (
                  <div className="mb-2 matchCardText">
                    <strong>Batting Condition: </strong>{" "}
                    {pitch.batting_condition}
                  </div>
                )}
                {pitch?.pace_bowling_condition && (
                  <div className="mb-2 matchCardText">
                    <strong>Pace Bowling Condition: </strong>{" "}
                    {pitch.pace_bowling_condition}
                  </div>
                )}
                {pitch?.spine_bowling_condition && (
                  <div className="mb-2 matchCardText">
                    <strong>Spine Bowling Condition: </strong>{" "}
                    {pitch.spine_bowling_condition}
                  </div>
                )}
              </>
            ) : (
              <div className="mb-2 matchCardText">No data available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ marginTop: "5px", marginBottom: "8px" }} />
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={<span className="matchCardText">{teama?.name} </span>}
            size="small"
            className="team-card h-100"
          >
            <div /* className="overflow-auto" style={{ maxHeight: '100px' }} */>
            {matchData["match-playing11"].teama.squads.map((player, index) => (
              <span key={index}>
                {index + 1}{')'} {player.name}
                {index < matchData["match-playing11"].teama.squads.length - 1 && ', '}
              </span>
            ))}
            </div>
            {/* ) : (
              <div className="mb-2 matchCardText">No data available</div>
            )} */}
          </Card>
        </Col>

        {/* Pitch Details */}
        <Col xs={24} md={12}>
          <Card
            title={<span className="matchCardText">{teamb?.name} </span>}
            size="small"
            className="team-card h-100"
          >
            <div /* className="overflow-auto" style={{ maxHeight: '100px' }} */>
              {matchData["match-playing11"].teamb.squads.map((player, index) => (
                <span key={index}>
                  {index + 1}{')'} {player.name}
                  {index < matchData["match-playing11"].teamb.squads.length - 1 && ', '}
                </span>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

    </>
  );
};

export default MatchCard;