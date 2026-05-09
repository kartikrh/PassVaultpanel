import React, { useEffect, useState } from "react";
import axiosInstance from "../../Features/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { filterOrderChange } from "../../helpers/helper";
import {
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Table,
  Input,
} from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { updateToastData } from "../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ERROR, SUCCESS } from "../../components/Common/Const";
import Select from "react-select";
import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { SelectPlayersModel } from "./SelectPlayerModel";
import DeleteTeamModel from "../../components/Model/DeleteTeamModel";
import "./tournament.css";

const TournamentTeamPoints = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tournamentData, setTournamentData] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [groupDetails, setGroupDetails] = useState({ id : 1, name: "", prevGroupId: ""});
  const [playersModelVisible, setPlayersModelVisible] = useState(false);
  const [deleteTeamModelVisable, setDeleteTeamModelVisable] = useState(false);
  const [deleteTeamRecord, setDeleteTeamRecord] = useState({});
  const [selectedTournament, setSelectedTournament] = useState({});
  const [groupOrder, setGroupOrder] = useState([]);

  const competitionId = +sessionStorage.getItem("competitionId") || "0";
  const competitionDetails = JSON.parse(
    sessionStorage.getItem("competitionDetails") || "{}"
  );
  document.title = `${competitionDetails?.competition} Team Points`;
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchTournament = async (competitionId) => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/tournamentTeamPoints/all", { competitionId })
      .then((response) => {
        if (response?.result) {
          setTournamentData(response?.result);
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

  const fetchTeamList = async () => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/tournamentTeamPoints/teamsList", {})
      .then((response) => {
        if (response?.result) {
          setTeamList(response?.result);
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
    navigate("/Competition");
  };

  useEffect(() => {
    if (competitionId !== "0") {
      fetchTournament(competitionId);
      fetchTeamList();
    }
  }, [competitionId]);

  // Sync groupOrder whenever tournamentData changes — sorted by groupDisplayOrder from API response
  useEffect(() => {
    const groupDisplayOrderMap = {};
    tournamentData.forEach((item) => {
      const gId = String(item.groupId || "");
      if (groupDisplayOrderMap[gId] === undefined) {
        groupDisplayOrderMap[gId] = item.groupDisplayOrder ?? Infinity;
      }
    });
    const keys = Object.keys(groupDisplayOrderMap).sort(
      (a, b) => (groupDisplayOrderMap[a] ?? Infinity) - (groupDisplayOrderMap[b] ?? Infinity)
    );
    setGroupOrder(keys);
  }, [tournamentData]);

  const handleValueChange = (id, key, value) => {
    setTournamentData((prevData) => {
      return prevData.map((item) => {
        if (item.id === id) {
          return { ...item, [key]: value };
        }
        return item;
      });
    });
  };

  const handleIsActive = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/tournamentTeamPoints/activeInactive`, {
        id: record.id,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        // fetchTeamList();
        fetchTournament(record.competitionId);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleSave = async () => {
    if (!groupDetails?.id || !selectedTeamId) {
      dispatch(
        updateToastData({
          data: "Group Id and Team are required",
          title: "Validation Error",
          type: ERROR,
        })
      );
      return;
    }
    try {
      const response = await axiosInstance.post(
        "/admin/tournamentTeamPoints/save",
        {
          id: 0,
          teamId: selectedTeamId,
          competitionId: competitionId,
          isActive: true,
          groupId: groupDetails?.id,
          groupName: groupDetails?.name,
          prevGroupId:
            groupDetails?.prevGroupId !== ""
              ? Number(groupDetails?.prevGroupId)
              : null,
        }
      );
      fetchTournament(competitionId);
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

  const handleSelectPlayers = async () => {
    setIsLoading(true);
    if (selectedTournament?.teamPlayers && Array.isArray(selectedTournament?.teamPlayers)) {
    await axiosInstance
      .post(`/admin/tournamentTeamPlayers/save`, selectedTournament)
      .then((response) => {
        fetchTournament(competitionId);
        if (response?.result) {
          dispatch(
            updateToastData({
              data: response?.message,
              title: response?.title,
              type: SUCCESS,
            })
          );
        }
        setPlayersModelVisible(false);
        setIsLoading(false);
      })
      .catch((error) => {
        setPlayersModelVisible(false);
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
    } else {
      setPlayersModelVisible(false);
      setIsLoading(false);
    }
  };

  const handleRowSave = async (record) => {
    try {
      const response = await axiosInstance.post(
        "/admin/tournamentTeamPoints/save",
        {
          competitionId: competitionId,
          ...record,
          prevGroupId:
            record?.prevGroupId !== "" &&
              record?.prevGroupId !== null &&
              record?.prevGroupId !== undefined
              ? Number(record?.prevGroupId)
              : null,
        }
      );
      fetchTournament(competitionId);
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

  const handleTournamentTeam = (details) => {
    const url = new URL(window.location.origin + "/tournamentCompetitionPoints");
    sessionStorage.setItem('teamId', "" + details?.teamId);
    sessionStorage.setItem('teamDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
  };

  const handleCompetitionClick = (details) => {
    const url = new URL(window.location.origin + "/eventResult");
    sessionStorage.setItem('eventResultCompetitionId', "" + details?.competitionId);
    sessionStorage.setItem('eventResultTeamId', "" + details?.teamId);
    sessionStorage.setItem('eventResultDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("eventResultCompetitionId");
    sessionStorage.removeItem("eventResultTeamId");
    sessionStorage.removeItem("eventResultDetails");
  };

  const handleRowDelete = async (record) => {
    try {
      const response = await axiosInstance.post(
        "/admin/tournamentTeamPoints/delete",
        {
          id: [record?.id],
          teamId: [record?.teamId],
          competitionId: competitionId,
        }
      );
      setDeleteTeamModelVisable(false);
      fetchTournament(competitionId);
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      setDeleteTeamModelVisable(false);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const handleRecalculator = async () => {
    const selectedTeamIds = tournamentData && tournamentData?.map(item => item?.teamId);

    const payload = {
      competitionId: competitionId,
      teamId: selectedTeamIds || [],
    };
    
    try {
      const response = await axiosInstance.post("/admin/tournamentTeamPoints/recalculation", payload);
      if (response?.result) {
        dispatch(
          updateToastData({
            data: "Tournament Team Points recalculated successfully",
            title: "Success",
            type: SUCCESS,
          })
        );
        fetchTournament(competitionId);
      }
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  }

  const handleGroupDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    // Optimistic update — reorder locally immediately
    const newGroupOrder = [...groupOrder];
    const [moved] = newGroupOrder.splice(result.source.index, 1);
    newGroupOrder.splice(result.destination.index, 0, moved);
    setGroupOrder(newGroupOrder);

    // Build displayOrderData using the same filterOrderChange pattern as in common
    const orderItems = newGroupOrder.map((gId) => ({ groupId: gId }));
    const displayOrderData = filterOrderChange(orderItems, "tournamentTeamPoints");

    try {
      await axiosInstance.post("/admin/tournamentTeamPoints/changeDisplayOrder", {
        competitionId,
        displayOrderData,
      });
      // Fetch fresh data so groupDisplayOrder values in memory are up-to-date.
      fetchTournament(competitionId);
      dispatch(
        updateToastData({
          data: "Group order updated successfully",
          title: "Success",
          type: SUCCESS,
        })
      );
    } catch (error) {
      // Revert to previous order on failure
      setGroupOrder(groupOrder);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    }
  };

  const columns = [
    {
      title: "Team",
      dataIndex: "teamId",
      render: (text, record) => {
        const team = teamOptions.find((option) => option.value === text);
        return (
          <>
            <span style={{ cursor: "pointer" }} onClick={() => { handleCompetitionClick({...record, teamName: team?.label, competition: competitionDetails?.competition}); }}>{team ? team.label : ""}</span>
            <span className="text-danger">{record?.error?.teamId}</span>
          </>
        );
      },
      key: "teamId",
      style: { width: "20%" },
    },
    {
      title: "Position",
      dataIndex: "position",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "position", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.position}</span>
        </>
      ),
      key: "position",
      style: { width: "10%" },
    },
    {
      title: "Matches",
      dataIndex: "totalMatches",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "totalMatches", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalMatches}</span>
        </>
      ),
      key: "totalMatches",
      style: { width: "10%" },
    },
    {
      title: "Win",
      dataIndex: "totalWin",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "totalWin", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalWin}</span>
        </>
      ),
      key: "totalWin",
      style: { width: "10%" },
    },
    {
      title: "Lose",
      dataIndex: "totalLose",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "totalLose", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalLose}</span>
        </>
      ),
      key: "totalLose",
      style: { width: "10%" },
    },
    {
      title: "Tie",
      dataIndex: "totalTie",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "totalTie", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalTie}</span>
        </>
      ),
      key: "totalTie",
      style: { width: "10%" },
    },
    {
      title: "No Result",
      dataIndex: "noResult",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "noResult", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.noResult}</span>
        </>
      ),
      key: "noResult",
      style: { width: "10%" },
    },
    {
      title: "Points",
      dataIndex: "totalPoint",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "totalPoint", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.totalPoint}</span>
        </>
      ),
      key: "totalPoint",
      style: { width: "10%" },
    },
    {
      title: "Run Rate",
      dataIndex: "netRunRate",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(record.id, "netRunRate", e.target.value)
            }
          />
          <span className="text-danger">{record?.error?.netRunRate}</span>
        </>
      ),
      key: "netRunRate",
      style: { width: "10%" },
    },
    {
      title: "Active",
      dataIndex: "isActive",
      render: (text, record) => (
        <Button
          color={`${record.isActive ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsActive("isActive", record, record.isActive);
          }}
        >
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      key: "isActive",
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Players",
      key: "competitionId",
      render: (text, record) => {
        const team = teamOptions.find(
          (option) => option.value === record?.teamId
        );
        return (
          <>
            <Tooltip
              title={"Players"}
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <Button
                color={"success"}
                size="sm"
                className="btn"
                onClick={() => {
                  // handlePlayers(record);
                  setPlayersModelVisible(true);
                  setSelectedTournament({
                    ...record,
                    teamName: team ? team.label : "",
                  });
                }}
              >
                <i className="bx bx-plus"></i>
              </Button>
            </Tooltip>
          </>
        );
      },
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Team",
      key: "teamId",
      render: (text, record) => {
        const team = teamOptions.find((option) => option.value === record?.teamId);
        return (
        <>
          <Tooltip
            title={"Tournament Team points"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              // color={"primary"}
              size="sm"
              className="btn teamsBtn"
              onClick={() => {
                handleTournamentTeam({...record, teamName: team?.label });
              }}
            >
              <i class="bx bxs-store"></i>
            </Button>
          </Tooltip>
        </>
      )},
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "",
      dataIndex: "actions",
      render: (text, record) => {
        const team = teamOptions.find(
          (option) => option.value === record?.teamId
        );
        return (
        <div className="d-flex aligb-items-center">
          <Button
            color="primary"
            size="sm"
            className="mx-1"
            onClick={() => handleRowSave(record)}
          >
            Save
          </Button>
          <Button
            color="danger"
            size="sm"
            className="mx-1"
            onClick={() => {
              setDeleteTeamModelVisable(true);
              setDeleteTeamRecord({...record, teamName: team ? team.label : ""});
            }}
          >
            Delete
          </Button>
        </div>
      )},
      key: "actions",
      style: { width: "6%" },
    },
    {
      title: "Prev Id",
      dataIndex: "prevGroupId",
      render: (text, record) => (
        <>
          <Input
            className="form-control small-text-fields"
            type="text"
            inputMode="numeric"
            value={text != null ? text : ""}
            onChange={(e) =>
              handleValueChange(
                record.id,
                "prevGroupId",
                e.target.value.replace(/\D/g, "")
              )
            }
          />
          <span className="text-danger">{record?.error?.prevGroupId}</span>
        </>
      ),
      key: "prevGroupId",
      style: { width: "10%" },
    },
  ];

  const teamOptions = teamList.map((team) => ({
    value: team.teamId,
    label: team.teamName,
  }));

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row className="padding-row">
            <Card>
              <CardBody>
                {isLoading && <SpinnerModel />}
                <Row className="mt-3 mt-lg-3 mt-md-3 mb-3">
                  {competitionDetails && (
                    <Col className="col-sm-auto">
                      <h4 className="mb-0 font-size-18 modal-header-title">
                        {competitionDetails?.competition} Team Points [Ref:{" "}
                        {competitionDetails.refId}]
                      </h4>
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
                <Row className="mb-3">
                  <Col md={1}>
                    <Input
                      className="form-control"
                      type="number"
                      id={groupDetails?.id}
                      name={groupDetails?.id}
                      value={groupDetails?.id}
                      onChange={(e) => setGroupDetails({ ...groupDetails, id:e.target.value})}
                      placeholder="Group Id"
                      required
                    />
                  </Col>
                  <Col md={1}>
                    <Input
                      className="form-control"
                      type="text"
                      id={groupDetails?.name}
                      name={groupDetails?.name}
                      value={groupDetails?.name}
                      onChange={(e) => setGroupDetails({ ...groupDetails, name:e.target.value})}
                      placeholder="Group Name"
                    />
                  </Col>
                  <Col md={2}>
                    <Select
                      value={teamOptions.find(
                        (option) => option.value === selectedTeamId
                      )}
                      placeholder="Select Team"
                      onChange={(selectedOption) =>
                        setSelectedTeamId(selectedOption?.value)
                      }
                      options={teamOptions}
                    />
                  </Col>
                  <Col md={1}>
                    <Input
                      className="form-control"
                      type="text"
                      inputMode="numeric"
                      value={groupDetails?.prevGroupId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setGroupDetails({
                          ...groupDetails,
                          prevGroupId: value,
                        });
                      }}
                      placeholder="Prev Group Id"
                    />
                  </Col>
                  <Col md={1}>
                    <Button
                      color="primary"
                      className="btn"
                      onClick={handleSave}
                    >
                      {" "}
                      Save{" "}
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button
                      color="warning"
                      className="btn"
                      onClick={handleRecalculator}
                    >
                      Re-Calculate
                    </Button>
                  </Col>
                </Row>
                {/* <Table responsive>
                  <thead className="table-light">
                    <tr>
                      {columns.map((column, index) => (
                        <th
                          className="px-2 py-2"
                          key={index}
                          style={column.style}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentData.length > 0 &&
                      tournamentData.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            {columns.map((column, colIndex) => (
                              <td
                                className="p-2"
                                key={colIndex}
                                style={column.style}
                              >
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
                </Table> */}
                {(() => {
                  const grouped = tournamentData.reduce((acc, item) => {
                    const group = String(item.groupId || "");
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                  }, {});

                  return (
                    <DragDropContext onDragEnd={handleGroupDragEnd}>
                      <Droppable droppableId="tournament-groups">
                        {(droppableProvided) => (
                          <div
                            ref={droppableProvided.innerRef}
                            {...droppableProvided.droppableProps}
                          >
                            {groupOrder
                              .filter((gId) => grouped[gId])
                              .map((groupId, index) => {
                                const groupItems = grouped[groupId];
                                return (
                                  <Draggable
                                    key={groupId}
                                    draggableId={String(groupId)}
                                    index={index}
                                  >
                                    {(draggableProvided, snapshot) => (
                                      <div
                                        ref={draggableProvided.innerRef}
                                        {...draggableProvided.draggableProps}
                                        className="mb-4"
                                        style={{
                                          ...draggableProvided.draggableProps.style,
                                          opacity: snapshot.isDragging ? 0.85 : 1,
                                          background: snapshot.isDragging ? "#f8f9fa" : "transparent",
                                          borderRadius: snapshot.isDragging ? "4px" : undefined,
                                        }}
                                      >
                                        <Table responsive>
                                          <thead>
                                            <tr>
                                              {columns.map((column, colIdx) => {
                                                const groupRecord = groupItems?.find(
                                                  (item) => item?.groupName
                                                );
                                                return (
                                                  <th
                                                    className="px-2 py-2"
                                                    key={colIdx}
                                                    style={column.style}
                                                  >
                                                    {column?.dataIndex === "teamId" ? (
                                                      <>
                                                        <span
                                                          {...draggableProvided.dragHandleProps}
                                                          style={{
                                                            cursor: "grab",
                                                            marginRight: 6,
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            verticalAlign: "middle",
                                                          }}
                                                          title="Drag to reorder group"
                                                        >
                                                          <i className="bx bx-grid-vertical"></i>
                                                        </span>
                                                        {`${groupRecord?.groupName || ""} ${groupId && `[${groupId}]`}`}
                                                      </>
                                                    ) : (
                                                      column.title
                                                    )}
                                                  </th>
                                                );
                                              })}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {[...groupItems]
                                              .sort((a, b) => {
                                                const runRateColumn = columns.find(
                                                  (col) => col.title === "Run Rate"
                                                );
                                                const pointColumn = columns.find(
                                                  (col) => col.title === "Points"
                                                );
                                                if (!runRateColumn || !pointColumn) return 0;
                                                const runRateKey = runRateColumn.dataIndex;
                                                const pointKey = pointColumn.dataIndex;
                                                const pointsA = parseFloat(a[pointKey]) || 0;
                                                const pointsB = parseFloat(b[pointKey]) || 0;
                                                // First, compare points
                                                if (pointsB !== pointsA) return pointsB - pointsA;
                                                // If points are the same, compare run rate
                                                const runRateA = parseFloat(a[runRateKey]) || 0;
                                                const runRateB = parseFloat(b[runRateKey]) || 0;
                                                return runRateB - runRateA; // higher run rate first
                                              })
                                              .map((item, idx) => (
                                                <tr key={item.id || idx}>
                                                  {columns.map((column, colIndex) => (
                                                    <td
                                                      className="p-2"
                                                      key={colIndex}
                                                      style={column.style}
                                                    >
                                                      {column.render
                                                        ? column.render(
                                                            item[column.dataIndex],
                                                            item,
                                                            idx
                                                          )
                                                        : item[column.dataIndex]}
                                                    </td>
                                                  ))}
                                                </tr>
                                              ))}
                                          </tbody>
                                        </Table>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                            {droppableProvided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  );
                })()}

              </CardBody>
            </Card>
            {playersModelVisible && (
              <SelectPlayersModel
                playersModelVisible={playersModelVisible}
                setPlayersModelVisible={setPlayersModelVisible}
                selectedTournament={selectedTournament}
                setSelectedTournament={setSelectedTournament}
                handleSelect={handleSelectPlayers}
              />
            )}
            <DeleteTeamModel
              deleteModelVisable={deleteTeamModelVisable}
              setDeleteModelVisable={setDeleteTeamModelVisable}
              handleDelete={handleRowDelete}
              deleteTeamRecord={deleteTeamRecord}
            />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TournamentTeamPoints;
