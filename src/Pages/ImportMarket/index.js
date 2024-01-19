import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _,{ isEqual } from "lodash";
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_EVENT_TYPES } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { resetTabSliceData, setSelectedMarketHistory, setSelectedMarket } from "../../Features/Tabs/importMarketSlice";


const Index = () => {
  const pageName = "Import Events"
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Import Market | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [status, setStatus] = useState(false)
  const [dataToDB, setDataToDB] = useState({})
  const {selectedMarket, selectedMarketHistory } = useSelector(state => state.tabsData?.importMarket);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/ImportMarket/marketList`,{...selectedMarket})
      .then((response) => {
        const apiData = response?.responseData?.appdata;
        setData(apiData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const addData = async (latestValueFromTable) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/ImportMarket/importMarketToDB`,{...dataToDB})
      .then((response) => {
        const apiData = response;
       console.log("this is add response +++ ",apiData);
       dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  //table columns
  const columns = [
    {
      title: `Id`,
      dataIndex:`${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "event" : "eventType"}`,
      render: (text, record) => (
          <span>
            {text?.id}
          </span>
      ),
      key: "eventTypeId",
      sort: true,
      style: { width: "20%" },
    },
    {
      title: `${selectedMarket?.isCompitition ? "Competition" :selectedMarket?.isEvent ? "Event" : "Event Type"}`,
      dataIndex: `${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "event" : "eventType"}`,
      render: (text, record) => (
          <div onClick={() => {
            let currentRecord = [{ label: text?.name, value: text?.id }]
            let historyList = selectedMarketHistory ?
              [].concat(selectedMarketHistory, currentRecord) : currentRecord
            dispatch(setSelectedMarketHistory(historyList))
            dispatch(
              setSelectedMarket({
              refID: text?.id,
              isAustralian: false,
              isEvent: Boolean(selectedMarket?.isCompitition),
              isCompitition: Boolean(!selectedMarket?.isCompitition),
            })
            )
            setDataToDB({
              ...dataToDB, 
              [`${selectedMarket?.isCompitition ? "competitionID" :selectedMarket?.isEvent ? "eventID" : "eventTypeID"}`]: text?.id,
              [`${selectedMarket?.isCompitition ? "competitionName" :selectedMarket?.isEvent ? "eventName" : "eventTypeName"}`]: text?.name,

            })
          }}><span>
          {text?.name}
        </span></div>
      ),
      key: "eventTypeName",
      sort: true,
      style: { width: "30%" },
    },
    selectedMarket?.isEvent && {
      title: "Date",
      dataIndex:`${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "event" : "eventType"}`,
      render: (text, record) => (
          <span>
            {text?.openDate}
          </span>
      ),
      sort: true,
      key: "eventTypeId",
      style: { width: "30%" },
    },
    selectedMarket?.isEvent && {
      title: "Import",
      dataIndex:`${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "event" : "eventType"}`,
      render: (text, record) => (
        <button
        color={"primary"}
        size="sm"
        className="btn-primary"
        onClick={()=>{
          setDataToDB({
            ...dataToDB, 
          eventName: text?.name,
          eventID: text?.id,
          timeZone: text?.timezone,
          countryCode: text?.countryCode || "",
          openDate: text?.openDate,
          venue: text?.venue || ""
          })
          setStatus(!status)
        }
        }
      >
        <i className="bx bx-plus"></i>
      </button>
      ),
      key: "eventTypeId",
      style: { width: "80%" },
    }
  ];

  

  //elements required
  const tableElement = {
    title: "Import Events",
    headerSelect: false,
    isActive: false,
    dragDrop: false,
    subTable: true,
  };

  const handleBreadCrumbsClick = (value) => {
    let historyList = _.clone(selectedMarketHistory)
    const index = historyList.findIndex(item => item.value === value);
    historyList = index === -1 ? [] : historyList.slice(0, index + 1);
    dispatch(setSelectedMarketHistory(historyList))
    dispatch(setSelectedMarket({ refID: 0,
      isAustralian: false,
      isEvent: false,
      isCompitition: false}))
  }

  useEffect(() => {
    // if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
    //   navigate("/dashboard")
    // }
    fetchData();
  }, [selectedMarket]);

  useEffect(()=>{
    addData()
  },[status])
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Import Events" />
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
            onAddNavigate={"/addEventType"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            onBreadCrumbsClick={handleBreadCrumbsClick}
            breadCrumbs={selectedMarketHistory}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            // handleDelete={handleDelete}
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

export default Index;
