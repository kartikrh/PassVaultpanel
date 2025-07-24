import React, { useState, useEffect, useRef, useCallback } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Avatar } from "antd";
import Table from "../../components/Common/Table";
import { Container } from "reactstrap";
import { Tooltip } from "antd";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import _, { isEmpty } from "lodash";
import {
  ERROR,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_IMPORT_ENTITYTEAMIMPORT,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import { loadInit } from "../../config";
import ImportModel from "./ImportModel";

export default function ImportEntityTeam() {
  const pageName = TAB_IMPORT_ENTITYTEAMIMPORT;
  document.title = "Entity Team Import";
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
      const response = await axiosInstance.post(`${entitySportUrl}/admin/v3/teams`, {
        page: currentPage === 0 ? 1 : currentPage,
        limit: pageSize,
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
    pageSize,
    entitySportUrl,
    dispatch,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Import team data
  const addTeamData = async (team) => {
    setIsLoading(true);
    finalizeRef.current.getTableAction();
    await axiosInstance
      .post(`/admin/autoImportData/save`, {
        refId: team.tid,
        refType: 4, // refType is 4 for team
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

  // Column configurations
  const columns = [
    {
      title: (
        <Tooltip
          title={"Import All Team"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <button
            // color={"primary"}
            size="sm"
            className="sucessBtn"
            onClick={() => setIsImportModalOpen(true)}
          >
            <i className="bx bx-plus"></i>
          </button>
        </Tooltip>
      ),
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
            addTeamData({
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
      title: "S-name",
      dataIndex: "abbr",
      key: "abbr",
      width: "10%",
      sort: true,
    },
    // {
    //   title: "Country",
    //   dataIndex: "country",
    //   key: "country",
    //   width: "10%",
    // },
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    //   width: "10%",
    // },
  ];

  // Table element configuration
  const tableElement = {
    title: "Entity Team Import",
    headerSelect: false,
    isActive: false,
    isServerPagination: true,
    isNonCrud: true,
    // resetButton: true,
    // reloadButton: true,
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem={"Entity Team Import"} />
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
            // onBreadCrumbsClick={handleBreadcrumbClick}
            // breadCrumbs={navigationHistory}
            // handleCustomReset={handleReset}
            handleReload={handleReload}
          />
          {isImportModalOpen && <ImportModel
            isOpen={isImportModalOpen}
            toggle={() => setIsImportModalOpen(!isImportModalOpen)}
            handleImport={() => {
                addTeamData({
                    ...dataToDB,
                    tid:-1,
                });
                setIsImportModalOpen(!isImportModalOpen);
            }}
          />}
        </Container>
      </div>
    </React.Fragment>
  );
}
