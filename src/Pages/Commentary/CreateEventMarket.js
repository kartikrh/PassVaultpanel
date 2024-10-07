import React, { useState, useEffect } from 'react';
import axiosInstance from "../../Features/axios";
import { Button, Card, CardBody, CardHeader, Table, Input, Container, Row, Col } from 'reactstrap';
import SpinnerModel from "../../components/Model/SpinnerModel";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

const MARKET_STATUS = {
    1: "Active",
    2: "Suspended",
    3: "Settled",
};

export const CreateEventMarket = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [marketData, setMarketData] = useState({
        teamAndPlayers: [],
        marketTemplate: [],
        commentary: {},
        eventMarket: [],
        categories: [],
        marketTypes: []
    });
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const commentaryId = +localStorage.getItem('marketTemplateCommentaryId') || "0";
    const [processedMarkets, setProcessedMarkets] = useState({});
    const [checkedList, setCheckedList] = useState([]);

    useEffect(() => {
        fetchData(commentaryId);
    }, []);

    const fetchData = async (commentaryId) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/admin/eventMarket/getDetailsByCIdV1", { commentaryId });
            if (response?.result) {
                const { teamAndPlayers, marketTemplate, commentary, eventMarket, categories, marketTypes, matchType } = response.result;
                setMarketData({ teamAndPlayers, marketTemplate, commentary, eventMarket, categories, marketTypes });
                processMarketData(marketTemplate, eventMarket, teamAndPlayers, commentary, matchType);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (markets, isSelected) => {
        const newCheckedList = isSelected
            ? [...new Set([...checkedList, ...markets.map(m => m.eventMarketId)])]
            : checkedList.filter(id => !markets.some(m => m.eventMarketId === id));

        setCheckedList(newCheckedList);

        markets.forEach(market => {
            handleValueChange(market, "isCreate", isSelected);
        });
    };

    const handleSelectMarket = (record) => {
        const newCheckedList = checkedList.includes(record.eventMarketId)
            ? checkedList.filter(id => id !== record.eventMarketId)
            : [...checkedList, record.eventMarketId];

        setCheckedList(newCheckedList);
        handleValueChange(record, "isCreate", !checkedList.includes(record.eventMarketId));
    };

    const processMarketData = (templates, existingMarkets, teams, commentary, matchType) => {
        const processedMarketsObj = {};

        templates.forEach(template => {
            const market = existingMarkets.find(m => m.marketTemplateId === template.marketTemplateId) || generateMarketFromTemplate(template, teams, commentary);

            if (template.isPerEvent) {
                processMarketAndRunners(market, null, 'oneTimeMarket', processedMarketsObj);
            } else if (market.marketTypeCategoryId === 11 && market.isOver) {
                processOnlyOverMarkets(market, teams, matchType.maxOversInFirstInings, processedMarketsObj);
            } else if (market.marketTypeCategoryId === 13) {
                processWicketMarkets(market, teams, matchType.noOfPlayer, processedMarketsObj);
            } else if (market.marketTypeCategoryId === 12) {
                processPlayerRunsMarkets(market, teams, processedMarketsObj);
            } else {
                teams.forEach(team => {
                    processMarketAndRunners(market, team.teamId, team.teamId.toString(), processedMarketsObj);
                });
            }
        });

        setProcessedMarkets(processedMarketsObj);
    };

    const processMarketAndRunners = (market, teamId, keyPrefix, processedMarketsObj) => {
        const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}_##_${market.marketName || market.templateName}`;
        processedMarketsObj[baseKey] = processedMarketsObj[baseKey] || [];
        processedMarketsObj[baseKey].push({ ...market, teamId });
    };

    const processOnlyOverMarkets = (market, teams, maxOvers, processedMarketsObj) => {
        const startOver = parseInt(market.over);
        teams.forEach(team => {
            for (let currentOver = startOver; currentOver <= maxOvers; currentOver++) {
                const specialMarketName = `ONLY ${currentOver} OVER - ${team.shortName}`;
                const specialMarket = {
                    ...market,
                    over: currentOver.toString(),
                    marketName: specialMarketName,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };

    const processWicketMarkets = (market, teams, noOfPlayers, processedMarketsObj) => {
        teams.forEach(team => {
            for (let wicket = 1; wicket < noOfPlayers; wicket++) {
                const specialMarketName = `${wicket} Wicket - ${team.shortName}`;
                const specialMarket = {
                    ...market,
                    marketName: specialMarketName,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            }
        });
    };

    const processPlayerRunsMarkets = (market, teams, processedMarketsObj) => {
        teams.forEach(team => {
            team.players.forEach(player => {
                const specialMarketName = `${player.playerName} Runs`;
                const specialMarket = {
                    ...market,
                    playerId: player.playerId,
                    marketName: specialMarketName,
                    teamId: team.teamId
                };
                processMarketAndRunners(specialMarket, team.teamId, team.teamId.toString(), processedMarketsObj);
            });
        });
    };

    const generateMarketFromTemplate = (template, teams, commentary) => {
        return {
            eventMarketId: 0,
            isCreate: true,
            status: "1",
            margin: template.margin,
            data: "",
            playerId: null,
            ...template,
            commentaryId: commentary.commentaryId,
            eventRefId: commentary.eventRefId,
            marketName: template.templateName,
            teamId: null,
            inningsId: 1,
            isAllow: false,
            index: 0,
            runners: template.runners || []
        };
    };


    const handleRunnerValueChange = (market, runnerIndex, key, value) => {
        setProcessedMarkets(prevMarkets => {
            const updatedMarkets = { ...prevMarkets };
            const marketKey = Object.keys(updatedMarkets).find(k => updatedMarkets[k].includes(market));
            const marketIndex = updatedMarkets[marketKey].findIndex(m => m === market);
            const updatedRunners = [...market.runners];
            updatedRunners[runnerIndex] = { ...updatedRunners[runnerIndex], [key]: value };
            updatedMarkets[marketKey][marketIndex] = { ...market, runners: updatedRunners };
            return updatedMarkets;
        });
    };

    const renderTable = (markets) => {
        const hasRunnerColumns = !markets[0]?.isPredefineRunnerValue;
        const columns = [
            ...columnInitials,
            ...(hasRunnerColumns ? runnerColumns : []),
        ];

        return (
            <Table responsive>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th className="p-0" key={index} style={column.style}>
                                {typeof column.title === 'function' ? column.title() : column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {markets.map((market, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                {columns.map((column, colIndex) => (
                                    <td className="p-2" key={colIndex}>
                                        {column.render ? column.render(market[column.dataIndex], market) : market[column.dataIndex]}
                                    </td>
                                ))}
                            </tr>
                            {market.isPredefineRunnerValue && market.runners && market.runners.length > 0 && (
                                <tr>
                                    <td className="p-2" colSpan={columns.length}>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th className="p-0">Runner</th>
                                                    {runnerColumns.map((column, runnerColIndex) => (
                                                        <th className="p-0" key={runnerColIndex}>{column.title}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {market.runners.map((runner, runnerIndex) => (
                                                    <tr key={runnerIndex}>
                                                        <td className="p-2">{runner.runner}</td>
                                                        {runnerColumns.map((column, runnerColIndex) => (
                                                            <td className="p-2" key={runnerColIndex}>
                                                                {column.render(runner[column.key], runner, (key, value) => handleRunnerValueChange(market, runnerIndex, key, value))}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
        );
    };

    const renderMarketCategory = (categoryId, markets) => (
        <Card key={categoryId}>
            <CardHeader>
                {marketData.categories.find(cat => cat.marketTypeCategoryId === parseInt(categoryId))?.categoryName || `Category ${categoryId}`}
            </CardHeader>
            <CardBody className="p-1">
                {renderTable(markets)}
            </CardBody>
        </Card>
    );

    const renderMarketType = (typeId, categories) => (
        <Card key={typeId}>
            <CardHeader>
                {marketData.marketTypes.find(type => type.marketTypeId === parseInt(typeId))?.marketTypeName || `Type ${typeId}`}
            </CardHeader>
            <CardBody className="p-1">
                {Object.entries(categories).map(([categoryId, markets]) =>
                    renderMarketCategory(categoryId, markets)
                )}
            </CardBody>
        </Card>
    );

    const renderTeamMarkets = (teamId, typeCategories) => (
        <Card key={teamId}>
            <CardHeader>
                {marketData.teamAndPlayers.find(team => team.teamId === parseInt(teamId))?.teamName || `Team ${teamId}`}
            </CardHeader>
            <CardBody className="p-1">
                {Object.entries(typeCategories).map(([typeId, categories]) =>
                    renderMarketType(typeId, categories)
                )}
            </CardBody>
        </Card>
    );

    const renderMainSections = () => {
        const sections = {
            oneTimeMarket: { title: "One Time Markets", data: {} }
        };

        // Create sections for each team dynamically
        marketData.teamAndPlayers.forEach(team => {
            sections[`team_${team.teamId}`] = {
                title: `${team.teamName} Markets`,
                data: {}
            };
        });

        Object.entries(processedMarkets).forEach(([key, markets]) => {
            const [prefix, typeId, categoryId, name] = key.split('_##_');

            if (prefix === 'oneTimeMarket') {
                if (!sections.oneTimeMarket.data[typeId]) sections.oneTimeMarket.data[typeId] = {};
                if (!sections.oneTimeMarket.data[typeId][categoryId]) sections.oneTimeMarket.data[typeId][categoryId] = [];
                sections.oneTimeMarket.data[typeId][categoryId].push(...markets);
            } else {
                const teamId = prefix;
                const teamSection = sections[`team_${teamId}`];

                if (teamSection) {
                    if (!teamSection.data[typeId]) teamSection.data[typeId] = {};
                    if (!teamSection.data[typeId][categoryId]) teamSection.data[typeId][categoryId] = [];
                    teamSection.data[typeId][categoryId].push(...markets);
                }
            }
        });

        return (
            <>
                {Object.entries(sections).map(([sectionKey, section]) => (
                    <Card key={sectionKey}>
                        <CardHeader>{section.title}</CardHeader>
                        <CardBody className="p-1">
                            {Object.entries(section.data).map(([typeId, categories]) =>
                                renderMarketType(typeId, categories)
                            )}
                        </CardBody>
                    </Card>
                ))}
            </>
        );
    };
    const handleSave = async () => {
        const savedData = Object.values(processedMarkets)
            .flat()
            .filter(market => checkedList.includes(market.eventMarketId))
            .map(market => ({
                ...market,
                runners: market.runners.map(runner => ({
                    ...runner,
                    marketTemplateId: market.marketTemplateId
                }))
            }));
        await axiosInstance
            .post(`/admin/eventMarket/saveEventMarketV1`, {
                eventMarket: savedData,
            })
            .then((response) => {
                fetchData(commentaryId);
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            })
            .catch((error) => {
                setIsLoading(false);
                dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
            });
        console.log(savedData);
        // Here you would typically send this data to your backend
    };


    const handleBackClick = () => {
        navigate("/commentary");
    };
    const handleValueChange = (market, key, value) => {
        setProcessedMarkets(prevMarkets => {
            const updatedMarkets = { ...prevMarkets };
            const marketKey = Object.keys(updatedMarkets).find(k => updatedMarkets[k].includes(market));
            const marketIndex = updatedMarkets[marketKey].findIndex(m => m === market);
            // console.log({ marketKey, marketIndex })
            updatedMarkets[marketKey][marketIndex] = { ...market, [key]: value };
            return updatedMarkets;
        });
    }
    const columnInitials = [
        {
            title: "",
            render: (text, record) => (
                <div className="form-check d-flex align-items-center justify-between">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="chk_child"
                        value="option1"
                        checked={checkedList.includes(record.eventMarketId)}
                        onChange={() => handleSelectMarket(record)}
                    />
                </div>
            ),
            key: "isCreate",
            style: { width: "2%" },
        },
        {
            title: "Market",
            dataIndex: "marketName",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control small-text-fields"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "marketName", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.marketName}
                    </span>
                </>
            ),
            key: "marketName",
            style: { width: "30%" },
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            render: (text, record) => (
                <Button
                    color={`${record.isActive ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleValueChange(record, "isActive", !record.isActive);
                    }}
                >
                    <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isActive",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Market Allow",
            dataIndex: "isAllow",
            render: (text, record) => (
                <Button
                    color={`${record.isAllow ? "primary" : "danger"}`}
                    size="sm"
                    className="btn"
                    onClick={() => {
                        handleValueChange(record, "isAllow", !record.isAllow);
                    }}
                >
                    <i className={`bx ${record.isAllow ? "bx-check" : "bx-block"}`}></i>
                </Button>
            ),
            key: "isAllow",
            style: { width: "2%", textAlign: "center" },
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text, record) => (
                <select
                    className="small-text-fields"
                    value={text}
                    onChange={(e) => {
                        handleValueChange(record, "status", e.target.value);
                    }}
                    closeMenuOnSelect={true}
                >
                    {
                        Object.entries(MARKET_STATUS).map(([key, value]) =>
                            <option key={key} value={key}>{value}</option>
                        )
                    }
                </select>
            ),
            key: "status",
            style: { width: "10%" },
        },
        {
            title: "Margin",
            dataIndex: "margin",
            render: (text, record) => (
                <>
                    <Input
                        className="form-control small-text-fields"
                        type="text"
                        value={text}
                        onChange={(e) => handleValueChange(record, "margin", e.target.value)}
                    />
                    <span className="text-danger">
                        {record?.error?.margin}
                    </span>
                </>
            ),
            key: "margin",
            style: { width: "10%" },
        }
    ];

    const runnerColumns = [
        {
            title: "Line",
            key: "line",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.line || ""}
                    onChange={(e) => onChange("line", +e.target.value || 0)}
                    placeholder="Line"
                />
            ),
        },
        {
            title: "Under",
            key: "under",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.underRate || ""}
                    onChange={(e) => onChange("underRate", +e.target.value || 0)}
                    placeholder="Under"
                />
            ),
        },
        {
            title: "Over",
            key: "over",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.overRate || ""}
                    onChange={(e) => onChange("overRate", +e.target.value || 0)}
                    placeholder="Over"
                />
            ),
        },
        {
            title: "No Rate",
            key: "noRate",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.layPrice || ""}
                    onChange={(e) => onChange("layPrice", +e.target.value || 0)}
                    placeholder="No Rate"
                />
            ),
        },
        {
            title: "Yes Rate",
            key: "yesRate",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.backPrice || ""}
                    onChange={(e) => onChange("backPrice", +e.target.value || 0)}
                    placeholder="Yes Rate"
                />
            ),
        },
        {
            title: "No Point",
            key: "noPoint",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.laySize || ""}
                    onChange={(e) => onChange("laySize", +e.target.value || 0)}
                    placeholder="No Point"
                />
            ),
        },
        {
            title: "Yes Point",
            key: "yesPoint",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.backSize || ""}
                    onChange={(e) => onChange("backSize", +e.target.value || 0)}
                    placeholder="Yes Point"
                />
            ),
        },
    ];
    return (
        <React.Fragment>
            <div className="page-content" >
                <Container fluid={true}>
                    <Row>
                        <Card>
                            <CardBody className="p-1">
                                {isLoading && <SpinnerModel />}
                                <Row className='mb-3' >
                                    <Col className="mt-3 mt-lg-4 mt-md-4" >
                                        <Breadcrumbs title="ScoreCard" breadcrumbItem="Commentary Market Template" page="updatecp" />
                                    </Col>
                                    <Col className="mt-3 mt-lg-3 mt-md-3" >
                                        <Button color="primary" className="btn text-right" onClick={handleSave} > Save </Button>
                                    </Col>
                                    < Col className="mt-3 mt-lg-3 mt-md-3" >
                                        <button className="btn btn-danger text-right" onClick={handleBackClick} > Back </button>
                                    </Col>
                                </Row>
                                {renderMainSections()}
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );

};
