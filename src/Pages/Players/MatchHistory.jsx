import React, { useEffect, useState } from "react";
import axiosInstance from "../../Features/axios";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  CardHeader,
  Table,
  Input,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR, SUCCESS, TAB_PLAYER_EVENT_HISTORY } from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";

const MatchHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIndexforBowl, setEditingIndexforBowl] = useState(null);
  document.title = TAB_PLAYER_EVENT_HISTORY;
  const [battingHistory, setBattingHistory] = useState([]);
  const [bowlingHistory, setBowlingHistory] = useState([]);
  const playerId = +sessionStorage.getItem("playerId") || "0";
  const playerDetails = JSON.parse(
    sessionStorage.getItem("playerDetails") || "{}"
  );
  const matchTypeId = +sessionStorage.getItem("matchHistoryId") || "0";
  const matchTypeDetails = JSON.parse(
    sessionStorage.getItem("matchHistoryDetails") || "{}"
  );
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchPlayerBatHistory = async (playerId, matchTypeId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/playerHistory/getPlayerBatHist", {
        playerId,
        matchTypeId,
      })
      .then((response) => {
        if (response?.result) {
          setBattingHistory(
            response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId)
          );
          setIsLoading(false);
        }
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };

  const fetchPlayerBallHistory = async (playerId, matchTypeId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/playerHistory/getPlayerBallHist", {
        playerId,
        matchTypeId,
      })
      .then((response) => {
        if (response?.result) {
          setBowlingHistory(
            response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId)
          );
          setIsLoading(false);
        }
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };

  const handleBackClick = () => {
    navigate("/playerHistory");
  };

  useEffect(() => {
    if (playerId !== "0" && matchTypeId !== "0") {
      fetchPlayerBatHistory(playerId, matchTypeId);
      fetchPlayerBallHistory(playerId, matchTypeId);
    }
  }, [playerId, matchTypeId]);

  const battingColumns = [
    {
      title: "Event",
      dataIndex: "eventName",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record) => (<Input
        className="form-control medium-text-fields"
        disabled
        type="text"
        value={text ? text : "-"}
      />),
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        // <span style={{ cursor: "pointer" }}>
        //   {text ? convertDateUTCToLocal(text, "index") : "-"}
        // </span>
        <Input
          className="form-control medium-text-fields"
          disabled
          type="text"
          value={text ? convertDateUTCToLocal(text, "index") : "-"}
        />
      ),
      key: "eventDate",
      style: { width: "15%" },
      sort: true,
    },
    {
      title: "Mat",
      dataIndex: "matchCount",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            // disabled = "true"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "matchCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.matchCount}</span>
        </>
      ),
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      key: "matchCount",
      style: { width: "3%" },
    },
    {
      title: "Inns",
      dataIndex: "inningsCount",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "inningsCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.inningsCount}</span>
        </>
      ),
      key: "inningsCount",
      style: { width: "3%" },
    },
    {
      title: "NO",
      dataIndex: "notOut",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "notOut", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.notOut}</span>
        </>
      ),
      key: "notOut",
      style: { width: "3%" },
    },
    {
      title: "Runs",
      dataIndex: "totalRuns",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "totalRuns", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalRuns}</span>
        </>
      ),
      key: "totalRuns",
      style: { width: "3%" },
    },
    {
      title: "OC",
      dataIndex: "outCount",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "outCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.outCount}</span>
        </>
      ),
      key: "outCount",
      style: { width: "3%" },
    },
    {
      title: "HS",
      dataIndex: "highestScore",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "highestScore", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.highestScore}</span>
        </>
      ),
      key: "highestScore",
      style: { width: "3%" },
    },
    {
      title: "Ave",
      dataIndex: "average",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            // disabled={editingIndex !== index}
            disabled
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : '-'}
            onChange={(e) =>
              handleBattingValueChange(index, "average", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.average}</span>
        </>
      ),
      key: "average",
      style: { width: "3%" },
    },
    {
      title: "BF",
      dataIndex: "ballsFacedCount",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "ballsFacedCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.ballsFacedCount}</span>
        </>
      ),
      key: "ballsFacedCount",
      style: { width: "3%" },
    },
    {
      title: "SR",
      dataIndex: "strikeRate",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "strikeRate", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.strikeRate}</span>
        </>
      ),
      key: "strikeRate",
      style: { width: "3%" },
    },
    {
      title: "100s",
      dataIndex: "countOf100",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf100", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf100}</span>
        </>
      ),
      key: "countOf100",
      style: { width: "3%" },
    },
    {
      title: "50s",
      dataIndex: "countOf50",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf50", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf50}</span>
        </>
      ),
      key: "countOf50",
      style: { width: "3%" },
    },
    {
      title: "4s",
      dataIndex: "countOf4",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf4", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf4}</span>
        </>
      ),
      key: "countOf4",
      style: { width: "3%" },
    },
    {
      title: "6s",
      dataIndex: "countOf6",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf6", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf6}</span>
        </>
      ),
      key: "countOf6",
      style: { width: "3%" },
    },
    {
      title: "Ct",
      dataIndex: "catchCount",
      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndex !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "catchCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.catchCount}</span>
        </>
      ),
      key: "catchCount",
      style: { width: "3%" },
    },
    {
      title: "St",
      dataIndex: "stumpCount",

      // render: (text, record) => <span>{text ? text : "-"}</span>,
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            disabled={editingIndex !== index}
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "stumpCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.stumpCount}</span>
        </>
      ),
      key: "stumpCount",
      style: { width: "3%" },
    },
    {
      title: "",
      dataIndex: "",
      render: (text, record, ind) => (
        <Button
          color={"primary"}
          size="sm"
          className="btn"
          onClick={() => {
            console.log(text, record, ind);
            if (editingIndex === ind) {
              // If already editing, save the data
              handleBattingSave(record);
              setEditingIndex(null); // Reset editing index
            } else {
              // Otherwise, set the current index as editing
              setEditingIndex(ind);
            }
          }}
        >
          {/* {isEdit ? "Update" : "Edit"} */}
          {editingIndex === ind ? "Update" : "Edit"}
        </Button>
      ),
      key: "",
      style: { width: "5%" },
    },
  ];

  const bowlingColumns = [
    {
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => (<Input
        className="form-control medium-text-fields"
        disabled
        type="text"
        value={text ? text : "-"}
      />),
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Date",
      dataIndex: "eventDate",
      render: (text, record) => (
        <Input
          className="form-control medium-text-fields"
          disabled
          type="text"
          value={text ? convertDateUTCToLocal(text, "index") : "-"}
        />
      ),
      key: "eventDate",
      style: { width: "15%" },
      sort: true,
    },
    {
      title: "Mat",
      dataIndex: "bowlerPlayedMatchCount",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "bowlerPlayedMatchCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.bowlerPlayedMatchCount}</span>
        </>
      ),
      key: "bowlerPlayedMatchCount",
      style: { width: "3%" },
    },
    {
      title: "Inns",
      dataIndex: "bowlerPlayedInningsCount",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "bowlerPlayedInningsCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.bowlerPlayedInningsCount}</span>
        </>
      ),
      key: "bowlerPlayedInningsCount",
      style: { width: "5%" },
    },
    {
      title: "Balls",
      dataIndex: "ballCount",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "ballCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.ballCount}</span>
        </>
      ),
      key: "ballCount",
      style: { width: "5%" },
    },
    {
      title: "Runs",
      dataIndex: "runsFromBowler",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "runsFromBowler", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.balrunsFromBowlerlCount}</span>
        </>
      ),
      key: "runsFromBowler",
      style: { width: "5%" },
    },
    {
      title: "Wkts",
      dataIndex: "wicketsCount",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "wicketsCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.wicketsCount}</span>
        </>
      ),
      key: "wicketsCount",
      style: { width: "5%" },
    },
    {
      title: "BBI",
      dataIndex: "bestBowlingInInnings",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "bestBowlingInInnings", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.bestBowlingInInnings}</span>
        </>
      ),
      key: "bestBowlingInInnings",
      style: { width: "5%" },
    },
    {
      title: "BBM",
      dataIndex: "bestBowlingInMatch",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "bestBowlingInMatch", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.bestBowlingInMatch}</span>
        </>
      ),
      key: "bestBowlingInMatch",
      style: { width: "5%" },
    },
    {
      title: "Ave",
      dataIndex: "bowlerAverage",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "bowlerAverage", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.bowlerAverage}</span>
        </>
      ),
      key: "bowlerAverage",
      style: { width: "5%" },
    },
    {
      title: "Econ",
      dataIndex: "economy",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "economy", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.economy}</span>
        </>
      ),
      key: "economy",
      style: { width: "5%" },
    },
    {
      title: "SR",
      dataIndex: "bowlerStrikeRate",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "bowlerStrikeRate", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.bowlerStrikeRate}</span>
        </>
      ),
      key: "bowlerStrikeRate",
      style: { width: "5%" },
    },
    {
      title: "4w",
      dataIndex: "wickets4",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "wickets4", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.wickets4}</span>
        </>
      ),
      key: "wickets4",
      style: { width: "5%" },
    },
    {
      title: "5w",
      dataIndex: "wickets5",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "wickets5", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.wickets5}</span>
        </>
      ),
      key: "wickets5",
      style: { width: "5%" },
    },
    {
      title: "10w",
      dataIndex: "wickets10",
      render: (text, record, index) => (
        <>
          <Input
            disabled={editingIndexforBowl !== index}
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "wickets10", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.wickets10}</span>
        </>
      ),
      key: "wickets10",
      style: { width: "5%" },
    },
    {
      title: "",
      dataIndex: "",
      render: (text, record, ind) => (
        <Button
          color={"primary"}
          size="sm"
          className="btn"
          onClick={() => {
            console.log(text, record, ind);
            if (editingIndexforBowl === ind) {
              // If already editing, save the data
              handleBowlingSave(record);
              setEditingIndexforBowl(null); // Reset editing index
            } else {
              // Otherwise, set the current index as editing
              setEditingIndexforBowl(ind);
            }
          }}
        >
          {/* {isEdit ? "Update" : "Edit"} */}
          {editingIndexforBowl === ind ? "Update" : "Edit"}
        </Button>
      ),
      key: "",
      style: { width: "5%" },
    },
  ];

  const renderMainSections = () => {
    return (
      <>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 font-size-16 font-bold">
              Batting Career Summary
            </h5>
          </CardHeader>
          <CardBody className="p-1">
            <Table responsive>
              <thead>
                <tr>
                  {battingColumns.map((column, index) => (
                    <th className="px-2 py-0" key={index} style={column.style}>
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {battingHistory.length > 0 &&
                  battingHistory.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        {battingColumns.map((column, colIndex) => (
                          <td className="p-2" key={colIndex}>
                            {column.render
                              ? column.render(
                                item[column.dataIndex],
                                item,
                                index
                              )
                              : item[column.dataIndex]}
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </Table>
            {!battingHistory.length > 0 && (
              <div className="d-flex justify-content-center">
                <span style={{ color: "lightgray" }}>No Data Available</span>
              </div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 font-size-16">Bowling Career Summary</h5>
          </CardHeader>
          <CardBody className="p-1">
            <Table responsive>
              <thead>
                <tr>
                  {bowlingColumns.map((column, index) => (
                    <th className="px-2 py-0" key={index} style={column.style}>
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bowlingHistory.length > 0 &&
                  bowlingHistory.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        {bowlingColumns.map((column, colIndex) => (
                          <td className="p-2" key={colIndex}>
                            {column.render
                              ? column.render(
                                item[column.dataIndex],
                                item,
                                index
                              )
                              : item[column.dataIndex]}
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </Table>
            {!bowlingHistory.length > 0 && (
              <div className="d-flex justify-content-center">
                <span style={{ color: "lightgray" }}>No Data Available</span>
              </div>
            )}
          </CardBody>
        </Card>
      </>
    );
  };

  const handleBattingValueChange = (index, key, value) => {
    const regex = /^\d*\.?\d*$/; // Only allow numbers and one optional decimal point

    if (regex.test(value)) {
      setBattingHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        if (index !== -1) {
          updatedHistory[index][key] = value;

          // Calculate average if key is 'outCount' or 'totalRuns'
          if (key === 'outCount' || key === 'totalRuns') {
            const batRun = Number(updatedHistory[index].totalRuns) || 0;
            const batOutCount = Number(updatedHistory[index].outCount) || 0;
            updatedHistory[index].average = batOutCount !== 0 ? batRun / batOutCount : batRun;
          }

          // Calculate strike rate if key is 'ballsFacedCount' or 'totalRuns'
          if (key === 'ballsFacedCount' || key === 'totalRuns') {
            const batRun = Number(updatedHistory[index].totalRuns) || 0;
            const ballsFacedCount = Number(updatedHistory[index].ballsFacedCount) || 0;
            updatedHistory[index].strikeRate = ballsFacedCount !== 0 ? (batRun / ballsFacedCount) * 100 : 0;
          }
        }
        return updatedHistory;
      });
    }
  };

  const handleBowlingValueChange = (index, key, value) => {
    const regex = /^\d*\.?\d*$/; // Only allow numbers and one optional decimal point
  
    if (regex.test(value)) {
      setBowlingHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        if (index !== -1) {
          updatedHistory[index][key] = value;
          // updatedHistory[index].selected = true; // Uncomment if needed
        }
        return updatedHistory;
      });
    }
  };
  
  const handleBattingSave = async (obj) => {
    const payload = {
      id: Number(obj.id),
      matchTypeId: Number(obj.matchTypeId),
      matchCount: Number(obj.matchCount),
      inningsCount: Number(obj.inningsCount),
      notOut: Number(obj.notOut),
      totalRuns: Number(obj.totalRuns),
      highestScore: obj.highestScore, // Keeping this as string
      average: Number(obj.average),
      ballsFacedCount: Number(obj.ballsFacedCount),
      strikeRate: Number(obj.strikeRate),
      countOf100: Number(obj.countOf100),
      countOf50: Number(obj.countOf50),
      countOf4: Number(obj.countOf4),
      countOf6: Number(obj.countOf6),
      catchCount: Number(obj.catchCount),
      stumpCount: Number(obj.stumpCount),
      outCount: Number(obj.outCount),
    };

    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/upPlayerBatHist",
        payload
      );

      fetchPlayerBatHistory(playerId, matchTypeId);

      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };
  const handleBowlingSave = async (obj) => {
    const payload = {
      id: Number(obj.id),
      matchTypeId: Number(obj.matchTypeId),
      playerId: Number(obj.playerId),
      commentaryId: Number(obj.commentaryId),
      commentaryPlayerId: Number(obj.commentaryPlayerId),
      bowlerPlayedMatchCount: Number(obj.bowlerPlayedMatchCount),
      bowlerPlayedInningsCount: Number(obj.bowlerPlayedInningsCount),
      ballCount: Number(obj.ballCount),
      runsFromBowler: Number(obj.runsFromBowler),
      wicketsCount: Number(obj.wicketsCount),
      bowlerAverage: Number(obj.bowlerAverage),
      bestBowlingInInnings: obj.bestBowlingInInnings,
      bestBowlingInMatch: obj.bestBowlingInMatch,
      economy: Number(obj.economy),
      bowlerStrikeRate: Number(obj.bowlerStrikeRate),
      wickets4: Number(obj.wickets4),
      wickets5: Number(obj.wickets5),
    };

    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/upPlayerBallHist",
        payload
      );

      fetchPlayerBallHistory(obj.playerId, obj.matchTypeId);
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            <Card>
              <CardBody className="p-1">
                {isLoading && <SpinnerModel />}
                <Row className="mt-3 mt-lg-3 mt-md-3 mb-3">
                  {playerDetails && (
                    <Col className="col-sm-auto d-flex align-items-center">
                      {playerDetails?.image ? (
                        <img
                          className="avatar-md rounded-circle"
                          alt=""
                          src={playerDetails?.image}
                        />
                      ) : (
                        <Avatar src="#" alt="ET">
                          Image
                        </Avatar>
                      )}
                      <div className="d-flex flex-column">
                        <h5 className="mx-2 mb-0">{`${playerDetails?.playerName} History`}</h5>
                        <span className="mx-2">
                          {playerDetails?.playerType}
                        </span>
                        <span className="mx-2">
                          {matchTypeDetails?.matchTypeName}
                        </span>
                      </div>
                    </Col>
                  )}
                  <Col className="float-right">
                    <Button
                      className="btn btn-danger text-right mx-2"
                      onClick={handleBackClick}
                    >
                      {" "}
                      Back{" "}
                    </Button>
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

export default MatchHistory;
