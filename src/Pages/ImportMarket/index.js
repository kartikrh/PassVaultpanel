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
  const pageName = "Import Market"
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = "Import Market | ScoreCard - React Admin & Dashboard Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  
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
        console.log("this is apiData ",apiData)
        setData(apiData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };
  //table columns
  const columns = [
    {
      title: "EventTypeId",
      dataIndex:`${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "events" : "eventType"}`,
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
      title: "Event Type Name",
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
              isCompitition: !selectedMarket?.isCompitition
            })
            )
          }}><span>
          {text?.name}
        </span></div>
      ),
      key: "eventTypeName",
      sort: true,
      style: { width: "100%" },
    },
    selectedMarket?.isEvent && {
      title: "Date",
      dataIndex:`${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "event" : "eventType"}`,
      render: (text, record) => (
          <span>
            {text?.openDate}
          </span>
      ),
      key: "eventTypeId",
      sort: true,
      style: { width: "80%" },
    },
    selectedMarket?.isEvent && {
      title: "Add",
      dataIndex:`${selectedMarket?.isCompitition ? "competition" :selectedMarket?.isEvent ? "event" : "eventType"}`,
      render: (text, record) => (
        <Button
        color={"primary"}
        size="sm"
        className="btn"
        onClick={() => {
         alert(text?.id)
        }}
      >
        <i className="bx bx-plus"></i>
      </Button>
      ),
      key: "eventTypeId",
      sort: true,
      style: { width: "80%" },
    }
  ];


  //elements required
  const tableElement = {
    title: "Import Market",
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
      isCompitition: 0}))
  }
  useEffect(() => {
    // if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
    //   navigate("/dashboard")
    // }
    fetchData();
  }, [selectedMarket]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Import Market" />
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
