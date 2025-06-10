import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual } from "lodash";
import { TAB_SUBSCRIBERS, PERMISSION_ADD, PERMISSION_DELETE, PERMISSION_EDIT, PERMISSION_VIEW, SUCCESS, ERROR, MODULE_SUBSCRIBERS, } from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import {ImportExportModel} from '../../components/Model/ImportExportModel'
import SubDomainsModels from '../../components/Model/SubdomainsModel'
import LoadDataModal from "../../components/Model/LoadDataModal";

const Index = () => {
  const pageName = TAB_SUBSCRIBERS
  const finalizeRef = useRef(null);
  const permissionObj = useSelector(state => state.auth?.tabPermissionList);
  document.title = TAB_SUBSCRIBERS;
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [domainsModelVisable, setDomainsModelVisable] = useState(false);
  const [subDomains, setSubDomains] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction()
    const data = latestValueFromTable || tableActions
    await axiosInstance
      .post(`/admin/subscribeDomain/all`, {
        ...data,
        isApproved: data?.isApproved !== undefined ? data?.isApproved : tableActions?.isApproved !== undefined ? tableActions?.isApproved : true
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.subScribesDomainId - b?.subScribesDomainId);
        let apiDataIdList = [];
        apiData.forEach(ele => {
          apiDataIdList.push(ele?.subScribesDomainId)
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

  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = []
    if (checekedList.includes(e.subScribesDomainId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.subScribesDomainId);
    } else {
      updateSingleCheck = [...checekedList, e.subScribesDomainId];
    }
    setCheckedList(updateSingleCheck)
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/subscribeDomain/isDomainApprove`, {
        subScribesDomainId: record.subScribesDomainId,
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
      .post(`/loadPanelData`, {module: [MODULE_SUBSCRIBERS], password})
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
      .post(`/admin/subscribeDomain/delete`, {
        subScribesDomainId: checekedList,
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

  const handleDomains = async (data) => {
    setSubDomains(data)
    setDomainsModelVisable(true)
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
            checked={checekedList.includes(record.subScribesDomainId)}
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
    {
      title: "Site Name",
      dataIndex: "siteName",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "siteName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Site Domain",
      dataIndex: "siteDomain",
      key: "siteDomain",
      style: { width: "20%" },
      sort: true,
    },
    {
        title: "subDomain Count",
        dataIndex: "subDomainCount",
        key: "subDomainCount",
        style: { width: "30%" },
        sort: true,
      },
      {
        title: "subDomains",
        dataIndex: "subDomains",
        key: "subDomains",
        render: (text, record) => (
          <span style={{ cursor: "pointer", }} onClick={()=>{handleDomains(text)}}>
            <i className="fas fa-eye"></i>
          </span>
        ),
        style: { width: "10%", textAlign:"center" },
        sort: true,
      },
    {
      title: "IsApproved",
      key: "isApproved",
      render: (text, record) => (
        <Button
          color={`${record.isApproved ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handlePermissions("isApproved", record, record.isApproved);
          }}
        >
          <i className={`bx ${record.isApproved ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
  ];
  //elements required
  const tableElement = {
    title: "Subscribers",
    // isActive: true,
    isApproved: true,
    loadData: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW) && !isEmpty(permissionObj)) {
      navigate("/dashboard")
    }
    fetchData();
  }, [permissionObj]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Subscribers" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            // onAddNavigate={"/addSubscriber"}
            handleReset={handleReset}
            loadDataModelFunction={setLoadDataModelVisable}
            reFetchData={fetchData}
            // isAddPermission={checkPermission(permissionObj, pageName, PERMISSION_ADD)}
            isDeletePermission={checkPermission(permissionObj, pageName, PERMISSION_DELETE)}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
            <SubDomainsModels
            domainsModelVisable={domainsModelVisable}
            setDomainsModelVisable={setDomainsModelVisable}
            subDomains = {subDomains}
            handleDomains={handleDomains}
            />
          {loadDataModelVisable && 
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Subscribers"} 
            />}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
