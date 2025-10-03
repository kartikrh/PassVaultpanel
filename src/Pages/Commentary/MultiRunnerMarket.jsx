import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import CustomInput from "../../components/Common/Reusables/CustomInput";
import { getStatusColor, getStatusFontColor, OPEN_MARKET_STATUS } from "./CommentartConst";
import "./CommentaryCss.css";
import { generateOverUnderLineType, getDynamicStep, roundToDynamicStep } from "./functions";
import axiosInstance from "../../Features/axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

const MultiRunnerMarket = ({ market, onUpdate, teams, handleSingleAction, loadingTrue, loadingFalse, dismisalRoundOff }) => {
    const [localMarket, setLocalMarket] = useState(market);
    const [lockedRunners, setLockedRunners] = useState(new Set());
    const dispatch = useDispatch();
    const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);

    useEffect(() => {
        setLocalMarket(market);
    }, [market]);

    const toggleRunnerLock = (runnerId) => {
        setLockedRunners(prev => {
            const newSet = new Set(prev);
            if (newSet.has(runnerId)) {
                newSet.delete(runnerId);
            } else {
                newSet.add(runnerId);
            }
            return newSet;
        });
    };

    const handleMarketValueChange = (key, value) => {
        let updatedMarket = {
            ...localMarket,
            [key]: value
        };

        if (key === 'margin') {
            updatedMarket.runner = updatedMarket.runner.map(runner =>
                generateOverUnderLineType({ ...runner, margin: parseFloat(value), lineType: updatedMarket?.lineType, marketTypeId: updatedMarket?.marketTypeId, rateDiff: updatedMarket?.rateDiff }, marketTypeObj)
            );
        } else if (key === 'rateDiff') {
            updatedMarket.runner = updatedMarket.runner.map(runner =>
                generateOverUnderLineType({ ...runner, margin: updatedMarket?.margin, lineType: updatedMarket?.lineType, marketTypeId: updatedMarket?.marketTypeId, rateDiff: parseFloat(value) }, marketTypeObj)
            );
        }

        // Synchronize status across all runners when market status changes
        if (key === 'status') {
            updatedMarket.runner = updatedMarket.runner.map(runner => ({
                ...runner,
                status: value
            }));
        }

        setLocalMarket(updatedMarket);
        onUpdate(updatedMarket);
    };

    const handleRunnerValueChange = (runnerId, key, value) => {
        // Handle dismissal wicket markets (marketTypeCategoryId === 27) with formula
        if (localMarket.marketTypeCategoryId === 27 && key === 'line') {
            const changedRunnerIndex = localMarket.runner.findIndex(runner => runner.runnerId === runnerId);

            if (changedRunnerIndex !== -1) {
                const oldLine = parseFloat(localMarket.runner[changedRunnerIndex].line);
                const newLine = parseFloat(value);

                // Convert to percentages
                const oldPercentage = 1 / oldLine;
                const newPercentage = 1 / newLine;
                const deltaPercentage = newPercentage - oldPercentage;

                // Get all other runners (excluding the changed runner) that are unlocked
                const otherUnlockedRunners = localMarket.runner.filter((runner, index) =>
                    index !== changedRunnerIndex && !lockedRunners.has(runner.runnerId)
                );

                if (otherUnlockedRunners.length > 0 && Math.abs(deltaPercentage) > 0.0001) {
                    // Calculate current percentages of other unlocked runners
                    const otherUnlockedPercentages = otherUnlockedRunners.map(runner => ({
                        runner,
                        percentage: 1 / parseFloat(runner.line)
                    }));

                    const sumOfOtherPercentages = otherUnlockedPercentages.reduce((sum, item) => sum + item.percentage, 0);

                    if (sumOfOtherPercentages > 0) {
                        const updatedMarket = {
                            ...localMarket,
                            runner: localMarket.runner.map((runner, index) => {
                                if (index === changedRunnerIndex) {
                                    return { ...runner, line: newLine, backPrice: newLine };
                                } else if (!lockedRunners.has(runner.runnerId)) {
                                    // Find this runner's current percentage
                                    const currentPercentage = 1 / parseFloat(runner.line);
                                    const proportion = currentPercentage / sumOfOtherPercentages;

                                    // Distribute the delta percentage proportionally (subtract to compensate)
                                    const newRunnerPercentage = Math.max(0.001, currentPercentage - (deltaPercentage * proportion));

                                    // Convert back to odds (line)
                                    const newRunnerLine = dismisalRoundOff ? roundToDynamicStep(1 / newRunnerPercentage): 1 / newRunnerPercentage;

                                    return {
                                        ...runner,
                                        line: parseFloat(newRunnerLine.toFixed(2)),
                                        backPrice: parseFloat(newRunnerLine.toFixed(2))
                                    };
                                }
                                return runner; // Keep locked runners unchanged
                            })
                        };

                        setLocalMarket(updatedMarket);
                        onUpdate(updatedMarket);
                        return;
                    }
                }
            }
        }

        // Handle all other markets (original logic)
        const updatedMarket = {
            ...localMarket,
            runner: localMarket.runner.map(runner => {
                if (runner.runnerId === runnerId) {
                    let updatedRunner = { ...runner, [key]: value };
                    if (key === 'line') {
                        updatedRunner = generateOverUnderLineType({
                            ...updatedRunner,
                            margin: localMarket.margin,
                            lineType: localMarket?.lineType,
                            marketTypeId: localMarket?.marketTypeId,
                            rateDiff: localMarket?.rateDiff,
                        }, marketTypeObj);
                    }
                    return updatedRunner;
                }
                return runner;
            })
        };

        setLocalMarket(updatedMarket);
        onUpdate(updatedMarket);
    };

    const handleSave = async () => {
        loadingTrue();
        try {
            const response = await axiosInstance.post("/admin/eventMarket/updateMarketRateV1", {
                eventMarket: [localMarket],
                action: "SAVE_ALL",
            });
            if (response.success) {
                onUpdate(localMarket);
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            }
        } catch (error) {
            console.error("Error saving market:", error);
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            loadingFalse();
        }
    };

    const handleAction = async (key, value) => {
        loadingTrue();
        try {
            const response = await axiosInstance.post("/admin/eventMarket/updateMarketRateV1", {
                eventMarket: [{ ...localMarket, [key]: value }],
                action: key.toUpperCase()
            });
            if (response.success) {
                handleMarketValueChange(key, value);
                dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
            }
        } catch (error) {
            console.error(`Error updating ${key}:`, error);
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            loadingFalse();
        }
    };

    // Sort runners based on runnerId
    const sortedRunners = [...localMarket.runner].sort((a, b) => a.runnerId - b.runnerId);
    const isDismissalWicket = localMarket.marketTypeCategoryId === 27;

    return (
        <div className="multi-runner-market">
            <table className="table table-bordered table-sm open-market-table-class m-0 color-white">
                <thead className='whitespace-nowrap color-light-grey'>
                    <tr>
                        <th>Team</th>
                        <th>Market ID</th>
                        <th>Status</th>
                        <th>Active</th>
                        <th>Allow</th>
                        <th>Is Send</th>
                        <th>L-Ratio</th>
                        <th>Save</th>
                        <th>Margin</th>
                        <th>Rate Diff</th>
                    </tr>
                </thead>
                <tbody className='whitespace-nowrap'>
                    <tr style={{ backgroundColor: getStatusColor(localMarket.status) }}>
                        <td style={{ color: getStatusFontColor(localMarket.status) }}>{teams[localMarket.teamId]} <div>Innings {localMarket.inningsId}</div></td>
                        <td style={{ color: getStatusFontColor(localMarket.status) }}>{`${localMarket.marketId} - ${localMarket.marketName}`}</td>
                        <td>
                            <select
                                className="form-control small-text-fields"
                                value={localMarket.status}
                                onChange={(e) => handleMarketValueChange("status", +e.target.value)}
                            >
                                {Object.entries(OPEN_MARKET_STATUS).map(([key, value]) =>
                                    <option key={key} value={key}>{value}</option>
                                )}
                            </select>
                        </td>
                        <td>
                            <Button
                                color={localMarket.isActive ? "primary" : "danger"}
                                size="sm"
                                className="btn"
                                onClick={() => handleMarketValueChange("isActive", !localMarket.isActive)}
                            >
                                <i className={`bx ${localMarket.isActive ? "bx-check" : "bx-block"}`}></i>
                            </Button>
                        </td>
                        <td>
                            <Button
                                color={localMarket.isAllow ? "primary" : "danger"}
                                size="sm"
                                className="btn"
                                onClick={() => handleMarketValueChange("isAllow", !localMarket.isAllow)}
                            >
                                <i className={`bx ${localMarket.isAllow ? "bx-check" : "bx-block"}`}></i>
                            </Button>
                        </td>
                        <td>
                            <Button
                                color={localMarket.isSendData ? "primary" : "danger"}
                                size="sm"
                                className="btn"
                                onClick={() => handleAction("isSendData", !localMarket.isSendData)}
                            >
                                <i className={`bx ${localMarket.isSendData ? "bx-check" : "bx-block"}`}></i>
                            </Button>
                        </td>
                        <td>
                            <CustomInput
                                className="form-control small-text-fields"
                                value={localMarket.lineRatio}
                                steps={getDynamicStep(localMarket.lineRatio)}
                                onChange={(newValue) => handleMarketValueChange("lineRatio", newValue)}

                            />
                        </td>
                        <td>
                            <Button color="primary" className="small-button" onClick={handleSave}>Save</Button>
                        </td>
                        <td>
                            <CustomInput
                                className="form-control small-text-fields"
                                value={localMarket?.margin === null ? "" : localMarket.margin}
                                onChange={(newValue) => handleMarketValueChange("margin", newValue)}
                                steps={getDynamicStep(localMarket.margin)}

                            />
                        </td>
                        <td>
                            <CustomInput
                                className="form-control small-text-fields"
                                value={localMarket?.rateDiff === null ? "" : localMarket.rateDiff}
                                onChange={(newValue) => handleMarketValueChange("rateDiff", newValue)}
                                steps={getDynamicStep(localMarket.rateDiff)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="table table-bordered table-sm open-market-table-class m-0 color-white">
                <thead className='whitespace-nowrap color-light-grey'>
                    <tr>
                        <th>Runner</th>
                        {isDismissalWicket && <th>Lock</th>}
                        <th>Status</th>
                        <th>Line</th>
                        <th>R-R</th>
                        <th>R-No</th>
                        <th>R-Yes</th>
                        <th>Under</th>
                        <th>Over</th>
                        <th>P-No</th>
                        <th>P-Yes</th>
                    </tr>
                </thead>
                <tbody className='whitespace-nowrap'>
                    {sortedRunners.map((runner, index) => (
                        <tr key={runner.runnerId} style={{ backgroundColor: getStatusColor(runner.status) }}>
                            <td style={{ color: getStatusFontColor(localMarket.status) }}>{teams[runner.teamId] || `${runner.runnerId} - ${runner.runnerName}`}</td>
                            {isDismissalWicket && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={lockedRunners.has(runner.runnerId)}
                                        onChange={() => toggleRunnerLock(runner.runnerId)}
                                    />
                                </td>
                            )}
                            <td>
                                <select
                                    className="form-control small-text-fields"
                                    value={runner.status}
                                    onChange={(e) => handleRunnerValueChange(runner.runnerId, "status", +e.target.value)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                >
                                    {Object.entries(OPEN_MARKET_STATUS).map(([key, value]) =>
                                        <option key={key} value={key}>{value}</option>
                                    )}
                                </select>
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-line-field"
                                    value={runner?.line === null ? "" : runner.line}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "line", newValue)}
                                    steps={getDynamicStep(runner?.line)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                            <td style={{ color: getStatusFontColor(localMarket.status) }}>
                                <span>{`${(+runner.line / +localMarket.over)?.toFixed(2)}`}</span>
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-no-field"
                                    value={runner?.layPrice === null ? "" : runner.layPrice}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "layPrice", newValue)}
                                    steps={getDynamicStep(runner.layPrice)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-yes-field"
                                    value={runner?.backPrice === null ? "" : runner.backPrice}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "backPrice", newValue)}
                                    steps={getDynamicStep(runner?.backPrice)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-under-field"
                                    value={runner?.underRate === null ? "" : runner.underRate}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "underRate", newValue)}
                                    steps={getDynamicStep(runner.underRate)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-over-field"
                                    value={runner?.overRate === null ? "" : runner.overRate}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "overRate", newValue)}
                                    steps={getDynamicStep(runner.overRate)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-no-field"
                                    value={runner?.laySize === null ? "" : runner.laySize}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "laySize", newValue)}
                                    steps={getDynamicStep(runner.laySize)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-yes-field"
                                    value={runner?.backSize === null ? "" : runner.backSize}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "backSize", newValue)}
                                    steps={getDynamicStep(runner.backSize)}
                                    disabled={isDismissalWicket && lockedRunners.has(runner.runnerId)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MultiRunnerMarket;