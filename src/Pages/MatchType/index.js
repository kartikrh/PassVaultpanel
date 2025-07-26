import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import { useNavigate } from "react-router-dom";
import { MatchTypeClone } from "../../components/Model/Clone";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEmpty, isEqual } from "lodash";
import {
  ERROR,
  MODULE_MATCH_TYPES,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_MATCH_TYPE,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import Select from "react-select";
import LoadDataModal from "../../components/Model/LoadDataModal";

const ENTITY_OPTIONS = [
  { label: " ", value: 0 },
  { label: "ODI (One Day International)", value: 1 },
  { label: "TEST", value: 2 },
  { label: "T20I(Twenty20 International)", value: 3 },
  { label: "List A(Limited Over Domestic Match)", value: 4 },
  { label: "First Class", value: 5 },
  { label: "T20 Domestic", value: 6 },
  { label: "Women ODI", value: 7 },
  { label: "Women T20", value: 8 },
  { label: "Youth ODI", value: 9 },
  { label: "Youth T20", value: 10 },
  { label: "Other", value: 11 },
  { label: "Other List A", value: 12 },
  { label: "Other 1st Class", value: 13 },
  { label: "Other T20", value: 14 },
  { label: "Youth Test", value: 15 },
  { label: "Women Test", value: 16 },
  { label: "T10", value: 17 },
  { label: "T100", value: 18 },
  { label: "Women T100", value: 19 },
  { label: "TB-10", value: 20 },
];

const Index = () => {
  const pageName = TAB_MATCH_TYPE;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Match Type";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [entityType, setEntityType] = useState();
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    selectedEntity: undefined,
  });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (dataToPass = {}) => {
    setIsLoading(true);

    const tableActions = finalizeRef.current?.getTableAction() || {};
    const requestPayload = {
      ...tableActions,
      ...dataToPass,
    };

    await axiosInstance
      .post(`/admin/matchType/all`, requestPayload)
      .then((response) => {
        const apiData = response?.result?.sort(
          (a, b) => a?.matchTypeId - b?.matchTypeId
        );
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.matchTypeId);
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error fetching match types:", error);
      });
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.matchTypeId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.matchTypeId);
    } else {
      updateSingleCheck = [...checekedList, e.matchTypeId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleLoadData = async (password) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/loadPanelData`, { module: [MODULE_MATCH_TYPES], password })
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

  const handleClone = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/clone`, {
        matchTypeId: checekedList?.[0],
        matchType: cloneName,
        entityEnum: +entityType,
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
        setEntityType(undefined)
        setCloneModelVisible(false);
      })
      .catch((error) => {
        dispatch(
          updateToastData({
            data: error?.message,
            title: error?.title,
            type: ERROR,
          })
        );
        setIsLoading(false);
      });
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/delete`, {
        matchTypeId: checekedList,
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
        setDeleteModelVisable(false);
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

  const handleIsHistory = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/isHistory`, {
        matchTypeId: record.matchTypeId,
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

  const handleEdit = (id) => {
    navigate("/addMatchType", { state: { userId: id } });
  };

  const handlePredictorClick = (id) => {
    const url = new URL(window.location.origin + "/matchTypePredictor");
    sessionStorage.setItem("matchTypePredictorId", "" + id);
    window.open(url.href, "_blank");
  };

  const handleBowlingPredictorClick = (id) => {
    const url = new URL(window.location.origin + "/bowlingPredictor");
    sessionStorage.setItem("bowlingPredictorId", "" + id);
    window.open(url.href, "_blank");
  };

  const handleFilterChange = (key, value) => {
    const filterDataToUpdate = { ...selectedFilter, [key]: value };
    setSelectedFilter(filterDataToUpdate);

    const apiPayload = {};

    if (value && value.value === 0) {
      return;
    }
    if (
      filterDataToUpdate.selectedEntity &&
      filterDataToUpdate.selectedEntity.value !== 0
    ) {
      apiPayload.entityEnum = filterDataToUpdate.selectedEntity.value;
    }

    fetchData(apiPayload);
  };

  const handleReload = () => {
    const apiPayload = {};

    if (
      selectedFilter.selectedEntity &&
      selectedFilter.selectedEntity.value !== 0
    ) {
      apiPayload.entityEnum = selectedFilter.selectedEntity.value;
    }

    fetchData(apiPayload);
  };

  const handleReset = () => {
    setSelectedFilter({
      selectedEntity: { label: "Select Entity", value: 0 },
    });
    fetchData({isActive: true});
  };

  const getEntityLabel = (entityEnum) => {
    const entity = ENTITY_OPTIONS.find((option) => option.value === entityEnum);
    return entity ? entity.label : "";
  };

  const handleActiveInactive = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/activeInactive`, {
        matchTypeId: record?.matchTypeId,
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

  const columns = [
    {
      title: (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={
              data?.length > 0 &&
              isEqual(checekedList?.sort(), dataIndexList?.sort())
            }
            onChange={() => {
              setCheckedList(
                isEqual(checekedList?.sort(), dataIndexList?.sort())
                  ? []
                  : dataIndexList
              );
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
            checked={checekedList.includes(record.matchTypeId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
        </div>
      ),
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
            handleEdit(record.matchTypeId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      key: "matchType",
      style: { width: "76%" },
      sort: true,
    },
    {
      title: "History",
      key: "isHistory",
      render: (text, record) => (
        <Tooltip
          title={"History"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isHistory ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleIsHistory("isHistory", record, record.isHistory);
            }}
          >
            <i
              className={`bx ${record.isHistory ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"Commentary"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleActiveInactive("isActive", record, record?.isActive);
            }}
          >
            <i
              className={`bx ${record?.isActive ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Predictor",
      key: "predictor",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Test Event Predictor"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"success"}
            size="sm"
            className="btn"
            onClick={() => {
              handlePredictorClick(record?.matchTypeId);
            }}
          >
            <i className="bx bx-plus"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "8%", textAlign: "center" },
    },
    {
      title: "Bowling Predictor",
      key: "bowlingPredictor",
      printType: "ignore",
      render: (text, record) => (
        <Tooltip
          title={"Test bowling Predictor"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={"success"}
            size="sm"
            className="btn"
            onClick={() => {
              handleBowlingPredictorClick(record?.matchTypeId);
            }}
          >
            <i className="bx bx-plus"></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "8%", textAlign: "center" },
    },
    {
      title: "Entity",
      dataIndex: "entityEnum",
      key: "entityEnum",
      render: (text, record) => getEntityLabel(record.entityEnum),
      style: { width: "8%" },
    },
  ];

  const tableElement = {
    title: "Match Type",
    headerSelect: false,
    switch: false,
    clone: true,
    reloadButton: true,
    loadData: true,
    resetButton: true,
    isActive: true
  };

  useEffect(() => {
    if (
      !checkPermission(permissionObj, pageName, PERMISSION_VIEW) &&
      !isEmpty(permissionObj)
    ) {
      navigate("/dashboard");
    }

    if (!initialLoadDone && !isEmpty(permissionObj)) {
      fetchData();
      setInitialLoadDone(true);
    }
  }, [permissionObj, initialLoadDone]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Match Type" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
            handleReload={handleReload}
            handleReset={handleReset}
            // handleCustomReset={handleReset}
            loadDataModelFunction={setLoadDataModelVisable}
            cloneModelFunction={setCloneModelVisible}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addMatchType"}
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
            renderCustomFilter={() => (
              <div className="d-flex align-items-center">
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 250 }),
                  }}
                  value={selectedFilter?.selectedEntity}
                  placeholder="Select Entity"
                  options={ENTITY_OPTIONS}
                  onChange={(selectedOption) => {
                    handleFilterChange("selectedEntity", selectedOption);
                  }}
                  classNamePrefix="filter-dropdown"
                />
              </div>
            )}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <MatchTypeClone
            cloneModelVisible={cloneModelVisible}
            setCloneModelVisible={setCloneModelVisible}
            handleClone={handleClone}
            setCloneName={setCloneName}
            setEntityType={setEntityType}
            singleCheck={checekedList}
          />
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Match Type"}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
