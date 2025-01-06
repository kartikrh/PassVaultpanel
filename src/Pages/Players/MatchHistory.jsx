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
import {
  ERROR,
  SUCCESS,
  TAB_PLAYER_EVENT_HISTORY,
} from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import { convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import DeletePlayerEventHistoryModel from "../../components/Model/DeletePlayerEventHistoryModel";

const MatchHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  document.title = TAB_PLAYER_EVENT_HISTORY;
  const [battingHistory, setBattingHistory] = useState([]);
  const [bowlingHistory, setBowlingHistory] = useState([]);
  const [deleteBattingModelVisable, setDeleteBattingModelVisable] =
    useState(false);
  const [deleteBattingData, setDeleteBattingData] = useState({});
  const [deleteBowlingModelVisable, setDeleteBowlingModelVisable] =
    useState(false);
  const [deleteBowlingData, setDeleteBowlingData] = useState({});
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

  const handleBattingRecalculator = async () => {
    const payload = {
      "playerId": playerId,
      "matchTypeId": [matchTypeId]
    }
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/admin/playerHistory/batSummary", payload);
      if (response?.result) {
        setIsLoading(false)
        dispatch(
          updateToastData({
            data: "Batting history recalculated successfully",
            title: "Success",
            type: SUCCESS,
          })
        );
        fetchPlayerBatHistory(playerId, matchTypeId);
      }
    } catch (error) {
      setIsLoading(false)
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  }
  const handleBowlingRecalculator = async () => {

    const payload = {
      "playerId": playerId,
      "matchTypeId": [matchTypeId]
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/admin/playerHistory/bowlSummary", payload);
      if (response?.result) {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: "Bowling history recalculated successfully",
            title: "Success",
            type: SUCCESS,
          })
        );
        fetchPlayerBallHistory(playerId, matchTypeId);
      }
    } catch (error) {
      setIsLoading(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );

    }
  }

  const fetchPlayerBatHistory = async (playerId, matchTypeId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/playerHistory/getPlayerBatHist", {
        playerId,
        matchTypeId,
      })
      .then((response) => {
        if (response?.result?.length > 0  && response?.result?.some(item => !item.eventName || !item.eventDate)) {
          setBattingHistory(
            response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId),
          );
        } else if(response?.result?.length > 0){
          setBattingHistory([
            {
              id: 0,
              matchTypeId: matchTypeId,
              playerId: playerId,
              commentaryId: 0,
              commentaryPlayerId: 0,
              matchCount: 0,
              inningsCount: 0,
              notOut: 0,
              totalRuns: 0,
              highestScore: "0",
              average: 0,
              ballsFacedCount: 0,
              strikeRate: 0,
              countOf100: 0,
              countOf50: 0,
              countOf4: 0,
              countOf6: 0,
              catchCount: 0,
              stumpCount: 0,
              createdBy: null,
              createdAt: "",
              outCount: 0,
              eventName: "",
              eventDate: "",
            },
            ...response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId),
          ]);
        } else {
          setBattingHistory([
            {
              id: 0,
              matchTypeId: matchTypeId,
              playerId: playerId,
              commentaryId: 0,
              commentaryPlayerId: 0,
              matchCount: 0,
              inningsCount: 0,
              notOut: 0,
              totalRuns: 0,
              highestScore: "0",
              average: 0,
              ballsFacedCount: 0,
              strikeRate: 0,
              countOf100: 0,
              countOf50: 0,
              countOf4: 0,
              countOf6: 0,
              catchCount: 0,
              stumpCount: 0,
              createdBy: null,
              createdAt: "",
              outCount: 0,
              eventName: "",
              eventDate: "",
            },
          ]);
        }
        setIsLoading(false);
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
        if (response?.result?.length > 0 && response?.result?.some(item => !item.eventName || !item.eventDate)) {
          setBowlingHistory(
            response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId),
          );
        } else if(response?.result?.length > 0){
          setBowlingHistory([
            {
              id: 0,
              matchTypeId: matchTypeId,
              playerId: playerId,
              commentaryId: 0,
              commentaryPlayerId: 0,
              bowlerPlayedMatchCount: 0,
              bowlerPlayedInningsCount: 0,
              ballCount: 0,
              runsFromBowler: 0,
              wicketsCount: 0,
              bowlerAverage: 0,
              bestBowlingInInnings: "0",
              bestBowlingInMatch: "0",
              economy: 0,
              bowlerStrikeRate: 0,
              wickets4: 0,
              wickets5: 0,
              wickets10: 0,
              createdBy: null,
              createdAt: "",
              eventName: "",
              eventDate: "",
            },
            ...response?.result?.sort((a, b) => a.matchTypeId - b.matchTypeId),
          ]);
        } else {
          setBowlingHistory([
            {
              id: 0,
              matchTypeId: matchTypeId,
              playerId: playerId,
              commentaryId: 0,
              commentaryPlayerId: 0,
              bowlerPlayedMatchCount: 0,
              bowlerPlayedInningsCount: 0,
              ballCount: 0,
              runsFromBowler: 0,
              wicketsCount: 0,
              bowlerAverage: 0,
              bestBowlingInInnings: "0",
              bestBowlingInMatch: "0",
              economy: 0,
              bowlerStrikeRate: 0,
              wickets4: 0,
              wickets5: 0,
              wickets10: 0,
              createdBy: null,
              createdAt: "",
              eventName: "",
              eventDate: "",
            },
          ]);
        }
        setIsLoading(false);
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

  const battingDelete = async (record) => {
    setDeleteBattingModelVisable(true);
    setDeleteBattingData(record);
  };

  const handleBattingDelete = async (obj) => {
    try {
      const response = await axiosInstance.post(
        "/admin/commPlayerHistory/deleteBatHis",
        { id: obj?.id }
      );
      fetchPlayerBatHistory(playerId, matchTypeId);
      setDeleteBattingModelVisable(false);
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      setDeleteBattingModelVisable(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const battingColumns = [
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
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => (
        <Input
          className="form-control medium-text-fields"
          disabled
          type="text"
          value={text ? text : "-"}
        />
      ),
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Mat",
      dataIndex: "matchCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBattingValueChange(index, "matchCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.matchCount}</span>
        </>
      ),
      key: "matchCount",
      style: { width: "3%" },
    },
    {
      title: "Inns",
      dataIndex: "inningsCount",
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
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
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
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
        <div className="d-flex align-items-center gap-2">
          <Button
            color={"primary"}
            size="sm"
            className="btn"
            onClick={() => {
              handleBattingSave(record);
            }}
          >
            {record?.id === 0 ? "save" : "Update"}
          </Button>
          {record?.id !== 0 ?
            <Button
              color={"danger"}
              size="sm"
              className="btn"
              onClick={() => {
                battingDelete(record);
              }}
            >
              Delete
            </Button>
            : null}
        </div>
      ),
      key: "",
      style: { width: "5%" },
    },
  ];

  const bowlingDelete = async (record) => {
    setDeleteBowlingModelVisable(true);
    setDeleteBowlingData(record);
  };

  const handleBowlingDelete = async (obj) => {
    try {
      const response = await axiosInstance.post(
        "/admin/commPlayerHistory/deleteBowlHis",
        { id: obj?.id }
      );
      fetchPlayerBallHistory(playerId, matchTypeId);
      setDeleteBowlingModelVisable(false);
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      setDeleteBowlingModelVisable(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const bowlingColumns = [
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
      title: "Event",
      dataIndex: "eventName",
      render: (text, record) => (
        <Input
          className="form-control medium-text-fields"
          type="text"
          disabled
          value={text ? text : "-"}
        />
      ),
      key: "eventName",
      style: { width: "10%" },
    },
    {
      title: "Mat",
      dataIndex: "bowlerPlayedMatchCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(
                index,
                "bowlerPlayedMatchCount",
                e.target.value
              )
            }
          />
          <span className="text-danger">
            {record?.error?.bowlerPlayedMatchCount}
          </span>
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
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(
                index,
                "bowlerPlayedInningsCount",
                e.target.value
              )
            }
          />
          <span className="text-danger">
            {record?.error?.bowlerPlayedInningsCount}
          </span>
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
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(index, "runsFromBowler", e.target.value)
            }
          />
          <span className="text-danger">
            {record?.error?.balrunsFromBowlerlCount}
          </span>
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
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(
                index,
                "bestBowlingInInnings",
                e.target.value
              )
            }
          />
          <span className="text-danger">
            {record?.error?.bestBowlingInInnings}
          </span>
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
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(
                index,
                "bestBowlingInMatch",
                e.target.value
              )
            }
          />
          <span className="text-danger">
            {record?.error?.bestBowlingInMatch}
          </span>
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
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : "-"}
            onChange={(e) =>
              handleBowlingValueChange(
                index,
                "bowlerStrikeRate",
                e.target.value
              )
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
        <div className="d-flex align-items-center gap-2">
          <Button
            color={"primary"}
            size="sm"
            className="btn"
            onClick={() => {
              handleBowlingSave(record);
            }}
          >
            {record?.id === 0 ? "save" : "Update"}
          </Button>
          {record?.id !== 0 ?
            <Button
              color={"danger"}
              size="sm"
              className="btn"
              onClick={() => {
                bowlingDelete(record);
              }}
            >
              Delete
            </Button>
            : null}

          {/* ) : null} */}
        </div>
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
            <Button
              color="warning"
              className="btn mx-2"
              onClick={handleBattingRecalculator}
            >
              {" "}
              Re-Calculate{" "}
            </Button>
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
            <Button
              color="warning"
              className="btn mx-2"
              onClick={handleBowlingRecalculator}
            >
              {" "}
              Re-Calculate{" "}
            </Button>
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
          if (key === "outCount" || key === "totalRuns") {
            const batRun = Number(updatedHistory[index].totalRuns) || 0;
            const batOutCount = Number(updatedHistory[index].outCount) || 0;
            updatedHistory[index].average =
              (batOutCount !== 0 ? batRun / batOutCount : batRun).toFixed(2);
          }

          // Calculate strike rate if key is 'ballsFacedCount' or 'totalRuns'
          if (key === "ballsFacedCount" || key === "totalRuns") {
            const batRun = Number(updatedHistory[index].totalRuns) || 0;
            const ballsFacedCount =
              Number(updatedHistory[index].ballsFacedCount) || 0;
            updatedHistory[index].strikeRate =
              (ballsFacedCount !== 0 ? (batRun / ballsFacedCount) * 100 : 0).toFixed(2);
          }
        }
        return updatedHistory;
      });
    }
  };

  const handleBowlingValueChange = (index, key, value) => {
    const regex = /^\d*\.?\d*\/?\d*\.?\d*$/; // Only allow numbers and one optional decimal point
    // && key != "bestBowlingInInnings" && value != "bestBowlingInMatch"
    if (regex.test(value)) {
      setBowlingHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        if (index !== -1) {
          updatedHistory[index][key] = value;
          // updatedHistory[index].selected = true;
          if (key === "wicketsCount" || key === "runsFromBowler") {
            const bowlRun = Number(updatedHistory[index].runsFromBowler) || 0;
            const wicketsCount = Number(updatedHistory[index].wicketsCount) || 0;
            updatedHistory[index].bowlerAverage =
              (wicketsCount !== 0 ? bowlRun / wicketsCount : bowlRun)?.toFixed(2);
          }
          if (key === "ballCount" || key === "runsFromBowler") {
            const totalOvers = Math.floor(updatedHistory[index].ballCount / 6) + (updatedHistory[index].ballCount % 6) / 6;
            const bowlRun = Number(updatedHistory[index].runsFromBowler) || 0;
            updatedHistory[index].economy =
              (totalOvers > 0 ? bowlRun / totalOvers : 0)?.toFixed(2);
          }
          if (key === "ballCount" || key === "wicketsCount") {
            const ballCount = Number(updatedHistory[index].ballCount)
            const wicketsCount = Number(updatedHistory[index].wicketsCount) || 0;
            updatedHistory[index].bowlerStrikeRate =
              (wicketsCount === 0 ? 0 : ballCount / wicketsCount)?.toFixed(2);
          }
        }
        return updatedHistory;
      });
    }
  };

  const handleBattingSave = async (obj) => {
    const payload = {
      playerId: Number(obj.playerId),
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
    setIsLoading(true)
    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/upPlayerBatHist",
        payload
      );

      fetchPlayerBatHistory(playerId, matchTypeId);
      setIsLoading(false)
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );

    } catch (error) {
      setIsLoading(false)
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
      wickets10: Number(obj.wickets10)
    };
    setIsLoading(true)
    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/upPlayerBallHist",
        payload
      );
      fetchPlayerBallHistory(obj.playerId, obj.matchTypeId);
      setIsLoading(false)
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      setIsLoading(false)
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
              <DeletePlayerEventHistoryModel
                deleteModelVisable={deleteBattingModelVisable}
                setDeleteModelVisable={setDeleteBattingModelVisable}
                selectedRowData={deleteBattingData}
                handleDelete={handleBattingDelete}
                data={"batting"}
              />
              <DeletePlayerEventHistoryModel
                deleteModelVisable={deleteBowlingModelVisable}
                setDeleteModelVisable={setDeleteBowlingModelVisable}
                selectedRowData={deleteBowlingData}
                handleDelete={handleBowlingDelete}
                data={"bowling"}
              />
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MatchHistory;
