import React, { useState, useEffect, useRef, useCallback } from "react";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { Tooltip, Tag } from "antd";
import Table from "../../../components/Common/Table";
import { Container, Row, Col } from "reactstrap";
import SpinnerModel from "../../../components/Model/SpinnerModel";
import TabModel from "../../../components/Model/AddTabModel";
import DeleteTabModel from "../../../components/Model/DeleteModel";
import MatchCard from "./MatchCard"; // Import the new MatchCard component
import axiosInstance from "../../../Features/axios";
import { useNavigate, useLocation } from "react-router-dom";
import _, { isEmpty } from "lodash";
import moment from "moment";

import {
  ERROR,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_IMPORT_ENTITYIMPORT,
} from "../../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../../Features/toasterSlice";
import { loadInit } from "../../../config";

// Match status enum mapping (numbers)
const MatchStatus = {
  LIVE: 1,
  COMPLETED: 2,
  UPCOMING: 3,
};

export const SeasonList = () => {
  const pageName = TAB_IMPORT_ENTITYIMPORT;
  document.title = "Season Wise Competition List";

  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // State variables
  const [data, setData] = useState([]);
  const [matchData, setMatchData] = useState(null); // New state for match data
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);

  // Get initial data from navigation state
  const seasonId = location.state?.importEntitySeasonId || "0";
  const year = location.state?.year || "";

  let entitySportUrl =
    loadInitData.find((item) => item.key === loadInit.ENTITYSPORTURL)?.value ||
    "https://es.deployed.live";

  // New state for nested navigation
  const [selectedLevel, setSelectedLevel] = useState({
    seasonId: seasonId,
    competitionId: null,
    matchId: null,
    level: "seasonCompetitions", // 'seasonCompetitions', 'competitions', 'competitionMatches', 'matchList','matchInfo'
    competitionStatus: null, // Default status for competitions (string)
    matchStatus: null, // Default status for match list (enum)
  });
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Status color mapping for competitions (string values)
  // const getCompetitionStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case "live":
  //       return "processing";
  //     case "result":
  //       return "success";
  //     case "fixture":
  //       return "warning";
  //     default:
  //       return "default";
  //   }
  // };

  const getCompetitionStatus = (status) => {
    switch (status) {
      case "live":
        return "LIVE";
      case "result":
        return "COMPLETED";
      case "fixture":
        return "UPCOMING";
      default:
        return "UNKNOWN";
    }
  };
  // Status color mapping for matches (enum values)
  // const getMatchStatusColor = (status) => {
  //   switch (parseInt(status)) {
  //     case 1:
  //       return "processing";
  //     case 2:
  //       return "success";
  //     case 3:
  //       return "warning";
  //     default:
  //       return "default";
  //   }
  // };

  // const getMatchStatusText = (status) => {
  //   switch (parseInt(status)) {
  //     case 1:
  //       return "LIVE";
  //     case 2:
  //       return "COMPLETED";
  //     case 3:
  //       return "UPCOMING";
  //     default:
  //       return "UNKNOWN";
  //   }
  // };

  const getMatchStatus = (status) => {
    switch (parseInt(status)) {
      case 1:
        return "LIVE";
      case 2:
        return "COMPLETED";
      case 3:
        return "UPCOMING";
      default:
        return "UNKNOWN";
    }
  };

  // Initialize navigation history only once
  useEffect(() => {
    if (seasonId !== "0" && navigationHistory.length === 0) {
      setNavigationHistory([
        {
          label: `Season Competitions (${year})`,
          value: {
            seasonId: seasonId,
            competitionId: null,
            matchId: null,
            level: "seasonCompetitions",
            competitionStatus: null,
            matchStatus: null,
          },
        },
      ]);
    }
  }, [seasonId, year]);

  // Memoized fetch function to prevent infinite loops
  const fetchData = useCallback(
    async (page = 1, limit = 10) => {
      if (!selectedLevel.seasonId || selectedLevel.seasonId === "0") {
        dispatch(
          updateToastData({
            type: ERROR,
            message: "Season ID not found",
          })
        );
        return;
      }

      setIsLoading(true);
      let endpoint = "";
      let payload = {};

      try {
        switch (selectedLevel.level) {
          case "seasonCompetitions":
            endpoint = `${entitySportUrl}/admin/list/seasonCompetitions`;
            payload = {
              sid: +selectedLevel.seasonId,
              page: page,
              limit: limit,
            };
            break;
          case "competitions":
            endpoint = `${entitySportUrl}/admin/list/competitions`;
            payload = {
              status: selectedLevel.competitionStatus,
              page: page,
              limit: limit,
            };
            break;
          case "competitionMatches":
            endpoint = `${entitySportUrl}/admin/list/competitionMatches`;
            payload = {
              cid: selectedLevel.competitionId,
              page: page,
              limit: limit,
            };
            break;
          case "matchList":
            endpoint = `${entitySportUrl}/admin/list/matchList`;
            payload = {
              status: selectedLevel.matchStatus, // enum value (number)
              page: page,
              limit: limit,
            };
            break;
          case "matchInfo":
            endpoint = `${entitySportUrl}/admin/list/MatchInfo`;
            payload = {
              mid: +selectedLevel.matchId,
              page: page,
              limit: limit,
            };
            break;
          default:
            setIsLoading(false);
            return;
        }

        // console.log(`Fetching ${selectedLevel.level} with payload:`, payload);
        const response = await axiosInstance.post(endpoint, payload);

        let apiData = [];
        let totalCount = 0;

        // Handle different response structures
        if (response?.result?.response?.items) {
          apiData = response.result.response.items;
          totalCount =
            response.result.response.total_items ||
            response.result.response.total ||
            0;
        } else if (response?.result?.response) {
          apiData = response.result.response;
          totalCount = response?.result?.total || 0;
        } else if (response?.data?.result?.appdata) {
          // For seasonCompetitions
          apiData = response.data.result.appdata;
          totalCount = response.data.result.total || 0;
        } else if (response?.result?.data) {
          apiData = response?.result.data || [];
          totalCount = response?.total || 0;
        } else {
          apiData = response?.result || [];
          totalCount = response?.total || 0;
        }
        // console.log({ apiData, response });
        // console.log(`${selectedLevel.level} API Response:`, {
        //   apiData,
        //   totalCount,
        // });

        setData(apiData);
        setTotal(totalCount);
        setCurrentPage(page);
        setPageSize(limit);
      } catch (error) {
        console.error(`Error fetching ${selectedLevel.level}:`, error);
        dispatch(
          updateToastData({
            type: ERROR,
            message: `Failed to fetch ${selectedLevel.level} data`,
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedLevel, entitySportUrl, dispatch]
  );

  // Handle item click for navigation
  const handleItemClick = (record, nextLevel, labelField) => {
    let newSelectedLevel = { ...selectedLevel };
    let currentRecord = {
      label: record[labelField],
      value: { ...selectedLevel },
    };

    // eslint-disable-next-line default-case
    switch (nextLevel) {
      case "competitions":
        newSelectedLevel = {
          ...selectedLevel,
          level: "competitions",
          competitionStatus: null, // Default status (string)
        };
        break;
      case "competitionMatches":
        newSelectedLevel = {
          ...selectedLevel,
          competitionId: record.cid || record.id,
          level: "competitionMatches",
        };
        break;
      case "matchList":
        newSelectedLevel = {
          ...selectedLevel,
          matchId: record.match_id || record.id,
          level: "matchList",
          matchStatus: null, // Default status (enum)
        };
        break;
      case "matchInfo":
        newSelectedLevel = {
          ...selectedLevel,
          matchId: record.match_id || record.id,
          level: "matchInfo",
        };
        break;
    }

    currentRecord.value = newSelectedLevel;
    const newHistory = [...navigationHistory, currentRecord];
    setNavigationHistory(newHistory);
    setSelectedLevel(newSelectedLevel);
    setData([]);
    // setMatchData(null); // Clear match data
    setCurrentPage(1); // Reset to first page
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (value) => {
    let historyList = _.clone(navigationHistory);
    const index = historyList.findIndex((item) => _.isEqual(item.value, value));
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    setNavigationHistory(historyList);
    setSelectedLevel(value);
    setData([]); // Clear current data
    // setMatchData(null);
    setCurrentPage(1); // Reset to first page
  };

  // Handle back to years
  const handleBackToYears = () => {
    navigate(-1); // Go back to EntityImport page
  };

  // Format date/time
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("DD/MM/YYYY HH:mm");
  };

  // Handle page change
  const handlePageChange = (page, size) => {
    if (page !== currentPage || size !== pageSize) {
      setCurrentPage(page);
      setPageSize(size);
      fetchData(page, size, true); // Force refresh for pagination
    }
    // setCurrentPage(page);
    // setPageSize(size);
    // console.log("HI from 1")
    // fetchData(page, size);
  };

  // Column configurations for different levels
  const getSeasonCompetitionsColumns = () => [
    {
      title: "ID",
      dataIndex: "cid",
      key: "cid",
      width: "10%",
    },
    {
      title: "Competition",
      dataIndex: "title",
      key: "title",
      width: "40%",
      render: (text, record) => (
        <Tooltip title={`Click to view competitions for ${text}`}>
          <span
            className="cursor-pointer"
            onClick={() => handleItemClick(record, "competitions", "title")}
            style={{
              cursor: "pointer",
              color: "#000",
              // textDecoration: "underline",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "datestart",
      key: "datestart",
      width: "20%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "End Date",
      dataIndex: "dateend",
      key: "dateend",
      width: "20%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => getCompetitionStatus(status),
      // render: (status) => (
      //   <Tag color={getCompetitionStatusColor(status)}>
      //     {status?.toUpperCase() || "UNKNOWN"}
      //   </Tag>
      // ),
    },
  ];

  const getCompetitionsColumns = () => [
    {
      title: "ID",
      dataIndex: "cid",
      key: "cid",
      width: "10%",
    },
    {
      title: "Competition Name",
      dataIndex: "title",
      key: "title",
      width: "50%",
      render: (text, record) => (
        <Tooltip title={`Click to view matches for ${text}`}>
          <span
            className="cursor-pointer"
            onClick={() =>
              handleItemClick(record, "competitionMatches", "title")
            }
            style={{
              cursor: "pointer",
              color: "#000",
              // textDecoration: "underline",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "datestart",
      key: "datestart",
      width: "15%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "End Date",
      dataIndex: "dateend",
      key: "dateend",
      width: "15%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => getCompetitionStatus(status),
      // render: (status) => (
      //   <Tag color={getCompetitionStatusColor(status)}>
      //     {status?.toUpperCase() || "UNKNOWN"}
      //   </Tag>
      // ),
    },
  ];

  const getCompetitionMatchesColumns = () => [
    {
      title: "Match ID",
      dataIndex: "match_id",
      key: "match_id",
      width: "10%",
    },
    {
      title: "Match",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text, record) => (
        <Tooltip title={`Click to view match list for ${text}`}>
          <span
            className="cursor-pointer"
            onClick={() => handleItemClick(record, "matchList", "title")}
            style={{
              cursor: "pointer",
              color: "#000",
              // textDecoration: "underline",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "date_start_ist",
      key: "date_start_ist",
      width: "15%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "End Date",
      dataIndex: "date_end_ist",
      key: "date_end_ist",
      width: "15%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "Venue",
      dataIndex: "venue", // Assuming venue is an object
      key: "venue",
      width: "12.5%",
      render: (venue) => venue?.name || "N/A",
    },
    {
      title: "Country",
      dataIndex: "venue", // Assuming venue contains country info
      key: "country",
      width: "12.5%",
      render: (venue) => venue?.country || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => getMatchStatus(status),
      // render: (status) => (
      //   <Tag color={getMatchStatusColor(status)}>
      //     {getMatchStatusText(status)}
      //   </Tag>
      // ),
    },
  ];

  const getMatchListColumns = () => [
    {
      title: "Match ID",
      dataIndex: "match_id",
      key: "match_id",
      width: "10%",
    },
    {
      title: "Match Title",
      dataIndex: "title",
      key: "title",
      width: "30%",
      render: (text, record) => (
        <Tooltip title={`Click to view match info of ${text}`}>
          <span
            className="cursor-pointer"
            onClick={() => handleItemClick(record, "matchInfo", "title")}
            style={{
              cursor: "pointer",
              color: "#000",
              // textDecoration: "underline",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Team A",
      dataIndex: "teama",
      key: "teama",
      width: "20%",
      render: (team) => team?.name || team || "N/A",
    },
    {
      title: "Team B",
      dataIndex: "teamb",
      key: "teamb",
      width: "20%",
      render: (team) => team?.name || team || "N/A",
    },
    {
      title: "Start Date",
      dataIndex: "date_start",
      key: "date_start",
      width: "15%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "End Date",
      dataIndex: "date_end",
      key: "date_end",
      width: "15%",
      render: (text) => formatDateTime(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => getMatchStatus(status),
      // render: (status) => (
      //   <Tag color={getMatchStatusColor(status)}>
      //     {getMatchStatusText(status)}
      //   </Tag>
      // ),
    },
  ];

  // Get current columns based on level
  const getCurrentColumns = () => {
    switch (selectedLevel.level) {
      case "seasonCompetitions":
        return getSeasonCompetitionsColumns();
      case "competitions":
        return getCompetitionsColumns();
      case "competitionMatches":
        return getCompetitionMatchesColumns();
      case "matchList":
        return getMatchListColumns();
      // case "matchInfo":
      //   return getMatchInfoColumns();
      default:
        return getSeasonCompetitionsColumns();
    }
  };

  // Get current title based on level
  const getCurrentTitle = () => {
    switch (selectedLevel.level) {
      case "seasonCompetitions":
        return `Season Competitions for Year ${year}`;
      case "competitions":
        return `Competitions for Year  ${year} `;
      // return `Competitions (${selectedLevel.competitionStatus})`;
      case "competitionMatches":
        return "Competition Matches";
      case "matchList":
        return "Match List";
      case "matchInfo":
        return "Match Details";
      default:
        return `Season Listing for Year ${year}`;
    }
  };

  // Table element configuration
  const tableElement = {
    title: getCurrentTitle(),
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: true,
    isServerPagination: true,
  };

  // Initial permission check and setup
  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
      return;
    }

    if (!seasonId || seasonId === "0") {
      navigate("/importEntity");
      return;
    }
  }, [permissionObj, seasonId, navigate]);

  useEffect(() => {
    if (selectedLevel.seasonId && selectedLevel.seasonId !== "0") {

      fetchData(1, pageSize); // Always start from page 1 when level changes
    }
  }, [
    selectedLevel.level,
    selectedLevel.competitionId,
    selectedLevel.matchId,
    selectedLevel.seasonId,
    pageSize,
  ]);

  const handleReload = () => {
    fetchData(currentPage, pageSize);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Row>
            {isLoading && <SpinnerModel />}
            <Row>
              <Col>
                <Breadcrumbs
                  title="ScoreCard"
                  breadcrumbItem={getCurrentTitle()}
                  page={selectedLevel.level}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <button
                  className="btn btn-primary text-left"
                  onClick={handleReload}
                >
                  Reload
                </button>
              </Col>
              <Col className={"d-flex justify-content-end"}>
                <button
                  className="btn btn-danger mx-3"
                  onClick={handleBackToYears}
                >
                  Back
                </button>
              </Col>
            </Row>
          </Row>
          <Row>
            {/* Conditionally render Table or MatchCard */}
            {selectedLevel.level === "matchInfo" && !isEmpty(data) ? (
              <MatchCard matchData={data} />
            ) : (
              <Table
                ref={finalizeRef}
                columns={getCurrentColumns()}
                dataSource={data}
                tableElement={tableElement}
                deleteModelFunction={setDeleteModelVisable}
                singleCheck={checekedList}
                reFetchData={handleReload}
                serverCurrentPage={currentPage}
                serverPageSize={pageSize}
                serverTotal={total}
                setServerCurrentPage={(page) =>
                  handlePageChange(page, pageSize)
                }
                setServerPageSize={(size) => handlePageChange(1, size)}
                onBreadCrumbsClick={handleBreadcrumbClick}
                breadCrumbs={navigationHistory}
              />
            )}
          </Row>
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            singleCheck={checekedList}
          />

          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};
