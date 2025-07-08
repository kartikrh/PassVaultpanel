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


export default function ImportEntity() {
  const pageName = TAB_IMPORT_ENTITYIMPORT;
  document.title = "Import EntityImport";
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [currentPage, setCurrentPage] = useState(1);
  const globalPageSize = parseInt(localStorage.getItem("pageSize")) || 10;
  const [pageSize, setPageSize] = useState(globalPageSize);
  const [total, setTotal] = useState(0);
  const [permissionChecked, setPermissionChecked] = useState(false);

  const [statusOptionsforMatch, setStatusOptionsforMatch] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  // Initialize filter based on level
  const getDefaultFilter = (level) => {
    if (level === "competitionMatches") {
      return { status: 1 }; // Live for matches (enum value)
    }
    return { status: "live" }; // Live for competitions (string value)
  };

  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter("competitions"));

  const [selectedLevel, setSelectedLevel] = useState({
    seasonId: 2025, // Default to current year or set a specific season ID
    competitionId: null,
    matchId: null,
    level: "competitions", // Start with season competitions
    year: 2025,
  });
  const [navigationHistory, setNavigationHistory] = useState([
    {
      label: "Competitions",
      value: {
        seasonId: 2025,
        competitionId: null,
        matchId: null,
        level: "competitions",
        year: 2025,
      },
    },
  ]);

  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [dataToDB, setDataToDB] = useState({});
  let entitySportUrl =
    loadInitData.find((item) => item.key === loadInit.ENTITYSPORT_URL)?.value ||
    "https://es.deployed.live";

  const getCompetitionStatus = (status) => {
    const statusLower = String(status).toLowerCase();
    switch (statusLower) {
      case "live":
        return "LIVE";
      case "result":
      case "completed":
        return "COMPLETED";
      case "fixture":
      case "upcoming":
      case "scheduled":
        return "SCHEDULED";
      case "cancelled":
      case "abandoned":
        return "CANCELLED";
      default:
        return " ";
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("DD/MM/YYYY");
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

  // Client-side filtering function for matches
  const filterMatchData = useCallback((rawData, statusFilter) => {
    if (!rawData || rawData.length === 0) return [];
    if (statusFilter === null || statusFilter === undefined) {
      return rawData;
    }

    // For matches, statusFilter is enum
    return rawData.filter((item) => item.status === statusFilter);
  }, []);

  // Apply client-side filtering when filter changes for matches
  useEffect(() => {
    if (selectedLevel.level === "competitionMatches" && rawData.length > 0) {
      const filteredData = filterMatchData(rawData, selectedFilter.status);
      setData(filteredData);
      setTotal(filteredData.length);
    }
  }, [selectedFilter.status, rawData, selectedLevel.level, filterMatchData]);

  const fetchData = useCallback(async () => {
    if (!permissionChecked) return;

    setIsLoading(true);
    let endpoint = "";
    let payload = {};

    try {
      switch (selectedLevel.level) {
        case "competitions":
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
          //status filter if selected - server-side filtering for competitions
          if (
            selectedFilter.status !== null &&
            selectedFilter.status !== undefined
          ) {
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
          //client-side filtering in Matches
          break;
        default:
          setIsLoading(false);
          return;
      }

      const response = await axiosInstance.post(endpoint, payload);

      const items = response?.result?.response?.items;
      const totalItems = response?.result?.response?.total_items;

      let apiData = Array.isArray(items) ? items : [];
      let totalCount = +totalItems || apiData.length;

      // Sort data in ascending order by date
      if (selectedLevel.level === "competitions") {
        apiData = apiData
          .map((item) => {
            return { ...item, status: getCompetitionStatus(item.status) };
          })
          .sort((a, b) => new Date(a.datestart) - new Date(b.datestart));

        setData(apiData);
        setTotal(totalCount);
      } else if (selectedLevel.level === "competitionMatches") {
        apiData = apiData.sort(
          (a, b) => new Date(a.date_start_ist) - new Date(b.date_start_ist)
        );

        // Store raw data for client-side filtering
        setRawData(apiData);

        // Apply client-side filtering
        const filteredData = filterMatchData(apiData, selectedFilter.status);
        setData(filteredData);
        setTotal(filteredData.length);
      }
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
    selectedLevel.level,
    selectedLevel.seasonId,
    selectedLevel.competitionId,
    currentPage,
    pageSize,
    // Only include selectedFilter.status for competitions (server-side filtering)
    ...(selectedLevel.level === "competitions" ? [selectedFilter.status] : []),
    entitySportUrl,
    dispatch,
    filterMatchData,
  ]);

  useEffect(() => {
    fetchMatchStatusData();
    fetchCompStatusData()
  }, []);
  
    const fetchMatchStatusData = async () => {
      try {
        const response = await axiosInstance.post('/admin/list/matchStatus');
        const result = response?.result;
  
        if (result && typeof result === 'object') {
          const options = [
            { value: null, label: "Status" },
            ...Object.entries(result).map(([label, value]) => ({
              label,
              value
            }))
          ];
  
          setStatusOptionsforMatch(options);
        } else {
          console.error("Invalid response format", result);
          setStatusOptionsforMatch([]);
        }
      } catch (error) {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setStatusOptionsforMatch([]);
      }
    };
    const fetchCompStatusData = async () => {
      try {
        const response = await axiosInstance.post('/admin/list/compStatus');
        const result = response?.result;
  
        if (result && typeof result === 'object') {
          const uniqueValues = [...new Set(Object.values(result))];
  
          const options = [
            { value: null, label: "Status" },
            ...uniqueValues.map((value) => ({
              value,
              label: value
            }))
          ];
  
          setStatusOptions(options);
        } else {
          console.error("Invalid response format", result);
          return [];
        }
      } catch (error) {
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        return [];
      }
    };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch match details for modal popup
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
      .post(`/admin/autoImportData/save`, {
        // matchId: matchData.match_id,
        refId: matchData.match_id,
        refType: 3,
        sourceId: 3,
      })
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

  const addCompetitionData = async (data) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/autoImportData/save`, {
        // cId: data.cid,
        refId: data.cid,
        refType: 2,
        sourceId: 3,
      })
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
    setRawData([]);
    setCurrentPage(0);
    setSelectedFilter(getDefaultFilter("competitionMatches"));
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
    setRawData([]);
    setCurrentPage(0);
    // Set appropriate default filter based on level
    setSelectedFilter(getDefaultFilter(value.level));
  };

  const handleFilterChange = (key, value) => {
    const filterDataToUpdate = { ...selectedFilter, [key]: value };
    setSelectedFilter(filterDataToUpdate);

    // Reset to first page only for competitions (server-side filtering)
    if (selectedLevel.level === "competitions") {
      setCurrentPage(0);
    }
  };

  const handlePageChange = (page) => {
    if (page === currentPage || isLoading) return;
    if (page !== currentPage && !isLoading) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    if (size !== pageSize && !isLoading) {
      setPageSize(() => {
        setCurrentPage(0); // only after pageSize is updated
        return size;
      });
      localStorage.setItem("pageSize", size);
    }
  };

  const handleReset = () => {
    setSelectedFilter(getDefaultFilter(selectedLevel.level));
    setCurrentPage(0);
  };

  // Column configurations
  const getCompetitionsColumns = () => [
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
            addCompetitionData({
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
      title: "Start Date",
      dataIndex: "datestart",
      key: "datestart",
      width: "20%",
      sort: true,
      render: (text) => formatDate(text),
    },
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
      title: "Format",
      dataIndex: "game_format",
      key: "game_format",
      width: "10%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
    },
    {
      title: "Season",
      dataIndex: "season",
      key: "season",
      width: "10%",
      style: { textAlign: "center" },
    },
    {
      title: "Total Matches",
      dataIndex: "total_matches",
      key: "total_matches",
      width: "10%",
      style: { textAlign: "center" },
    },
    {
      title: "Total rounds",
      dataIndex: "total_rounds",
      key: "total_rounds",
      width: "10%",
      style: { textAlign: "center" },
    },
    {
      title: "End Date",
      dataIndex: "dateend",
      key: "dateend",
      width: "20%",
      sort: true,
      render: (text) => formatDate(text),
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
      title: "Start Date",
      dataIndex: "date_start_ist",
      key: "date_start_ist",
      width: "15%",
      sort: true,
      render: (text) => formatDateTime(text),
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
      title: "Format",
      dataIndex: "format_str",
      key: "format_str",
      width: "10%",
    },
    {
      title: "Status",
      dataIndex: "status_str",
      key: "status_str",
      width: "10%",
      render: (text) => text?.toUpperCase(),
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
      title: "End Date",
      dataIndex: "date_end_ist",
      key: "date_end_ist",
      width: "15%",
      sort: true,
      render: (text) => formatDateTime(text),
    },
  ];

  const handleReload = () => {
    fetchData();
  };
  
  const getCurrentStatusOptions = () => {
    if (selectedLevel.level === "competitionMatches") {
      return statusOptionsforMatch;
    }
    return statusOptions; // default: for competitions or others
  };

  // Get current columns based on level
  const getCurrentColumns = () => {
    switch (selectedLevel.level) {
      case "competitions":
        return getCompetitionsColumns();
      case "competitionMatches":
        return getCompetitionMatchesColumns();
      default:
        return getCompetitionsColumns();
    }
  };

  const getCurrentTitle = () => {
    switch (selectedLevel.level) {
      case "competitions":
        return "Entity Import";
      case "competitionMatches":
        return "Entity Competition Matches";
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
    subTable: selectedLevel.level !== "competitions",
    isServerPagination: true,
    resetButton: true,
    reloadButton: true,
  };
  // console.log("Length: ", data?.length||0)
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
            handleReload={handleReload}
            renderCustomFilter={() => (
              <div className="d-flex align-items-center gap-2">
                {/* Status Filter */}
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