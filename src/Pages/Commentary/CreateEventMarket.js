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
    const [selectedMarkets, setSelectedMarkets] = useState({});
    useEffect(() => {
        console.log({ selectedMarkets, processedMarkets })
    })
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
                const processedMarkets = processMarketData(marketTemplate, eventMarket, teamAndPlayers, commentary, matchType);
                setProcessedMarkets(processedMarkets);
                initializeSelectedMarkets(processedMarkets);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAllInSection = (sectionKey) => {
        setSelectedMarkets(prev => {
            const sectionSelections = prev[sectionKey] || [];
            const allSelected = sectionSelections.length > 0 && sectionSelections.every(Boolean);
            const newSelections = processedMarkets[sectionKey]?.map(() => !allSelected) || [];
            return {
                ...prev,
                [sectionKey]: newSelections
            };
        });
    };

    // const handleSelectMarket = (record) => {
    //     const newCheckedList = checkedList.includes(record.eventMarketId)
    //         ? checkedList.filter(id => id !== record.eventMarketId)
    //         : [...checkedList, record.eventMarketId];

    //     setCheckedList(newCheckedList);
    //     handleValueChange(record, "isCreate", !checkedList.includes(record.eventMarketId));
    // };
    const generateOverUnder = (dataObj) => {
        const roundedLine = Math.floor(parseFloat(dataObj?.line));
        const thresholdValue = Math.floor(roundedLine) + 0.5;
        const marginAdjustment = dataObj?.margin ? ((dataObj.margin / 100) + 1) : 1;
        const dataToSend = {
            ...dataObj,
            backPrice: parseFloat((roundedLine + 1).toFixed(2)) || 0,
            layPrice: parseFloat(roundedLine.toFixed(2)) || 0,
            backSize: parseFloat(dataObj?.backSize) || 100,
            laySize: parseFloat(dataObj?.laySize) || 100,
            overRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(-(dataObj?.line - thresholdValue))))).toFixed(2))) || 0 : 0,
            underRate: dataObj?.margin ? parseFloat(((1 / (marginAdjustment / (1 + Math.exp(+(dataObj?.line - thresholdValue))))).toFixed(2))) || 0 : 0,
        }
        return dataToSend;
    };

    const processMarketData = (templates, existingMarkets, teams, commentary, matchType) => {
        const processedMarketsObj = {};

        // Helper function to get the key for a market
        const getMarketKey = (market) => {
            const prefix = market.teamId || 'oneTimeMarket';
            return `${prefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;
        };

        // Process templates first to ensure all markets are generated
        templates.forEach(template => {
            if (template.isPerEvent) {
                processMarketAndRunners(generateMarketFromTemplate(template, teams, commentary), null, 'oneTimeMarket', processedMarketsObj);
            } else if (template.marketTypeCategoryId === 11 && template.isOver) {
                processOnlyOverMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 13) {
                processWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.noOfPlayer, processedMarketsObj);
            } else if (template.marketTypeCategoryId === 12) {
                processPlayerRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else {
                teams.forEach(team => {
                    processMarketAndRunners(generateMarketFromTemplate(template, teams, commentary), team.teamId, team.teamId.toString(), processedMarketsObj);
                });
            }
        });

        // Now update with existing markets from API
        existingMarkets.forEach(apiMarket => {
            const key = getMarketKey(apiMarket);
            if (!processedMarketsObj[key]) {
                processedMarketsObj[key] = [];
            }

            const existingMarketIndex = processedMarketsObj[key].findIndex(m =>
                m.teamId === apiMarket.teamId &&
                m.marketTypeId === apiMarket.marketTypeId &&
                m.marketTypeCategoryId === apiMarket.marketTypeCategoryId &&
                m.marketName === apiMarket.marketName
            );

            if (existingMarketIndex !== -1) {
                // Replace the template-generated market with the API market
                processedMarketsObj[key][existingMarketIndex] = {
                    ...apiMarket,
                    isCreate: false,
                    runners: apiMarket.runners.length > 0 ? apiMarket.runners : processedMarketsObj[key][existingMarketIndex].runners
                };
            } else {
                // If the API market doesn't exist in our generated markets, add it
                processedMarketsObj[key].push({
                    ...apiMarket,
                    isCreate: false
                });
            }
        });

        // Sort the markets within each key to maintain order
        Object.keys(processedMarketsObj).forEach(key => {
            processedMarketsObj[key].sort((a, b) => {
                // First, sort by over if it exists
                if (a.over && b.over) {
                    return a.over - b.over;
                }
                // If over doesn't exist, maintain the original order
                return 0;
            });
        });

        return processedMarketsObj;
    };

    // const mergeRunners = (generatedRunners, apiRunners) => {
    //     const mergedRunners = [...generatedRunners];
    //     apiRunners.forEach(apiRunner => {
    //         const existingRunnerIndex = mergedRunners.findIndex(r => r.marketTemplateRunnerId === apiRunner.marketTemplateRunnerId);
    //         if (existingRunnerIndex !== -1) {
    //             mergedRunners[existingRunnerIndex] = {
    //                 ...mergedRunners[existingRunnerIndex],
    //                 ...apiRunner,
    //                 runnerId: apiRunner.runnerId || mergedRunners[existingRunnerIndex].runnerId
    //             };
    //         } else {
    //             mergedRunners.push({
    //                 ...apiRunner,
    //                 runnerId: apiRunner.runnerId || "0"
    //             });
    //         }
    //     });
    //     return mergedRunners;
    // };


    const initializeSelectedMarkets = (markets) => {
        const initialSelection = {};
        Object.keys(markets).forEach(key => {
            initialSelection[key] = Array(markets[key].length).fill(false);
        });
        setSelectedMarkets(initialSelection);
    };

    const handleSelectMarket = (sectionKey, index) => {
        setSelectedMarkets(prev => {
            const sectionSelections = prev[sectionKey] || [];
            const updatedSelections = [...sectionSelections];
            updatedSelections[index] = !updatedSelections[index];
            return {
                ...prev,
                [sectionKey]: updatedSelections
            };
        });
    };
    const processMarketAndRunners = (market, teamId, keyPrefix, processedMarketsObj) => {
        const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;
        const fullKey = `${baseKey}_##_${market.marketName || market.templateName}`;

        if (!processedMarketsObj[baseKey]) {
            processedMarketsObj[baseKey] = [];
        }

        // Add default runner only if the market doesn't have any runners
        if (!market.runners || market.runners.length === 0) {
            market.runners = [{
                marketTemplateRunnerId: 0,
                runnerId: "0",
                marketTemplateId: market.marketTemplateId,
                runner: "",
                line: 0,
                overRate: 0,
                underRate: 0,
                lastUpdate: new Date().toISOString(),
                selectionId: `${market.marketTemplateId}01`,
                order: 1,
                backPrice: 1,
                layPrice: 1,
                backSize: 100,
                laySize: 100
            }];
        }

        // Apply generateOverUnder to each runner
        const updatedRunners = market.runners.map(runner =>
            generateOverUnder({ ...runner, margin: parseFloat(market.margin) || 3 })
        );

        processedMarketsObj[baseKey].push({
            ...market,
            teamId,
            eventMarketId: market.eventMarketId || 0,
            isCreate: market.isCreate !== undefined ? market.isCreate : true,
            status: market.status || "1",
            margin: parseFloat(market.margin) || 3,
            data: market.data || "",
            playerId: market.playerId || null,
            isActive: market.isActive !== undefined ? market.isActive : true,
            isAllow: market.isAllow !== undefined ? market.isAllow : false,
            inningsId: market.inningsId || 1,
            index: market.index || 0,
            commentaryId: market.commentaryId,
            eventRefId: market.eventRefId,
            isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
            runners: updatedRunners
        });
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
            eventMarketId: 0, // Default to 0 for new markets
            isCreate: true,  // Default to true for new markets
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
            runners: template.runners?.map(runner => ({
                ...runner,
                runnerId: runner.runnerId || "0"
            })) || []
        };
    };

    const handleRunnerValueChange = (market, runnerIndex, key, value) => {
        setProcessedMarkets(prevMarkets => {
            const updatedMarkets = { ...prevMarkets };
            const marketKey = Object.keys(updatedMarkets).find(k => updatedMarkets[k].includes(market));
            const marketIndex = updatedMarkets[marketKey].findIndex(m => m === market);
            const updatedMarket = { ...updatedMarkets[marketKey][marketIndex] };
            const updatedRunners = [...updatedMarket.runners];

            // Parse the value as a float for numeric fields
            const parsedValue = ['line', 'overRate', 'underRate', 'backPrice', 'layPrice', 'backSize', 'laySize'].includes(key)
                ? parseFloat(value) || 0
                : value;

            updatedRunners[runnerIndex] = { ...updatedRunners[runnerIndex], [key]: parsedValue };

            // If the line changes, recalculate the runner values
            if (key === 'line') {
                const newRunnerValues = generateOverUnder({
                    ...updatedRunners[runnerIndex],
                    margin: updatedMarket.margin
                });
                updatedRunners[runnerIndex] = { ...newRunnerValues, line: parsedValue };
            }

            updatedMarket.runners = updatedRunners;
            updatedMarkets[marketKey][marketIndex] = updatedMarket;
            return updatedMarkets;
        });
    };

    const renderTable = (markets, sectionKey) => {
        const columns = [
            {
                title: () => (
                    <input
                        type="checkbox"
                        checked={selectedMarkets[sectionKey]?.every(Boolean)}
                        onChange={() => handleSelectAllInSection(sectionKey)}
                    />
                ),
                style: { width: "5%" },
                render: (_, record, index) => (
                    <input
                        type="checkbox"
                        checked={selectedMarkets[sectionKey]?.[index] || false}
                        onChange={() => handleSelectMarket(sectionKey, index)}
                    />
                ),
            },
            ...columnInitials,
            ...runnerColumns.map(column => ({
                ...column,
                render: (text, record, index) => column.render(
                    record.runners[0][column.key],
                    record.runners[0],
                    (key, value) => handleRunnerValueChange(record, 0, key, value)
                )
            }))
        ];

        return (
            <Table responsive>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th className="p-0" key={index} style={column.style}>
                                {typeof column.title === 'function' ? column.title(sectionKey) : column.title}
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
                                        {column.render ?
                                            column.render(
                                                market[column.dataIndex],
                                                market,
                                                index,
                                                (key, value) => handleValueChange(market, key, value)
                                            ) :
                                            market[column.dataIndex]
                                        }
                                    </td>
                                ))}
                            </tr>
                            {market.runners && market.runners.length > 1 &&
                                market.runners.slice(1).map((runner, runnerIndex) => (
                                    <tr key={`additional-runner-${runnerIndex}`}>
                                        <td colSpan={columns.length - runnerColumns.length}></td>
                                        {runnerColumns.map((column, runnerColIndex) => (
                                            <td className="p-2" key={`additional-runner-col-${runnerColIndex}`}>
                                                {column.render(
                                                    runner[column.key],
                                                    runner,
                                                    (key, value) => handleRunnerValueChange(market, runnerIndex + 1, key, value)
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            }
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
        );
    };

    const renderMarketCategory = (categoryId, markets, sectionKey) => (
        <Card key={categoryId}>
            <CardHeader>
                {marketData.categories.find(cat => cat.marketTypeCategoryId === parseInt(categoryId))?.categoryName || `Category ${categoryId}`}
            </CardHeader>
            <CardBody className="p-1">
                {renderTable(markets, sectionKey)}
            </CardBody>
        </Card>
    );
    const renderMarketType = (typeId, categories, teamId) => (
        <Card key={typeId}>
            <CardHeader>
                {marketData.marketTypes.find(type => type.marketTypeId === parseInt(typeId))?.marketTypeName || `Type ${typeId}`}
            </CardHeader>
            <CardBody className="p-1">
                {Object.entries(categories).map(([categoryId, markets]) => {
                    const sectionKey = `${teamId || 'oneTimeMarket'}_##_${typeId}_##_${categoryId}`;
                    return renderMarketCategory(categoryId, markets, sectionKey);
                })}
            </CardBody>
        </Card>
    );

    // const renderTeamMarkets = (teamId, typeCategories) => (
    //     <Card key={teamId}>
    //         <CardHeader>
    //             {marketData.teamAndPlayers.find(team => team.teamId === parseInt(teamId))?.teamName || `Team ${teamId}`}
    //         </CardHeader>
    //         <CardBody className="p-1">
    //             {Object.entries(typeCategories).map(([typeId, categories]) =>
    //                 renderMarketType(typeId, categories)
    //             )}
    //         </CardBody>
    //     </Card>
    // );

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
                                renderMarketType(typeId, categories, sectionKey === 'oneTimeMarket' ? null : sectionKey.split('_')[1])
                            )}
                        </CardBody>
                    </Card>
                ))}
            </>
        );
    };

    const handleSave = async () => {
        const savedData = Object.entries(processedMarkets)
            .flatMap(([key, markets]) =>
                markets.filter((_, index) => selectedMarkets[key]?.[index])
            )
            .map(market => ({
                ...market,
                runners: market.runners.map(runner => ({
                    ...runner,
                    marketTemplateId: market.marketTemplateId
                }))
            }));

        try {
            const response = await axiosInstance.post(`/admin/eventMarket/saveEventMarketV1`, {
                eventMarket: savedData,
            });
            fetchData(commentaryId);
            dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        } catch (error) {
            setIsLoading(false);
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        }
    };

    const handleBackClick = () => {
        navigate("/commentary");
    };
    const handleValueChange = (market, key, value) => {
        setProcessedMarkets(prevMarkets => {
            const updatedMarkets = { ...prevMarkets };
            const marketKey = Object.keys(updatedMarkets).find(k => updatedMarkets[k].includes(market));
            const marketIndex = updatedMarkets[marketKey].findIndex(m => m === market);
            const updatedMarket = { ...market, [key]: value };

            // If margin changes, update all runners
            if (key === 'margin') {
                updatedMarket.runners = updatedMarket.runners.map(runner =>
                    generateOverUnder({ ...runner, margin: parseFloat(value) })
                );
            }

            updatedMarkets[marketKey][marketIndex] = updatedMarket;
            return updatedMarkets;
        });
    };

    const columnInitials = [
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
            style: { width: "20%" }, // Reduced width
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
            title: "Runner",
            key: "runner",
            render: (text, record, onChange) => (
                <Input
                    className="form-control small-text-fields"
                    type="text"
                    value={record.runner || ""}
                    onChange={(e) => onChange("runner", e.target.value)}
                    placeholder="Runner Name"
                />
            ),
            style: { width: "15%" },
        },
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
            style: { width: "10%" },
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
            style: { width: "10%" },
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
            style: { width: "10%" },
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
            style: { width: "10%" },
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
            style: { width: "10%" },
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
            style: { width: "10%" },
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
            style: { width: "10%" },
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
