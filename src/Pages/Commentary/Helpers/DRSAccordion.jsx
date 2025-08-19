import React, { useEffect, useState } from "react";
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
import { isEmpty } from "lodash";

const DRSAccordion = ({ teamDetails = [], commentaryDetails, fetchData }) => {
  console.log(teamDetails);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDRSLog, setSelectedDRSLog] = useState(null);
  const [modalData, setModalData] = useState({
    result: true,
    isCount: false,
  });

  const [drsLogs, setDrsLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState({});
  const [submittingDRS, setSubmittingDRS] = useState(false);
  const [logExpanded, setLogExpanded] = useState({});
  const [teamsData, setTeamsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isEmpty(teamDetails)) {
      setTeamsData(teamDetails);
    }
  }, [teamDetails]);

  // Group teams by batting order (higher order first)
  const sortedTeams = React.useMemo(() => {
    if (!teamsData || !Array.isArray(teamsData)) return [];

    // Sort by teamBattingOrder (higher order first)
    return teamsData.sort(
      (a, b) => (b.teamBattingOrder || 0) - (a.teamBattingOrder || 0)
    );
  }, [teamsData]);

  // Set default expanded team
  React.useEffect(() => {
    if (sortedTeams.length > 0) {
      // Only set default if no team is currently expanded
      if (expanded === null) {
        setExpanded(`${sortedTeams[0].commentaryTeamId}`);
      } else {
        // Check if the currently expanded team still exists in the updated data
        const currentTeamExists = sortedTeams.some(
          team => `${team.commentaryTeamId}` === expanded
        );
        
        // If the current team no longer exists, fall back to the first team
        if (!currentTeamExists) {
          setExpanded(`${sortedTeams[0].commentaryTeamId}`);
        }
        // If the current team still exists, keep it expanded
      }
    }
  }, [sortedTeams, expanded]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);

    if (isExpanded) {
      // When opening a new team accordion, close all log accordions
      setLogExpanded({});
    } else {
      // When closing the current team accordion, close its log accordion
      setLogExpanded((prev) => {
        const newState = { ...prev };
        delete newState[panel];
        return newState;
      });
    }
  };

  const handleTakeAction = async (drsItem) => {
    setSubmittingDRS(true);

    const payload = {
      id: 0,
      commentaryId: commentaryDetails?.commentaryId || drsItem.commentaryId,
      commentaryTeamId: drsItem.commentaryTeamId,
      teamId: drsItem.teamId,
    };

    console.log("Taking DRS with payload:", payload);

    try {
      const response = await axiosInstance.post(
        "/admin/commentary/takeDrs",
        payload
      );
      console.log("DRS taken successfully");
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );

      // Refresh the logs if they are currently expanded
      const logKey = `${drsItem.commentaryTeamId}`;
      if (logExpanded[logKey]) {
        await fetchDRSLogs(drsItem, logKey);
      }
    } catch (error) {
      console.error("Failed to take DRS", error);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      setSubmittingDRS(false);
    }
  };

  const fetchDRSLogs = async (drsItem, logKey) => {
    console.log("--------------------------------------", logKey);
    setLoadingLogs((prev) => ({ ...prev, [logKey]: true }));

    try {
      const response = await axiosInstance.post(
        "/admin/commentary/drsByCommId",
        {
          commentaryTeamId: drsItem.commentaryTeamId,
          commentaryId: commentaryDetails?.commentaryId || drsItem.commentaryId,
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
  };
  console.log(drsLogs);
  const handleLogAction = async (drsItem) => {
    const logKey = `${drsItem.commentaryTeamId}`;
    const isCurrentlyExpanded = logExpanded[logKey];
    setLogExpanded((prev) => ({
      ...prev,
      [logKey]: !isCurrentlyExpanded,
    }));

    // If expanding and no data exists, fetch the data
    if (!isCurrentlyExpanded && !drsLogs[logKey]) {
      await fetchDRSLogs(drsItem, logKey);
    }
  };

  const handleUpdateDRSClick = (log) => {
    setSelectedDRSLog(log);
    setModalData({
      result: true,
      isCount: false,
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDRSLog(null);
    setModalData({
      result: true,
      isCount: false,
    });
  };

  const handleUpdateDrs = async () => {
    if (!selectedDRSLog) return;
    setIsLoading(true);
    // setSubmittingDRS(true);

    const payload = {
      id: selectedDRSLog.id,
      teamId: selectedDRSLog.teamId,
      result: modalData.result,
      isCount: modalData.isCount,
    };

    console.log("Updating DRS with payload:", payload);

    try {
      const response = await axiosInstance.post(
        "/admin/commentary/upDrs",
        payload
      );
      console.log("DRS updated successfully");
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
      handleModalClose();

      const updatedDataFromApi = await fetchData();
      setTeamsData(updatedDataFromApi.commentaryTeams || []);

      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", selectedDRSLog);

      const logKey = `${selectedDRSLog.commentaryTeamId}`;
      const drsItem = {
        teamId: selectedDRSLog.teamId,
        currentInnings: selectedDRSLog.currentInnings,
        commentaryTeamId: selectedDRSLog.commentaryTeamId,
        commentaryId: selectedDRSLog.commentaryId,
      };
      await fetchDRSLogs(drsItem, logKey);
    } catch (error) {
      console.error("Failed to update DRS", error);
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      // setSubmittingDRS(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (log) => {
    console.log("Drs Id:", log.id);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/admin/commentary/dltDrs", {
        id: log.id,
      });

      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );

      const updatedDataFromApi = await fetchData();
      setTeamsData(updatedDataFromApi.commentaryTeams || []);

      const logKey = `${log.commentaryTeamId}`;
      const drsItem = {
        teamId: log.teamId,
        currentInnings: log.currentInnings,
        commentaryTeamId: log.commentaryTeamId,
        commentaryId: log.commentaryId,
      };
      await fetchDRSLogs(drsItem, logKey);
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      setIsLoading(false);
    }
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

    // Teams Accordion Table Head
    return (
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
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
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {drsItem.teamName}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{drsItem.drsLeft}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{drsItem.drsPass}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{drsItem.drsFail}</Typography>
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
                  {submittingDRS ? "Taking..." : "Take"}
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
                  {logExpanded[`${drsItem.commentaryTeamId}`] ? "Hide" : "Log"}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderLogContent = (team) => {
    const logKey = `${team.commentaryTeamId}`;
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
                    <strong>Created</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Result</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Count</strong>
                  </TableCell>
                  <TableCell align="center" sx={{ px: 1, py: 0.5 }}>
                    <strong>R</strong>
                  </TableCell>
                  <TableCell align="center" sx={{ px: 1, py: 0.5 }}>
                    <strong>D</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs
                  .sort((a, b) => b.order - a.order)
                  .map((log, index) => (
                    <TableRow key={log.id || index}>
                      <TableCell>{log.order}</TableCell>
                      <TableCell>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {log.result === null || log.result === undefined
                          ? "Not Set"
                          : log.result
                          ? "Successful"
                          : "Failed"}
                      </TableCell>
                      <TableCell>
                        {log.isCount === null || log.isCount === undefined
                          ? "Not Set"
                          : log.isCount
                          ? "Yes"
                          : "No"}
                      </TableCell>
                      <TableCell align="center" sx={{ px: 1, py: 0.5 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleUpdateDRSClick(log)}
                          sx={{
                            width: 32,
                            height: 32,
                            minWidth: 0,
                            fontSize: "0.75rem",
                            padding: 0,
                          }}
                        >
                          R
                        </Button>
                      </TableCell>
                      <TableCell align="center" sx={{ px: 1, py: 0.5 }}>
                        <Button
                          variant="contained"
                          color="soft-danger"
                          onClick={() => handleDelete(log)}
                          sx={{
                            width: 32,
                            height: 32,
                            minWidth: 0,
                            // fontSize: "0.75rem",
                            padding: 0,
                          }}
                        >
                          <i className="ri-delete-bin-2-line"></i>
                        </Button>
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
        <Box key={`${team.commentaryTeamId}`}>
          <Accordion
            expanded={
              sortedTeams.length > 1
                ? expanded === `${team.commentaryTeamId}`
                : true
            }
            onChange={handleChange(`${team.commentaryTeamId}`)}
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
          {logExpanded[`${team.commentaryTeamId}`] && (
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

      {/* DRS Update Modal - Opens from R button */}
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
              Set the DRS outcome:
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

            {/* Only show Count Review when result is false */}
            {!modalData.result && (
              <Box mb={2} display="flex" alignItems="center">
                <Typography>Count Review:</Typography>
                <Switch
                  checked={modalData.isCount}
                  onChange={(e) => {
                    setModalData({
                      ...modalData,
                      isCount: e.target.checked,
                    });
                  }}
                />
              </Box>
            )}
          </Box>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleModalClose}
              disabled={submittingDRS}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateDrs}
              disabled={submittingDRS}
            >
              {submittingDRS ? "Saving..." : "Update DRS"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DRSAccordion;