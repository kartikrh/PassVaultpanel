import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual, isEmpty } from "lodash";
import { ERROR, MODULE_TEAMS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_TEAMS } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";
import GenerateModal from "./GenerateModal";

const Index = () => {
  const globalPageSize = localStorage.getItem("pageSize")
  const pageName = TAB_TEAMS
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Teams";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypeId, setEventTypeId] = useState(null);
  const [competitionId, setCompetitionId] = useState(null);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [generateModalData, setGenerateModalData] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [showBrokenOnly, setShowBrokenOnly] = useState(false);
  const [brokenImageTeams, setBrokenImageTeams] = useState([]);
  const [hasCheckedImages, setHasCheckedImages] = useState(false);
  const [isCheckingImages, setIsCheckingImages] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // fetch data
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/team/all`, {
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a?.teamId - b?.teamId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.teamId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([]);
        setHasCheckedImages(false);
        setShowBrokenOnly(false);
        setBrokenImageTeams([]); // or setBrokenImagePlayers([])
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/team/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
        setIsLoading(false);
      })
      .catch((error) => { });
  };

  const checkBrokenImages = async (teams) => {
    // setIsCheckingImages(true);
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;
    const currentPageTeams = teams.slice(startIndex, endIndex);
    const validImages = currentPageTeams.filter(
      (team) => (team.image && team.image.trim() !== "") || (team.jersey && team.jersey.trim() !== "")
    );

    const brokenImages = await Promise.all(
      validImages.map(async (team) => {
        const results = { teamId: team.teamId, imageBroken: false, jerseyBroken: false };

        // Check team image
        const checkImageWithTimeout = async (url) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          try {
            const res = await fetch(url, {
              method: "HEAD",
              signal: controller.signal
            });
            clearTimeout(timeout);
            return !res.ok;
          } catch (err) {
            clearTimeout(timeout);
            return true; // Treat timeout/error as broken
          }
        };

        if (team.image && team.image.trim() !== "") {
          results.imageBroken = await checkImageWithTimeout(team.image);
        }

        if (team.jersey && team.jersey.trim() !== "") {
          results.jerseyBroken = await checkImageWithTimeout(team.jersey);
        }

        return results.imageBroken || results.jerseyBroken ? team.teamId : null;
      })
    );

    const brokenTeamIds = brokenImages.filter((id) => id !== null);
    setBrokenImageTeams(brokenTeamIds);
    // setIsCheckingImages(false);
    return brokenTeamIds;
  };

  const getFilteredData = () => {
    if (showBrokenOnly && brokenImageTeams.length > 0) {
      // console.log("Broken Image Teams:", brokenImageTeams);
      return data.filter(team => brokenImageTeams.includes(team.teamId));
    }
    return data;
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.teamId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.teamId);
    } else {
      updateSingleCheck = [...checekedList, e.teamId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handleTournament = (details) => {
    const url = new URL(window.location.origin + "/tournamentCompetitionPoints");
    sessionStorage.setItem('teamId', "" + details?.teamId);
    sessionStorage.setItem('teamDetails', "" + JSON.stringify(details));
    window.open(url.href, '_blank');
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_TEAMS], password })
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/team/delete`, {
        teamId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        setCheckedList([])
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleEdit = (id) => {
    navigate("/addTeams", { state: { userId: id } });
  };
  const handleReset = (value) => {
    fetchData(value)
  }
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
            checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
            onChange={() => {
              setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
              )
            }}
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
            checked={checekedList.includes(record.teamId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => <i className="bx bx-edit"
        onClick={() => {
          handleEdit(record.teamId);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Image",
      dataIndex: "image",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs "
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
      key: "image",
      style: { width: "10%" },
    },
    {
      title: "Jersey Image",
      dataIndex: "jersey",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs "
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
      key: "jersey",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Short Name",
      dataIndex: "teamShortName",
      key: "teamShortName",
      style: { width: "20%" },
    },
    {
      title: "Country",
      dataIndex: "countryName",
      render: (text, record) => text !== null ? text : "N/A",
      key: "countryName",
      style: { width: "20%" },
    },
    {
      title: "Snap",
      key: "teamId",
      render: (text, record) => (
        <>
          <Tooltip title={"Snap"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
            <Button
              // color={"primary"}
              size="sm"
              className="btn snapBtn"
              onClick={() => {
                handleTournament(record);
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
  ];

  const downloadExcelColumn = [
    {
      title: "Team Name",
      dataIndex: "teamName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "teamName",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventType",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Short Name",
      dataIndex: "teamShortName",
      key: "teamShortName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Image Url",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Jersey Url",
      dataIndex: "jersey",
      key: "jersey",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      style: { width: "10%", textAlign: "left" },
    },
  ]

  //elements required
  const tableElement = {
    title: "Teams",
    headerSelect: false,
    switch: false,
    eventTypeSelect: true,
    resetButton: true,
    reloadButton: true,
    loadData: true,
    showBrokenImageButton: true,
  };

  const updatedImportData = async () => {
    setIsLoading(true)
    await axiosInstance
      .post(`/admin/team/importUpdate`, {teamIds: checekedList})
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

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
    fetchEventTypeData()
  }, [permissionObj]);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData()
  };

const handleBrokenImageToggle = async () => {
  const newShowBrokenOnly = !showBrokenOnly;

  if (newShowBrokenOnly && !hasCheckedImages) {
    setIsCheckingImages(true); 
    const brokenTeamIds = await checkBrokenImages(data);
    setIsCheckingImages(false); 
    if (brokenTeamIds.length === 0) {
      dispatch(
        updateToastData({
          data: "No team found with broken image",
          title: "Info",
          type: "info",
        })
      );
      return;
    }
    setBrokenImageTeams(brokenTeamIds);
    setHasCheckedImages(true);
  } 
  setShowBrokenOnly(newShowBrokenOnly);
};

  // console.log("-------------------------", currentPage, pageSize)
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Teams" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            // dataSource={data}
            dataSource={getFilteredData()}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            eventTypes={eventTypes}
            setEventTypeId={setEventTypeId}
            onAddNavigate={"/addTeams"}
            reFetchData={fetchData}
            setCompetitionId={setCompetitionId}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            manualExcel={downloadExcelColumn}
            renderCustomFilter={() => {
              return <>
                <Button
                  onClick={() => updatedImportData()}
                    className="btn border"
                >
                    Update
                </Button>
              </>
            }}
            showBrokenOnly={showBrokenOnly}
            // brokenImages={brokenImageTeams}
            isCheckingImages={isCheckingImages} 
            handleBrokenImageToggle={handleBrokenImageToggle}
            setParentPageSize={setPageSize}
            setParentCurrentPage={setCurrentPage}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
          />
          {loadDataModelVisable &&
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Teams"}
            />}
          {isGenerateModalOpen && <GenerateModal
            isOpen={isGenerateModalOpen}
            toggle={() => setIsGenerateModalOpen(!isGenerateModalOpen)}
            data={generateModalData}
            fetchData={fetchData}
          />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
