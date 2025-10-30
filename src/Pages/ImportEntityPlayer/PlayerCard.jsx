import React from "react";
import { Card, Row, Col, Tag, Avatar, Divider, Tabs } from "antd";
import {
    UserOutlined,
    TrophyOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { TabPane } = Tabs;

const PlayerCard = ({ playerData, onClose }) => {
    if (!playerData || !playerData.result) {
        return null;
    }

    const { player, batting, bowling } = playerData.result;

    const formatDate = (date) => {
        if (!date) return "N/A";
        return moment(date).format("DD MMM YYYY");
    };

    const StatCard = ({ title, stats, type = "batting" }) => {
        if (!stats || Object.keys(stats).length === 0) {
            return (
                <Card
                    title={<span className="matchCardText">{title}</span>}
                    size="small"
                    className="team-card h-100"
                >
                    <div className="mb-2 matchCardText">No data available</div>
                </Card>
            );
        }

        return (
            <Card
                title={<span className="matchCardText">{title}</span>}
                size="small"
                className="team-card h-100"
            >
                <Row gutter={[8, 8]}>
                    {stats?.matches ? (<Col span={12}>
                        <div className="matchCardText">
                            <strong>Matches:</strong> {stats.matches}
                        </div>
                    </Col>) : null}
                    {stats?.innings ? (<Col span={12}>
                        <div className="matchCardText">
                            <strong>Innings:</strong> {stats.innings}
                        </div>
                    </Col>) : null}

                    {type === "batting" ? (
                        <>
                            {stats?.runs ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Runs:</strong> {stats.runs}
                                </div>
                            </Col>) : null}
                            {stats?.balls ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Balls:</strong> {stats.balls}
                                </div>
                            </Col>) : null}
                            {stats?.highest ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Highest:</strong> {stats.highest}
                                </div>
                            </Col>) : null}
                            {stats?.average ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Average:</strong> {stats.average}
                                </div>
                            </Col>) : null}
                            {stats?.strike ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Strike Rate:</strong> {stats.strike}
                                </div>
                            </Col>) : null}
                            {(stats?.run100 || stats?.run50) ? (<Col span={12}>
                                <div className="matchCardText">
                                    {/* <strong>100s/50s:</strong> {stats.run100 || "0"}/{stats.run50 || "0"} */}
                                    {stats?.run100 && stats?.run50 ? (
                                        <>
                                            <strong>100s/50s:</strong> {stats.run100}/{stats.run50}
                                        </>
                                    ) : stats?.run100 ? (
                                        <>
                                            <strong>100s:</strong> {stats.run100}
                                        </>
                                    ) : (
                                        <>
                                            <strong>50s:</strong> {stats.run50}
                                        </>
                                    )}
                                </div>
                            </Col>) : null}
                            {(stats?.run4 || stats?.run6) ? (<Col span={12}>
                                <div className="matchCardText">
                                    {/* <strong>4s/6s:</strong> {stats?.run4 || "0"}/{stats?.run6 || "0"} */}
                                    {stats?.run4 && stats?.run6 ? (
                                        <>
                                            <strong>4s/6s:</strong> {stats.run4}/{stats.run6}
                                        </>
                                    ) : stats?.run4 ? (
                                        <>
                                            <strong>4s:</strong> {stats.run4}
                                        </>
                                    ) : (
                                        <>
                                            <strong>6s:</strong> {stats.run6}
                                        </>
                                    )}
                                </div>
                            </Col>) : null}
                            {stats?.notout ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Not Out:</strong> {stats.notout}
                                </div>
                            </Col>) : null}
                            {stats?.catches ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Catches:</strong> {stats?.catches}
                                </div>
                            </Col>) : null}
                            {stats?.stumpings ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Stumpings:</strong> {stats.stumpings}
                                </div>
                            </Col>) : null}
                        </>
                    ) : (
                        <>
                            {stats?.wickets ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Wickets:</strong> {stats.wickets}
                                </div>
                            </Col>) : null}
                            {stats?.runs ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Runs:</strong> {stats.runs}
                                </div>
                            </Col>) : null}
                            {stats?.overs ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Overs:</strong> {stats.overs}
                                </div>
                            </Col>) : null}
                            {stats?.econ ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Economy:</strong> {stats.econ}
                                </div>
                            </Col>) : null}
                            {stats?.average ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Average:</strong> {stats.average}
                                </div>
                            </Col>) : null}
                            {stats?.strike ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Strike Rate:</strong> {stats.strike}
                                </div>
                            </Col>) : null}
                            {stats?.bestinning ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Best Inning:</strong> {stats.bestinning}
                                </div>
                            </Col>) : null}
                            {stats?.bestmatch ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Best Match:</strong> {stats.bestmatch}
                                </div>
                            </Col>) : null}
                            {stats?.hattrick ? (<Col span={12}>
                                <div className="matchCardText">
                                    <strong>Hattrick:</strong> {stats.hattrick}
                                </div>
                            </Col>) : null}
                            {(stats?.wicket5i || stats?.wicket4i) ? (<Col span={12}>
                                <div className="matchCardText">
                                    {/* <strong>5W/4W:</strong> {stats.wicket5i || "0"}/{stats.wicket4i || "0"} */}
                                    {stats?.wicket5i && stats?.wicket4i ? (
                                        <>
                                            <strong>5W/4W:</strong> {stats.wicket5i}/{stats.wicket4i}
                                        </>
                                    ) : stats?.wicket5i ? (
                                        <>
                                            <strong>5W:</strong> {stats.wicket5i}
                                        </>
                                    ) : (
                                        <>
                                            <strong>4W:</strong> {stats.wicket4i}
                                        </>
                                    )}
                                </div>
                            </Col>) : null}
                        </>
                    )}
                </Row>
            </Card>
        );
    };

    return (
        <>
            <div className="mb-4">
                <Row justify="space-between" align="middle">
                    <Col>
                        <h2 className="mt-1 mb-1 text-primary h4">
                            {player?.title} ({player?.pid})
                        </h2>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
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
                                        marginRight: "5px",
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

            {/* Player Info Section */}
            {/* <Row gutter={[24, 24]} className="mb-3">
                <Col xs={24}>
                    <Card className="text-center team-card border" bodyStyle={{ padding: 20 }}>
                        <Avatar
                            size={100}
                            src={player?.logo_url}
                            className="bg-primary mb-3"
                            icon={<UserOutlined />}
                        >
                            {player?.short_name}
                        </Avatar>
                        <h3 className="matchCardText my-2 h5">{player?.first_name} {player?.last_name}</h3>
                        <p className="m-0 text-muted">({player?.short_name})</p>
                        <div className="mt-3 d-flex justify-content-center gap-2 flex-wrap">
                            <Tag color="blue">{player?.nationality}</Tag>
                            <Tag color="green">{player?.playing_role}</Tag>
                        </div>
                    </Card>
                </Col>
            </Row> */}

            {/* Player Details */}
            <Row gutter={[24, 16]} className="mb-3">
                <Col xs={24} md={12}>
                    <Card
                        title={<span className="matchCardText">Personal Information</span>}
                        size="small"
                        className="team-card h-100"
                    >
                        {player?.title ? (
                            <div className="d-flex align-items-center mb-2 matchCardText">
                                <UserOutlined className="me-2 text-primary" />
                                <span className="mb-2 matchCardText">
                                    <strong>Player:</strong> {player.title}
                                </span>
                            </div>
                        ) : null}
                        {player?.birthdate ? (<div className="d-flex align-items-center mb-2 matchCardText">
                            <CalendarOutlined className="me-2 text-primary" />
                            <span>
                                <strong>Birth Date:</strong> {formatDate(player.birthdate)}
                            </span>
                        </div>): null}
                        {player?.short_name ? (
                            <div className="mb-2 matchCardText">
                                <strong>Short Name:</strong> {player.short_name}
                            </div>
                        ) : null}
                        {player?.birthplace ? (
                            <div className="mb-2 matchCardText">
                                <strong>Birth Place:</strong> {player.birthplace}
                            </div>
                        ) : null}
                        {player?.nationality ? (<div className="mb-2 matchCardText">
                            <strong>Nationality:</strong> {player.nationality}
                        </div>) : null}
                        {player?.country ? (<div className="mb-2 matchCardText">
                            <strong>Country:</strong> {player.country?.toUpperCase()}
                        </div>) : null}
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        title={<span className="matchCardText">Playing Style</span>}
                        size="small"
                        className="team-card h-100"
                    >
                        {player?.playing_role ? (<div className="mb-2 matchCardText">
                            <strong>Playing Role:</strong> {player.playing_role}
                        </div>) : null}
                        {player?.batting_style ? (<div className="mb-2 matchCardText">
                            <strong>Batting Style:</strong> {player.batting_style}
                        </div>) : null}
                        {player?.bowling_style ? (<div className="mb-2 matchCardText">
                            <strong>Bowling Style:</strong> {player.bowling_style}
                        </div>) : null}
                        {player?.bowling_type ? (<div className="mb-2 matchCardText">
                            <strong>Bowling Type:</strong> {player.bowling_type}
                        </div>) : null}
                        {player.fielding_position ? (
                            <div className="mb-2 matchCardText">
                                <strong>Fielding Position:</strong> {player.fielding_position}
                            </div>
                        ) : null}
                    </Card>
                </Col>
            </Row>

            <Divider style={{ marginTop: "5px", marginBottom: "8px" }} />

            {/* Statistics Tabs */}
            <Tabs defaultActiveKey="batting" className="custom-tabs">
                <TabPane tab="Batting Statistics" key="batting">
                    <Row gutter={[16, 16]}>
                        {batting?.test && <Col xs={24} md={12}>
                            <StatCard title="Test" stats={batting?.test} type="batting" />
                        </Col>}
                        {batting?.odi && <Col xs={24} md={12}>
                            <StatCard title="ODI" stats={batting?.odi} type="batting" />
                        </Col>}
                        {batting?.t20i && <Col xs={24} md={12}>
                            <StatCard title="T20I" stats={batting?.t20i} type="batting" />
                        </Col>}
                        {batting?.t20 && <Col xs={24} md={12}>
                            <StatCard title="T20" stats={batting?.t20} type="batting" />
                        </Col>}
                        {batting?.firstclass && <Col xs={24} md={12}>
                            <StatCard title="First Class" stats={batting?.firstclass} type="batting" />
                        </Col>}
                        {batting?.lista && <Col xs={24} md={12}>
                            <StatCard title="List A" stats={batting?.lista} type="batting" />
                        </Col>}
                    </Row>
                </TabPane>

                <TabPane tab="Bowling Statistics" key="bowling">
                    <Row gutter={[16, 16]}>
                        {bowling?.test && <Col xs={24} md={12}>
                            <StatCard title="Test" stats={bowling?.test} type="bowling" />
                        </Col>}
                        {bowling?.odi && <Col xs={24} md={12}>
                            <StatCard title="ODI" stats={bowling?.odi} type="bowling" />
                        </Col>}
                        {bowling?.t20i && <Col xs={24} md={12}>
                            <StatCard title="T20I" stats={bowling?.t20i} type="bowling" />
                        </Col>}
                        {bowling?.t20 && <Col xs={24} md={12}>
                            <StatCard title="T20" stats={bowling?.t20} type="bowling" />
                        </Col>}
                        {bowling?.firstclass && <Col xs={24} md={12}>
                            <StatCard title="First Class" stats={bowling?.firstclass} type="bowling" />
                        </Col>}
                        {bowling?.lista && <Col xs={24} md={12}>
                            <StatCard title="List A" stats={bowling?.lista} type="bowling" />
                        </Col>}
                    </Row>
                </TabPane>
            </Tabs>
        </>
    );
};

export default PlayerCard;