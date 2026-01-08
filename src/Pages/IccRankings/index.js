import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual, pickBy } from "lodash";
import {
  ERROR,
  MODULE_COMPETITION,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMPETITION,
  TAB_ICC_RANKINGS,
} from "../../components/Common/Const";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import CompetitionMarketTemplateModel from "../../components/Model/CompetitionMarketTemplateModel";
import LoadDataModal from "../../components/Model/LoadDataModal";
import { mapType } from "../Commentary/functions";
import { ChangeStatusModel } from "../../components/Model/ChangeStatusModel";
import Item from "antd/es/list/Item";

  const typeOptions = [
      { label: "Select Type", value: 0 },
      { label: "Team", value: 1 },
      { label: "Player", value: 2 },
  ]
  const genderOptions = [
      { label: "Select Gender", value: 0 },
      { label: "Men", value: 1 },
      { label: "Women", value: 2 },
  ]
  const playerTypeOptions = [
      { label: "Select Type", value: "0" },
      { label: "Batsmen", value: 1 },
      { label: "Bowler", value: 2 },
      { label: "All Rounder", value: 4 },
  ]

  // const countryOptions = (countryCode && countryCode.length) > 0 ? countryCode.map((country) => ({
  //   label: country?.countryName,
  //   value: country?.shortName,
  // })) : [];

const Index = () => {
  const pageName = TAB_ICC_RANKINGS;
  const globalPageSize = localStorage.getItem("pageSize");
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "ICC Ranking";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [matchTypes, setMatchTypes] = useState([]);
  const [matchTypeList, setMatchTypeList] = useState([{ label: "Select Gender", value: 0 }]);
  const [sportList, setSportList] = useState([{ label: "Select Sport", value: 0 }]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [typeSelectedOption, setTypeSelectedOption] = useState(undefined);
  const [genderSelectedOption, setGenderSelectedOption] = useState(undefined);
  const [playerTypeSelectedOption, setPlayerTypeSelectedOption] = useState(undefined);
  const [selectedFilter, setSelectedFilter] = useState({
      // isActive: true,
      matchTypeId: undefined,
      sportId: undefined
    });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pageSize, setPageSize] = useState(globalPageSize || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearchedData, setTableSearchedData] = useState([]);

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions;
    const payload = {
      ...data,
      sportId: selectedFilter?.sportId?.value,
      matchTypeId: selectedFilter?.matchTypeId?.value,
      type: typeSelectedOption,
      ...(genderSelectedOption !== undefined && {
        isMen: genderSelectedOption == 1 ? true : false,
      }),
      playerTypeId: playerTypeSelectedOption
    }
    await axiosInstance
      .post(
        `/admin/iccRanking/all`,
        payload
      )
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.id);
        });
        setData(response?.result);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
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

  const fetchEventTypeData = async () => {
    setIsLoading(true)
    await axiosInstance
      .post(`/admin/list/eventTypeList`, {})
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

  const fetchMatchTypeData = async () => {
    setIsLoading(true)
    await axiosInstance
      .post(`/admin/competition/getMatchTypes`, {})
      .then((response) => {
        setMatchTypes(response.result);
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
  // const updatedImportData = async () => {
  //   setIsLoading(true)
  //   await axiosInstance
  //     .get(`/admin/iccRanking/import`)
  //     .then((response) => {
  //       fetchData()
  //       dispatch(
  //         updateToastData({
  //           data: response.result,
  //           title: response?.title,
  //           type: SUCCESS,
  //         })
  //       );
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       setIsLoading(false);
  //       dispatch(
  //         updateToastData({
  //           data: error?.message,
  //           title: error?.title,
  //           type: ERROR,
  //         })
  //       );
  //     });
  // };
  const importData = async () => {
    setIsLoading(true)
    await axiosInstance
      .post(`/admin/autoImportData/save`, {
        "refId": null,
        "refType": 9,
        "sourceId": 3
      })
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.id
      );
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/iccRanking/activeInactive`, {
        id: record.id,
        [pType]: cState ? false : true,
      })
      .then((response) => {
        fetchData();
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
  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_COMPETITION], password })
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

  //delete function
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/iccRanking/delete`, {
        id: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
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

  //edit
  const handleEdit = (id) => {
    navigate("/addRanking", { state: { userId: id } });
  };

  function getLabelByValue(value, list) {
    const sport = list.find(item => item.value === value);
    return sport ? sport.label : null; // return null if not found
  }

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.id)
      : dataIndexList;

    return sourceList.slice(startIndex, endIndex);
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
    console.log("currentItems: ", currentItems);
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
            // indeterminate={
            // checked={
            //   data?.length > 0 &&
            //   isEqual(checekedList?.sort(), dataIndexList?.sort())
            // }
            // onChange={() => {
            //   setCheckedList(
            //     isEqual(checekedList?.sort(), dataIndexList?.sort())
            //       ? []
            //       : dataIndexList
            //   );
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
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          {/* {isDrag ? <i /className="bx bx-move ms-1 mt-1"></i> : null} */}
        </div>
      ), // Use 'select' as a placeholder key for the checkbox column
      key: "select",
      style: { width: "2%" },
    },
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.id);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Type",
      dataIndex: "type",
    //   printType: "ignore",
      render: (text, record) => (
        // <img src={text}/>
        <div className="flex-shrink-0">
          {text == 1 ? 'Team' : text == 2 ? 'Player' : 'undefined'}
        </div>
      ),
      key: "type",
      sort: true,
      style: { width: "10%", /* textAlign: "center" */ },
    },
    {
      title: "Sport",
      dataIndex: "sportId",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{getLabelByValue(text, sportList)}</span>
      ),
      key: "sportId",
      sort: true,
      style: { width: "10%",/*  textAlign: "center" */ },
    },
    {
      title: "Match Type",
      dataIndex: "matchTypeId",
      render: (text, record) => {
        return <span>{getLabelByValue(text, matchTypeList)}</span>;
      },
      key: "matchTypeId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Player Type",
      dataIndex: "playerTypeName",
      render: (text, record) => <span>{record?.playerTypeName ? text : " "}</span>,
      key: "playerTypeName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Player",
      dataIndex: "playerName",
      render: (text, record) => <span>{text}</span>,
      key: "playerName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Team",
      dataIndex: "teamName",
      render: (text, record) => <span>{text}</span>,
      key: "teamName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Gender",
      dataIndex: "isMen",
      render: (text, record) => {
        return<span>{text == true ? "Men" : "women"}</span>
      },
      key: "isMen",
      sort: true,
      style: { width: "10%" },
    },
    
    {
      title: "Rank",
      key: "rank",
      key: "rank",
      sort: true,
      render: (text, record) => <span>{record.rank}</span>,
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Pre Rank",
      key: "preRank",
      key: "preRank",
      render: (text, record) => <span>{record.preRank}</span>,
      style: { width: "2%", textAlign: "center" },
      sort: true,
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"Active"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handlePermissions("isActive", record, record.isActive);
            }}
          >
            <i
              className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  const handleReset = (value) => {
    setSelectedFilter({
      matchTypeId: undefined,
      sportId: undefined
    })
    setTypeSelectedOption(undefined)
    setPlayerTypeSelectedOption(undefined)
    setGenderSelectedOption(undefined)
  };

  //elements required
  const tableElement = {
    title: "ICC Rankings",
    isActive: true,
    resetButton: true,
    reloadButton: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    
    fetchEventTypeData();
    fetchMatchTypeData();
    fetchMatchTypeOptions();
    fetchSportOptions()
  }, [permissionObj]);

  useEffect(() =>{
    fetchData();
  }, [typeSelectedOption, selectedFilter, playerTypeSelectedOption, genderSelectedOption])

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
  };

  const fetchMatchTypeOptions = async () => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/list/matchTypeList", {})
      .then((response) => {
        setMatchTypeList((prev) => [
        ...prev,
        ...(response.result?.map((item) => ({
          label: item.matchType,
          value: item.matchTypeId,
        })) || []),
      ]);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };
  const fetchSportOptions = async () => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/list/eventTypeList", {})
      .then((response) => {
        setSportList((prev) => [
          ...prev,
          ...(response.result?.map((item) => ({
            label: item.eventType,
            value: item.eventTypeId,
          })) || []),
        ]);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
      });
  };

  const handleFilterChange = (key, value) => {
    const filterDataToUpdate = { ...selectedFilter, [key]: value };
    setSelectedFilter(filterDataToUpdate);
    setCurrentPage(0)
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="ICC Ranking" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            changeOrderApiName="Icc Ranking"
            eventTypes={eventTypes}
            matchType={matchTypes}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addRanking"}
            handleReset={handleReset}
            setParentPageSize={handlePageSizeChange}
            parentCurrentPage={currentPage}
            setParentCurrentPage={handleCurrentPageChange}
            setParentSearchedData={handleTableSearchedDataChange}
            isAddPermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_ADD
            )}
            isDeletePermission={checkPermission(
              permissionObj,
              pageName,
              PERMISSION_DELETE
            )}
            renderCustomFilter={() => {
              return <>
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  value={
                    typeSelectedOption
                      ? typeOptions.find((option) => option.value === typeSelectedOption)
                      : null
                  }
                  onChange={(e) => {
                    setTypeSelectedOption(e?.value)
                    setCurrentPage(0)
                  }}
                  options={typeOptions}
                  placeholder="Type"
                  classNamePrefix="filter-dropdown"
                />
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  value={
                    genderSelectedOption
                      ? genderOptions.find((option) => option.value === genderSelectedOption)
                      : null
                  }
                  onChange={(e) => {
                      setGenderSelectedOption(e?.value)
                      setCurrentPage(0)
                    }
                  }
                  options={genderOptions}
                  placeholder="Gender"
                  classNamePrefix="filter-dropdown"
                />
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  // value={playerTypeOptions.find((option) => option.value === playerTypeSelectedOption)}
                  value={
                    playerTypeSelectedOption
                      ? playerTypeOptions.find((option) => option.value === playerTypeSelectedOption)
                      : null
                  }
                  onChange={(e) => {setPlayerTypeSelectedOption(e?.value);setCurrentPage(0)}}
                  options={playerTypeOptions}
                  placeholder="Player Type"
                  classNamePrefix="filter-dropdown"
                />
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 180 }),
                  }}
                  value={selectedFilter?.matchTypeId ? selectedFilter?.matchTypeId : null}
                  placeholder={"Match Type"}
                  onChange={(e) => {
                    handleFilterChange("matchTypeId", e);
                  }}
                  options={matchTypeList}
                  classNamePrefix="filter-dropdown"
                />
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 180 }),
                  }}
                  value={selectedFilter?.sportId ? selectedFilter?.sportId : null}
                  placeholder={"Sport"}
                  onChange={(e) => {
                    handleFilterChange("sportId", e);
                  }}
                  options={sportList}
                  classNamePrefix="filter-dropdown"
                />
                <Tooltip title={"Import ICC Ranking"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                  <Button
                    color={"success"}
                    className="btn border"
                    onClick={() => importData()}
                  // onClick={() => updatedImportData()}
                    // className="btn border"
                  >
                    <i className="bx bx-plus"></i>
                    Import
                  </Button>
                </Tooltip>
              </>
            }}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
          />
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Competition"}
            />
          )}
          
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
