import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Table from "../../components/Common/Table";
import { Avatar, Tooltip } from "antd";
import { Button } from "reactstrap";
import { Container } from "reactstrap";
import SpinnerModel from "../../components/Model/SpinnerModel";
import DeleteTabModel from "../../components/Model/DeleteModel";
import axiosInstance from "../../Features/axios";
import { useNavigate } from "react-router-dom";
import { isEmpty, isEqual, pickBy } from "lodash";
import {
  ERROR,
  MODULE_COMPETITION,
  PERMISSION_ADD,
  PERMISSION_DELETE,
  PERMISSION_EDIT,
  PERMISSION_VIEW,
  SUCCESS,
  TAB_COMPETITION,
} from "../../components/Common/Const";
import { useDispatch, useSelector } from "react-redux";
import { checkPermission } from "../../components/Common/Reusables/reusableMethods";
import { updateToastData } from "../../Features/toasterSlice";
import CompetitionMarketTemplateModel from "../../components/Model/CompetitionMarketTemplateModel";
import LoadDataModal from "../../components/Model/LoadDataModal";
import { mapType } from "../Commentary/functions";
import { ChangeStatusModel } from "../../components/Model/ChangeStatusModel";
import Item from "antd/es/list/Item";

const Index = () => {
  const pageName = TAB_COMPETITION;
  const finalizeRef = useRef(null);
  const permissionObj = useSelector((state) => state.auth?.tabPermissionList);
  document.title = "Competitions";
  const [data, setData] = useState([]);
  const [dataIndexList, setDataIndexList] = useState([]);
  const [checekedList, setCheckedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModelVisable, setDeleteModelVisable] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [matchTypes, setMatchTypes] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [pythonApis, setpythonApis] = useState([]);
  const [loadDataModelVisable, setLoadDataModelVisable] = useState(false);
  const [marketTemplateModelVisible, setMarketTemplateModelVisible] =
    useState(false);
  const [marketTemplateRecord, setMarketTemplateTimeRecord] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [changeStatusModelVisible, setChangeStatusModelVisible] =
    useState(false);
  const [selectedCompetitionRecord, setSelectedCompetitionRecord] = useState(
    {}
  );

  const fetchData = async (latestValueFromTable) => {
    setIsLoading(true);
    const tableActions = finalizeRef.current.getTableAction();
    const data = latestValueFromTable || tableActions;
    const isDragValue =
      data?.isTrending !== undefined ? data?.isTrending : isDrag;
    setIsDrag(isDragValue);
    const countryData = isEmpty(countryList)
      ? await fetchCountryData()
      : countryList;
    await axiosInstance
      .post(
        `/admin/competition/all`,
        pickBy(
          {
            ...data,
            isTrending:
              data?.isTrending !== undefined
                ? data?.isTrending
                : tableActions?.isTrending !== undefined
                ? tableActions?.isTrending
                : false,
          },
          (value) => value !== null
        )
      )
      .then((response) => {
        let apiData = [...response?.result]?.sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        let apiDataIdList = [];
        apiData = apiData.map((ele) => {
          apiDataIdList.push(ele?.competitionId);
          return {
            ...ele,
            countryName: countryData.find(
              (item) => item.countryId === ele.countryId
            )?.countryName,
          };
        });
        setData(apiData);
        setDataIndexList(apiDataIdList);
        setCheckedList([]);
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

  const fetchEventTypeData = async () => {
    await axiosInstance
      .post(`/admin/competition/eventTypeList`, {})
      .then((response) => {
        setEventTypes(response.result);
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

  const fetchMatchTypeData = async () => {
    await axiosInstance
      .post(`/admin/competition/getMatchTypes`, {})
      .then((response) => {
        setMatchTypes(response.result);
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

  const fetchPythonAPIData = async () => {
    await axiosInstance
      .post(`/admin/competition/pythonAPIs`, {})
      .then((response) => {
        setpythonApis(response.result);
        setIsLoading(false);
      })
      .catch((error) => {});
  };

  const fetchCountryData = async () => {
    let dataToReturn = [];
    await axiosInstance
      .post(`/admin/list/countryList`, {})
      .then((response) => {
        // setCountries(response.result);
        setIsLoading(false);
        dataToReturn = response.result;
        setCountryList(dataToReturn);
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
    return dataToReturn;
  };

  const handleSingleCheck = (e) => {
    let updateSingleCheck = [];
    if (checekedList.includes(e.competitionId)) {
      updateSingleCheck = checekedList.filter(
        (item) => item !== e.competitionId
      );
    } else {
      updateSingleCheck = [...checekedList, e.competitionId];
    }
    setCheckedList(updateSingleCheck);
  };

  const handleCompetitionClick = (details) => {
    const url = new URL(window.location.origin + "/eventResult");
    sessionStorage.setItem(
      "eventResultCompetitionId",
      "" + details?.competitionId
    );
    sessionStorage.setItem("eventResultDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
    sessionStorage.removeItem("eventResultCompetitionId");
    sessionStorage.removeItem("eventResultDetails");
  };

  //permissions function
  const handlePermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/save`, {
        competitionId: record.competitionId,
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
  const handleVirtualPermissions = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/isVirtual`, {
        competitionId: record.competitionId,
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
  const handleIsTrending = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/isTrending`, {
        competitionId: record.competitionId,
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
  const handleIsMen = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/isMen`, {
        competitionId: record.competitionId,
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
  const handleIsEventSnap = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/isEventSnap`, {
        competitionId: record.competitionId,
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
  const handleIsPointTable = async (pType, record, cState) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/isPointTable`, {
        competitionId: record.competitionId,
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
      .post(`/loadPanelData`, { module: [MODULE_COMPETITION], password })
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

  //delete function
  const handleDelete = async (e) => {
    setIsLoading(true);
    await axiosInstance
      .post(`/admin/competition/delete`, {
        competitionId: checekedList,
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

  const handleTournament = (details) => {
    const url = new URL(window.location.origin + "/tournamentTeamPoints");
    sessionStorage.setItem("competitionId", "" + details?.competitionId);
    sessionStorage.setItem("competitionDetails", "" + JSON.stringify(details));
    window.open(url.href, "_blank");
  };

  //edit
  const handleEdit = (id) => {
    navigate("/addCompetition", { state: { userId: id } });
  };

  const handleChangeStatus = async (updatedData) => {
    try {
      setIsLoading(true);
      const { data: response } = await axiosInstance.post(
        `/admin/competition/upStatus`,
        {
          competitionId: updatedData.competitionId,
          commStatus: +updatedData.commStatus,
        }
      );

      fetchData();
      dispatch(
        updateToastData({
          data: response?.message,
          title: response?.title,
          type: SUCCESS,
        })
      );
    } catch (error) {
      dispatch(
        updateToastData({
          data: error?.message,
          title: error?.title,
          type: ERROR,
        })
      );
    } finally {
      setIsLoading(false);
      setChangeStatusModelVisible(false);
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
            checked={checekedList.includes(record.competitionId)}
            onChange={() => {
              handleSingleCheck(record);
            }}
          />
          {isDrag ? <i className="bx bx-move ms-1 mt-1"></i> : null}
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
            handleEdit(record.competitionId);
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
        // <img src={text}/>
        <div className="flex-shrink-0">
          {text ? (
            <div>
              <img className="avatar-xs" alt="" src={text} />
            </div>
          ) : (
            <Avatar src="#" alt="ET">
              Image
            </Avatar>
          )}
        </div>
      ),
      key: "tabName",
      style: { width: "10%" },
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }}>{text}</span>
      ),
      key: "eventType",
      style: { width: "10%" },
    },
    {
      title: "Match Type",
      dataIndex: "matchTypeId",
      render: (text, record) => {
        const matchTypeName =
          matchTypes.length > 0 &&
          matchTypes.find((item) => item.matchTypeId == record?.matchTypeId)
            ?.matchType;
        return <span>{matchTypeName}</span>;
      },
      key: "matchTypeId",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (text, record) => <span>{mapType(text)}</span>,
      key: "type",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Reference Id",
      dataIndex: "refId",
      key: "refId",
      style: { width: "10%" },
    },
    {
      title: "Competition",
      dataIndex: "competition",
      render: (text, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleCompetitionClick(record);
          }}
        >
          {text}
        </span>
      ),
      key: "competition",
      style: { width: "34%" },
    },
    {
      title: "",
      key: "matchType",
      render: (text, record) => {
        const matchTypeName =
          matchTypes.length > 0 &&
          matchTypes.find((item) => item?.matchTypeId == record?.matchTypeId)
            ?.matchType;
        return (
          <div className="d-flex align-items-center gap-2">
            <>
              {parseInt(record.matchTypeId) ? (
                <Tooltip
                  title={"Add Market Template"}
                  color={"#e8e8ea"}
                  overlayInnerStyle={{ color: "#000" }}
                >
                  <Button
                    color={"primary"}
                    size="sm"
                    className="btn"
                    onClick={() => {
                      setMarketTemplateModelVisible(true);
                      setMarketTemplateTimeRecord({
                        ...record,
                        matchType: matchTypeName,
                      });
                    }}
                  >
                    <i className="bx bx-plus"></i>
                  </Button>
                </Tooltip>
              ) : (
                ""
              )}
            </>
          </div>
        );
      },
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Status",
      dataIndex: "commStatus",
      render: (text, record) => {
        const statusLabels = {
          1: "Upcoming",
          2: "Started",
          3: "Completed",
          4: "Stop",
        };
        return (
          <span
            onClick={() => {
              setChangeStatusModelVisible(true);
              setSelectedCompetitionRecord(record);
            }}
            style={{ cursor: "pointer" }}
          >
            {statusLabels[text] || " "}
            <Tooltip
              title="Edit Status"
              color={"#e8e8ea"}
              overlayInnerStyle={{ color: "#000" }}
            >
              <a className="bx bx-edit-alt"></a>
            </Tooltip>
          </span>
        );
      },
      key: "commStatus",
      style: { width: "10%" },
    },
    {
      title: "API",
      dataIndex: "developerName",
      // render: (text, record) => {
      //   const pythonApiNames =
      //     pythonApis.length > 0 &&
      //     pythonApis.find((item) => item.id == record?.pythonId)?.developerName;
      //   return <span>{pythonApiNames}</span>;
      // },
      key: "developerName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Country",
      dataIndex: "countryName",
      key: "countryName",
      sort: true,
      style: { width: "10%" },
    },
    {
      title: "Active",
      key: "isActive",
      render: (text, record) => (
        <Tooltip
          title={"Competition"}
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
    {
      title: "Virtual",
      key: "isVirtual",
      render: (text, record) => (
        <Tooltip
          title={"Virtual"}
          color={"#e8e8ea"}
          overlayInnerStyle={{ color: "#000" }}
        >
          <Button
            color={`${record.isVirtual ? "primary" : "danger"}`}
            size="sm"
            className="btn"
            onClick={() => {
              handleVirtualPermissions("isVirtual", record, record.isVirtual);
            }}
          >
            <i
              className={`bx ${record?.isVirtual ? "bx-check" : "bx-block"}`}
            ></i>
          </Button>
        </Tooltip>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Trending",
      key: "isTrending",
      render: (text, record) => (
        <Button
          color={`${record.isTrending ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsTrending("isTrending", record, record.isTrending);
          }}
        >
          <i
            className={`bx ${record.isTrending ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Men",
      key: "isMen",
      render: (text, record) => (
        <Button
          color={`${record?.isMen ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsMen("isMen", record, record?.isMen);
          }}
        >
          <i className={`bx ${record.isMen ? "bx-check" : "bx-block"}`}></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Snap",
      key: "isEventSnap",
      render: (text, record) => (
        <Button
          color={`${record.isEventSnap ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsEventSnap("isEventSnap", record, record?.isEventSnap);
          }}
        >
          <i
            className={`bx ${record.isEventSnap ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Table",
      key: "isPointTable",
      render: (text, record) => (
        <Button
          color={`${record.isPointTable ? "primary" : "danger"}`}
          size="sm"
          className="btn"
          onClick={() => {
            handleIsPointTable("isPointTable", record, record?.isPointTable);
          }}
        >
          <i
            className={`bx ${record.isPointTable ? "bx-check" : "bx-block"}`}
          ></i>
        </Button>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "Teams",
      key: "competitionId",
      render: (text, record) => (
        <>
          <Tooltip
            title={"Snap"}
            color={"#e8e8ea"}
            overlayInnerStyle={{ color: "#000" }}
          >
            <Button
              color={"primary"}
              size="sm"
              className="btn"
              onClick={() => {
                handleTournament(record);
              }}
            >
              <i class="bx bxs-store"></i>
            </Button>
          </Tooltip>
        </>
      ),
      style: { width: "2%", textAlign: "center" },
    },
    {
      title: "TPID",
      dataIndex: "tpId",
      key: "tpId",
      style: { width: "10%" },
      sort: true,
    },
    {
      title: "CID",
      dataIndex: "competitionId",
      key: "competitionId",
      style: { width: "10%" },
      sort: true,
    },
  ];

  const handleReset = (value) => {
    fetchData(value);
  };

  //elements required
  const tableElement = {
    title: "Competition",
    dragDrop: isDrag,
    headerSelect: false,
    eventTypeSelect: true,
    matchTypeSelect: true,
    pythonApiSelect: true,
    typeSelect: true,
    isActive: true,
    resetButton: true,
    reloadButton: true,
    isTrending: true,
    isMen: true,
    loadData: true,
    isVirtual: true,
    virtualOptions: [
      {
        label: "All",
        value: 0,
      },
      {
        label: "true",
        value: true,
      },
      {
        label: "false",
        value: false,
      },
    ],
  };

  useEffect(() => {
    if (!checkPermission(permissionObj, pageName, PERMISSION_VIEW)) {
      navigate("/dashboard");
    }
    fetchData();
    fetchEventTypeData();
    fetchMatchTypeData();
    fetchPythonAPIData();
  }, []);

  const handleReload = (value) => {
    fetchData();
    // fetchEventTypeData();
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Competition" />
          {isLoading && <SpinnerModel />}
          <Table
            ref={finalizeRef}
            columns={columns}
            dataSource={data}
            tableElement={tableElement}
            deleteModelFunction={setDeleteModelVisable}
            changeOrderApiName="competition"
            eventTypes={eventTypes}
            matchType={matchTypes}
            pythonApis={pythonApis}
            singleCheck={checekedList}
            reFetchData={fetchData}
            handleReload={handleReload}
            loadDataModelFunction={setLoadDataModelVisable}
            onAddNavigate={"/addCompetition"}
            handleReset={handleReset}
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
          />
          {loadDataModelVisable && (
            <LoadDataModal
              loadDataModelVisable={loadDataModelVisable}
              setLoadDataModelVisable={setLoadDataModelVisable}
              handleLoadData={handleLoadData}
              moduleName={"Competition"}
            />
          )}
          {marketTemplateModelVisible && (
            <CompetitionMarketTemplateModel
              marketTemplateModelVisible={marketTemplateModelVisible}
              setMarketTemplateModelVisible={setMarketTemplateModelVisible}
              marketTemplateRecord={marketTemplateRecord}
              fetchData={fetchData}
            />
          )}
          {changeStatusModelVisible && (
            <ChangeStatusModel
              changeStatusModelVisible={changeStatusModelVisible}
              setChangeStatusModelVisible={setChangeStatusModelVisible}
              handleChangeStatus={handleChangeStatus}
              selectedCompetitionRecord={selectedCompetitionRecord}
              setSelectedCompetitionRecord={setSelectedCompetitionRecord}
            />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Index;
