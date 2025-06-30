import React, { useState, useEffect, useRef, useCallback } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Modal } from "antd";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import Select from "react-select";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _, { isEmpty } from "lodash";
import moment from "moment";
import config from '../../config';

import {
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_IMPORT_ENTITYIMPORT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { loadInit } from "../../config";
import MatchCard from "./MatchCard";

// Status options for Competition Status filter
const statusOptions = [
  { value: null, label: "Status" },
  { value: "live", label: "Live" },
  { value: "result", label: "Result" },//Completed
  { value: "fixture", label: "Fixture" },//Upcoming
];

// Status options for Match Status filter
const statusOptionsforMatch = [
  { value: null, label: "Status" },
  { value: 1, label: "Live" },
  { value: 2, label: "Result" },//Completed
  { value: 3, label: "Fixture" },//Upcoming
];

export default function ImportEntity() {
  const pageName = TAB_IMPORT_ENTITYIMPORT;
  document.title = "Import EntityImport";
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [currentPage, setCurrentPage] = useState(1);
  const globalPageSize = parseInt(localStorage.getItem("pageSize")) || 10;
  const [pageSize, setPageSize] = useState(globalPageSize);
  const [total, setTotal] = useState(0);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    status: null
  });

  const [selectedLevel, setSelectedLevel] = useState({
    seasonId: 2025, // Default to current year or set a specific season ID
    competitionId: null,
    matchId: null,
    level: "seasonCompetitions", // Start with season competitions
    year: 2025,
  });
  const [navigationHistory, setNavigationHistory] = useState([
    {
      label: "Season Competitions",
      value: {
        seasonId: 2025,
        competitionId: null,
        matchId: null,
        level: "seasonCompetitions",
        year: 2025,
      },
    },
  ]);

  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [dataToDB, setDataToDB] = useState({});
  let entitySportUrl =
    loadInitData.find((item) => item.key === config.loadInit.ENTITYSPORT_URL)?.value ||
    "https://es.deployed.live";

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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("DD/MM/YYYY HH:mm");
  };

  useEffect(() => {
    if (!isEmpty(permissionObj)) {
      if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
        navigate("/dashboard");
        return;
      }
      setPermissionChecked(true);
    }
  }, [permissionObj, navigate]);

  const fetchData = useCallback(async () => {
    if (!permissionChecked) return;

    setIsLoading(true);
    let endpoint = "";
    let payload = {};

    try {
      switch (selectedLevel.level) {
        case "seasonCompetitions":
          if (!selectedLevel.seasonId) {
            setIsLoading(false);
            return;
          }
          endpoint = `${entitySportUrl}/admin/v3/competitions`;
          payload = {
            sid: +selectedLevel.seasonId,
            page: currentPage == 0 ? 1 : currentPage,
            limit: pageSize,
          };
          //status filter if selected
          if (selectedFilter.status !== null && selectedFilter.status !== undefined) {
            payload.status = selectedFilter.status;
          }
          break;
        case "competitionMatches":
          if (!selectedLevel.competitionId) {
            setIsLoading(false);
            return;
          }
          endpoint = `${entitySportUrl}/admin/v3/competitions/matches`;
          payload = {
            cid: selectedLevel.competitionId,
            page: currentPage == 0 ? 1 : currentPage,
            limit: pageSize,
          };
          //status filter if selected
         if (selectedFilter.status !== null && selectedFilter.status !== undefined) {
            payload.status = selectedFilter.status;
          }
          break;
        default:
          setIsLoading(false);
          return;
      }

      const response = await axiosInstance.post(endpoint, payload);

      // let apiData = [];
      // let totalCount = 0;

      const items = response?.result?.response?.items;
      const totalItems = response?.result?.response?.total_items;

      let apiData = Array.isArray(items) ? items : [];
      let totalCount = +totalItems || apiData.length;

      // Handle different response structures
      // if (response?.data?.result?.appdata) {
      //   apiData = response.data.result.appdata;
      //   totalCount =
      //     response.data.result.totalRecordsl ||
      //     response.data.result.appdata.length;
      // } else if (response?.result?.response?.items) {
      //   apiData = response.result.response.items;
      //   totalCount =
      //     response.result.response.totalRecords ||
      //     response.result.response.total ||
      //     0;
      // } else if (
      //   response?.result?.response &&
      //   Array.isArray(response.result.response)
      // ) {
      //   apiData = response.result.response;
      //   totalCount =
      //     response?.result?.totalRecords || response.result.response.length;
      // } else if (
      //   response?.result?.data &&
      //   Array.isArray(response.result.data)
      // ) {
      //   apiData = response.result.data;
      //   totalCount =
      //     response?.result?.totalRecords || response.result.data.length;
      // } else if (response?.result && Array.isArray(response.result)) {
      //   apiData = response.result;
      //   totalCount = response?.totalRecords || response.result.length;
      // } else {
      //   console.error("Unexpected API response structure:", response);
      //   apiData = [];
      //   totalCount = 0;
      // }

      // Sort data in descending order by date
      if (selectedLevel.level === "seasonCompetitions") {
        apiData = apiData.sort(
          (a, b) => new Date(b.datestart) - new Date(a.datestart)
        );
      } else if (selectedLevel.level === "competitionMatches") {
        apiData = apiData.sort(
          (a, b) => new Date(b.date_start_ist) - new Date(a.date_start_ist)
        );
      }

      setData(apiData);
      setTotal(totalCount);
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
  }, [
    permissionChecked,
    selectedLevel,
    currentPage,
    pageSize,
    selectedFilter,
    entitySportUrl,
    dispatch,
  ]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch match details for modal
  const fetchMatchDetails = async (matchId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `${entitySportUrl}/admin/v3/matches/info`,
        {
          mid: +matchId,
        }
      );

      if (response?.result) {
        setMatchData(response.result);
        setMatchModalVisible(true);
      } else {
        dispatch(
          updateToastData({
            type: ERROR,
            message: "Failed to fetch match details",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching match details:", error);
      dispatch(
        updateToastData({
          type: ERROR,
          message: "Failed to fetch match details",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Import match data
  const addMatchData = async (matchData) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`${entitySportUrl}/admin/import/commentary`, {matchId: matchData.match_id})
      .then((response) => {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleCompetitionClick = (record) => {
    const newSelectedLevel = {
      ...selectedLevel,
      competitionId: record.cid || record.id,
      level: "competitionMatches",
    };

    const newHistory = [
      ...navigationHistory,
      {
        label: record.title,
        value: newSelectedLevel,
      },
    ];

    setNavigationHistory(newHistory);
    setSelectedLevel(newSelectedLevel);
    setData([]);
    setCurrentPage(1);
  };

  const handleMatchClick = (record) => {
    fetchMatchDetails(record.match_id || record.id);
  };

  const handleBreadcrumbClick = (value) => {
    let historyList = _.clone(navigationHistory);
    const index = historyList.findIndex((item) => _.isEqual(item.value, value));
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    setNavigationHistory(historyList);
    setSelectedLevel(value);
    setData([]);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    const filterDataToUpdate = { ...selectedFilter, [key]: value };
    setSelectedFilter(filterDataToUpdate);
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilterChange("status", null);
  }, [selectedLevel.level]);

  const handlePageChange = (page) => {
    if (page !== currentPage && !isLoading) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    if (size !== pageSize && !isLoading) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
      localStorage.setItem("pageSize", size);
    }
  };

  const handleReset = () => {
    setSelectedFilter({
      status: null
    });
    setCurrentPage(1);
  };

  // Column configurations
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
        <span
          className="cursor-pointer"
          onClick={() => handleCompetitionClick(record)}
          style={{
            cursor: "pointer",
          }}
        >
          {text}
        </span>
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
    },
  ];

  const getCompetitionMatchesColumns = () => [
    {
      title: "Import",
      dataIndex: "import",
      key: "import",
      width: "7.5%",
      render: (text, record) => (
        <button
          color={"primary"}
          size="sm"
          className="btn-primary"
          onClick={() => {
            setDataToDB({
              ...dataToDB,
              ...record,
            });
            addMatchData({
              ...dataToDB,
              ...record,
            });
          }}
        >
          <i className="bx bx-plus"></i>
        </button>
      ),
    },
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
        <span
          className="cursor-pointer"
          onClick={() => handleMatchClick(record)}
          style={{
            cursor: "pointer",
          }}
        >
          {text}
        </span>
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
      dataIndex: "venue",
      key: "venue",
      width: "12.5%",
      render: (venue) => {
        const name = venue?.name;
        const location = venue?.location;
        const country = venue?.country;

        const parts = [name, location, country].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => getMatchStatus(status),
    },
  ];

  const getCurrentStatusOptions = () => {
    if (selectedLevel.level === "competitionMatches") {
      return statusOptionsforMatch;
    }
    return statusOptions; // default: for seasonCompetitions or others
  };


  // Get current columns based on level
  const getCurrentColumns = () => {
    switch (selectedLevel.level) {
      case "seasonCompetitions":
        return getSeasonCompetitionsColumns();
      case "competitionMatches":
        return getCompetitionMatchesColumns();
      default:
        return getSeasonCompetitionsColumns();
    }
  };

  // Get current title based on level
  const getCurrentTitle = () => {
    switch (selectedLevel.level) {
      case "seasonCompetitions":
        return "Season Competitions";
      case "competitionMatches":
        return "Competition Matches";
      default:
        return "Entity Import";
    }
  };

  // Table element configuration
  const tableElement = {
    title: getCurrentTitle(),
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: selectedLevel.level !== "seasonCompetitions",
    isServerPagination: true,
    resetButton:true,
    // isNonCrud: true,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem={getCurrentTitle()} />
          {isLoading && <SpinnerModel />}

          <Table
            ref={finalizeRef}
            columns={getCurrentColumns()}
            dataSource={data}
            tableElement={tableElement}
            singleCheck={checekedList}
            reFetchData={fetchData}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={handlePageChange}
            setServerPageSize={handlePageSizeChange}
            onBreadCrumbsClick={handleBreadcrumbClick}
            breadCrumbs={navigationHistory}
            handleCustomReset={handleReset}
            renderCustomFilter={() => (
              <div className="d-flex align-items-center">
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 180 }),
                  }}
                  value={getCurrentStatusOptions().find(
                    (option) => option.value === selectedFilter?.status
                  )}
                  placeholder={"Filter by Status"}
                  onChange={(e) => {
                    handleFilterChange("status", e?.value ?? null);
                  }}
                  options={getCurrentStatusOptions()}
                  classNamePrefix="filter-dropdown"
                />
              </div>
            )}
          />

          {/* Match Details Modal */}
          <Modal
            // title="Match Details"
            open={matchModalVisible}
            onCancel={() => setMatchModalVisible(false)}
            footer={null}
            width={800}
            style={{
              top: "3rem",
              maxHeight: 650,
              overflowY: "auto",
              overflowX: "hidden",
              marginRight: "-16px",
              marginLeft: "-16px",
              marginTop: "-16px",
              marginBottom: "-16px",
            }}
            centered
          >
            <MatchCard matchData={matchData} />
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
}