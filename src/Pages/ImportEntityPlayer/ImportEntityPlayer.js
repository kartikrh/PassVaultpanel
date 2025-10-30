import React, { useState, useEffect, useRef, useCallback } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar, Modal } from "antd";
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
import axios from "axios";
import PlayerCard from "./PlayerCard";

export default function ImportEntityPlayer() {
  const pageName = TAB_IMPORT_ENTITYPLAYERIMPORT;
  document.title = "Entity Player Import";
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
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
  
  // Player Card Modal States
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [loadingPlayerData, setLoadingPlayerData] = useState(false);
  
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
      const params = {
        paged: currentPage === 0 ? 1 : currentPage,
        per_page: pageSize,
        country: selectedCountry?.value || null,
        search: search || null,
      }
      const response = await axios.get(`${entitySportUrl}/player/search`, {
        params
      });

      const items = response?.data?.result?.items;
      const totalItems = response?.data?.result?.total_items;

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
    dispatch,
    search
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

  const handlePlayerClick = async (pid) => {
    setLoadingPlayerData(true);
    setIsPlayerModalVisible(true);
    
    try {
      const response = await axios.get(`${entitySportUrl}/player/${pid}/statistics`);
      console.log("response", response);
      setSelectedPlayerData(response?.data);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      dispatch(
        updateToastData({
          data: "Failed to fetch player data",
          title: "Error",
          type: ERROR,
        })
      );
      setIsPlayerModalVisible(false);
    } finally {
      setLoadingPlayerData(false);
    }
  }

  // const handleClosePlayerModal = () => {
  //   setIsPlayerModalVisible(false);
  //   setSelectedPlayerData(null);
  // };

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
      render: (text, record) => (
        <span
          className="cursor-pointer"
          onClick={() => handlePlayerClick(record?.pid)}
          style={{
            cursor: "pointer",
          }}
        >
          {text}
        </span>
      ),
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

  const customPageSizeOptions = ["10", "20", "50"];

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
            playerSearch={search}
            setSearch={setSearch}
            setServerCurrentPage={handlePageChange}
            setServerPageSize={handlePageSizeChange}
            customPageSizeOptions={customPageSizeOptions}
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

      {/* Player Card Modal */}
      <Modal
        open={isPlayerModalVisible}
        onCancel={()=>setIsPlayerModalVisible(false)}
        footer={null}
        width={900}
        closable={false}
        centered
        className="player-modal"
        styles={{
          body: {
            top: "3rem",
            maxHeight: 650,
            overflowY: "auto",
            overflowX: "hidden",
            marginRight: "-16px",
            marginLeft: "-16px",
            marginTop: "0px",
            marginBottom: "-16px",
            scrollBehavior: 'smooth'
          },
        }}
      >
        <PlayerCard
          playerData={selectedPlayerData}
          onClose={() => setIsPlayerModalVisible(false)}
        />
      </Modal>
    </React.Fragment>
  );
}
