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
  TAB_PLAYER_HISTORY,
} from "../../components/Common/Const";
import { useNavigate } from "react-router-dom";
import DeletePlayerHistoryModel from "../../components/Model/DeletePlayerHistoryModel";
import { Avatar } from "antd";

const PlayerHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  document.title = TAB_PLAYER_HISTORY;
  const [battingHistory, setBattingHistory] = useState([]);
  const [bowlingHistory, setBowlingHistory] = useState([]);
  const [deleteBattingModelVisable, setDeleteBattingModelVisable] = useState(false);
  const [deleteBowlingModelVisable, setDeleteBowlingModelVisable] = useState(false);
  const playerId = +sessionStorage.getItem("playerId") || "0";
  const playerDetails = JSON.parse(
    sessionStorage.getItem("playerDetails") || "{}"
  );
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchPlayerHistory = async (playerId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/playerHistory/all", { playerId })
      .then((response) => {
        if (response?.result) {
          setBattingHistory(
            response?.result?.battingHistory?.sort(
              (a, b) => a.matchTypeId - b.matchTypeId
            )
          );
          setBowlingHistory(
            response?.result?.bowlingHistory?.sort(
              (a, b) => a.matchTypeId - b.matchTypeId
            )
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
    navigate("/Players");
  };

  useEffect(() => {
    if (playerId !== "0") {
      fetchPlayerHistory(playerId);
    }
  }, [playerId]);

  const handleBattingValueChange = (index, key, value) => {
    setBattingHistory((prevHistory) => {
      const updatedHistory = [...prevHistory];
      if (index !== -1) {
        updatedHistory[index][key] = value;
        // updatedHistory[index].selected = true;
      }
      return updatedHistory;
    });
  };

  const handleBowlingValueChange = (index, key, value) => {
    setBowlingHistory((prevHistory) => {
      const updatedHistory = [...prevHistory];
      if (index !== -1) {
        updatedHistory[index][key] = value;
        // updatedHistory[index].selected = true;
      }
      return updatedHistory;
    });
  };

  // const validateBattingRow = (row) => {
  //   const requiredFields = [
  //     "matchTypeName",
  //     "matchCount",
  //     "inningsCount",
  //     "notOut",
  //     "totalRuns",
  //     "highestScore",
  //     "average",
  //     "ballsFacedCount",
  //     "strikeRate",
  //     "countOf100",
  //     "countOf50",
  //     "countOf4",
  //     "countOf6",
  //     "catchCount",
  //     "stumpCount",
  //   ];
  //   const errors = [];
  //   requiredFields.forEach((field) => {
  //     if (!row[field]) {
  //       errors.push(`${field}`);
  //     }
  //   });
  //   return errors;
  // };

  const handleBattingSelectRow = (index) => {
    setBattingHistory((prevHistory) => {
      // const row = prevHistory[index];
      // const errors = validateBattingRow(row);
      // if (errors.length > 0) {
      //   dispatch(
      //     updateToastData({
      //       data: `Please fill all required fields: ${errors.join(", ")}`,
      //       title: "Batting History Error",
      //       type: ERROR,
      //     })
      //   );
      //   return prevHistory;
      // }
      const updatedHistory = [...prevHistory];
      updatedHistory[index].selected = !updatedHistory[index].selected;
      return updatedHistory;
    });
  };

  const handleSelectBattingAll = (event) => {
    const isChecked = event.target.checked;
    // const errors = [];
    const newBattingHistory = battingHistory.map((item) => {
      // const rowErrors = validateBattingRow(item);
      // if (rowErrors.length > 0) {
      //   errors.push(`Row ${item.index || 0}: ${rowErrors.join(", ")}`);
      // }
      return {
        ...item,
        selected: isChecked,
      };
    });
    // if (errors.length > 0) {
    //   dispatch(
    //     updateToastData({
    //       data: `Please fill all required fields.`,
    //       title: "Batting History Error",
    //       type: ERROR,
    //     })
    //   );
    //   return;
    // }
    setBattingHistory(newBattingHistory);
  };

  // const validateBowlingRow = (row) => {
  //   const requiredFields = [
  //     "matchTypeName",
  //     "bowlerPlayedMatchCount",
  //     "bowlerPlayedInningsCount",
  //     "ballCount",
  //     "runsFromBowler",
  //     "wicketsCount",
  //     "bestBowlingInInnings",
  //     "bestBowlingInMatch",
  //     "bowlerAverage",
  //     "economy",
  //     "bowlerStrikeRate",
  //     "wickets4",
  //     "wickets5",
  //     "wickets10",
  //   ];
  //   const errors = [];
  //   requiredFields.forEach((field) => {
  //     if (!row[field]) {
  //       errors.push(`${field}`);
  //     }
  //   });
  //   return errors;
  // };

  const handleBowlingSelectRow = (index) => {
    setBowlingHistory((prevHistory) => {
      // const row = prevHistory[index];
      // const errors = validateBowlingRow(row);
      // if (errors.length > 0) {
      //   dispatch(
      //     updateToastData({
      //       data: `Please fill all required fields: ${errors.join(", ")}`,
      //       title: "Bowling History Error",
      //       type: ERROR,
      //     })
      //   );
      //   return prevHistory;
      // }
      const updatedHistory = [...prevHistory];
      updatedHistory[index].selected = !updatedHistory[index].selected;
      return updatedHistory;
    });
  };

  const handleSelectBowlingAll = (event) => {
    const isChecked = event.target.checked;
    // const errors = [];
    const newBowlingHistory = bowlingHistory.map((item) => {
      // const rowErrors = validateBowlingRow(item);
      // if (rowErrors.length > 0) {
      //   errors.push(`Row ${item.index || 0}: ${rowErrors.join(", ")}`);
      // }
      return {
        ...item,
        selected: isChecked,
      };
    });
    // if (errors.length > 0) {
    //   dispatch(
    //     updateToastData({
    //       data: `Please fill all required fields.`,
    //       title: "Bowling History Error",
    //       type: ERROR,
    //     })
    //   );
    //   return;
    // }
    setBowlingHistory(newBowlingHistory);
  };

  const handleBattingSave = async () => {
    const modifiedRows = battingHistory.filter((item) => item.selected);

    if (modifiedRows.length === 0) {
      dispatch(
        updateToastData({
          data: "Please select at least one row.",
          title: "Batting History Error",
          type: ERROR,
        })
      );
      return;
    }

    const payload =
      modifiedRows.length > 0 &&
      modifiedRows.map((item) => {
        return {
          ...item,
          battingHistoryId: item?.battingHistoryId
            ? +item?.battingHistoryId
            : 0,
          matchTypeId: +item?.matchTypeId,
          playerId: +playerId,
          matchTypeName: item?.matchTypeName,
          matchCount: +item?.matchCount,
          inningsCount: +item?.inningsCount,
          notOut: +item?.notOut,
          totalRuns: +item?.totalRuns,
          highestScore: item?.highestScore,
          average: +item?.average,
          ballsFacedCount: +item?.ballsFacedCount,
          strikeRate: +item?.strikeRate,
          countOf100: +item?.countOf100,
          countOf50: +item?.countOf50,
          countOf4: +item?.countOf4,
          countOf6: +item?.countOf6,
          catchCount: +item?.catchCount,
          stumpCount: +item?.stumpCount,
        };
      });
    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/saveBattingHistory",
        payload
      );
      fetchPlayerHistory(playerId);
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

  const battingDelete = async () => {
    const modifiedRows = battingHistory.filter((item) => item.selected);

    if (modifiedRows.length === 0) {
      dispatch(
        updateToastData({
          data: "Please select at least one row.",
          title: "Batting History Error",
          type: ERROR,
        })
      );
      return;
    }

    const deleteIds =
      modifiedRows.length > 0
        ? modifiedRows
            .filter((i) => i?.battingHistoryId !== null)
            .map((item) => item.battingHistoryId)
        : [];

    if (deleteIds.length === 0) {
      dispatch(
        updateToastData({
          data: "No batting history IDs selected for deletion.",
          title: "Batting History Error",
          type: ERROR,
        })
      );
      return;
    }
    setDeleteBattingModelVisable(true);
  }

  const handleBattingDelete = async () => {
    const modifiedRows = battingHistory.filter((item) => item.selected);

    const deleteIds =
      modifiedRows.length > 0
        ? modifiedRows
            .filter((i) => i?.battingHistoryId !== null)
            .map((item) => item.battingHistoryId)
        : [];

    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/deleteBattingHistory",
        { battingHistoryId: deleteIds }
      );
      fetchPlayerHistory(playerId);
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

  const handleBowlingSave = async () => {
    const modifiedRows = bowlingHistory.filter((item) => item.selected);

    if (modifiedRows.length === 0) {
      dispatch(
        updateToastData({
          data: "Please select at least one row.",
          title: "Bowling History Error",
          type: ERROR,
        })
      );
      return;
    }

    const payload =
      modifiedRows.length > 0 &&
      modifiedRows.map((item) => {
        return {
          ...item,
          bowlingHistoryId: item?.bowlingHistoryId
            ? +item?.bowlingHistoryId
            : 0,
          matchTypeId: +item?.matchTypeId,
          playerId: +playerId,
          matchTypeName: item?.matchTypeName,
          bowlerPlayedMatchCount: +item?.bowlerPlayedMatchCount,
          bowlerPlayedInningsCount: +item?.bowlerPlayedInningsCount,
          ballCount: +item?.ballCount,
          runsFromBowler: +item?.runsFromBowler,
          wicketsCount: +item?.wicketsCount,
          bowlerAverage: +item?.bowlerAverage,
          bestBowlingInInnings: item?.bestBowlingInInnings,
          bestBowlingInMatch: item?.bestBowlingInMatch,
          bowlerStrikeRate: +item?.bowlerStrikeRate,
          economy: +item?.economy,
          wickets4: +item?.wickets4,
          wickets5: +item?.wickets5,
          wickets10: +item?.wickets10,
        };
      });
    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/saveBowlingHistory",
        payload
      );
      fetchPlayerHistory(playerId);
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

  const bowlingDelete = async () => {
    const modifiedRows = bowlingHistory.filter((item) => item.selected);

    if (modifiedRows.length === 0) {
      dispatch(
        updateToastData({
          data: "Please select at least one row.",
          title: "Bowling History Error",
          type: ERROR,
        })
      );
      return;
    }

    const deleteIds =
      modifiedRows.length > 0
        ? modifiedRows
            .filter((i) => i?.bowlingHistoryId !== null)
            .map((item) => item.bowlingHistoryId)
        : [];

    if (deleteIds.length === 0) {
      dispatch(
        updateToastData({
          data: "No bowling history IDs selected for deletion.",
          title: "Bowling History Error",
          type: ERROR,
        })
      );
      return;
    }
    setDeleteBowlingModelVisable(true);
  }

  const handleBowlingDelete = async () => {
    const modifiedRows = bowlingHistory.filter((item) => item.selected);

    const deleteIds =
      modifiedRows.length > 0
        ? modifiedRows
            .filter((i) => i?.bowlingHistoryId !== null)
            .map((item) => item.bowlingHistoryId)
        : [];

    try {
      const response = await axiosInstance.post(
        "/admin/playerHistory/deleteBowlingHistory",
        { bowlingHistoryId: deleteIds }
      );
      fetchPlayerHistory(playerId);
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

  const battingColumns = [
    {
      title: (
        <Input
          type="checkbox"
          checked={
            battingHistory.length > 0 &&
            battingHistory.every((item) => item.selected)
          }
          onChange={handleSelectBattingAll}
        />
      ),
      dataIndex: "select",
      render: (text, record, index) => (
        <Input
          type="checkbox"
          checked={record.selected || false}
          onChange={() => handleBattingSelectRow(index)}
        />
      ),
      key: "select",
      style: { width: "5%" },
    },
    {
      title: "Format",
      dataIndex: "matchTypeName",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "matchTypeName", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.matchTypeName}</span>
        </>
      ),
      key: "matchTypeName",
      style: { width: "30%" },
    },
    {
      title: "Mat",
      dataIndex: "matchCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "matchCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.matchCount}</span>
        </>
      ),
      key: "matchCount",
      style: { width: "5%" },
    },
    {
      title: "Inns",
      dataIndex: "inningsCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "inningsCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.inningsCount}</span>
        </>
      ),
      key: "inningsCount",
      style: { width: "5%" },
    },
    {
      title: "NO",
      dataIndex: "notOut",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "notOut", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.notOut}</span>
        </>
      ),
      key: "notOut",
      style: { width: "5%" },
    },
    {
      title: "Runs",
      dataIndex: "totalRuns",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "totalRuns", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalRuns}</span>
        </>
      ),
      key: "totalRuns",
      style: { width: "5%" },
    },
    {
      title: "HS",
      dataIndex: "highestScore",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "highestScore", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.highestScore}</span>
        </>
      ),
      key: "highestScore",
      style: { width: "5%" },
    },
    {
      title: "Ave",
      dataIndex: "average",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "average", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.average}</span>
        </>
      ),
      key: "average",
      style: { width: "5%" },
    },
    {
      title: "BF",
      dataIndex: "ballsFacedCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "ballsFacedCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.ballsFacedCount}</span>
        </>
      ),
      key: "ballsFacedCount",
      style: { width: "5%" },
    },
    {
      title: "SR",
      dataIndex: "strikeRate",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "strikeRate", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.strikeRate}</span>
        </>
      ),
      key: "strikeRate",
      style: { width: "5%" },
    },
    {
      title: "100s",
      dataIndex: "countOf100",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf100", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf100}</span>
        </>
      ),
      key: "countOf100",
      style: { width: "5%" },
    },
    {
      title: "50s",
      dataIndex: "countOf50",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf50", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf50}</span>
        </>
      ),
      key: "countOf50",
      style: { width: "5%" },
    },
    {
      title: "4s",
      dataIndex: "countOf4",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf4", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf4}</span>
        </>
      ),
      key: "countOf4",
      style: { width: "5%" },
    },
    {
      title: "6s",
      dataIndex: "countOf6",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "countOf6", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.countOf6}</span>
        </>
      ),
      key: "countOf6",
      style: { width: "5%" },
    },
    {
      title: "Ct",
      dataIndex: "catchCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "catchCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.catchCount}</span>
        </>
      ),
      key: "catchCount",
      style: { width: "5%" },
    },
    {
      title: "St",
      dataIndex: "stumpCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBattingValueChange(index, "stumpCount", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.stumpCount}</span>
        </>
      ),
      key: "stumpCount",
      style: { width: "5%" },
    },
  ];

  const bowlingColumns = [
    {
      title: (
        <Input
          type="checkbox"
          checked={
            bowlingHistory.length > 0 &&
            bowlingHistory.every((item) => item.selected)
          }
          onChange={handleSelectBowlingAll}
        />
      ),
      dataIndex: "select",
      render: (text, record, index) => (
        <Input
          type="checkbox"
          checked={record.selected || false}
          onChange={() => handleBowlingSelectRow(index)}
        />
      ),
      key: "select",
      style: { width: "5%" },
    },
    {
      title: "Format",
      dataIndex: "matchTypeName",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBowlingValueChange(index, "matchTypeName", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.matchTypeName}</span>
        </>
      ),
      key: "matchTypeName",
      style: { width: "35%" },
    },
    {
      title: "Mat",
      dataIndex: "bowlerPlayedMatchCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
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
      style: { width: "5%" },
    },
    {
      title: "Inns",
      dataIndex: "bowlerPlayedInningsCount",
      render: (text, record, index) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
            onChange={(e) =>
              handleBowlingValueChange(index, "runsFromBowler", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.runsFromBowler}</span>
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
            value={text != null ? text : ""}
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
  ];

  const renderMainSections = () => {
    return (
      <>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 font-size-16">Batting & Fielding</h5>
            <div>
              <Button
                color="primary"
                className="btn mx-2"
                onClick={handleBattingSave}
              >
                {" "}
                Save{" "}
              </Button>
              <Button
                color="danger"
                className="btn"
                onClick={battingDelete}
              >
                {" "}
                Delete{" "}
              </Button>
            </div>
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
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 font-size-16">Bowling</h5>
            <div>
              <Button
                color="primary"
                className="btn mx-2"
                onClick={handleBowlingSave}
              >
                {" "}
                Save{" "}
              </Button>
              <Button
                color="danger"
                className="btn"
                onClick={bowlingDelete}
              >
                {" "}
                Delete{" "}
              </Button>
            </div>
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
          </CardBody>
        </Card>
      </>
    );
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
                {playerDetails && 
                  <Col className="col-sm-auto d-flex align-items-center">
                    {playerDetails?.image ? (
                        <img
                          className="avatar-sm rounded-circle"
                          alt=""
                          src={playerDetails?.image}
                        />
                      ) : (
                        <Avatar src="#" alt="ET">
                          Image
                        </Avatar>
                    )}
                    <h4 className="mb-0 font-size-18 mx-2">{`${playerDetails?.playerName} History`}</h4>
                  </Col>}
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
                <DeletePlayerHistoryModel
                  deleteModelVisable={deleteBattingModelVisable}
                  setDeleteModelVisable={setDeleteBattingModelVisable}
                  handleDelete={handleBattingDelete}
                  data={"batting"}
                />
                <DeletePlayerHistoryModel
                  deleteModelVisable={deleteBowlingModelVisable}
                  setDeleteModelVisable={setDeleteBowlingModelVisable}
                  handleDelete={handleBowlingDelete}
                  data={"bowling"}
                />
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PlayerHistory;
