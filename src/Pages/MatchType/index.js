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
import { isEqual } from "lodash";
import {
  ERROR,
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);

    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/matchType/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.matchTypeId - b?.matchTypeId);
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

  const handleClone = async () => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/matchType/clone`, {
        matchTypeId: checekedList?.[0],
        matchType: cloneName,
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
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };
  const handleEdit = (id) => {
    navigate("/addMatchType", { state: { userId: id } });
  };
  const handlePredictorClick = (id) => {
    navigate("/matchTypePredictor", { state: { userId: id } });
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
      style: { width: "86%" },
      sort: true,
    },
    {
      title: "Is History",
      key: "isHistory",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive History"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${record.isHistory ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsHistory("isHistory", record, record.isHistory);
          }}
        >
          <i className={`bx ${record.isHistory ? "bx-check" : "bx-block"}`}></i>
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
      <Tooltip title={"View Test Event Predictor"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={"primary"}
          size="sm"
          className="btn"
          onClick={() => {
            handlePredictorClick(record.matchTypeId);
          }}
        >
          <i className="bx bx-plus"></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "8%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Match Type",
    headerSelect: false,
    switch: false,
    clone: true,
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
  }, []);

  const handleReload = (value) => {
    fetchData();
  };
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
            singleCheck={checekedList}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
