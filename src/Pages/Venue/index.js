import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Tooltip } from "antd";
import { Button, Container } from "reactstrap";
import DeleteTabModel from "../../components/Model/DeleteModel";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
import {
  VENUE,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  ERROR,
  MODULE_VENUE, // for load data
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import LoadDataModal from "../../components/Model/LoadDataModal";
import Select from "react-select";
import Switch from "react-switch";
import { StatusSymbol } from "../../components/Common/Reusables/StatusSymbol";

const Index = () => {
  const pageName = VENUE;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = VENUE;
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    isActive: true,
    selectedCountry: undefined,
  });
  const [countryList, setCountryList] = useState([]);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [checekedList, setCheckedList] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async (dataToPass = {}) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/venue/all`, dataToPass)
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

  const fetchCountryData = async () => {
    setIsLoading(true);
    await axiosInstance
      .post("/admin/venue/countryCodes", {})
      .then((response) => {
        setCountryList(
          response.result?.map((item) => {
            return { label: item.countryName, value: item.id };
          })
        );
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

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.id)) {
      updateSingleCheck = checekedList.filter((item) => item !== e.id);
    } else {
      updateSingleCheck = [...checekedList, e.id];
    }
    setCheckedList(updateSingleCheck);
  };

  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/venue/activeInactive`, {
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
      .post(`/loadPanelData`, { module: [MODULE_VENUE], password })
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
      .post(`/admin/venue/delete`, {
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
    navigate("/addVenue", { state: { venueId: id } });
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
            checked={checekedList.includes(record.id)}
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
        <Tooltip
          title="Edit Venue"
          color="#e8e8ea"
          overlayInnerStyle={{ color: "#000" }}
        >
          <i
            className="bx bx-edit"
            onClick={() => {
              handleEdit(record.id);
            }}
            style={{ cursor: "pointer" }}
          ></i>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Country",
      dataIndex: "countryName",
      key: "countryName",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      style: { width: "20%" },
    },
    {
      title: "Venue",
      dataIndex: "name",
      key: "name",
      style: { width: "20%" },
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      style: { width: "20%" },
      sort: true,
    },
    {
      title: "TPID",
      dataIndex: "tpId",
      key: "tpId",
      style: { width: "10%" },
      // sort: true,
    },
    {
      title: "Active",
      key: "IsActive",
      render: (text, record) => (
        <Tooltip
          title={"Venue"}
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

  const tableElement = {
    title: "Venue",
    reloadButton: true,
    resetButton: true,
    loadData: true,
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchCountryData();
  }, []);

  const handleReset = () => {
    // console.log("Inside Reset")
    setSelectedFilter({
      isActive: true,
      selectedCountry: { label: "Select Country", value: 0 },
    });
    fetchData({
      isActive: true,
      countryId: undefined,
    });
  };

  const handleFilterChange = (key, value) => {
    const filterDataToUpdate = { ...selectedFilter, [key]: value };
    setSelectedFilter(filterDataToUpdate);
    fetchData({
      isActive: filterDataToUpdate.isActive,
      countryId: filterDataToUpdate.selectedCountry?.value,
    });
  };

  const handleReload = () => {
    // console.log("Inside reload")
    fetchData({
      isActive: selectedFilter.isActive,
      countryId: selectedFilter.selectedCountry?.value,
    });
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Venue" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            singleCheck={checekedList}
            onAddNavigate={"/addVenue"}
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
            renderCustomFilter={() => (
              <div className="d-flex align-items-center">
                <Select
                  styles={{
                    control: (provided) => ({ ...provided, width: 180 }),
                  }}
                  value={selectedFilter?.selectedCountry}
                  placeholder={"Country"}
                  onChange={(e) => {
                    handleFilterChange("selectedCountry", e);
                  }}
                  options={countryList}
                  classNamePrefix="filter-dropdown"
                />
                <Switch
                  width={70}
                  uncheckedIcon={<StatusSymbol valueToShow={"InActive"} />}
                  checkedIcon={<StatusSymbol valueToShow={"Active"} />}
                  className="pe-0"
                  onColor="#02a499"
                  onChange={() => {
                    handleFilterChange("isActive", !selectedFilter.isActive);
                  }}
                  checked={selectedFilter.isActive}
                />
              </div>
            )}
            handleCustomReset={handleReset}
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
              moduleName={"Venue"}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
