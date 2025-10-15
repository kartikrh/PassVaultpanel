import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import Select from "react-select";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import TabModel from "../../components/Model/AddTabModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual, isEmpty } from "lodash";
import { ERROR, MODULE_BLOCKS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, TAB_BLOCKS } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { Tooltip } from "antd";
import LoadDataModal from "../../components/Model/LoadDataModal";

const isSquadOptions = [
  { value: "Select", label: "Select" },
  { value: "true", label: "true" },
  { value: "false", label: "false" },
];

const Index = () => {
  const pageName = TAB_BLOCKS
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList); document.title = "Players";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addModelVisable, setAddModelVisable] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [run, setRun] = useState(null);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [isSquadSelectedOption, setIsSquadSelectedOption] = useState('Select');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    await axiosInstance
      .post(`/admin/block/all`, {
        ...(latestValueFromTable || { ...tableActions }),
        isShowContent: isSquadSelectedOption == "Select" ? null : isSquadSelectedOption,
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.blockId - b?.blockId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.blockId)
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
    if (checekedList.includes(e.blockId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.blockId);
    } else {
      updateSingleCheck = [...checekedList, e.blockId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/block/save`, {
        // blockId: record.blockId,
        ...record,
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
      .post(`/loadPanelData`, {module: [MODULE_BLOCKS], password})
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

  //delete row
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/block/delete`, {
        blockId: checekedList,
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
  //chnage Penalty Run
  const handleRuns = async (value) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/block/save`, value)
      .then((response) => {
        fetchData();
        dispatch(updateToastData({ data: response?.message, title: response?.title, type: SUCCESS }));
      })
      .catch((error) => {
        setIsLoading(false);
        dispatch(updateToastData({ data: error?.message, title: error?.title, type: ERROR }));
      });
  };

  const handleEdit = (blockId) => {
    // navigate("/addblocks", { state: { userId: blockId } });
    navigate("/addblocks", { state: { blockId } });
  };

  //table columns
  const columns = [
    {
      // title: (
      //   <div className="form-check">
      //     <input
      //       className="form-check-input"
      //       type="checkbox"
      //       name="chk_child"
      //       value="option1"
      //       checked={data?.length > 0 && isEqual(checekedList?.sort(), dataIndexList?.sort())}
      //       onChange={() => {
      //         setCheckedList(isEqual(checekedList?.sort(), dataIndexList?.sort()) ? [] : dataIndexList
      //         )
      //       }}
      //     />
      //   </div>
      // ),
      render: (text, record) => (
        <div className="form-check d-flex align-items-center justify-between">
          <input
            className="form-check-input"
            type="checkbox"
            name="chk_child"
            value="option1"
            checked={checekedList.includes(record.blockId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
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
            handleEdit(record.blockId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Block Name",
      dataIndex: "blockName",
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
      key: "blockName",
      sort: true,
      style: { width: "100%" },
    },
    {
      title: "Container Id",
      dataIndex: "containerId",
      //   render: (text, record) => (
      //     <span style={{ cursor: "pointer" }}>
      //       {record.parentId === "0" ? "Root" : (record?.parentName || null)}
      //     </span>
      //   ),
      key: "containerId",
      sort: true,
      style: { width: "100%" },
    },

    {
      title: "Show Content",
      key: "isShowContent",
      dataIndex: "isShowContent",
      render: (text, record) => (
      <Tooltip title={"Show/Hide Content"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
        <Button
          color={`${text ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isShowContent", record, record.isShowContent);
          }}
        >
          {" "}
          <i className={`bx ${record.isShowContent ? "bx-check" : "bx-block"}`}></i>
        </Button>
      </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];

  //elements required
  const tableElement = {
    title: "Block",
    // headerSelect: false,
    // isShowContent: true,
    reloadButton: true,
    loadData: true,
    // clone: false,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
    }
    fetchData();
  }, [isSquadSelectedOption, permissionObj]);

  const handleReload = (value) => {
    fetchData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Block" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addblocks"}
            isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
            renderCustomFilter={() => (
              <>
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 140 }),
                  }}
                  value={isSquadOptions.find((option) => option.value === isSquadSelectedOption) || isSquadOptions[0]}
                  onChange={(e) => setIsSquadSelectedOption(e?.value === "Select" ? null : e?.value)}
                  options={isSquadOptions}
                  placeholder="Is Squad"
                  classNamePrefix="filter-dropdown"
                />
              </>
            )}
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
              moduleName={"Blocks"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
