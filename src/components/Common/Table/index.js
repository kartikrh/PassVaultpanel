import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";
import Pagination from "../../Pagination";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Select from "react-select";
import { filterOrderChange } from "../../../helpers/helper";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import Switch from "react-switch";
import axiosInstance from "../../../Features/axios";
import { ERROR } from "../Const";
import { updateToastData } from "../../../Features/toasterSlice";
import { useDispatch } from "react-redux";
import { ReusableBreadcrumbs } from "../Reusables/Breadcrumbs";
import { RSelect } from "../Reusables/FormElements";
import { DatePicker, Space, Tooltip } from "antd";
import moment from "moment";
import { convertDateUTCToLocal } from "../Reusables/reusableMethods";
import { getStatusColor } from "../../../Pages/Commentary/CommentartConst";
const { RangePicker } = DatePicker;
const changeDisplayOrder = async (tabdisplayOrder, apiName) => {
  try {
    const response = await axiosInstance.post(
      `/admin/${apiName}/changeDisplayOrder`,
      tabdisplayOrder // Send the updated order data to the API
    );
    return response?.result || [];
  } catch (error) {
    throw Error(error);
  }
};
const Index = forwardRef(
  (
    {
      columns,
      dataSource,
      tableElement,
      cloneModelFunction,
      deleteModelFunction,
      loadModelFunction,
      suspendModelFunction,
      closeModelFunction,
      deleteAllModelFunction,
      loadPanelModelFunction,
      loadClientModelFunction,
      loadSignalRToggleFunction,
      isSignalRStarted,
      singleCheck,
      setImportExportModelVisable,
      eventTypes,
      competitionList,
      eventList,
      statusList,
      rateSourceList,
      ratesource,
      setRatesource,
      setEventTypeId,
      setCompetitionId,
      reFetchData,
      delay,
      setDelay,
      handleDelay,
      selectedClientSocket,
      setSelectedClientSocket,
      handleClientSocketChange,
      actionTypeOptions,
      handleReset,
      competitions,
      onAddNavigate,
      changeOrderApiName,
      isAddPermission,
      isDeletePermission,
      isSuspendPermission,
      isClosePermission,
      isDeleteAllPermission,
      breadCrumbs,
      onBreadCrumbsClick,
      teams,
      setDateRange,
      dateRange,
      isSearch,
      setIsSearch,
      matchType,
      isPagination = true
    },
    ref
  ) => {
    document.title = `${tableElement?.title}`;
    const [data, setData] = useState(dataSource);
    const [tableActions, setTableActions] = useState({
      isActive: true,
    });
    const [total, setTotal] = useState(dataSource.length);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState({
      sortOrder: "",
      key: "",
    });
    const [statusSwitch, setStatusSwitch] = useState(true);
    const [selectedTableElements, setSelectedTableElements] = useState({});
    const [delayValidationMessage, setDelayValidationMessage] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectInputRef = useRef(null);
    useEffect(() => {
      setData(filteredData);
    }, [filteredData]);

    const OffsymbolStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 10,
            color: "#fff",
            // paddingRight: 2,
          }}
        >
          {" "}
          inActive
        </div>
      );
    };
    const OnSymbolStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 12,
            color: "#fff",
            // paddingRight: 4,
          }}
        >
          {" "}
          active
        </div>
      );
    };

    const OffsymbolApprovedStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 8,
            color: "#fff",
            // paddingRight: 2,
          }}
        >
          {" "}
          not approved
        </div>
      );
    };
    const OnSymbolApprovedStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 9,
            color: "#fff",
            // paddingRight: 4,
          }}
        >
          {" "}
          approved
        </div>
      );
    };

    const styles = {
      menu: ({ width, ...css }) => ({ ...css }),
    };
    const handleTableActions = (key, id) => {
      if (key === "isActive") {
        setStatusSwitch(id);
        setTableActions((preValue) => {
          return {
            ...preValue,
            [key]: id,
          };
        });
        reFetchData({
          ...tableActions,
          isActive: id,
        });
      } else if (key === "isApproved") {
        setStatusSwitch(id);
        setTableActions((preValue) => {
          return {
            ...preValue,
            [key]: id,
          };
        });
        reFetchData({
          ...tableActions,
          isApproved: id,
        });
      } else {
        if (key === "isShowContent") {
          setStatusSwitch(id);
        }
        reFetchData({
          ...tableActions,
          [key]: id?.value,
        });
        setTableActions((preValue) => {
          return {
            ...preValue,
            [key]: id?.value,
          };
        });
      }
    };

    const handleSearchFilter = () => {
      if (tableElement.title === "Tabs") {
        const updatedData = data.filter((val) => {
          const found = Object.values(val).some((value) => {
            if (typeof value === "string" || value instanceof String) {
              return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });
          return found === true;
        });
        if (searchTerm) {
          setFilteredData(updatedData);
          setTotal(updatedData.length);
        } else {
          setTotal(data.length);
          setFilteredData(data);
        }
      } else if (tableElement.title === "Import Events") {
        const updatedData = dataSource.filter((val) => {
          const first = Object.values(val);
          const firstObject = first[0];
          const found = Object.values(firstObject).some((value) => {
            if (typeof value === "string" || value instanceof String) {
              return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });
          return found === true;
        });
        if (searchTerm === "") {
          setTotal(dataSource.length);
          const sliced = dataSource.slice(
            currentPage * pageSize,
            currentPage * pageSize + pageSize
          );
          setFilteredData(sliced);
        } else {
          setFilteredData(updatedData);
          setTotal(updatedData.length);
        }
      } else {
        const updatedData = dataSource.filter((val) => {
          const found = Object.values(val).some((value) => {
            if (typeof value === "string" || value instanceof String) {
              return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });
          return found === true;
        });
        if (searchTerm === "") {
          setTotal(dataSource.length);
          const sliced = dataSource.slice(
            currentPage * pageSize,
            currentPage * pageSize + pageSize
          );
          setFilteredData(sliced);
        } else {
          setFilteredData(updatedData);
          setTotal(updatedData.length);
        }
      }
    };
    const diffKey = [
      "playerId",
      "playerName",
      "batsmanAverage",
      "batsmanStrikeRate",
      "bowlerEconomy",
    ];
    const generateSimplifiedData = () => {
      let pdfCols = ["No."];
      let colsDataKey = [];
      columns?.forEach((item) => {
        if (
          item.key !== "select" &&
          item.key !== "edit" &&
          item.printType !== "ignore"
        ) {
          pdfCols.push(item.title);
          colsDataKey.push(item.key);
        }
      });
      const headers = [pdfCols];
      let colsData = dataSource.map((dataItem) =>
        colsDataKey.map((key) => dataItem[key])
      );
      colsData = colsData.map((value, index) => [index + 1, ...value]);
      const csvData = colsData.map((value, i) => {
        let data = {};
        value.forEach((v, i) => {
          data = {
            ...data,
            [pdfCols[i]]: v,
          };
        });
        return data;
      });
      return { headers, colsData, csvData };
    };
    const generateDifferentData = () => {
      let pdfCols = ["No."];
      let colsDataKey = [];
      diffKey?.forEach((item) => {
        pdfCols.push(item);
        colsDataKey.push(item);
      });
      const headers = [pdfCols];
      let colsData = dataSource.map((dataItem) =>
        colsDataKey.map((key) => dataItem[key])
      );
      colsData = colsData.map((value, index) => [index + 1, ...value]);
      const csvData = colsData.map((value, i) => {
        let data = {};
        value.forEach((v, i) => {
          data = {
            ...data,
            [pdfCols[i]]: v,
          };
        });
        return data;
      });
      return { headers, colsData, csvData };
    };
    const handleDownloadExcel = () => {
      // Create a worksheet

      const ws = XLSX.utils.json_to_sheet(generateDifferentData().csvData);

      // Create a workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

      // Download the workbook
      XLSX.writeFile(wb, `${tableElement.title}.xlsx`);
    };

    const generatePDF = () => {
      const { headers, colsData } = generateSimplifiedData();

      const pdf = new jsPDF({
        orientation: "portrait", // or 'landscape'
        unit: "mm",
        format: "ledger", // or [width, height]
        fontSize: 3, // Set the font size
      });

      let content = {
        startY: 50,
        head: headers,
        body: colsData,
      };

      pdf.autoTable(content);
      pdf.save(tableElement.title + ".pdf");
    };

    const downloadExcel = () => {
      // Create a worksheet
      const ws = XLSX.utils.json_to_sheet(generateSimplifiedData().csvData);

      // Create a workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

      // Download the workbook
      XLSX.writeFile(wb, `${tableElement.title}.xlsx`);
    };

    const sortByProperty = (order, propName) => {
      if (order !== "ascending" && order !== "descending") {
        throw new Error(
          "Invalid sorting order. Use 'ascending' or 'descending'."
        );
      }

      setSortOrder({
        sortOrder: order,
        key: propName,
      });

      const sortedData = data.slice().sort((a, b) => {
        const valueA =
          typeof a[propName] === "string" ? a[propName] : a[propName];
        const valueB =
          typeof b[propName] === "string" ? b[propName] : b[propName];

        if (order === "ascending") {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });

      setData(sortedData);
    };

    const sortByPropertyB = (order, propName) => {
      if (order !== "ascending" && order !== "descending") {
        throw new Error(
          "Invalid sorting order. Use 'ascending' or 'descending'."
        );
      }
      setSortOrder({
        sortOrder: order,
        key: propName,
      });
      const sortedData = data.slice().sort((a, b) => {
        if (
          propName == "eventTypeId" ||
          propName == "competitionId" ||
          propName == "eventId"
        ) {
          const first = Object.values(a);
          const second = Object.values(b);
          const firstObject = first[0]?.id;
          const secondObject = second[0]?.id;
          const valueA =
            typeof firstObject === "string"
              ? Number(firstObject)
              : Number(firstObject);
          const valueB =
            typeof secondObject === "string"
              ? Number(secondObject)
              : Number(secondObject);
          if (order === "ascending") {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
          } else {
            return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
          }
        } else if (propName == "date") {
          const first = Object.values(a);
          const second = Object.values(b);
          const firstObject = first[0]?.openDate;
          const secondObject = second[0]?.openDate;
          const valueA =
            typeof firstObject === "string" ? firstObject : firstObject;
          const valueB =
            typeof secondObject === "string" ? secondObject : secondObject;
          if (order === "ascending") {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
          } else {
            return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
          }
        } else {
          const valueA =
            typeof a[propName]?.name === "string"
              ? a[propName]?.name
              : a[propName]?.name;
          const valueB =
            typeof b[propName]?.name === "string"
              ? b[propName]?.name
              : b[propName]?.name;
          if (order === "ascending") {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        }
      });

      setData(sortedData);
    };
    const optionGroup = [
      {
        label: "Picnic",
        options: [
          { label: "Mustard", value: "Mustard" },
          { label: "Ketchup", value: "Ketchup" },
          { label: "Relish", value: "Relish" },
        ],
      },
      {
        label: "Camping",
        options: [
          { label: "Tent", value: "Tent" },
          { label: "Flashlight", value: "Flashlight" },
          { label: "Toilet Paper", value: "Toilet Paper" },
        ],
      },
    ];
    const fetchData = () => {
      if (isPagination) {
        const possibleNoOfPages = Math.ceil(dataSource?.length / pageSize);
        let sliced;

        if (currentPage < possibleNoOfPages) {
          sliced = dataSource.slice(
            currentPage * pageSize,
            currentPage * pageSize + pageSize
          );
        } else {
          const pageToJump = possibleNoOfPages - 1;
          sliced = dataSource.slice(
            pageToJump * pageSize,
            pageToJump * pageSize + pageSize
          );
        }
        setData(sliced);
      }
      else {
        setData(dataSource);
      }
      setTotal(dataSource.length);
    };

    const handleDragEnd = (result) => {
      if (!result.destination) {
        return;
      }

      const newData = [...data];
      const [movedRow] = newData.splice(result.source.index, 1);
      newData.splice(result.destination.index, 0, movedRow);
      setData(newData);
      const tabOrders = filterOrderChange(newData, changeOrderApiName) || "";
      changeDisplayOrder(tabOrders, changeOrderApiName || "");
    };

    const handleTableReset = () => {
      setSearchTerm("");
      setTableActions({
        isActive: true,
      });
      setSelectedTableElements({
        rateSourceType: { 
          value: 1,
          label: "Ratesource",
        },
        eventName: {
          value: 0,
          label: "Event List",
        },
        competition: {
          value: 0,
          label: "Competition",
        },
        eventType: {
          value: 0,
          label: "Event Type",
        },
        matchType: {
          value: 0,
          label: "Match Type",
        },
        commentaryStatus: {
          value: 0,
          label: "Commentary Status",
        },
        displayType: {
          value: 0,
          label: "Display Type",
        },
        team: {
          value: 0,
          label: "Select Team",
        },
        statusType: {
          value: 0,
          label: "Select Status"
        }
      });
      if (tableElement?.dateRange) {
        setDateRange({
          startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
          endDate: `${new Date().toISOString().split("T")[0]}T23:59`,
        });
      }
      setStatusSwitch(true);
      if (tableElement?.rateSourceListSelect) {
        handleReset({
          isActive: true,
          rateSourceRefId: 1,
        });
      } else{
      handleReset({
        isActive: true,
      });
      }
    };

    const getTableAction = () => {
      return tableActions;
    };

    useEffect(() => {
      handleSearchFilter();
    }, [searchTerm]);
    useEffect(() => {
      fetchData();
    }, [dataSource]);

    useImperativeHandle(ref, () => ({ getTableAction }));
    return (
      <Row>
        <Col lg={12}>
          <Card>
            {(tableElement?.title !== "Auto Events" && tableElement?.title !== "Manual Events") && (
              <CardHeader>
                <form>
                  <Row className="g-2">
                    <Col className="col-sm-auto">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        {tableElement?.displayTitle && tableElement?.title}
                        {isAddPermission && (
                          <Button
                            color="success"
                            className="add-btn"
                            onClick={() => {
                              navigate(onAddNavigate);
                            }}
                            id="create-btn"
                          >
                            <i className="ri-add-line align-bottom me-1"></i>{" "}
                            Add
                          </Button>
                        )}
                        {tableElement?.isActive ? (
                          <div className="d-flex align-items-center">
                            <Switch
                              width={70}
                              uncheckedIcon={<OffsymbolStatus />}
                              checkedIcon={<OnSymbolStatus />}
                              className="pe-0"
                              onColor="#02a499"
                              onChange={() => {
                                handleTableActions("isActive", !statusSwitch);
                              }}
                              checked={statusSwitch}
                            />
                          </div>
                        ) : null}
                        {tableElement?.isApproved ? (
                          <div className="d-flex align-items-center">
                            <Switch
                              width={70}
                              uncheckedIcon={<OffsymbolApprovedStatus />}
                              checkedIcon={<OnSymbolApprovedStatus />}
                              className="pe-0"
                              onColor="#02a499"
                              onChange={() => {
                                handleTableActions("isApproved", !statusSwitch);
                              }}
                              checked={statusSwitch}
                            />
                          </div>
                        ) : null}
                        {tableElement?.clone ? (
                          <Button
                            color="warning"
                            className="btn"
                            onClick={() => {
                              singleCheck.length === 1
                                ? cloneModelFunction(true)
                                : dispatch(
                                  updateToastData({
                                    data: "Select at least one (only One) row",
                                    title: "Error",
                                    type: ERROR,
                                  })
                                );
                            }}
                            id="create-btn"
                          >
                            <i className="ri-add-line align-bottom me-1"></i>{" "}
                            Clone
                          </Button>
                        ) : null}
                        {tableElement?.loadCommentary ? (
                          <Button
                            color="success"
                            className="btn"
                            onClick={() => {
                              singleCheck.length > 0
                                ? loadModelFunction(true)
                                : dispatch(
                                  updateToastData({
                                    data: "Select at least one (only One) row",
                                    title: "Error",
                                    type: ERROR,
                                  })
                                );
                            }}
                            id="create-btn"
                          >
                            <i className="ri-add-line align-bottom me-1"></i>{" "}
                            Load
                          </Button>
                        ) : null}
                        {isSuspendPermission && (
                          <Button
                            color="danger"
                            onClick={() => {
                              singleCheck.length > 0
                                ? suspendModelFunction(true)
                                : dispatch(
                                  updateToastData({
                                    data: "Select at least one (only One) row",
                                    title: "Error",
                                    type: ERROR,
                                  })
                                );
                            }}
                          >
                            Suspend
                          </Button>
                        )}
                        {isClosePermission && (
                          <Button
                            color="danger"
                            onClick={() => {
                              singleCheck.length > 0
                                ? closeModelFunction(true)
                                : dispatch(
                                  updateToastData({
                                    data: "Select at least one (only One) row",
                                    title: "Error",
                                    type: ERROR,
                                  })
                                );
                            }}
                          >
                            Close
                          </Button>
                        )}
                        {isDeletePermission && (
                          <Button
                            color="soft-danger"
                            onClick={() => {
                              singleCheck.length > 0
                                ? deleteModelFunction(true)
                                : dispatch(
                                  updateToastData({
                                    data: "Select at least one (only One) row",
                                    title: "Error",
                                    type: ERROR,
                                  })
                                );
                            }}
                          >
                            <i className="ri-delete-bin-2-line"></i>
                          </Button>
                        )}
                        {tableElement?.displayTypeDropDown ? (
                          <div className="">
                            <Select
                              value={selectedTableElements?.display}
                              placeholder="Select Event Type"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                handleTableActions("displayType", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  displayType: e,
                                });
                              }}
                              options={tableElement?.displayTypes?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                         {tableElement?.rateSourceListSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }), // Adjust width as needed
                              }}
                              value={selectedTableElements?.rateSourceType}
                              placeholder={ratesource?.rateSourceType}
                              onChange={(e) => {
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  rateSourceType: e,
                                });
                                setRatesource({
                                  rateSourceType: e?.label,
                                  rateSourceRefId: e?.value,
                                })
                              }}
                              options={rateSourceList?.map((item) => ({
                                label: item?.rateSourceType,
                                value: item?.rateSourceRefId,
                              }))}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.eventTypeSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }), // Adjust width as needed
                              }}
                              value={selectedTableElements?.eventType}
                              placeholder="Event Type"
                              onChange={(e) => {
                                handleTableActions("eventTypeId", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  eventType: e,
                                  competition: { value: 0, label: "Competition List" },
                                  eventName: { value: 0, label: "Event List" },
                                });
                                setEventTypeId(e?.value);
                                setCompetitionId(null);
                              }}
                              options={[
                                { label: "Select Event Type", value: null },
                                ...eventTypes?.map((item) => ({
                                  label: item?.eventType,
                                  value: item?.eventTypeId,
                                })),
                              ]}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.competitionsListSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }),
                              }}
                              value={selectedTableElements?.competition}
                              placeholder="Competition List"
                              onChange={(e) => {
                                setCompetitionId(e?.value);
                                handleTableActions("competitionId", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  competition: e,
                                  eventName: { value: 0, label: "Event List" },
                                });
                              }}
                              options={competitionList?.map((item) => ({
                                label: item?.competition,
                                value: item?.competitionId,
                              }))}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.eventListSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }),
                              }}
                              value={selectedTableElements?.eventName}
                              placeholder="Event List"
                              onChange={(e) => {
                                handleTableActions("eventId", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  eventName: e,
                                });
                              }}
                              options={eventList?.map((item) => ({
                                label: `${item?.eventName} (${convertDateUTCToLocal(item?.eventDate, "index")})`,
                                value: item?.eventId,
                              }))}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.statusListSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }), // Adjust width as needed
                              }}
                              value={selectedTableElements?.statusType}
                              // defaultValue={statusList?.find(item => item.statusId === 1)?.statusType}
                              placeholder="Status Type"
                              onChange={(e) => {
                                handleTableActions("status", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  statusType: e,
                                });
                              }}
                              options={statusList?.map((item) => ({
                                label: item?.statusType,
                                value: item?.statusId,
                              }))}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.matchTypeSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }), // Adjust width as needed
                              }}
                              value={selectedTableElements?.matchType}
                              placeholder="Match Type"
                              onChange={(e) => {
                                handleTableActions("matchTypeId", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  matchType: e,
                                });
                              }}
                              options={matchType?.map((item) => ({
                                label: item?.matchType,
                                value: item?.matchTypeId,
                              }))}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.competitionsSelect ? (
                          <div className="">
                            <Select
                              value={selectedTableElements?.competition}
                              placeholder="Competition"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                handleTableActions("competitionId", e);
                                setSelectedTableElements({
                                  ...selectedTableElements,
                                  competition: e,
                                });
                              }}
                              options={competitions?.map((item) => ({
                                label: item?.competition,
                                value: item?.competitionId,
                              }))}
                              classNamePrefix="select2-selection"
                            />
                          </div>
                        ) : null}
                        {tableElement?.teamsList ? (
                          <Select
                            value={selectedTableElements?.team}
                            placeholder="Select Team"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                width: 200,
                              }), // Adjust width as needed
                            }}
                            onChange={(e) => {
                              handleTableActions("teamId", e);
                              setSelectedTableElements({
                                ...selectedTableElements,
                                team: e,
                              });
                            }}
                            options={teams?.map((item) => ({
                              label: item?.teamName,
                              value: item?.teamId,
                            }))}
                            classNamePrefix="select2-selection"
                          />
                        ) : null}
                        {tableElement?.commentaryStatus ? (
                          <Select
                            value={selectedTableElements?.commentaryStatus}
                            placeholder="Commentary Status"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                width: 200,
                              }), // Adjust width as needed
                            }}
                            onChange={(e) => {
                              handleTableActions("commentaryStatus", e);
                              setSelectedTableElements({
                                ...selectedTableElements,
                                commentaryStatus: e,
                              });
                            }}
                            options={tableElement?.statusOptions?.map(
                              (item) => ({
                                label: item?.label,
                                value: item?.value,
                              })
                            )}
                            classNamePrefix="select2-selection"
                          />
                        ) : null}
                        {tableElement?.actionType ? (
                          <div className="d-flex flex-wrap align-items-center gap-2 p-2 m-2">
                            <div className="d-flex flex-column">
                              <Select
                                placeholder="Action Type"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 200,
                                  }),
                                }}
                                onChange={(e) => {
                                  setSelectedClientSocket({
                                    actionType: e?.value,
                                    clientSocketId: singleCheck,
                                  });
                                }}
                                options={actionTypeOptions}
                                classNamePrefix="select2-selection"
                              />
                            </div>
                            <button
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.preventDefault()
                                singleCheck.length > 0
                                  ? handleClientSocketChange()
                                  : dispatch(
                                    updateToastData({
                                      data: "Select at least one (only One) row",
                                      title: "Error",
                                      type: ERROR,
                                    })
                                  );
                              }}
                              type="delay"
                              id="create-btn"
                            >
                              Save
                            </button>
                          </div>
                        ) : null}
                        {tableElement?.isShowContent ? (
                          <div className="d-flex align-items-center">
                            <Switch
                              width={70}
                              uncheckedIcon={<OffsymbolStatus />}
                              checkedIcon={<OnSymbolStatus />}
                              className="pe-0"
                              onColor="#02a499"
                              onChange={() => {
                                handleTableActions(
                                  "isShowContent",
                                  !statusSwitch
                                );
                              }}
                              checked={statusSwitch}
                            />
                          </div>
                        ) : null}
                        {!tableElement?.isDateRange && tableElement?.resetButton ? (
                          <div>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                handleTableReset();
                              }}
                              type="reset"
                              id="create-btn"
                            >
                              Reset
                              {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                            </button>
                          </div>
                        ) : null}
                        {tableElement?.importExport ? (
                          <div className="d-flex align-items-center" style={{}}>
                            <span
                              className="btn btn-primary"
                              onClick={() => {
                                setImportExportModelVisable(true);
                              }}
                            >
                              Bulk Update
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </Col>
                    <Col className="col-sm-auto ms-auto">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        {isDeleteAllPermission && (
                          <Button
                            color={isSignalRStarted ? "success" : "danger"}
                            onClick={() => {
                              loadSignalRToggleFunction();
                            }}
                            className="d-flex align-items-center gap-1"
                          >
                            <i className="ri-refresh-line"></i>
                            {isSignalRStarted ? "SignalR Started" : "SignalR Stopped"}
                          </Button>
                        )}
                        {isDeleteAllPermission && (
                          <Button
                            color="warning"
                            onClick={() => {
                              loadPanelModelFunction();
                            }}
                            className="d-flex align-items-center gap-1"
                          >
                            <i className="ri-refresh-line"></i>
                            Load Panel Data
                          </Button>
                        )}
                        {isDeleteAllPermission && (
                          <Button
                            color="warning"
                            onClick={() => {
                              loadClientModelFunction();
                            }}
                            className="d-flex align-items-center gap-1"
                          >
                            <i className="ri-refresh-line"></i>
                            Load Client Data
                          </Button>
                        )}
                        {isDeleteAllPermission && (
                          <Button
                            color="danger"
                            onClick={() => {
                              deleteAllModelFunction(true)
                            }}
                            className="d-flex align-items-center gap-1"
                          >
                            <i className="ri-delete-bin-2-line"></i>
                            Delete All
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                  {tableElement?.dateRange ? (
                    <Row className="">
                      {/* <Col className="bg-white p-2 m-2"> */}
                      <div className="d-flex flex-wrap align-items-center gap-2 p-2 m-2">
                        <div className="d-flex flex-column">
                          <input
                            className="form-control"
                            type="datetime-local"
                            defaultValue={dateRange?.startDate}
                            onChange={(startDate) => {
                              setDateRange({
                                ...dateRange,
                                startDate: startDate?.target?.value,
                              });
                            }}
                            id="example-datetime-local-input"
                          />
                        </div>
                        <span>To</span>
                        <div className="d-flex flex-column">
                          <input
                            className="form-control"
                            type="datetime-local"
                            defaultValue={dateRange?.endDate}
                            onChange={(startDate) => {
                              setDateRange({
                                ...dateRange,
                                endDate: startDate?.target?.value,
                              });
                            }}
                            id="example-datetime-local-input"
                          />
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            reFetchData();
                          }}
                          type="reset"
                          id="create-btn"
                        >
                          Search
                          {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                        </button>
                      </div>
                      {/* </Col> */}
                    </Row>
                  ) : null}
                  {tableElement?.isDateRange ? (
                    <Row className="g-2">
                      {/* <Col className="bg-white p-2 m-2"> */}
                      <div className="d-flex flex-wrap align-items-center gap-2 p-2 m-2">
                        <Button
                          color={`${isSearch ? "primary" : "danger"}`}
                          size="sm"
                          className="btn"
                          onClick={() => { setIsSearch(!isSearch) }}
                        >
                          <i
                            className={`bx ${isSearch ? "bx-check" : "bx-block"
                              }`}
                          ></i>
                        </Button>
                        <div className="d-flex flex-column">
                          <input
                            className="form-control"
                            type="datetime-local"
                            defaultValue={dateRange?.startDate}
                            onChange={(startDate) => {
                              setDateRange({
                                ...dateRange,
                                startDate: startDate?.target?.value,
                              });
                            }}
                            id="example-datetime-local-input"
                          />
                        </div>
                        <span>To</span>
                        <div className="d-flex flex-column">
                          <input
                            className="form-control"
                            type="datetime-local"
                            defaultValue={dateRange?.endDate}
                            onChange={(startDate) => {
                              setDateRange({
                                ...dateRange,
                                endDate: startDate?.target?.value,
                              });
                            }}
                            id="example-datetime-local-input"
                          />
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            reFetchData();
                          }}
                          disabled={!isSearch}
                          type="reset"
                          id="create-btn"
                        >
                          Search
                          {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                        </button>
                        {tableElement?.resetButton ? (
                          <div>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                handleTableReset();
                              }}
                              type="reset"
                              id="create-btn"
                            >
                              Reset
                              {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {/* </Col> */}
                    </Row>
                  ) : null}
                  {tableElement?.delayTextBox ? (
                    <Row className="">
                      <div className="d-flex flex-wrap align-items-center gap-2 p-2 m-2">
                        <div className="d-flex flex-column">
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Event Delay"
                            defaultValue={delay}
                            onChange={(e) => {
                              setDelay(e.target.value);
                            }}
                            id="delay"
                          />
                          {delayValidationMessage && (
                            <div style={{ color: 'red', marginTop: '2px' }}>
                              {delayValidationMessage}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!delay) {
                              setDelayValidationMessage("Delay value is required.");
                            } else if (singleCheck.length > 0) {
                              setDelayValidationMessage("");
                              handleDelay();
                            } else {
                              setDelayValidationMessage("");
                              dispatch(
                                updateToastData({
                                  data: "Select at least one (only one) row",
                                  title: "Error",
                                  type: Error,
                                })
                              );
                            }
                          }}
                          type="delay"
                          id="create-btn"
                        >
                          Save
                        </button>
                      </div>
                    </Row>
                  ) : null}
                </form>
              </CardHeader>
            )}

            <CardBody>
              <div id="customerList">
                {breadCrumbs && (
                  <ReusableBreadcrumbs
                    listToRender={breadCrumbs}
                    updateClickedId={onBreadCrumbsClick}
                  />
                )}
                {isPagination ? (<Row className="g-2 d-flex align-items-center">
                  <Col className="col-sm-auto">
                    <span>
                      Showing {currentPage * pageSize + 1} -{" "}
                      {currentPage * pageSize + data.length} of{" "}
                      {tableElement.title === "Tabs"
                        ? data?.length
                        : dataSource?.length}{" "}
                      entries
                    </span>
                    <div className="d-flex align-items-center justify-content-end"></div>
                  </Col>
                  <Col className="col-sm">
                    <div className="d-flex justify-content-sm-end align-items-end flex-sm-row flex-column">
                      {tableElement.title !== "Import Events" && (
                        <div className="me-1 d-flex">
                          <CSVLink
                            data={generateSimplifiedData().csvData}
                            filename={tableElement.title + ".csv"}
                          >
                            <Tooltip title="save as csv" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
                            <Button size="small" className="btn border">
                              <i className="fas fa-file-csv"></i>
                            </Button>
                            </Tooltip>
                          </CSVLink>
                          <Tooltip title="save as excel" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
                          <Button
                            size="large"
                            className="btn border mx-1"
                            onClick={downloadExcel}
                          >
                            <i className="fas fa-file-excel"></i>
                          </Button>
                          </Tooltip>
                          <Tooltip title="save as pdf" color={"#e8e8ea"} overlayInnerStyle={{color: '#000'}}>
                          <Button onClick={generatePDF} className="btn border">
                            <i className="bx bxs-file-pdf"></i>
                          </Button>
                          </Tooltip>
                        </div>
                      )}
                      <div className="">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Min. 2 characters"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                        />
                        {/* <i className="ri-search-line search-icon"></i> */}
                      </div>
                    </div>
                  </Col>
                </Row>) : null}

                <div
                  className="table-responsive table-card mt-3 mb-1"
                  id="myTable"
                >
                  {tableElement?.dragDrop ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="droppable" direction="vertical">
                        {(provided) => (
                          <table
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="table align-middle table-nowrap"
                            id="customerTable"
                          >
                            <thead className="table-light">
                              <tr>
                                {columns.map((column) => (
                                  <th key={column.key} style={column.style}>
                                    <div className="d-flex" style={{ visibility: column?.key === "select" && "hidden" }}>
                                      <span>{column.title}</span>
                                      {column.sort ? (
                                        <span className="d-flex flex-column align-items-center">
                                          <i
                                            className="bx bx-caret-up"
                                            onClick={() => {
                                              sortByProperty(
                                                "ascending",
                                                column.key
                                              );
                                            }}
                                            style={{
                                              color: `${sortOrder.key === column.key &&
                                                sortOrder.sortOrder ===
                                                "ascending"
                                                ? "gray"
                                                : "lightGray"
                                                }`,
                                              fontSize: "12px",
                                              marginTop: "2px",
                                              cursor: "pointer",
                                            }}
                                          ></i>
                                          <i
                                            className="bx bx-caret-down"
                                            onClick={() => {
                                              sortByProperty(
                                                "descending",
                                                column.key
                                              );
                                            }}
                                            style={{
                                              color: `${sortOrder.key === column.key &&
                                                sortOrder.sortOrder ===
                                                "descending"
                                                ? "gray"
                                                : "lightGray"
                                                }`,
                                              marginTop: "-5px",
                                              fontSize: "12px",
                                              cursor: "pointer",
                                            }}
                                          ></i>
                                        </span>
                                      ) : null}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="list form-check-all">
                              {data
                                // .sort(
                                //   (a, b) =>
                                //     (a.displayOrder || 0) - (b.displayOrder || 0)
                                // )
                                .map((record, index) => (
                                  <Draggable
                                    key={index}
                                    draggableId={`row-${index}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <tr
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`hover`}
                                      >
                                        {columns.map((column) => (
                                          <>
                                            <td
                                              key={column.key}
                                              style={column.style}
                                            >
                                              {column.render
                                                ? column.render(
                                                  record[column.dataIndex],
                                                  record
                                                )
                                                : record[column.dataIndex]}
                                            </td>
                                          </>
                                        ))}
                                      </tr>
                                    )}
                                  </Draggable>
                                ))}

                              {provided.placeholder}
                            </tbody>
                          </table>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <table
                      className="table align-middle table-nowrap"
                      id="customerTable"
                    >
                      <thead className="table-light">
                        <tr>
                          {columns.map((column) => (
                            <th key={column.key} style={column.style} className={column.className}>
                              <div className="d-flex" style={{ visibility: column?.key === "select" && "hidden" }}>
                                <span>{column.title}</span>
                                {column.sort ? (
                                  <span className="d-flex flex-column align-items-center">
                                    <i
                                      className={"bx bx-caret-up " + column.className}
                                      onClick={() => {
                                        tableElement.title == "Import Events"
                                          ? sortByPropertyB(
                                            "ascending",
                                            column.key
                                          )
                                          : sortByProperty(
                                            "ascending",
                                            column.key
                                          );
                                      }}
                                      style={{
                                        color: `${sortOrder.key === column.key &&
                                          sortOrder.sortOrder === "ascending"
                                          ? "gray"
                                          : "lightGray"
                                          }`,
                                        fontSize: "12px",
                                        marginTop: "2px",
                                        cursor: "pointer",
                                      }}
                                    ></i>
                                    <i
                                      className={"bx bx-caret-down " + column.className}
                                      onClick={() => {
                                        tableElement.title == "Import Events"
                                          ? sortByPropertyB(
                                            "descending",
                                            column.key
                                          )
                                          : sortByProperty(
                                            "descending",
                                            column.key
                                          );
                                      }}
                                      style={{
                                        color: `${sortOrder.key === column.key &&
                                          sortOrder.sortOrder === "descending"
                                          ? "gray"
                                          : "lightGray"
                                          }`,
                                        marginTop: "-5px",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                      }}
                                    ></i>
                                  </span>
                                ) : null}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="list form-check-all">
                        {data.map((record, index) => (
                          <tr key={index} className={tableElement.title === "Event Markets" ? "hover1" : "hover"} style={{backgroundColor: tableElement.title === "Event Markets" && getStatusColor(+record?.status) }}>
                            {columns.map((column) => (
                              <td key={column.key} style={column.style}>
                                {column.render
                                  ? column.render(
                                    record[column.dataIndex],
                                    record
                                  )
                                  : record[column.dataIndex]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div className="noresult" style={{ display: "none" }}>
                    <div className="text-center">
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#121331,secondary:#08a88a"
                        style={{ width: "75px", height: "75px" }}
                      ></lord-icon>
                      <h5 className="mt-2">Sorry! No Result Found</h5>
                      <p className="text-muted mb-0">
                        No Result
                      </p>
                    </div>
                  </div>
                </div>
                {data.length > 0 ? (
                  <Row>
                    <Col >{tableElement?.compToRender}</Col>
                    <Col className="d-flex justify-content-end">
                      {isPagination ? (<Pagination
                        total={total}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        fetchData={fetchData}
                        setCurrentPage={setCurrentPage}
                        setPageSize={setPageSize}
                      />) : null}
                    </Col>
                  </Row>
                ) : (
                  <div className="d-flex justify-content-center">
                    <span style={{ color: "lightgray" }}>
                      No Data Available
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
);

export default Index;

