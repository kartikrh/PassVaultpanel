import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import CustomInput from "../../components/Common/Reusables/CustomInput";
import { MARKET_STATUS } from "./CommentartConst";
import "./CommentaryCss.css";
import { generateOverUnder } from "./functions";

const MultiRunnerMarket = ({ market, onUpdate, teams }) => {
    const [localMarket, setLocalMarket] = useState(market);

    useEffect(() => {
        setLocalMarket(market);
    }, [market]);

    const handleMarketValueChange = (key, value) => {
        let updatedMarket = {
            ...localMarket,
            [key]: value
        };

        if (key === 'line' || key === 'margin') {
            updatedMarket = generateOverUnder(updatedMarket);
        }

        setLocalMarket(updatedMarket);
        onUpdate(updatedMarket);
    };

    const handleRunnerValueChange = (runnerId, key, value) => {
        const updatedMarket = {
            ...localMarket,
            runner: localMarket.runner.map(runner => {
                if (runner.runnerId === runnerId) {
                    let updatedRunner = { ...runner, [key]: value };
                    if (key === 'line') {
                        updatedRunner = generateOverUnder(updatedRunner);
                    }
                    return updatedRunner;
                }
                return runner;
            })
        };

        setLocalMarket(updatedMarket);
        onUpdate(updatedMarket);
    };

    const handleSave = () => {
        onUpdate(localMarket);
    };

    const handleSingleAction = (key, value) => {
        handleMarketValueChange(key, value);
    };

    return (
        <div className="multi-runner-market table color-white">
            <table className="table table-bordered table-sm open-market-table-class m-0">
                <thead>
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
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{teams[localMarket.teamId]}<div>Innings {localMarket.inningsId}</div></td>
                        <td>{`${localMarket.marketId} - ${localMarket.marketName}`}</td>
                        <td>
                            <select
                                className="form-control small-text-fields"
                                value={localMarket.status}
                                onChange={(e) => handleMarketValueChange("status", +e.target.value)}
                            >
                                {Object.entries(MARKET_STATUS).map(([key, value]) =>
                                    <option key={key} value={key}>{value}</option>
                                )}
                            </select>
                        </td>
                        <td>
                            <Button
                                color={localMarket.isActive ? "primary" : "danger"}
                                size="sm"
                                className="btn"
                                onClick={() => handleSingleAction("isActive", !localMarket.isActive)}
                            >
                                <i className={`bx ${localMarket.isActive ? "bx-check" : "bx-block"}`}></i>
                            </Button>
                        </td>
                        <td>
                            <Button
                                color={localMarket.isAllow ? "primary" : "danger"}
                                size="sm"
                                className="btn"
                                onClick={() => handleSingleAction("isAllow", !localMarket.isAllow)}
                            >
                                <i className={`bx ${localMarket.isAllow ? "bx-check" : "bx-block"}`}></i>
                            </Button>
                        </td>
                        <td>
                            <Button
                                color={localMarket.isSendData ? "primary" : "danger"}
                                size="sm"
                                className="btn"
                                onClick={() => handleSingleAction("isSendData", !localMarket.isSendData)}
                            >
                                <i className={`bx ${localMarket.isSendData ? "bx-check" : "bx-block"}`}></i>
                            </Button>
                        </td>
                        <td>
                            <CustomInput
                                className="form-control small-text-fields"
                                value={localMarket.lineRatio || ""}
                                onChange={(newValue) => handleMarketValueChange("lineRatio", newValue)}
                            />
                        </td>
                        <td>
                            <Button color="primary" className="small-button" onClick={handleSave}>Save</Button>
                        </td>
                        <td>
                            <CustomInput
                                className="form-control small-text-fields"
                                value={localMarket.margin || ""}
                                onChange={(newValue) => handleMarketValueChange("margin", newValue)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="table table-bordered table-sm open-market-table-class m-0">
                <thead>
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
                <tbody>
                    {localMarket.runner.map((runner, index) => (
                        <tr key={runner.runnerId}>
                            <td>{teams[runner.teamId] || `Runner ${runner.runnerId}`}</td>
                            <td>
                                <select
                                    className="form-control small-text-fields"
                                    value={runner.status}
                                    onChange={(e) => handleRunnerValueChange(runner.runnerId, "status", +e.target.value)}
                                >
                                    {Object.entries(MARKET_STATUS).map(([key, value]) =>
                                        <option key={key} value={key}>{value}</option>
                                    )}
                                </select>
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-line-field"
                                    value={runner.line || ""}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "line", newValue)}
                                />
                            </td>
                            <td>
                                <span>{`${(+runner.line / +localMarket.over)?.toFixed(2) || 0}`}</span>
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-no-field"
                                    value={runner.layPrice || ""}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "layPrice", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-yes-field"
                                    value={runner.backPrice || ""}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "backPrice", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-under-field"
                                    value={runner.underRate || ""}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "underRate", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-over-field"
                                    value={runner.overRate || ""}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "overRate", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-no-field"
                                    value={runner.laySize || ""}
                                    onChange={(newValue) => handleRunnerValueChange(runner.runnerId, "laySize", newValue)}
                                />
                            </td>
                            <td>
                                <CustomInput
                                    className="form-control small-text-fields input-yes-field"
                                    value={runner.backSize || ""}
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