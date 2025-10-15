import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar, Tooltip } from "antd";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual, isEmpty } from "lodash";
import { ERROR, MODULE_EVENT_TYPES, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_COMMENTARY, TAB_COMMENTARY_LIST, TAB_EVENT_TYPES } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_EVENT_TYPES
  const CommentaryListPage = TAB_COMMENTARY_LIST
  const CommentaryPage = TAB_COMMENTARY
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Event Types";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const didInitialFetch = useRef(false);
  const [filledDropdownData, setFilledDropdownData] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [userRefData, setUserRefData] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUserPermission = () => {
    const refData = JSON.parse(localStorage.getItem("refData"));
    setUserRefData(refData);
    fetchData(refData);
  };

  useEffect(() => {
    fetchUserPermission()
    fetchEventTypeData()
  }, [])

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/competition/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
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
    const objToSave = {};
    let shouldFetchData = false;

    if (userRefData?.eventTypeId !== 0 && eventTypes && eventTypes.length > 0) {
      const matchedEvent = eventTypes.find(
        (item) => item.eventTypeId === userRefData?.eventTypeId
      );
      objToSave["eventType"] = {
        label: matchedEvent?.eventType,
        value: matchedEvent?.eventTypeId,
      };
    }

    setFilledDropdownData(objToSave);

    // Use a ref to track if we've already fetched data
    if (shouldFetchData && !didInitialFetch.current) {
      fetchData();
      didInitialFetch.current = true;
    }
  }, [eventTypes]);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/eventType/all`, {
        ...(latestValueFromTable || tableActions)
      })
      .then((response) => {
        const apiData = response?.result?.sort((a, b) => a.displayOrder - b.displayOrder);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.eventTypeId)
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.eventTypeId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.eventTypeId);
    } else {
      updateSingleCheck = [...checekedList, e.eventTypeId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handleCompetitionEventTypeClick = (details) => {
    const url = new URL(window.location.origin + "/Competition");
    sessionStorage.setItem(
      "CompetitionEventTypeId",
      "" + details?.eventTypeId
    );
    // sessionStorage.setItem(
    //   "commentaryManualOddsMarketDetails",
    //   "" + JSON.stringify(details)
    // );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("CompetitionEventTypeId");
    // sessionStorage.removeItem("commentaryManualOddsMarketDetails");
  };

  const commentaryPermission = checkPermission(permissionObj, CommentaryPage, PERMISSION_VIEW)
  const commentaryListPermission = checkPermission(permissionObj, CommentaryListPage, PERMISSION_VIEW)
  
  const handleCommentaryClick = (details) => {
    const navUrl = (commentaryPermission && commentaryListPermission) ? "/Commentary" : commentaryPermission ? "/Commentary" : commentaryListPermission ? "/CommentaryList" : ''
    const url = new URL(window.location.origin + navUrl);
    sessionStorage.setItem(
      "commentaryEventTypeId",
      "" + details?.eventTypeId
    );
    // sessionStorage.setItem(
    //   "commentaryManualOddsMarketDetails",
    //   "" + JSON.stringify(details)
    // );
    window.open(url.href, "_blank");
    sessionStorage.removeItem("commentaryEventTypeId");
    // sessionStorage.removeItem("commentaryManualOddsMarketDetails");
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/eventType/save`, {
        eventTypeId: record.eventTypeId,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        fetchData();
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, {module: [MODULE_EVENT_TYPES], password})
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
      .post(`/admin/eventType/delete`, {
        eventTypeId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
        setDeleteModelVisable(false);
      });
  };

  const handleEdit = (eventTypeId) => {
    navigate("/addEventType", { state: { eventTypeId } });
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.eventTypeId)
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
            //   setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
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
            checked={checekedList.includes(record.eventTypeId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          <i className="bx bx-move ms-1 mt-1"></i>
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT)
    && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.eventTypeId);
          }}
        ></i>
      ),
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
            <div>
              <img
                // className="avatar-xs rounded-circle"
                className="avatar-xs"
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
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      sort: true,
      style: { width: "100%" },
    },

    {
      title: "Highlights",
      key: "isHighlight",
      dataIndex: "isHighlight",
      render: (text, record) => (
      <Tooltip title={"Highlights"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isHighlight", record, record.isHighlight);
          }}
        >
          <i
            className={`bx ${record.isHighlight ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isActive", record, record.isActive);
          }}
        >
          {" "}
          <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "",
      dataIndex: "",
      key: "",
      render: (text, record) => (
      <Tooltip title={"Competition"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"primary"}
          size="sm"
          className="btn"
          onClick={() => {
            handleCompetitionEventTypeClick(record)
            // handlePermissions("isHighlight", record, record.isHighlight);
          }}
        >
          C
        </Button>
      </Tooltip>
      ),
      // sort: true,
      style: { width: "10%" },
    },
    (commentaryPermission || commentaryListPermission) &&
    {
      title: "",
      dataIndex: "",
      key: "",
      render: (text, record) => {
        const isMatchingEvent =
          record?.eventTypeId === filledDropdownData?.eventType?.value;
          
        if (userRefData.eventTypeId != 0 && !isMatchingEvent) return null; 

        return (
          <Tooltip
            title={"Commentary List"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => handleCommentaryClick(record)}
            >
              CL
            </Button>
          </Tooltip>
        );
      },
      // sort: true,
      style: { width: "10%" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Event Types",
    headerSelect: false,
    isActive: true,
    dragDrop: true,
    reloadButton: true,
    loadData: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
  }, [permissionObj]);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Event Types" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            changeOrderApiName="eventType"
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addEventType"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <TabModel
            addModelVisable={addModelVisable}
            setAddModelVisable={setAddModelVisable}
          />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Event Types"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
