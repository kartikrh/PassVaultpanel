import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual } from "lodash";
import { TAB_PLAYERS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, ERROR, MODULE_PLAYERS, } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {ImportExportModel} from '../../components/Model/ImportExportModel';
import {UploadPlayerHistoryModal} from '../../components/Model/PlayerModal/UploadPlayerHistoryModal ';
import LoadDataModal from "../../components/Model/LoadDataModal";
// import GenerateModal from "./GenerateModal";

const Index = () => {
  const pageName = TAB_PLAYERS
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
      .post(`/admin/package/all`, {
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a?.id - b?.id);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.playerId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([])
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
  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.id);
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`${pType == 'isActive' ? '/admin/package/activeInactive' : '/admin/package/isDefault'}`, {
        id: record.id,
        // isActive: cState,
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/package/delete`, {
        id: checekedList,
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
        setCheckedList([]);
      });
  };
  const handleEdit = (id) => {
    navigate("/addPackage", { state: { packageId: id } });
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
              setCheckedList(
                isEqual(checekedList?.sort(),
                  dataIndexList?.sort())
                  ? []
                  : dataIndexList
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
            checked={checekedList.includes(record.id)}
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
          handleEdit(record.id);
        }}
      ></i>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "name",
      sort: true,
      style: { width: "30%" },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      style: { width: "30%" },
      sort: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",

      style: { width: "30%", textAlign: "center" },
    },
    {
      title: "Trail Days",
      dataIndex: "trailDays",
      key: "trailDays",

      style: { width: "30%", textAlign: "center" },
    },
    {
      title: "Interval Count",
      dataIndex: "intervalCount",
      key: "intervalCount",

      style: { width: "30%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip title={"Active/Inactive package"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
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
      title: "Default",
      key: "isDefault",
      render: (text, record) => (
        <Tooltip title={"isDefault"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isDefault ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isDefault", record, record.isDefault);
            }}
          >
            <i className={`bx ${record.isDefault ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    // {
    //   title: "System Player",
    //   key: "isSystemPlayer",
    //   render: (text, record) => (
    //     <Tooltip title={"Active/Inactive System Player"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
    //       <Button
    //         color={`${record.isSystemPlayer ? "primary" : "danger"}`}
    //         size="sm"
    //         className="btn"
    //         onClick={() => {
    //           handleSystemPlayer("isSystemPlayer", record, record.isSystemPlayer);
    //         }}
    //       >
    //         <i className={`bx ${record.isSystemPlayer ? "bx-check" : "bx-block"}`}></i>
    //       </Button>
    //     </Tooltip>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    // {
    //   title: "Player History",
    //   key: "playerId",
    //   render: (text, record) => (
    //     <>
    //       <Tooltip title={"Player History"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
    //         <Button
    //           color={"primary"}
    //           size="sm"
    //           className="btn"
    //           onClick={() => {
    //             handlePlayerHistory(record);
    //           }}
    //         >
    //           <i class='bx bxs-store' ></i>
    //         </Button>
    //       </Tooltip>
    //     </>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    // {
    //   title: "Generate Image",
    //   key: "generateImage",
    //   render: (text, record) => (
    //     <>
    //       <Tooltip title={"Generate Image"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
    //         <Button
    //           color={"info"}
    //           size="sm"
    //           className="btn"
    //           onClick={() => {
    //             setGenerateModalData(record);
    //             setIsGenerateModalOpen(true);
    //           }}
    //         >
    //           GI
    //         </Button>
    //       </Tooltip>
    //     </>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
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
    title: "Package",
    isActive: true,
    // eventTypeSelect: true,
    resetButton: true,
    reloadButton: true,
    // loadData: true,
    // importExport: true,
    // teamsList: true,
    dragDrop: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
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
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Package" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            changeOrderApiName="package"
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            eventTypes={eventTypes}
            onAddNavigate={"/addPackage"}
            handleReset={handleReset}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            setImportExportModelVisable={setImportExportModelVisable}
            handlePlayerHistoryModalPopUp={handlePlayerHistoryModalPopUp}
            teams={teams}
            manualExcel={downloadExcelColumn}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          {/* {isGenerateModalOpen && <GenerateModal
            isOpen={isGenerateModalOpen}
            toggle={() => setIsGenerateModalOpen(!isGenerateModalOpen)}
            data={generateModalData}
            fetchData={fetchData}
          />} */}
          {/* {importExportModelVisable && <ImportExportModel
            importExportModelVisable={importExportModelVisable}
            setImportExportModelVisable={setImportExportModelVisable}
            dataSource={data}
            columns={modelColumns}
            dataToPick={dataToPick}
          />} */}

          {/* {importExportPlayerHistoryModelVisable && <UploadPlayerHistoryModal
            importExportPlayerHistoryModelVisable={importExportPlayerHistoryModelVisable}
            setImportExportPlayerHistoryModelVisable={setImportExportPlayerHistoryModelVisable}
            handleDownloadPlayerHistory={handleDownloadPlayerHistory}
            UploadFile={UploadFile}
          />} */}
          {/* {loadDataModelVisable &&
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Package"}
            />} */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
