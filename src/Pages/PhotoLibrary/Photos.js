import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import _, { isEqual } from "lodash";
import { Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import {
  TAB_PHOTOS,
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

const Photos = () => {
  const pageName = TAB_PHOTOS;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = TAB_PHOTOS;

  const [data, setData] = useState([]);

  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [importExportModelVisable, setImportExportModelVisable] =
    useState(false);
  const [checekedList, setCheckedList] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const id = localStorage.getItem("photoLibraryId")

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/libraryImages/all`, {
        "photoLibraryId": id
      })
      .then((response) => {
        const apiData = response?.result;
        let apiDataIdList = [];
        apiData.forEach((ele) => {
          apiDataIdList.push(ele?.id);
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
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.id);
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/libraryImages/delete`, {
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
    navigate("/addPhotos", { state: { PhotosId: id } });
  };
  const handleReset = (value) => {
    fetchData(value);
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
            checked={checekedList.includes(record.id)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          <i className="bx bx-move ms-1 mt-1"></i>
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
        <span style={{ cursor: "pointer" }} onClick={() => {
          // handleActionClick(record?.photoLibraryId)
        }}>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
      ),
      style: { width: "20%" },
      sort: true,
    },
  ];
  //elements required
  const tableElement = {
    title: "Photos",
    // isActive: true,
    dragDrop: true,
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
      Photos
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Photos" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            changeOrderApiName="libraryImages"
            onAddNavigate={"/addPhotos"}
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

export default Photos;
