import React, { useState, useEffect, useRef, useCallback } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
import Select from "react-select";
import Table from "../../components/Common/Table";
import { Button, Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _, { isEmpty } from "lodash";
import {
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_IMPORT_ENTITYPLAYERIMPORT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { loadInit } from "../../config";

export default function ImportEntityPlayer() {
  const pageName = TAB_IMPORT_ENTITYPLAYERIMPORT;
  document.title = "Entity Player Import";
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [currentPage, setCurrentPage] = useState(1);
  const globalPageSize = parseInt(localStorage.getItem("pageSize")) || 10;
  const [pageSize, setPageSize] = useState(globalPageSize);
  const [total, setTotal] = useState(0);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [countryCode, setCountryCode] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dataToDB, setDataToDB] = useState({});
  
  let entitySportUrl =
    loadInitData.find((item) => item.key === loadInit.ENTITYSPORT_URL)?.value;

  useEffect(() => {
    if (!isEmpty(permissionObj)) {
      if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
        navigate("/dashboard");
        return;
      }
      setPermissionChecked(true);
    }
  }, [permissionObj, navigate]);

  const fetchData = useCallback(async () => {
    if (!permissionChecked) return;

    setIsLoading(true);
    finalizeRef.current.getTableAction();

    try {
      const response = await axiosInstance.post(`${entitySportUrl}/admin/v3/players/search`, {
        page: currentPage === 0 ? 1 : currentPage,
        limit: pageSize,
        country: selectedCountry?.value || null,
        // search: "",
      });

      const items = response?.result?.response?.items;
      const totalItems = response?.result?.response?.total_items;

      const apiData = Array.isArray(items) ? items : [];
      const totalCount = +totalItems || apiData.length;

      setTotal(totalCount);
      setData(apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    // navigationHistory,
    permissionChecked,
    currentPage,
    selectedCountry,
    pageSize,
    entitySportUrl,
    dispatch
  ]);

  const fetchCountryCodeData = async () => {
    await axiosInstance
      .post(`/admin/countryCode/all`, { isActive: true })
      .then((response) => {
        setCountryCode(response?.result || []);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchCountryCodeData();
  },[])
  
  const countryOptions = (countryCode && countryCode.length) > 0 ? countryCode.map((country) => ({
    label: country?.countryName,
    value: country?.shortName,
  })) : [];

  // Import player data
  const addPlayerData = async (player) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/autoImportData/save`, {
        refId: player.pid,
        refType: 5, // refType is 5 for player
        sourceId: 3,
      })
      .then((response) => {
        dispatch(
          updateToastData({
            data: response?.message,
            title: response?.title,
            type: SUCCESS,
          })
        );
        setIsLoading(false);
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

  const handlePageChange = (page) => {
    if (page === currentPage || isLoading) return;
    if (page !== currentPage && !isLoading) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    if (size !== pageSize && !isLoading) {
      setPageSize(() => {
        setCurrentPage(0); // only after pageSize is updated
        return size;
      });
      localStorage.setItem("pageSize", size);
    }
  };

  const handleReload = () => {
    fetchData();
  };

  const handleReset = () => {
    setSelectedCountry(null)
    setCurrentPage(1);
  };

  // Column configurations
  const columns = [
    {
      title: "Import",
      dataIndex: "import",
      key: "import",
      style: { width: "7.5%", textAlign: "left" },
      render: (text, record) => (
        <button
          // color={"primary"}
          size="sm"
          className="sucessBtn"
          onClick={() => {
            setDataToDB({
              ...dataToDB,
              ...record,
            });
            addPlayerData({
              ...dataToDB,
              ...record,
            });
          }}
        >
          <i className="bx bx-plus"></i>
        </button>
      ),
    },
    {
      title: "Logo",
      dataIndex: "logo_url",
      printType: "ignore",
      render: (text, record) => (
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img
                className="avatar-xs "
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
      key: "logo_url",
      style: { width: "10%", textAlign: "left" },
    },
    {
      title: "Name",
      dataIndex: "title",
      key: "title",
      width: "10%",
      sort: true,
    },
    {
      title: "Short",
      dataIndex: "short_name",
      key: "short_name",
      width: "10%",
      sort: true,
    },
    // {
    //   title: "Country",
    //   dataIndex: "country",
    //   key: "country",
    //   width: "10%",
    //   sort: true,
    // },
    {
      title: "Nationality",
      dataIndex: "nationality",
      key: "nationality",
      width: "10%",
      sort: true,
    },
    {
      title: "Batting Style",
      dataIndex: "batting_style",
      key: "batting_style",
      width: "10%",
      sort: true,
    },
    {
      title: "Bowling Style",
      dataIndex: "bowling_style",
      key: "bowling_style",
      width: "10%",
      sort: true,
    },
    {
      title: "Bowling Type",
      dataIndex: "bowling_type",
      key: "bowling_type",
      width: "10%",
      sort: true,
    },
    {
      title: "Playing Role",
      dataIndex: "playing_role",
      key: "playing_role",
      width: "10%",
      sort: true,
    },
  ];

  // Table element configuration
  const tableElement = {
    title: "Entity Player Import",
    headerSelect: false,
    isActive: false,
    isServerPagination: true,
    countryCodeSelect: true,
    resetButton: true,
    reloadButton: true,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem={"Entity Player Import"} />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            reFetchData={fetchData}
            serverCurrentPage={currentPage}
            serverPageSize={pageSize}
            serverTotal={total}
            setServerCurrentPage={handlePageChange}
            setServerPageSize={handlePageSizeChange}
            handleCustomReset={handleReset}
            handleReload={handleReload}
            renderCustomFilter={() => (
              <div className="d-flex align-items-center gap-2">
                <Select
                  styles={{ control: (provided) => ({ ...provided, width: 250 }) }}
                  placeholder="Country Code"
                  value={selectedCountry}
                  onChange={(selected) => {
                    setSelectedCountry(selected);
                    setCurrentPage(1);
                  }}
                  classNamePrefix="filter-dropdown"
                  options={countryOptions}
                />
              </div>
            )}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}
