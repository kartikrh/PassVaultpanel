import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { isEqual } from "lodash";
import { ERROR, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_MARKET_TEMPLATE } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { MarketTemplateClone } from "../../components/Model/Clone";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";

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
  const [cloneModelVisible, setCloneModelVisible] = useState(false);
  const [cloneValues, setCloneValues] = useState({
    marketTemplateId: "",
    matchTypeID: ""
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (value) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/marketTemplate/all`, {
        ...(value || tableActions),
      })
      .then((response) => {
        const apiData = response?.result
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.marketTemplateId)
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
    if (cloneValues.matchTypeID !== "") {
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
    navigate("/marketTemplateRunner", { state: { marketTemplateId: id } });
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
            checked={checekedList.includes(record.marketTemplateId)}
            onChange={() => {
              handleSingleCheck(record);
              setCloneValues({
                marketTemplateId: record?.marketTemplateId,
                matchTypeID: record?.matchTypeID,
              });
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
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "templateName",
      style: { width: "70%" },
    },
    {
      title: "Is Active",
      key: "isActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Market Template"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
      title: "Is P-Runner Value",
      key: "isPredefineRunnerValue",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Runner Value"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
      <Tooltip title={"View Market Template Runner"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"primary"}
          size="sm"
          disabled={
            !record.isPredefineRunnerValue
          }
          className="btn"
          onClick={() => {
            handleMarketTemplateRunnerClick(record.marketTemplateId);
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
    title: "Events",
    isActive: true,
    matchTypeSelect: true,
    resetButton: true,
    reloadButton: true,
    clone: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData({ isActive: true });
    fetchMatchTypeList()
  }, []);

  const handleReload = (value) => {
    fetchData({ isActive: true });
    fetchMatchTypeList();
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
            matchType = {matchType}
            reFetchData={fetchData}
            handleReload={handleReload}
            singleCheck={checekedList}
            handleReset={handleReset}
            onAddNavigate={"/addMarketTemplate"}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
