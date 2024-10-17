import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import {
  TAB_BANNER,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission, convertDateUTCToLocal } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
const Index = () => {
  const pageName = TAB_BANNER;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_BANNER;
  const [data, setData] = useState([]);

  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [importExportModelVisable, setImportExportModelVisable] =
    useState(false);
  const [checekedList, setCheckedList] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/banner/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort((a,b)=>a?.bannerId - b?.bannerId);
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.bannerId);
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

  //   const fetchEventTypeData = async () => {
  //     await axiosInstance
  //       .post(`/admin/player/eventTypeList`, {})
  //       .then((response) => {
  //         setEventTypes(response.result);
  //         setIsLoading(false);
  //       })
  //       .catch((error) => { });
  //   };
  //   const fetchTeamsData = async () => {
  //     await axiosInstance
  //       .post(`/admin/player/teamList`, {})
  //       .then((response) => {
  //         setTeams(response.result);
  //         setIsLoading(false);
  //       })
  //       .catch((error) => { });
  //   };
  //checkbox function
  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.bannerId)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.bannerId);
    } else {
      updateSingleCheck = [...checekedList, e.bannerId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/banner/activeInactiveBanner`, {
        bannerId: record.bannerId,
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

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/banner/delete`, {
        bannerId: checekedList,
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
        setCheckedList([]);
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
        setCheckedList([]);
      });
  };
  const handleEdit = (id) => {
    navigate("/addBanner", { state: { bannerId: id } });
  };
  const handleReset = (value) => {
    fetchData(value);
  };

  const getBannerType = (status) => {
    switch (status) {
      case 1:
        return "Top";
      case 2:
        return "Left";
      case 3:
        return "Right";
      case 4:
        return "Bottom";
      default:
        return "Unknown";
    }
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
            checked={checekedList.includes(record.bannerId)}
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
    checkPermission(permissionObj, pageName, PERMISSION_EDIT) && {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <i
          className="bx bx-edit"
          onClick={() => {
            handleEdit(record.bannerId);
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
                className="avatar-sm rounded-circle"
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
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
      ),
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "Type",
      dataIndex: "bannerType",
      key: "bannerType",
      style: { width: "5%" },
      render: (text, record) => <span>{getBannerType(record.bannerType)}</span>,
    },
    {
      title: "Views",
      dataIndex: "viewerCount",
      key: "viewerCount",
      style: { width: "5%", textAlign: "center" },
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      style: { width: "20%" },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "startDate",
      style: { width: "20%" },
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>
          {convertDateUTCToLocal(text, "index")}
        </span>
      ),
      key: "endDate",
      style: { width: "20%" },
    },
    // {
    //   title: "Created By",
    //   dataIndex: "createdBy",
    //   key: "eventType",
    //   style: { width: "30%" },
    // },
    // {
    //   title: "Created Date",
    //   dataIndex: "createdDate",
    //   key: "createdDate",
    //   style: { width: "30%" },
    // },
    // {
    //   title: "IsPermanent",
    //   key: "IsPermanent",
    //   render: (text, record) => (
    //     <Button
    //       color={`${record.isPermanent ? "primary" : "danger"}`}
    //       size="sm"
    //       className="btn"
    //     >
    //       <i
    //         className={`bx ${record.isPermanent ? "bx-check" : "bx-block"}`}
    //       ></i>
    //     </Button>
    //   ),
    //   style: { width: "2%", textAlign: "center" },
    // },
    {
      title: "IsActive",
      key: "IsActive",
      render: (text, record) => (
      <Tooltip title={"Active/Inactive Banner"} color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
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
  ];
  //elements required
  const tableElement = {
    title: "Banner",
    isActive: true,
    reloadButton: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard")
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Banner" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addBanner"}
            handleReset={handleReset}
            handleReload={handleReload}
            reFetchData={fetchData}
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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
