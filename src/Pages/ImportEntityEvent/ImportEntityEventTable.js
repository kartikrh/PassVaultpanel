import React, { useState, useEffect, useRef, useCallback } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Modal } from "antd";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
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
  TAB_IMPORT_ENTITYEVENTIMPORT,
  TAB_IMPORT_ENTITYIMPORT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { loadInit } from "../../config";
import MatchCard from "./MatchCard";

const isSquadOptions = [
      { value: "Select", label: "Select" },
      { value: "true", label: "true" },
      { value: "false", label: "false" },
    ];

export default function ImportEntityEvent() {
  const pageName = TAB_IMPORT_ENTITYEVENTIMPORT;
  document.title = "Import Entity Event";
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);

  // State variables
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [formateOptions, setFormateOptions] = useState([]);
  const [selectedFormateOption, setSelectedFormateOption] = useState();
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [currentPage, setCurrentPage] = useState(1);
  const globalPageSize = parseInt(localStorage.getItem("pageSize")) || 10;
  const [pageSize, setPageSize] = useState(globalPageSize);
  const [total, setTotal] = useState(0);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [dateType, setDateType] = useState({ label: "Local Timezone", value: 'IST: +5:30' });
  const [dateRange, setDateRange] = useState({
    startDate: `${today.toISOString().split("T")[0]}T00:00:00`,
    endDate: `${oneMonthLater.toISOString().split("T")[0]}T23:59:00`,
  });
  const [statusOptionsforMatch, setStatusOptionsforMatch] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [isSquadSelectedOption, setIsSquadSelectedOption] = useState('Select');

  // Initialize filter based on level
  const getDefaultFilter = (level) => {
    if (level === "competitionMatches") {
      return { status: 3 }; // Live for matches (enum value)
    }
    return { status: 1 }; // Live for Entity Event Import (string value)
  };

  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter("Entity Event Import"));

  const [selectedLevel, setSelectedLevel] = useState({
    seasonId: 2025, // Default to current year or set a specific season ID
    competitionId: null,
    matchId: null,
    level: "Entity Event Import", // Start with season Entity Event Import
    year: 2025,
  });
  const [navigationHistory, setNavigationHistory] = useState([
    {
      label: "Entity Event Import",
      value: {
        seasonId: 2025,
        competitionId: null,
        matchId: null,
        level: "Entity Event Import",
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

  const getEntityEventStatus = (status) => {
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

  function formatToYYYYMMDD(date) {
    const d = new Date(date); // handles string or Date input
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const fetchData = useCallback(async () => {
    if (!permissionChecked) return;

    setIsLoading(true);
    let endpoint = "";
    let payload = {};

    try {
      switch (selectedLevel.level) {
        case "Entity Event Import":
          if (!selectedLevel.seasonId) {
            setIsLoading(false);
            return;
          }
          endpoint = `${entitySportUrl}/admin/v3/matches`;
          payload = {
            start_date: formatToYYYYMMDD(dateRange.startDate), 
            end_date: formatToYYYYMMDD(dateRange.endDate), 
            // sid: +selectedLevel.seasonId,
            page: currentPage == 0 ? 1 : currentPage,
            limit: pageSize,
            timezone: dateType.value,
            pre_squad: isSquadSelectedOption === "Select" ? null : isSquadSelectedOption 
          };
          //status filter if selected - server-side filtering for Entity Event Import
          if (
            selectedFilter.status !== null &&
            selectedFilter.status !== undefined
          ) {
            payload.status = selectedFilter.status;
          }
          if (selectedFormateOption) {
            payload.format = selectedFormateOption;
          }
          break;
        case "competitionMatches":
          if (!selectedLevel.competitionId) {
            setIsLoading(false);
            return;
          }
          endpoint = `${entitySportUrl}/admin/v3/matches`;
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
      if (selectedLevel.level === "Entity Event Import") {
        apiData = apiData
          .map((item) => {
            return { ...item, status: getEntityEventStatus(item.status) };
          })
          .sort((a, b) => new Date(a.datestart) - new Date(b.datestart));
        // setMatchData(response.result);
        // setMatchModalVisible(true);
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
    navigationHistory,
    permissionChecked,
    selectedLevel.level,
    selectedLevel.seasonId,
    selectedLevel.competitionId,
    currentPage,
    pageSize,
    isFilter,
    // Only include selectedFilter.status for Entity Event Import (server-side filtering)
    // ...(selectedLevel.level === "Entity Event Import" ? [selectedFilter.status] : []),
    entitySportUrl,
    dispatch,
    filterMatchData,
  ]);

  useEffect(() => {
    fetchMatchStatusData();
    // fetchCompStatusData();
    fetchMasterData()
  }, []);

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
        console.log("response?.result", response?.result)
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

  const onFilter = () =>{
    setIsFilter((prev) => !prev)
  }

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);


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

    // Reset to first page only for Entity Event Import (server-side filtering)
    if (selectedLevel.level === "Entity Event Import") {
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
    setSelectedFormateOption(0)
    setDateType({ label: "Local Timezone", value: 'IST: +5:30' })
    setIsSquadSelectedOption('true')
    setCurrentPage(0);
    setIsFilter((pre) => !pre)
  };

  // Column configurations
  const getEntityEventColumns = () => [
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
      title: "E-Date",
      dataIndex: "date_start_ist",
      key: "date_start_ist",
      width: "20%",
      sort: true,
      render: (text) => text,
    },
    {
      title: "C-Date",
      dataIndex: "datestart",
      key: "datestart",
      width: "20%",
      sort: true,
      render: (_, record) => formatDate(record?.competition?.datestart),
      // render: (text) => formatDate(text),
    },
    {
      title: "E-Id",
      dataIndex: "match_id",
      key: "match_id",
      width: "10%",
    },
    {
      title: "Competition",
      dataIndex: "title",
      key: "title",
      width: "20%",
      render: (text, record) => (
        <span
          // className="cursor-pointer"
          // onClick={() => handleCompetitionClick(record)}
          // style={{
          //   cursor: "pointer",
          // }}
          
        >
          {record?.competition?.title}
        </span>
      ),
    },
    {
      title: "E-No",
      dataIndex: "match_number",
      key: "match_number",
      width: "10%",
      style: { textAlign: "center" },
    },
    {
      title: "Event",
      dataIndex: "title",
      key: "title",
      width: "40%",
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
      title: "E-Status",
      dataIndex: "status_str",
      key: "status_str",
      style: { textAlign: "center" },
      width: "10%",
    },
    {
      title: "Format",
      dataIndex: "match_format",
      key: "match_format",
      width: "10%",
      style: { textAlign: "center" },
      render: (_, record) => record?.competition?.match_format,
    },
    {
      title: "Season",
      dataIndex: "season",
      key: "season",
      width: "10%",
      style: { textAlign: "center" },
      render: (_, record) => record?.competition?.season,
    },
    {
      title: "C-Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      style: { textAlign: "center" },
      render: (_, record) => record?.competition?.status,
    },
    {
      title: "C-Id",
      dataIndex: "cid",
      key: "cid",
      width: "10%",
      render: (_, record) => record?.competition?.cid,
    },
    {
      title: "Total Matches",
      dataIndex: "total_matches",
      key: "total_matches",
      width: "10%",
      style: { textAlign: "center" },
      render: (_, record) => record?.competition?.total_matches,
    },
    {
      title: "Total rounds",
      dataIndex: "total_rounds",
      key: "total_rounds",
      width: "10%",
      style: { textAlign: "center" },
      render: (_, record) => record?.competition?.total_rounds,
    },
    
  ];

  const handleReload = () => {
    fetchData();
  };
  
  const getCurrentStatusOptions = () => {
    if (selectedLevel.level === "competitionMatches") {
      return statusOptionsforMatch;
    }
    return statusOptionsforMatch; // default: for Entity Event Import or others
    // return statusOptions; // default: for Entity Event Import or others
  };

  // Get current columns based on level
  const getCurrentColumns = () => {
    switch (selectedLevel.level) {
      case "Entity Event Import":
        return getEntityEventColumns();
      // case "competitionMatches":
      //   return getCompetitionMatchesColumns();
      default:
        return getEntityEventColumns();
    }
  };

  const getCurrentTitle = () => {
    switch (selectedLevel.level) {
      case "Entity Event Import":
        return "Entity Event Import";
      case "competitionMatches":
        return "Competition Matches";
      default:
        return "Entity Import";
    }
  };

  const fetchMasterData = async () => {
        try {
            const response = await axiosInstance.post('/admin/list/matchType');
            const result = response?.result;

            if (result && typeof result === 'object') {
            const formattedData = Object.entries(result).map(([key, value]) => ({
                label: key,
                value: value
            }));

            setFormateOptions((preData) => ({
                ...preData,
                format: [
                { label: "Select Module Type", value: "0" },
                ...formattedData
                ]
            }));
            } else {
            console.error("Invalid response format", result);
            }
        } catch (error) {
            dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        } finally {
            
        }
    };

  // Table element configuration
  const tableElement = {
    title: getCurrentTitle(),
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: selectedLevel.level !== "Entity Event Import",
    isServerPagination: true,
    resetButton: true,
    reloadButton: true,
    // isDateRange: true,
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
            // breadCrumbs={navigationHistory}
            handleCustomReset={handleReset}
            setDateRange={setDateRange}
            dateRange={dateRange}
            handleReload={handleReload}
            renderCustomFilter={() => (
              <div className="d-flex align-items-center flex-wrap gap-2">
                {/* Status Filter */}
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  value={getCurrentStatusOptions().find((option) => {
                    return String(option.value) === String(selectedFilter?.status);
                  })}
                  placeholder={"Filter by Status"}
                  onChange={(e) => {
                    handleFilterChange("status", e?.value ?? null);
                  }}
                  options={getCurrentStatusOptions()}
                  classNamePrefix="filter-dropdown"
                />
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  value={selectedFormateOption && selectedFormateOption.value}
                  placeholder={"Format"}
                  onChange={(e) => {
                      setSelectedFormateOption(e.value)
                  }}
                  options={formateOptions?.format}
                  classNamePrefix="filter-dropdown"
                />
                <div className="d-flex flex-column">
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={dateRange?.startDate}
                    onChange={(e) => {
                      setDateRange({
                        ...dateRange,
                        startDate: e.target.value,
                      });
                      e.target.blur();
                    }}
                    id="start-datetime"
                  />
                </div>
                <div className="d-flex flex-column">
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={dateRange?.endDate}
                    onChange={(e) => {
                      setDateRange({
                        ...dateRange,
                        endDate: e.target.value,
                      });
                      e.target.blur();
                    }}
                    id="end-datetime"
                  />
                </div>
                <Select
                  value={dateType}
                  placeholder="Date Type"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      width: 140,
                    }),
                  }}
                  onChange={(e) => setDateType(e)}
                  options={[
                    { label: "Local Timezone", value: 'IST: +5:30' },
                    { label: "UTC Timezone", value: 'UTC: 00:00' },
                  ]}
                  classNamePrefix="filter-dropdown"
                />
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  value={isSquadOptions.find((option) => option.value === isSquadSelectedOption) || isSquadOptions[0]}
                  onChange={(e) => setIsSquadSelectedOption(e?.value === "Select" ? null : e?.value)}
                  options={isSquadOptions}
                  placeholder="Is Squad"
                  classNamePrefix="filter-dropdown"
                />
                <button
                // color="success"
                  className="btn btn-primary"
                  onClick={() => {
                    onFilter()
                  }}
                  type="button"
                  // id="create-btn"
                >
                  Filter
                  {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                </button>
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