import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEmpty, isEqual } from "lodash";
import { ERROR, MODULE_MARKET_TEMPLATE, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_MARKET_TEMPLATE } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { MarketTemplateClone, MarketTemplateMultiClone } from "../../components/Model/Clone";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_MARKET_TEMPLATE
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title = "Market Template";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [matchType, setMatchType] = useState(undefined)
  const [mtAndCategories, setMtAndCategories] = useState(null);
  const [selectedMarketType, setSelectedMarketType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [cloneValues, setCloneValues] = useState({
    marketTemplateId: "",
    matchTypeID: "",
    templateName: "",
  });
  const [multiCloneModelVisible, setMultiCloneModelVisible] = useState(false);
  const [multiCloneValues, setMultiCloneValues] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (value) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    const data = value || tableActions
    await axiosInstance
      .post(`/admin/marketTemplate/all`, {
        ...data,
        marketTypeId: data?.marketTypeId || 0,
        marketTypeCategoryId: data?.marketTypeId !== selectedMarketType ? 0 : data?.marketTypeCategoryId || 0,
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.marketTemplateId - b?.marketTemplateId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.marketTemplateId)
        })
        setData(apiData);
        setDataIndexList(apiDataIdList)
        setCheckedList([]);
        setMultiCloneValues([]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };
  const fetchMatchTypeList = async () =>{
    await axiosInstance
    .post("/admin/marketTemplate/matchTypeList", {})
    .then((response) => {
      setMatchType(response?.result)
    })
    .catch((error) => {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    });
  }
  const fetchMarketCategoriesList = async () =>{
    await axiosInstance
    .post("/admin/marketTemplate/mtAndCategories", {})
    .then((response) => {
      setMtAndCategories(response?.result);
    })
    .catch((error) => {
      dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
    });
  }
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.marketTemplateId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.marketTemplateId);
    } else {
      updateSingleCheck = [...checekedList, e.marketTemplateId];
    }
    setCheckedList(updateSingleCheck)
  };
  const handleClone = async () => {
    if (cloneValues.matchTypeID !== "" && cloneValues?.templateName !== "") {
      setIsLoading(true);
      await axiosInstance
        .post(`/admin/marketTemplate/clone`, {
          marketTemplateId: checekedList?.[0],
          ...cloneValues,
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
          setCloneModelVisible(false);
        })
        .catch((error) => {
          setCloneModelVisible(false);
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
        });
    } else {
      dispatch(
        updateToastData({
          data: "MatchType is required",
          title: "Required",
          type: ERROR,
        })
      );
    }
  };
  const handleMultiClone = async () => {
    if (multiCloneValues && multiCloneValues?.length > 0) {
      setIsLoading(true);
      await axiosInstance
        .post(`/admin/marketTemplate/multiClone`, {
          marketTemplates : multiCloneValues,
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
          setMultiCloneModelVisible(false);
        })
        .catch((error) => {
          setMultiCloneModelVisible(false);
          dispatch(
            updateToastData({
              data: error?.message,
              title: error?.title,
              type: ERROR,
            })
          );
        });
    } else {
      dispatch(
        updateToastData({
          data: "MatchType is required",
          title: "Required",
          type: ERROR,
        })
      );
    }
  };
  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplate/activeInactiveTemplate`, {
        marketTemplateId: record.marketTemplateId,
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

  const handleIsPython = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplate/isPython`, {
        marketTemplateId: record.marketTemplateId,
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

  const handleIsPerEvent = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplate/isPerEvent`, {
        marketTemplateId: record.marketTemplateId,
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
  const handleIsDefaultIsSendData = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplate/defaultIsSendData`, {
        marketTemplateId: record.marketTemplateId,
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
  const handleIsShowInAdvanceMarket = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/marketTemplate/isShowInAdvanceMarket`, {
        marketTemplateId: record.marketTemplateId,
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
      .post(`/loadPanelData`, {module: [MODULE_MARKET_TEMPLATE], password})
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
      .post(`/admin/marketTemplate/delete`, {
        marketTemplateId: checekedList,
      })
      .then((response) => {
        fetchData();
        setDeleteModelVisable(false);
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  const handleEdit = (id) => {
    navigate("/addMarketTemplate", { state: { marketTemplateId: id } });
  };
  const handleMarketTemplateRunnerClick = (id) => {
    const url = new URL(window.location.origin + "/marketTemplateRunner");
    sessionStorage.setItem('marketTemplateRunnerId', "" + id);
    window.open(url.href, '_blank');
    // navigate("/marketTemplateRunner", { state: { marketTemplateId: id } });
  };
  const updatePredefineRunnerValue = async (pType, record, cState) => {
    await axiosInstance
      .post(`/admin/marketTemplate/changePredefineRunner`, {
        marketTemplateId: record?.marketTemplateId,
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
  const handleReset = (value) => {
    fetchData(value)
  }

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
              setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList)
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
            checked={checekedList.includes(record.marketTemplateId)}
            onChange={() => {
              const isChecked = checekedList.includes(record.marketTemplateId);
              handleSingleCheck(record);
              setCloneValues({
                marketTemplateId: record?.marketTemplateId,
                matchTypeID: record?.matchTypeID,
                templateName: record?.templateName,
              });
              if (isChecked) {
                setMultiCloneValues(multiCloneValues.filter(item => item.marketTemplateId !== record.marketTemplateId));
              } else {
                setMultiCloneValues([...multiCloneValues, {
                  marketTemplateId: record?.marketTemplateId,
                  matchTypeID: record?.matchTypeID,
                  templateName: record?.templateName,
                }]);
              }
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
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.marketTemplateId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Match Type",
      dataIndex: "matchType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "matchType",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Template",
      dataIndex: "templateName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "templateName",
      style: { width: "70%" },
      sort: true,
    },
    {
      title: "Market Type",
      dataIndex: "marketTypeName",
      key: "marketTypeName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Status"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
      title: "Python Code",
      key: "isPython",
      render: (text, record) => (
        <Tooltip title={"Python"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={record.isPython ? "primary" : "danger"}
            size="sm"
            className="btn"
            onClick={() => {
              handleIsPython("isPython", record, record.isPython);
            }}
          >
            <i className={`bx ${record.isPython ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Per Event",
      key: "isPerEvent",
      render: (text, record) => (
      <Tooltip title={"Per-Event"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isPerEvent ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsPerEvent("isPerEvent", record, record.isPerEvent);
          }}
        >
          <i className={`bx ${record.isPerEvent ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Default Send Data",
      key: "defaultIsSendData",
      render: (text, record) => (
      <Tooltip title={"Send Data"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.defaultIsSendData ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsDefaultIsSendData("defaultIsSendData", record, record.defaultIsSendData);
          }}
        >
          <i className={`bx ${record.defaultIsSendData ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Show Adv. Market",
      key: "isShowInAdvanceMarket",
      render: (text, record) => (
      <Tooltip title={"Show Adv. Market"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isShowInAdvanceMarket ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsShowInAdvanceMarket("isShowInAdvanceMarket", record, record.isShowInAdvanceMarket);
          }}
        >
          <i className={`bx ${record.isShowInAdvanceMarket ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "P-Runner Value",
      key: "isPredefineRunnerValue",
      render: (text, record) => (
      <Tooltip title={"Runner Value"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isPredefineRunnerValue ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            updatePredefineRunnerValue(
              "isPredefineRunnerValue",
              record,
              record?.isPredefineRunnerValue
            );
          }}
        >
          <i
            className={`bx ${record?.isPredefineRunnerValue ? "bx-check" : "bx-block"
              }`}
          ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "P-Market Template Runner",
      key: "marketTemplate",
      printType: "ignore",
      render: (text, record) => (
      <Tooltip title={"Runner"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          // color={"primary"}
          size="sm"
          disabled={
            !record.isPredefineRunnerValue
          }
          className="btn marketTemplateBtn"
          onClick={() => {
            handleMarketTemplateRunnerClick(record?.marketTemplateId);
          }}
        >
          <i class='bx bxs-store' ></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Market Template",
    isActive: true,
    matchTypeSelect: true,
    marketTypeSelect: true,
    categorySelect: true,
    resetButton: true,
    reloadButton: true,
    loadData: true,
    clone: true,
    multiClone: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard")
    }
    fetchData({ isActive: true });
    fetchMatchTypeList();
    fetchMarketCategoriesList();
  }, [permissionObj]);

  useEffect(() => {
    if(mtAndCategories && selectedMarketType) {
      const categoriesData = mtAndCategories?.categories?.filter((item)=>item?.marketTypeId == selectedMarketType)
      setCategories(categoriesData || []);
    } else if(!selectedMarketType) {
      setCategories([]);
    }
  },[mtAndCategories, selectedMarketType]);

  const handleReload = (value) => {
    fetchData();
    // fetchMatchTypeList();
    // fetchMarketCategoriesList();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Market Template" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            cloneModelFunction={setCloneModelVisible}
            multiCloneModelFunction={setMultiCloneModelVisible}
            matchType = {matchType}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            singleCheck={checekedList}
            handleReset={handleReset}
            onAddNavigate={"/addMarketTemplate"}
            marketTypes={mtAndCategories?.marketTypes || []}
            categories={categories}
            setSelectedMarketType={setSelectedMarketType}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          <MarketTemplateClone
            cloneModelVisible={cloneModelVisible}
            setCloneModelVisible={setCloneModelVisible}
            handleClone={handleClone}
            setCloneValues={setCloneValues}
            cloneValues={cloneValues}
            singleCheck={checekedList}
          />
          <MarketTemplateMultiClone
            cloneModelVisible={multiCloneModelVisible}
            setCloneModelVisible={setMultiCloneModelVisible}
            handleClone={handleMultiClone}
            setCloneValues={setMultiCloneValues}
            cloneValues={multiCloneValues}
            singleCheck={checekedList}
          />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Market Template"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
