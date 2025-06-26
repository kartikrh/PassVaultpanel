import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Switch,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../../Features/axios";
import { updateToastData } from "../../../Features/toasterSlice";
import { ERROR, SUCCESS } from "../../../components/Common/Const.js";
import _ from "lodash";

const DRSAccordion = ({ teamDetails = [], commentaryDetails }) => {
  console.log(teamDetails);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDRS, setSelectedDRS] = useState(null);
  const [modalData, setModalData] = useState({
    result: true,
    isCount: false, //default false
  });

  const [drsLogs, setDrsLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState({});
  const [submittingDRS, setSubmittingDRS] = useState(false);
  const [logExpanded, setLogExpanded] = useState({});
  const [editRowKey, setEditRowKey] = useState(null);
  const [editedDRS, setEditedDRS] = useState({});

  // Group teams by batting order (higher order first)
  const groupedTeams = React.useMemo(() => {
    if (!teamDetails || !Array.isArray(teamDetails)) return [];

    // Sort by teamBattingOrder (higher order first)
    return teamDetails.sort(
      (a, b) => (b.teamBattingOrder || 0) - (a.teamBattingOrder || 0)
    );
  }, [teamDetails]);

  const sortedTeams = groupedTeams;

  // Set default expanded team
  React.useEffect(() => {
    if (sortedTeams.length > 0) {
      setExpanded(`${sortedTeams[0].teamId}_${sortedTeams[0].currentInnings}`);
    }
  }, [sortedTeams]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);

    // auto-hide the DRS log if the parent accordion is collapsed
    if (!isExpanded) {
      setLogExpanded((prev) => {
        const newState = { ...prev };
        delete newState[panel]; // Remove logExpanded for the collapsing team
        return newState;
      });
    }
  };

  const handleTakeAction = (drsItem) => {
    setSelectedDRS(drsItem);
    setModalOpen(true);
  };

  const handleLogAction = async (drsItem) => {
    const logKey = `${drsItem.teamId}_${drsItem.currentInnings}`;

    // Toggle accordion
    const isCurrentlyExpanded = logExpanded[logKey];
    setLogExpanded((prev) => ({
      ...prev,
      [logKey]: !isCurrentlyExpanded,
    }));

    // If expanding and no data exists, fetch the data
    if (!isCurrentlyExpanded && !drsLogs[logKey]) {
      setLoadingLogs((prev) => ({ ...prev, [logKey]: true }));

      try {
        const response = await axiosInstance.post(
          "/admin/commentary/drsByCommId",
          {
            commentaryTeamId: drsItem.commentaryTeamId,
            commentaryId:
              commentaryDetails?.commentaryId || drsItem.commentaryId,
          }
        );
        console.log("Log data:", response?.result);
        if (response?.result) {
          setDrsLogs((prev) => ({
            ...prev,
            [logKey]: response?.result,
          }));
        } else {
          console.error("No data in response");
          setDrsLogs((prev) => ({
            ...prev,
            [logKey]: [],
          }));
        }
      } catch (error) {
        console.error("Error fetching DRS logs:", error);
        setDrsLogs((prev) => ({
          ...prev,
          [logKey]: [],
        }));
      } finally {
        setLoadingLogs((prev) => ({ ...prev, [logKey]: false }));
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDRS(null);
    setModalData(modalData);
  };

  const handleSubmitDRS = async () => {
    console.log("Submitting DRS with:", selectedDRS);
    console.log("Submitting DRS with cd:", commentaryDetails);
    if (!selectedDRS) return;
    setSubmittingDRS(true);

    const payload = {
      id: 0,
      commentaryId: commentaryDetails?.commentaryId || selectedDRS.commentaryId,
      commentaryTeamId: selectedDRS.commentaryTeamId || 0,
      teamId: selectedDRS.teamId,
      result: modalData.result,
      isCount: modalData.isCount,
    };
    console.log("Sending DRS payload:", payload);
    await axiosInstance
      .post("/admin/commentary/saveDrs", payload)
      .then((response) => {
        console.log("DRS saved successfully");
        handleModalClose();
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
      })
      .catch((error) => {
        console.error("Failed to save DRS", error);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      })
      .finally(() => {
        setSubmittingDRS(false);
      });
  };
  const handleSaveEdit = async (drsItem) => {
    const drsAttempt = editedDRS.drsPass + editedDRS.drsFail;

    const payload = {
      commentaryId: drsItem.commentaryId,
      commentaryTeamId: drsItem.commentaryTeamId,
      teamId: drsItem.teamId,
      drsCount: editedDRS.drsCount,
      drsFail: editedDRS.drsFail,
      drsAttempt,
    };

    try {
      await axiosInstance.post("/admin/commentary/updateDrsValue", payload);
      // After save, exit edit mode
      setEditRowKey(null);
      setEditedDRS({});

      const updatedTeamDetails = teamDetails.map((team) => {
        if (team.teamId === drsItem.teamId) {
          return {
            ...team,
            drsCount: editedDRS.drsCount,
            drsFail: editedDRS.drsFail,
            drsAttempt,
          };
        }
        return team;
      });
    } catch (error) {
      console.error("Error saving DRS edits:", error);
    }
  };
  const handleCancelEdit = (drsItem) => {
    setEditRowKey(null);
    setEditedDRS({});
  };

  const renderDRSTable = (team) => {
    if (!team) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No DRS data available for this team.
        </Typography>
      );
    }

    // Calculate DRS values
    const drsItem = {
      teamId: team.teamId,
      teamName: team.teamName,
      currentInnings: team.currentInnings,
      drsLeft: team.drsCount || 0,
      drsPass: (team.drsAttempt || 0) - (team.drsFail || 0),
      drsFail: team.drsFail || 0,
      commentaryTeamId: team.commentaryTeamId,
      commentaryId: team.commentaryId,
    };

    return (
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Edit</strong>
              </TableCell>
              <TableCell>
                <strong>Team</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Left</strong>
              </TableCell>
              <TableCell align="center">
                <CheckCircleIcon color="success" fontSize="small" />
              </TableCell>
              <TableCell align="center">
                <CancelIcon color="error" fontSize="small" />
              </TableCell>
              <TableCell align="center">
                <strong>Take</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Log</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {/* ✅ Action Column */}
              <TableCell>
                {editRowKey === drsItem.teamId ? (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      color="success"
                      onClick={() => handleSaveEdit(drsItem)}
                      sx={{
                        minWidth: "auto",
                        fontSize: "0.7rem",
                        px: 0.5,
                        py: 0.5,
                        ml: 1,
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleCancelEdit(drsItem)}
                      sx={{
                        minWidth: "auto",
                        fontSize: "0.7rem",
                        px: 0.5,
                        py: 0.5,
                        ml: 1,
                      }}
                    >
                      Back
                    </Button>
                  </>
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setEditRowKey(drsItem.teamId);
                      setEditedDRS({
                        drsCount: drsItem.drsLeft,
                        drsPass: drsItem.drsPass,
                        drsFail: drsItem.drsFail,
                      });
                    }}
                  >
                    <i className="bx bx-edit" />
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {drsItem.teamName}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {editRowKey === drsItem.teamId ? (
                  <input
                    type="number"
                    value={editedDRS.drsCount ?? drsItem.drsLeft}
                    onChange={(e) =>
                      setEditedDRS((prev) => ({
                        ...prev,
                        drsCount: parseInt(e.target.value) || 0,
                      }))
                    }
                    style={{ width: "40px", textAlign: "center" }}
                  />
                ) : (
                  <Typography variant="body2">{drsItem.drsLeft}</Typography>
                )}
              </TableCell>

              <TableCell align="center">
                {editRowKey === drsItem.teamId ? (
                  <input
                    type="number"
                    value={editedDRS.drsPass ?? drsItem.drsPass}
                    onChange={(e) =>
                      setEditedDRS((prev) => ({
                        ...prev,
                        drsPass: parseInt(e.target.value) || 0,
                      }))
                    }
                    style={{ width: "40px", textAlign: "center" }}
                  />
                ) : (
                  <Typography variant="body2">{drsItem.drsPass}</Typography>
                )}
              </TableCell>

              <TableCell align="center">
                {editRowKey === drsItem.teamId ? (
                  <input
                    type="number"
                    value={editedDRS.drsFail ?? drsItem.drsFail}
                    onChange={(e) =>
                      setEditedDRS((prev) => ({
                        ...prev,
                        drsFail: parseInt(e.target.value) || 0,
                      }))
                    }
                    style={{ width: "40px", textAlign: "center" }}
                  />
                ) : (
                  <Typography variant="body2">{drsItem.drsFail}</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  size="small"
                  disabled={drsItem.drsLeft === 0}
                  onClick={() => handleTakeAction(drsItem)}
                  sx={{
                    minWidth: "auto",
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                  }}
                >
                  Take
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleLogAction(drsItem)}
                  sx={{
                    minWidth: "auto",
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                  }}
                >
                  {logExpanded[`${drsItem.teamId}_${drsItem.currentInnings}`]
                    ? "Hide"
                    : "Log"}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderLogContent = (team) => {
    const logKey = `${team.teamId}_${team.currentInnings}`;
    const logs = drsLogs[logKey] || [];
    const isLoading = loadingLogs[logKey];

    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: 100, p: 2 }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (!logs || logs.length === 0) {
      return (
        <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            No DRS logs available
          </Typography>
        </Box>
      );
    }

    return (
      <Accordion expanded sx={{ mb: 1 }}>
        <AccordionDetails sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>DRS</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Team ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Commentary ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Result</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Count Review</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs
                  .sort((a, b) => b.order - a.order)
                  .map((log, index) => (
                    <TableRow>
                      <TableCell>{log.order}</TableCell>
                      <TableCell>{log.teamId}</TableCell>
                      <TableCell>{log.commentaryId}</TableCell>
                      <TableCell>
                        {log.result ? "Successful" : "Failed"}
                      </TableCell>
                      <TableCell>{log.isCount ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {sortedTeams.map((team, index) => (
        <Box key={`${team.teamId}_${team.currentInnings}`}>
          <Accordion
            expanded={
              sortedTeams.length > 1
                ? expanded === `${team.teamId}_${team.currentInnings}`
                : true
            }
            onChange={handleChange(`${team.teamId}_${team.currentInnings}`)}
            sx={{
              "&:before": { display: "none" },
              boxShadow: "none",
              "& .MuiAccordionSummary-root": {
                borderBottom: "1px solid #eee",
              },
            }}
            className="right-panel-over-accordian"
          >
            <AccordionSummary
              className="right-panel-over-accordian-summary"
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2 }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontFamily: "'Work Sans', sans-serif",
                  }}
                  className="accordian-text"
                >
                  {team.teamName}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontFamily: "'Work Sans', sans-serif",
                  }}
                  className="accordian-text"
                >
                  - Innings {team.currentInnings}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {renderDRSTable(team)}
            </AccordionDetails>
          </Accordion>

          {/* DRS Logs Accordion - appears below the team accordion */}
          {logExpanded[`${team.teamId}_${team.currentInnings}`] && (
            <Accordion
              expanded={true}
              sx={{
                mt: 1,
                "&:before": { display: "none" },
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <AccordionDetails sx={{ p: 0 }}>
                {renderLogContent(team)}
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      ))}

      {/* DRS Action Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="drs-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography id="drs-modal-title" variant="h6" component="h2">
              DRS Decision
            </Typography>
            <IconButton onClick={handleModalClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Set the DRS outcome for {selectedDRS?.teamName || "this team"}:
            </Typography>

            <Box mb={2} display="flex" alignItems="center">
              <Typography>Result:</Typography>
              <Switch
                checked={modalData.result}
                onChange={(e) => {
                  const newResult = e.target.checked;
                  setModalData({
                    ...modalData,
                    result: newResult,
                    isCount: newResult ? false : true,
                  });
                }}
              />
            </Box>
            {!modalData.result && (
              <Box mb={2} display="flex" alignItems="center">
                <Typography>Count Review:</Typography>
                <Switch
                  checked={modalData.isCount}
                  onChange={(e) => {
                    const newIsCount = e.target.checked;
                    setModalData({
                      ...modalData,
                      isCount: newIsCount,
                    });
                  }}
                />
              </Box>
            )}
          </Box>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmitDRS}>
              Submit DRS
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DRSAccordion;
