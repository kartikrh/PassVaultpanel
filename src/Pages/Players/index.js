import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { isEqual, isEmpty, set } from "lodash";
import { TAB_PLAYERS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, ERROR, MODULE_PLAYERS, } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { ImportExportModel } from '../../components/Model/ImportExportModel';
import { UploadPlayerHistoryModal } from '../../components/Model/PlayerModal/UploadPlayerHistoryModal ';
import LoadDataModal from "../../components/Model/LoadDataModal";
import GenerateModal from "./GenerateModal";
import PlayerCompetitionDetails from "../../components/Model/PlayerCompetitionDetails";
import PlayerPlayedCommentary from "../../components/Model/PlayerPlayedCommentary";

const Index = () => {
  const pageName = TAB_PLAYERS
  const globalPageSize = localStorage.getItem("pageSize")
  const PlayerTeamId = +sessionStorage.getItem('PlayerTeamId');
  const PlayerEventTypeId = +sessionStorage.getItem('PlayerEventTypeId');

  const [selectedTableElements, setSelectedTableElements] = useState({
      eventType: null,
      team: null,
      isMen: null
    });
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = TAB_PLAYERS;
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [importExportModelVisable, setImportExportModelVisable] = useState(false);
  const [importExportPlayerHistoryModelVisable, setImportExportPlayerHistoryModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [PlayerHistoryObject, setPlayerHistoryObject] = useState({});
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [generateModalData, setGenerateModalData] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const location = useLocation();
  const [playerSearch, setPlayerSearch] = useState(location.state?.playerName || '');
  const [showBrokenOnly, setShowBrokenOnly] = useState(false);
  const [brokenImagePlayers, setBrokenImagePlayers] = useState([]);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasCheckedImages, setHasCheckedImages] = useState(false);
  const [isCheckingImages, setIsCheckingImages] = useState(false);
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [competitionModelVisible, setCompetitionModelVisible] = useState(false);
  const [competitionRecord, setCompetitionRecord] = useState({});
  const [commentaryPlayedModelVisible, setCommentaryPlayedModelVisible] = useState(false);
  const [playerRecord, setPlayerRecord] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);

    const { eventTypeId, teamId } = latestValueFromTable || {};

    // Update PlayerHistoryObject state with eventTypeId and teamId
    setPlayerHistoryObject((prevState) => ({
      ...prevState,
      eventTypeId: eventTypeId !== undefined ? eventTypeId : prevState.eventTypeId,
      teamId: teamId !== undefined ? teamId : prevState.teamId,
    }));

    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/player/all`, {
        eventTypeId: PlayerEventTypeId ? PlayerEventTypeId : latestValueFromTable?.eventtypeId || tableActions?.eventTypeId,
        teamId: PlayerTeamId ? PlayerTeamId : latestValueFromTable?.teamId || tableActions?.teamId,
        ...(latestValueFromTable || tableActions),
        ...(latestValueFromTable?.isMen != null ? { isMen: latestValueFromTable.isMen } : {})
      })
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a?.playerId - b?.playerId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.playerId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
        setHasCheckedImages(false);
        setShowBrokenOnly(false);
        setBrokenImagePlayers([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchEventTypeData = async () => {
    // setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
        // setIsLoading(false);
      })
      .catch((error) => { });
  };
  const fetchTeamsData = async () => {
    // setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/teamList`, {})
      .then((response) => {
        setTeams(response.result);
        // setIsLoading(false);
      })
      .catch((error) => { });
  };

  const checkBrokenPlayerImages = async (players) => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;
    const currentPagePlayers = players.slice(startIndex, endIndex);

    const validPlayers = currentPagePlayers.filter(
      (player) => player.image && player.image.trim() !== ""
    );

    const brokenImages = await Promise.all(
      validPlayers.map(async (player) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(player.image, {
            method: "HEAD",
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          return res.ok ? null : player.playerId;
        } catch (err) {
          return player.playerId;
        }
      })
    );

    const brokenPlayerIds = brokenImages.filter((id) => id !== null);
    setBrokenImagePlayers(brokenPlayerIds);
    return brokenPlayerIds;
  };

  const getFilteredData = () => {
    if (showBrokenOnly && brokenImagePlayers.length > 0) {
      // console.log("Broken Image Players:", brokenImagePlayers);
      return data.filter(player => brokenImagePlayers.includes(player.playerId));
    }
    return data;
  };

  useEffect(() => {
    if (PlayerTeamId || PlayerEventTypeId) {
      setSelectedTableElements(prev => {
        const updated = { ...prev };

        if (PlayerEventTypeId) {
          const event = eventTypes.find(e => e.eventTypeId === PlayerEventTypeId);
          updated.eventType = {
            value: event?.eventTypeId,
            label: event?.eventType,
          };
        }
        if (PlayerTeamId) {
          const team = teams.find(c => c.teamId === PlayerTeamId);
          updated.team = {
            value: team?.teamId,
            label: team?.teamName,
          };
        }

        return updated;
      });
    }
  }, [eventTypes, PlayerEventTypeId, PlayerTeamId, teams]);

  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.playerId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.playerId);
    } else {
      updateSingleCheck = [...checekedList, e.playerId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePlayerClick = (details) => {
    const url = new URL(window.location.origin + "/playerDetails");
    sessionStorage.setItem('playerId', "" + details?.playerId);
    sessionStorage.setItem('playerDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
    sessionStorage.removeItem("playerId");
    sessionStorage.removeItem("playerDetails");
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/save`, {
        playerId: record.playerId,
        playerName: record.playerName,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_PLAYERS], password })
      .then((response) => {
        fetchData();
        setLoadDataModelVisable(false);
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
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

  const handleSystemPlayer = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/updateSystemPlayer`, {
        playerId: record.playerId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handlePlayerHistory = (details) => {
    const url = new URL(window.location.origin + "/playerHistory");
    sessionStorage.setItem('playerId', "" + details?.playerId);
    sessionStorage.setItem('playerDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/player/delete`, {
        playerId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setCheckedList([]);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setDeleteModelVisable(false);
        setCheckedList([]);
      });
  };
  const handleEdit = (id) => {
    navigate("/addPlayer", { state: { userId: id } });
  };
  const handleReset = (value) => {
    fetchData(value)
  }

  // console.log("playerIds", checekedList)
  const updatedImportData = async () => {
    setIsLoading(true)
    await axiosInstance
      .post(`/admin/autoImportData/saveAll`, {refType: 7, refIds: checekedList, sourceId: 3})
      .then((response) => {
        fetchData()
        dispatch(
          updateToastData({
            data: response.result,
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

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.playerId)
      : dataIndexList;

    return sourceList.slice(startIndex, endIndex);
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    setCheckedList(
      isEqual(checekedList?.sort(), currentItems?.sort())
        ? []
        : currentItems
    );
  };

  const checkIfAllSelected = () => {
    const currentItems = getSelectedItemsData();
    return data?.length > 0 &&
      checekedList?.length > 0 &&
      isEqual(checekedList?.sort(), currentItems?.sort());
  };

  const handleTableSearchedDataChange = (data) => {
    setTableSearchedData(data);
    setCheckedList([]);
  };

  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
    setCheckedList([]);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCheckedList([]);
  };

  //table columns
  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checkIfAllSelected()}
            onChange={handleSelectAllClick}
            // checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            // onChange={() => {
            //   setCheckedList(
            //     isEqual(checekedList?.sort(),
            //       dataIndexList?.sort())
            //       ? []
            //       : dataIndexList
            //   )
            // }}
          />
        </div>
      ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.playerId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          {/* <i className="bx bx-move ms-1 mt-1"></i> */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.playerId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        // <img src={process.env.REACT_APP_BASE_URL+text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div className="cursor-pointer"
              onClick={() => {
                handlePlayerClick(record);
              }}
            >
              <img
                className="avatar-sm "
                alt=""
                src={text}
              />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "tabName",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Player Name",
      dataIndex: "playerName",
      render: (text, record) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            handlePlayerClick(record);
          }}
        >{text}</span>
      ),
      key: "playerName",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      style: { width: "30%" },
      sort: true,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",

      style: { width: "30%" },
    },
    {
      title: "Country",
      dataIndex: "countryName",
      key: "countryName",
      style: { width: "30%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip title={"Player"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isActive", record, record.isActive);
            }}
          >
            <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Men",
      key: "isMen",
      render: (text, record) => (
        <Tooltip title={"Player"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isMen ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isMen", record, record.isMen);
            }}
          >
            <i className={`bx ${record.isMen ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "System Player",
      key: "isSystemPlayer",
      render: (text, record) => (
        <Tooltip title={"System Player"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isSystemPlayer ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleSystemPlayer("isSystemPlayer", record, record.isSystemPlayer);
            }}
          >
            <i className={`bx ${record.isSystemPlayer ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Player History",
      key: "playerId",
      render: (text, record) => (
        <>
          <Tooltip title={"Player History"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              // color={"primary"}
              size="sm"
              className="btn playerHistoryBtn"
              onClick={() => {
                handlePlayerHistory(record);
              }}
            >
              <i class='bx bxs-store' ></i>
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Generate Image",
      key: "generateImage",
      render: (text, record) => (
        <>
          <Tooltip title={"Generate Image"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              // color={"info"}
              size="sm"
              className="btn generateImageBtn"
              onClick={() => {
                setGenerateModalData(record);
                setIsGenerateModalOpen(true);
              }}
            >
              GI
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "TPID",
      dataIndex: "tpId",
      key: "tpId",
      style: { width: "10%" },
      // sort: true,
    },
    {
      title: "PID",
      dataIndex: "playerId",
      key: "playerId",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: " ",
      key: "competitionDetails",
      render: (text, record) => (
      <Tooltip
        title={"Player Competition Details"}
        color={"#e8e8ea"}
        overlayInnerStyle={{ color: "#000" }}
      >
        <Button
          // color={"info"}
          size="sm"
          className="btn competitionDetailsBtn"
          onClick={() => {
            setCompetitionModelVisible(true);
            setCompetitionRecord(record);
          }}
        >
          <i class='bx bx-detail' ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: " ",
      key: "playedCommentaryDetails",
      render: (text, record) => (
      <Tooltip
        title={"Commenatry Details"}
        color={"#e8e8ea"}
        overlayInnerStyle={{ color: "#000" }}
      >
        <Button
          // color={"primary"}
          size="sm"
          className="btn commentaryDetailsBtn"
          onClick={() => {
            setCommentaryPlayedModelVisible(true);
            setPlayerRecord(record);
          }}
        >
          <i class='bx bx-info-circle' ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  const downloadExcelColumn = [
    {
      title: "Player Name",
      dataIndex: "playerName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "playerName",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Short Name",
      dataIndex: "displayName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "displayName",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Player Image",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Is Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
  ]

  const modelColumns = [
    { title: "Player Id", key: "playerId", type: "text" },
    { title: "Player Name", key: "playerName", type: "text" },
    { title: "Batsman Average", key: "batsmanAverage", type: "input" },
    { title: "Batsman StrikeRate", key: "batsmanStrikeRate", type: "input" },
    { title: "Bowler Average", key: "bowlerAverage", type: "input" },
    { title: "Bowler Economy", key: "bowlerEconomy", type: "input" },
  ];
  const dataToPick = [
    { item: "playerId", type: "text" },
    { item: "playerName", type: "text" },
    { item: "batsmanAverage", type: "input" },
    { item: "batsmanStrikeRate", type: "input" },
    { item: "bowlerEconomy", type: "input" },
    { item: "bowlerAverage", type: "input" },
    { item: "isUpdate", type: "input" }
  ];
  //elements required
  const tableElement = {
    title: "Players",
    isActive: true,
    eventTypeSelect: true,
    resetButton: true,
    reloadButton: true,
    loadData: true,
    importExport: true,
    teamsList: true,
    isMen: true,
    showBrokenImageButton: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
    fetchEventTypeData()
    fetchTeamsData()
  }, [permissionObj]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData()
    // fetchTeamsData()
  };

  const handleDownloadPlayerHistory = async () => {
    try {
      const { teamId, eventTypeId } = PlayerHistoryObject;
      setIsLoading(true);
      // Call the export API
      const response = await axiosInstance.post('/admin/playerHistory/export', {
        teamId,
        eventTypeId,
      }, {
        responseType: 'arraybuffer', // Ensure the response is treated as a file blob
      });

      if (response) {
        // Create a blob from the response data (the file)
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Players_history_${new Date().toISOString()}.xlsx`; // Dynamic filename
        document.body.appendChild(a); // Append anchor to body
        a.click(); // Trigger file download
        a.remove(); // Cleanup after download
        setIsLoading(false);
        dispatch(updateToastData({ data: 'File Downloaded successfully', title: 'SUCCESS', type: SUCCESS }));
      } else {
        console.error('Error downloading file:', response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error while downloading file:', error);
      setIsLoading(false);
      dispatch(updateToastData({ data: 'Failed to download file', title: 'Error', type: ERROR }));
    }
  };


  const UploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file); // Append the file to the FormData object

    setIsLoading(true); // You can manage loading state

    await axiosInstance
      .post(`/admin/playerHistory/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
        },
      })
      .then((response) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: 'File uploaded successfully', title: 'SUCCESS', type: SUCCESS }));
        setImportExportPlayerHistoryModelVisable(false)
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error uploading file:", error);
        dispatch(updateToastData({ data: 'Error uploading file :' + error, title: 'Error', type: ERROR }));
      });
  };

  const handlePlayerHistoryModalPopUp = (event) => {
    const { teamId, eventTypeId } = PlayerHistoryObject;
    // Check if teamId and eventTypeId are present
    if (!teamId || !eventTypeId) {
      dispatch(
        updateToastData({
          data: 'Please select both a team and event type before downloading',
          title: 'Warning',
          type: 'WARNING',
        })
      );
      return; // Exit the function if either value is missing
    }
    else {
      setImportExportPlayerHistoryModelVisable(true)
    }
  }

  const handleBrokenImageToggle = async () => {
    const newShowBrokenOnly = !showBrokenOnly;

    if (newShowBrokenOnly && !hasCheckedImages ) {
      setIsCheckingImages(true);
      const brokenTeamIds = await checkBrokenPlayerImages(data);
      setIsCheckingImages(false);
      if (brokenTeamIds.length === 0) {
        dispatch(
          updateToastData({
            data: "No player found with broken image",
            title: "Info",
            type: "info",
          })
        );
        return;
      }
      setBrokenImagePlayers(brokenTeamIds);
      setHasCheckedImages(true);
    } 
    setShowBrokenOnly(newShowBrokenOnly);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Players" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={getFilteredData()}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            onAddNavigate={"/addPlayer"}
            handleReset={handleReset}
            reFetchData={fetchData}
            handleReload={handleReload}
            selectedTableElementsLogs={selectedTableElements}
            loadDataModelFunction={setLoadDataModelVisable}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            setImportExportModelVisable={setImportExportModelVisable}
            handlePlayerHistoryModalPopUp={handlePlayerHistoryModalPopUp}
            teams={teams}
            manualExcel={downloadExcelColumn}
            playerSearch = {playerSearch}
            renderCustomFilter={() => {
              return <>
              <Tooltip title={"Update player statistics"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                <Button
                  onClick={() => updatedImportData()}
                    className="btn border"
                >
                    Update
                </Button>
              </Tooltip>
              </>
            }}
            showBrokenOnly={showBrokenOnly}
            // brokenImages={brokenImagePlayers}
            isCheckingImages={isCheckingImages}
            handleBrokenImageToggle={handleBrokenImageToggle}
            // setParentPageSize={setPageSize}
            // setParentCurrentPage={setCurrentPage}
            setParentPageSize={handlePageSizeChange}
            setParentCurrentPage={handleCurrentPageChange}
            setParentSearchedData={handleTableSearchedDataChange}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          {isGenerateModalOpen && <GenerateModal
            isOpen={isGenerateModalOpen}
            toggle={() => setIsGenerateModalOpen(!isGenerateModalOpen)}
            data={generateModalData}
            fetchData={fetchData}
          />}
          {importExportModelVisable && <ImportExportModel
            importExportModelVisable={importExportModelVisable}
            setImportExportModelVisable={setImportExportModelVisable}
            dataSource={data}
            columns={modelColumns}
            dataToPick={dataToPick}
          />}

          {importExportPlayerHistoryModelVisable && <UploadPlayerHistoryModal
            importExportPlayerHistoryModelVisable={importExportPlayerHistoryModelVisable}
            setImportExportPlayerHistoryModelVisable={setImportExportPlayerHistoryModelVisable}
            handleDownloadPlayerHistory={handleDownloadPlayerHistory}
            UploadFile={UploadFile}
          />}
          {loadDataModelVisable &&
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Players"}
            />}
          {competitionModelVisible && (
            <PlayerCompetitionDetails
              competitionModelVisible={competitionModelVisible}
              setCompetitionModelVisible={setCompetitionModelVisible}
              competitionRecord={competitionRecord}
              fetchData={fetchData}
            />
          )}
          {commentaryPlayedModelVisible && (
            <PlayerPlayedCommentary
              commentaryPlayedModelVisible={commentaryPlayedModelVisible}
              setCommentaryPlayedModelVisible={setCommentaryPlayedModelVisible}
              playerRecord={playerRecord}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
