import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import CustomInput from "../../components/Common/Reusables/CustomInput";
import { getStatusColor, getStatusFontColor, OPEN_MARKET_STATUS } from "./CommentartConst";
import "./CommentaryCss.css";
import { generateOverUnderLineType } from "./functions";
import axiosInstance from "../../Features/axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateToastData } from '../../Features/toasterSlice';
import { ERROR, SUCCESS } from '../../components/Common/Const';

const MultiRunnerMarket = ({ market, onUpdate, teams, handleSingleAction, loadingTrue, loadingFalse }) => {
    const [localMarket, setLocalMarket] = useState(market);
    const dispatch = useDispatch();
    const marketTypeObj = useSelector((state) => state.marketType?.marketTypeList);

    useEffect(() => {
        setLocalMarket(market);
    }, [market]);

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
                const deltaP = newLine - oldLine;

                // Calculate sum of other runners' line values
                const sumOfOthers = localMarket.runner.reduce((sum, runner, index) => {
                    return index !== changedRunnerIndex ? sum + parseFloat(runner.line) : sum;
                }, 0);

                if (sumOfOthers > 0 && Math.abs(deltaP) > 0.001) {
                    // Apply dismissal wicket formula: Pnew = Pold + (ΔP × Pold / ∑Pothers)
                    const updatedMarket = {
                        ...localMarket,
                        runner: localMarket.runner.map((runner, index) => {
                            if (index === changedRunnerIndex) {
                                // Update the changed runner
                                return {
                                    ...runner,
                                    line: newLine,
                                    backPrice: newLine
                                };
                            } else {
                                // Apply formula to other runners
                                const oldRunnerLine = parseFloat(runner.line);
                                const newRunnerLine = oldRunnerLine - (deltaP * oldRunnerLine / sumOfOthers);

                                return {
                                    ...runner,
                                    line: parseFloat(newRunnerLine.toFixed(2)),
                                    backPrice: parseFloat(newRunnerLine.toFixed(2))
                                };
                            }
                        })
                    };

                    setLocalMarket(updatedMarket);
                    onUpdate(updatedMarket);
                    return;
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
                            margin: localMarket.margin, // Use market-level margin
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
            const response = await axiosInstance.post("/admin/eventMarket/updateMarketRate", {
                eventMarket: [localMarket]
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
            const response = await axiosInstance.post("/admin/eventMarket/updateMarketRate", {
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
                            />
                        </td>
                        <td>
                            <CustomInput
                                className="form-control small-text-fields"
                                value={localMarket?.rateDiff === null ? "" : localMarket.rateDiff}
                                onChange={(newValue) => handleMarketValueChange("rateDiff", newValue)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="table table-bordered table-sm open-market-table-class m-0 color-white">
                <thead className='whitespace-nowrap color-light-grey'>
                    <tr>
                        <th>Runner</th>
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
                            <td>
                                <select
                                    className="form-control small-text-fields"
                                    value={runner.status}
                                    onChange={(e) => handleRunnerValueChange(runner.runnerId, "status", +e.target.value)}
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
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-yes-field"
                                    value={runner?.backPrice === null ? "" : runner.backPrice}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "backPrice", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-under-field"
                                    value={runner?.underRate === null ? "" : runner.underRate}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "underRate", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-over-field"
                                    value={runner?.overRate === null ? "" : runner.overRate}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "overRate", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-no-field"
                                    value={runner?.laySize === null ? "" : runner.laySize}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "laySize", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-yes-field"
                                    value={runner?.backSize === null ? "" : runner.backSize}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "backSize", newValue)}
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