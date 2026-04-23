import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
import _, { isEqual,isEmpty } from "lodash";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  TAB_PHOTOLIBRARY,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
  MODULE_PHOTO_LIBRARY,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import {
  checkPermission,
  convertDateUTCToLocal,
} from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";
import { Tooltip } from "antd";

const Index = () => {
  const pageName = TAB_PHOTOLIBRARY;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_PHOTOLIBRARY;

  const [data, setData] = useState([]);

  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [importExportModelVisable, setImportExportModelVisable] =
    useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const globalPageSize = localStorage.getItem("pageSize");
  const [tableSearchedData, setTableSearchedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(globalPageSize || 10);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/photoLibrary/all`, {
        ...(latestValueFromTable || tableActions),
      })
      .then((response) => {
        const apiData = response?.result?.sort(
          (a, b) => a?.displayOrder - b?.displayOrder
        );
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.photoLibraryId);
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
    if (checekedList.includes(e.photoLibraryId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.photoLibraryId
      );
    } else {
      updateSingleCheck = [...checekedList, e.photoLibraryId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleActionClick = (id) => {
    localStorage.setItem("photoLibraryId", "" + id);
    const url = new URL(window.location.origin + "/photos");
    // url.searchParams.append("commentaryId", id);
    window.open(url.href, "_blank");
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/photoLibrary/updateStatus`, {
        photoLibraryId: record.photoLibraryId,
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
      .post(`/loadPanelData`, { module: [MODULE_PHOTO_LIBRARY], password })
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
      .post(`/admin/photoLibrary/delete`, {
        photoLibraryId: checekedList,
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
    navigate("/addPhotoLibrary", { state: { photoLibraryId: id } });
  };
  const handleReset = (value) => {
    fetchData(value);
  };

  //checkbox select
  const getSelectedItemsData = () => {
    const newCurrentPage = currentPage > 0 ? currentPage : 1;
    const startIndex = (newCurrentPage - 1) * pageSize;
    const endIndex = +startIndex + +pageSize;

    const sourceList = tableSearchedData && tableSearchedData.length > 0
      ? tableSearchedData.map(item => item.photoLibraryId)
      : dataIndexList;

    return sourceList.slice(startIndex, endIndex);
  };

  const handleSelectAllClick = () => {
    const currentItems = getSelectedItemsData();
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
            checked={checekedList.includes(record.photoLibraryId)}
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
            handleEdit(record.photoLibraryId);
          }}
        ></i>
      ),
      style: { width: "2%", textAlign: "center" },
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
      title: "White Label",
      dataIndex: "domain",
      key: "domain",
      style: { width: "5%", textAlign: "left" },
    },
    {
      title: "Permanent",
      dataIndex: "isPermanent",
      key: "isPermanent",
      render: (text, record) => (
        <Button
          color={`${record.isPermanent ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          disabled
        >
          <i
            className={`bx ${record?.isPermanent ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "10%"},
    },
    // {
    //   title: "SEO",
    //   dataIndex: "SEO",
    //   key: "SEO",
    //   render: (text, record) => (
    //     <span style={{ cursor: "pointer" }} onClick={() => {
    //       handleActionClick(record?.photoLibraryId)
    //     }}>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
    //   ),
    //   style: { width: "20%" },
    //   sort: true,
    // },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    //   render: (text, record) => (
    //     <span style={{ cursor: "pointer" }} onClick={() => {
    //       handleActionClick(record?.photoLibraryId)
    //     }}>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
    //   ),
    //   style: { width: "20%" },
    //   sort: true,
    // },
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
    {
      title: "Image",
      key: "image",
      render: (text, record) => (
        <Button
          color="success"
          size="sm"
          // style={{ marginRight: "300px" }}
          onClick={() => {
            handleActionClick(record?.photoLibraryId);
          }}
        >
          <i className="bx bx-plus"></i>
        </Button>
      ),
      style: { width: "10%"},
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "IsActive",
      render: (text, record) => (
        <Tooltip title={"Photo Library"} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
          <Button
            color={`${record.isActive ? "primary" : "danger"}`}
            size="sm"
            style={{ marginRight: "200px" }}
            className="btn"
            onClick={() => {
              handlePermissions("isActive", record, record.isActive);
            }}
          >
            <i className={`bx ${record.isActive ? "bx-check" : "bx-block"}`}></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "10%"},
    },
  ];
  //elements required
  const tableElement = {
    title: "Photo Library",
    isActive: true,
    reloadButton: true,
    loadData: true,
    dragDrop: true,
  };

  useEffect(() => {
    if (!isEmpty(permissionObj) && !checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
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
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Photo library" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addPhotoLibrary"}
            changeOrderApiName="photoLibrary"
            handleReset={handleReset}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
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
            setParentCurrentPage={handleCurrentPageChange}
            setParentPageSize={handlePageSizeChange}
            setParentSearchedData={handleTableSearchedDataChange}
          />
          <DeleteTabModel
            deleteModelVisable={deleteModelVisable}
            setDeleteModelVisable={setDeleteModelVisable}
            handleDelete={handleDelete}
            singleCheck={checekedList}
          />
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Photo Library"}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
