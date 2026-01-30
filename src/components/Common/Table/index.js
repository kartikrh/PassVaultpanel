import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
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
import { Tooltip } from "antd";
import {
  convertDateUTCToLocal,
  getDateRange,
} from "../Reusables/reusableMethods";
import {
  getStatusColor,
  getStatusFontColor,
} from "../../../Pages/Commentary/CommentartConst";
import { debounce, isEmpty } from "lodash";
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

const isTrendingOptions = [
  { value: null, label: "Select Trending" },
  { value: true, label: "Trending" },
  { value: false, label: "Non Trending" },
];
const isMenOptions = [
  { value: null, label: "Select Men" },
  { value: true, label: "Men" },
  { value: false, label: "Women" },
];
const Index = forwardRef(
  (
    {
      columns,
      dataSource,
      tableElement,
      cloneModelFunction,
      multiCloneModelFunction,
      deleteModelFunction,
      noCalculateModelFunction,
      loadModelFunction,
      suspendModelFunction,
      closeModelFunction,
      deleteAllModelFunction,
      closeAllModelFunction,
      closeMarketModelFunction,
      cancelAllModelFunction,
      cancelModelFunction,
      resultModelFunction,
      loadPanelModelFunction,
      loadDataModelFunction,
      importDataMethod,
      importDataName,
      showBrokenOnly,
      isCheckingImages,
      handleBrokenImageToggle,
      openDataProvider,
      loadClientModelFunction,
      playerImageUpdateFunction,
      loadSignalRToggleFunction,
      datePriceModelFunction,
      isSignalRStarted,
      singleCheck,
      setImportExportModelVisable,
      handlePlayerHistoryModalPopUp,
      marketTypes,
      categories,
      setSelectedMarketType,
      eventTypes,
      selectedTableElementsLogs,
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
      dateType,
      setDateType,
      handleDelay,
      sendDataList,
      createdTypeList,
      selectedClientSocket,
      setSelectedClientSocket,
      isEntitySocket = false,
      handleClientSocketChange,
      actionTypeOptions,
      handleReset,
      handleReload,
      competitions,
      commentary,
      createdByList,
      serverCurrentPage,
      serverPageSize,
      serverTotal,
      setServerCurrentPage,
      setServerPageSize,
      onAddNavigate,
      isCommentaryList,
      changeOrderApiName,
      isAddPermission,
      isDeletePermission,
      isSuspendPermission,
      isClosePermission,
      isCancelPermission,
      isDeleteAllPermission,
      breadCrumbs,
      onBreadCrumbsClick,
      teams,
      setDateRange,
      dateRange,
      isSearch,
      setIsSearch,
      matchType,
      isPagination = true,
      tournamentList,
      showtournamentList,
      onTournamentisChanges,
      isTournamentFilter,
      setIsTournamentFilter,
      setStickHeader,
      renderHeader,
      manualExcel,
      defaultTableActionData,
      renderCustomFilter,
      handleCustomReset,
      pythonApis,
      customPageSizeOptions,
      playerSearch,
      setSearch,
      dateTypeTitle,
      reportType,
      reportTypeOption,
      updateReportType,
      defaultCommentrayStatus,
      setParentCurrentPage,
      setParentPageSize,
      setParentSearchedData,
      parentCurrentPage,
      maxTableHeight,
      compStatsEntityEnums,
    },
    ref
  ) => {
    const globalPageSize = localStorage.getItem("pageSize");
    const globalDateType = localStorage.getItem("DateType") || {
      label: "Local Timezone",
      value: 1,
    }
    document.title = `${tableElement?.title}`;
    const [data, setData] = useState(dataSource);
    const [tableActions, setTableActions] = useState(
      defaultTableActionData || {
        isActive: true,
      }
    );
    const [total, setTotal] = useState(dataSource?.length);
    const [pageSize, setPageSize] = useState(globalPageSize || 10);
    const [currentPage, setCurrentPage] = useState(parentCurrentPage || 0);
    const [filteredData, setFilteredData] = useState([]);
    const [searchedData, setSearchedData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(playerSearch || "");
    const [sortOrder, setSortOrder] = useState({
      sortOrder: "",
      key: "",
    });
    //defaultStatusSwitch added for RegistrationPending Table
    const defaultStatusSwitch = defaultTableActionData
      ? defaultTableActionData.isActive === false
        ? false
        : true
      : true;
    const [statusSwitch, setStatusSwitch] = useState(defaultStatusSwitch);
    const [trendingStatusSwitch, setTrendingStatusSwitch] = useState(null);
    const [menSwitch, setMenSwitch] = useState(null);
    const [selectedTableElements, setSelectedTableElements] = useState({});
    const [delayValidationMessage, setDelayValidationMessage] = useState("");
    const [expandedRows, setExpandedRows] = useState({});
    const [shouldCallHandleReset, setShouldCallHandleReset] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectInputRef = useRef(null);

    useEffect(() => {
      setData(filteredData);
    }, [filteredData]);
    useEffect(() => {
      if (dataSource && tableElement.title !== "Entity Player Import") setSearchTerm(playerSearch || "");
    }, [dataSource]);

    useEffect(() => {
      if (dataSource && tableElement.title === "Entity Player Import")  setData(dataSource);
    }, [dataSource]);

    useEffect(() => {
      if (data.length == 0 && filteredData.length == 0) {
        if (serverCurrentPage) {
          setServerCurrentPage(0);
        }
        setCurrentPage(0);
      }
    }, [data, filteredData]);

    useEffect(() =>{
      setCurrentPage(parentCurrentPage)
    }, [parentCurrentPage])

    useEffect(() => {
      if(defaultCommentrayStatus){
        handleTableActions("commentaryStatus", defaultCommentrayStatus);
        setSelectedTableElements({
          ...selectedTableElements,
          commentaryStatus: defaultCommentrayStatus,
        });
      }
    }, [])

    // NEW useEffect for default filters in subscribers table:
    useEffect(() => {
      const initialFilters = {};

      if (tableElement?.scorecardSelect) {
        const defaultScorecard = defaultTableActionData?.isApproved !== undefined
          ? defaultTableActionData.isApproved
          : true;
        initialFilters.scorecard = {
          value: defaultScorecard,
          label: defaultScorecard === true ? "Approved" : defaultScorecard === false ? "Decline" : "Select Scorecard",
        };
      }

      if (tableElement?.streamSelect) {
        const defaultStream = defaultTableActionData?.isVideoApproved !== undefined
          ? defaultTableActionData.isVideoApproved
          : null;
        initialFilters.stream = {
          value: defaultStream,
          label: defaultStream === true ? "Approved" : defaultStream === false ? "Decline" : "Select Stream",
        };
      }

      if (Object.keys(initialFilters).length > 0) {
        setSelectedTableElements(prev => ({
          ...prev,
          ...initialFilters,
        }));
      }
    }, []);
    
    useEffect(() => {
      if (setParentCurrentPage) {
        setParentCurrentPage(currentPage);
      }
    }, [currentPage])

    useEffect(() => {
      if (setParentPageSize) {
        setParentPageSize(pageSize);
      }
    }, [pageSize])

    useEffect(() => {
      if (!isEmpty(searchedData) && setParentSearchedData) {
        setParentSearchedData(searchedData);
      }
    }, [searchedData])

    useEffect(() => {
      if (!isTournamentFilter && (tableElement.title === "Auto Events" || tableElement.title === "Manual Events")) {
        setSelectedTableElements((prev) => ({
          ...prev,
          tournamentType: { value: "0", label: "Tournament List" },
        }));
      }
    }, [isTournamentFilter]);

    const debouncedHandleSearchFilter = useCallback(
      debounce((searchValue) => {
        setIsSearching(true);

        // Use a setTimeout to prevent UI blocking
        setTimeout(() => {
          // Just use your existing handleSearchFilter logic here
          if (tableElement.title === "Tabs") {
            const updatedData = dataSource.filter((val) => {
              const found = Object.values(val).some((value) => {
                if (typeof value === "string" || value instanceof String) {
                  return value
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
                }
                return false;
              });
              return found === true;
            });

            if (searchValue) {
              setFilteredData(updatedData);
              setTotal(updatedData.length);
            } else {
              setTotal(dataSource.length);
              setFilteredData(dataSource);
            }
          } else if (tableElement.title === "Auto Events") {
            const updatedData = dataSource.filter((val) => {
              const marketIDFlag = val.marketID ? true : false;
              if (marketIDFlag) {
                const found = Object.values(val).some((value) => {
                  if (typeof value === "string" || value instanceof String) {
                    return value
                      .toLowerCase()
                      .includes(searchValue.toLowerCase());
                  }
                  return false;
                });
                return found === true;
              } else {
                const first = Object.values(val);
                const firstObject = first[0];
                const found = Object.values(firstObject).some((value) => {
                  if (typeof value === "string" || value instanceof String) {
                    return value
                      .toLowerCase()
                      .includes(searchValue.toLowerCase());
                  }
                  return false;
                });
                return found === true;
              }
            });

            if (searchValue === "") {
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
                  return value
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
                }
                return false;
              });
              return found === true;
            });

            if (searchValue.length <= 2) {
              setTotal(dataSource.length);
              const sliced = dataSource.slice(
                (currentPage == 1
                  ? currentPage - 1
                  : currentPage == 0
                    ? currentPage
                    : currentPage - 1) * pageSize,
                (currentPage == 0 ? 0 : Number((currentPage - 1) * pageSize)) +
                Number(pageSize)
              );

              setFilteredData(sliced);
            } else {
              setFilteredData(updatedData);
              setTotal(updatedData.length);
            }
          }

          setIsSearching(false);
        }, 0);
      }, 300),
      [dataSource, currentPage, pageSize, tableElement.title]
    );

    const toggleRow = (index) => {
      setExpandedRows((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };
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

    const FalseSymbolStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 12,
            color: "#fff",
            // paddingRight: 2,
          }}
        >
          {" "}
          False
        </div>
      );
    };
    const TrueSymbolStatus = () => {
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
          True
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
    const OnSymbolShowStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 9,
            color: "#fff",
            paddingLeft: 4,
          }}
        >
          {" "}
          show content
        </div>
      );
    };

    const OffsymbolShowStatus = () => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: 9,
            color: "#fff",
            // paddingRight: 2,
          }}
        >
          {" "}
          hide content
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

    const OffsymbolTrendingStatus = () => {
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
          non trending
        </div>
      );
    };
    const OnSymbolTrendingStatus = () => {
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
          trending
        </div>
      );
    };

    const OffsymbolMenStatus = () => {
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
          women
        </div>
      );
    };
    const OnSymbolMenStatus = () => {
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
          men
        </div>
      );
    };

    const styles = {
      menu: ({ width, ...css }) => ({ ...css }),
    };
    const handleTableActions = (key, id) => {
      setSearchTerm("");
      setCurrentPage(0);
      if (setServerCurrentPage) {
        setServerCurrentPage(0);
      }
      if (key === "isActive") {
        if (setServerCurrentPage) {
          setServerCurrentPage(0);
        }

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
        if (setServerCurrentPage) {
          setServerCurrentPage(0);
        }

        // setStatusSwitch(id);
        const value = id?.value !== undefined ? id.value : id;
  
  setStatusSwitch(value);
  setTableActions((preValue) => {
    return {
      ...preValue,
      [key]: value,
    };
  });
  reFetchData({
    ...tableActions,
    isApproved: value,
  });
        // } else if (key === "isTrending") {
        //   if (setServerCurrentPage) {
        //     setServerCurrentPage(0);
        //   }

        //   setTrendingStatusSwitch(id);
        //   setTableActions((preValue) => {
        //     return {
        //       ...preValue,
        //       [key]: id,
        //     };
        //   });
        //   reFetchData({
        //     ...tableActions,
        //     isTrending: id.value,
        //   });
        // } else if (key === "isMen") {
        // if (setServerCurrentPage) {
        //   setServerCurrentPage(0);
        // }

        // setMenSwitch(id);
        // setTableActions((preValue) => {
        //   return {
        //     ...preValue,
        //     [key]: id,
        //   };
        // });
        // reFetchData({
        //   ...tableActions,
        //   isMen: id.value,
        // });
      } else if (key === "isVideoApproved") {  
        if (setServerCurrentPage) {
          setServerCurrentPage(0);
        }

        setTableActions((preValue) => {
          return {
            ...preValue,
            [key]: id?.value !== undefined ? id.value : id, 
          };
        });
        reFetchData({
          ...tableActions,
          isVideoApproved: id?.value !== undefined ? id.value : id, 
        });
      } else if (key === "isShowContent") {
        if (setServerCurrentPage) {
          setServerCurrentPage(0);
        }

        setStatusSwitch(id);
        setTableActions((preValue) => {
          return {
            ...preValue,
            [key]: id,
          };
        });
        reFetchData({
          ...tableActions,
          isShowContent: id,
        });
      } else if (key === "onTournamentisChanges") {
        onTournamentisChanges(id);
      } else {
        if (setServerCurrentPage) {
          setServerCurrentPage(0);
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
              return value.toLowerCase().includes(searchTerm.trim().toLowerCase());
            }
            return false;
          });
          return found === true;
        });

        if (searchTerm) {
          setFilteredData(updatedData);
          setTotal(updatedData.length);
        } else {
          setTotal(dataSource.length);
          setFilteredData(dataSource);
        }
      } else if (tableElement.title === "Auto Events") {
        const updatedData = dataSource.filter((val) => {
          const marketIDFlag = val.marketID ? true : false; // Set the flag if `marketID` exists
          if (marketIDFlag) {
            const found = Object.values(val).some((value) => {
              if (typeof value === "string" || value instanceof String) {
                return value.toLowerCase().includes(searchTerm.trim().toLowerCase());
              }
              return false;
            });
            return found === true;
          } else {
            const first = Object.values(val);
            const firstObject = first[0];
            const found = Object.values(firstObject).some((value) => {
              if (typeof value === "string" || value instanceof String) {
                return value.toLowerCase().includes(searchTerm.trim().toLowerCase());
              }
              return false;
            });
            return found === true;
          }
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
      } else if (tableElement.title == "Entity Player Import"){
          setSearch(searchTerm)
      }
      else {
        // const updatedData = dataSource.filter((val) => {
        //   // console.log("val", val)
        //   const found = Object.values(val).some((value) => {
        //     if (typeof value === "string" || value instanceof String) {
        //       return value.toLowerCase().includes(searchTerm.toLowerCase());
        //     }
        //     return false;
        //   });
        //   return found === true;
        // });
        const updatedData = dataSource.filter((val) => {
          const found = Object.values(val).some((value) => {
            if (typeof value === "string" || value instanceof String || typeof value === "number") {
              return value.toString().toLowerCase().includes(searchTerm.toString().trim().toLowerCase());
            }
            return false;
          });
          return found === true;
        });
        if (searchTerm.length <= 2) {
          setSearchedData([]);
          if (tableElement.title !== "Dashboard") {
            setTotal(dataSource.length);
            const sliced = dataSource.slice(
              (currentPage == 1 ? currentPage - 1 : currentPage == 0 ? currentPage : currentPage - 1) * pageSize,
              (currentPage == 0 ? 0 : Number((currentPage - 1) * pageSize)) +
              Number(pageSize)
            );
            setFilteredData(sliced);
          } else {
            setFilteredData(dataSource)
          }
        } else {
          setSearchedData(updatedData)
          setTotal(updatedData.length);
          const sliced = updatedData.slice(
            (currentPage == 1 ? currentPage - 1 : currentPage == 0 ? currentPage : currentPage - 1) * pageSize,
            (currentPage == 0 ? 0 : Number((currentPage - 1) * pageSize)) +
            Number(pageSize)
          );
          setFilteredData(sliced);
          // setTotal(updatedData.length);
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
    const generateManualSimplifiedData = () => {
      let pdfCols = ["No."];
      let colsDataKey = [];
      manualExcel?.forEach((item) => {
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
      let ws;
      if (manualExcel)
        ws = XLSX.utils.json_to_sheet(generateManualSimplifiedData().csvData);
      else ws = XLSX.utils.json_to_sheet(generateSimplifiedData().csvData);

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
        const valueA = a[propName];
        const valueB = b[propName];

        // Handle null or undefined values
        if (valueA == null || valueB == null) {
          return valueA == null ? 1 : -1; // Treat null/undefined as "greater" for descending order
        }

        // If both are strings, use localeCompare
        if (typeof valueA === "string" && typeof valueB === "string") {
          return order === "ascending"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // For numbers or other types, use subtraction for sorting
        if (typeof valueA === "number" && typeof valueB === "number") {
          return order === "ascending" ? valueA - valueB : valueB - valueA;
        }

        // Convert other types to strings and compare
        const stringValueA = String(valueA);
        const stringValueB = String(valueB);
        return order === "ascending"
          ? stringValueA.localeCompare(stringValueB)
          : stringValueB.localeCompare(stringValueA);
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
          propName == "commentaryId"
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
    useEffect(() => {
      dataSource = searchedData
    }, [searchedData])
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
      if (tableElement?.isServerPagination) {
        const possibleNoOfPages = Math.ceil(
          dataSource?.length / serverPageSize
        );
        let sliced;
        if (serverCurrentPage < possibleNoOfPages) {
          // console.log("staRT", (serverCurrentPage == 1 ? serverCurrentPage - 1 : serverCurrentPage == 0 ? serverCurrentPage : serverCurrentPage - 1) * serverPageSize)
          // console.log("END", (serverCurrentPage == 0 ? 0 : Number((serverCurrentPage - 1) * serverPageSize)) + Number(serverPageSize))
          sliced = dataSource.slice(
            (serverCurrentPage == 1
              ? serverCurrentPage - 1
              : serverCurrentPage == 0
                ? serverCurrentPage
                : serverCurrentPage - 1) * serverPageSize,
            (serverCurrentPage == 0
              ? 0
              : Number((serverCurrentPage - 1) * serverPageSize)) +
            Number(serverPageSize)
          );
        } else {
          const pageToJump = possibleNoOfPages - 1;
          sliced = dataSource.slice(
            pageToJump * serverPageSize,
            Number(pageToJump * serverPageSize) + Number(serverPageSize)
          );
        }
        setData(sliced);
      } else if (isPagination) {
        if (searchTerm.toString().length > 2 || playerSearch) {
          handleSearchFilter()
          dataSource = searchedData.length > 0 ? searchedData : dataSource;
        }
        const possibleNoOfPages = Math.ceil(dataSource?.length / pageSize);
        let sliced;
        if (currentPage < possibleNoOfPages) {
          sliced = dataSource.slice(
            (currentPage == 1
              ? currentPage - 1
              : currentPage == 0
                ? currentPage
                : currentPage - 1) * pageSize,
            (currentPage == 0 ? 0 : Number((currentPage - 1) * pageSize)) +
            Number(pageSize)
          );
        } else {
          const pageToJump = possibleNoOfPages - 1;
          if (setParentCurrentPage) {
            setParentCurrentPage(pageToJump + 1); 
          }
          setCurrentPage(pageToJump + 1);
          sliced = dataSource.slice(
            pageToJump * pageSize,
            Number(pageToJump * pageSize) + Number(pageSize)
          );
        }
        setData(sliced);
      } else {
        setData(dataSource);
      }
      setTotal(searchedData.length > 0 ? searchedData.length : dataSource.length);
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

    const triggerResetWithState = (payload) => {
      setTableActions(payload);
      setShouldCallHandleReset(true);
    };

    useEffect(() => {
      if (shouldCallHandleReset) {
        handleReset(tableActions);
        setShouldCallHandleReset(false);
      }
    }, [shouldCallHandleReset, tableActions]);


    const handleTableReset = () => {
      if (renderCustomFilter && handleCustomReset) {
        handleCustomReset();
        return;
      }
      if(dateType?.value == 2){
        localStorage.setItem("DateType", JSON.stringify({ label: 'Local Timezone', value: 1 }))
        setDateType({ label: 'Local Timezone', value: 1 })
      } 
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
        commentary: {
          value: 0,
          label: "Commentary",
        },
        createdById: {
          value: 0,
          label: "created By",
        },
        eventType: {
          value: 0,
          label: "Event Type",
        },
        matchType: {
          value: 0,
          label: "Match Type",
        },
        type: {
          value: 0,
          label: "Type",
        },
        isTrending: {
          value: null,
          label: "Trending Type",
        },
        isMen: {
          value: null,
          label: "Select Gender",
        },
        commentaryStatus: {
          value: 0,
          label: "Commentary Status",
        },
        commStatus: {
          value: 0,
          label: "Competition Status",
        },
        isVirtual: {
          value: 0,
          label: "Virtual Status",
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
          label: "Select Status",
        },
        videoType: {
          value: 0,
          label: "Select Video Type",
        },
        createdTypeName: {
          value: 0,
          label: "Created Type",
        },
        sendDataType: {
          value: 0,
          label: "Send Data Type",
        },
        marketTypeName: {
          value: 0,
          label: "Market Type",
        },
        categoryName: {
          value: 0,
          label: "Category",
        },
        pythonApi: {
          value: 0,
          label: "API",
        },
        compStatsType: {
          value: 0,
          label: "Type",
        },
        compStatsEntityType: {
          value: 0,
          label: "Entity",
        },
        isCompetitionStatisticsCalculation: {
          value: 0,
          label: "Competition Stats",
        },
        scorecard: {
          value: true,  // Default Approved
          label: "Approved",
        },
        stream: {
          value: null, 
          label: "Select Stream",
        },
      });
      setMenSwitch(null)
      setTrendingStatusSwitch(null)
      if (
        tableElement?.dateRange &&
        tableElement?.title === "Commentary History"
      ) {
        setDateRange(() => getDateRange(5));
      } else if (tableElement?.dateRange) {
        setDateRange({
          startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
          endDate: `${new Date().toISOString().split("T")[0]}T23:59`,
        });
      }
      setStatusSwitch(true);
      // setIsSearch && setIsSearch(false);
      if (tableElement?.rateSourceListSelect) {
        triggerResetWithState({
          isActive: true,
          rateSourceRefId: 1,
        });
      } else {
        triggerResetWithState({
          isActive: true,
        });
      }
      setCurrentPage(0);
      if (serverCurrentPage) {
        setServerCurrentPage(0);
      }
    };

    const handleTableReload = (e) => {
      e.preventDefault();
      setSearchTerm("");
      // setTableActions({
      //   isActive: true,
      // });

      setSelectedTableElements((prevElements) => ({
        ...prevElements, // Retain previous state
      }));

      if (
        tableElement?.dateRange &&
        tableElement?.title === "Commentary History"
      ) {
        setDateRange(() => getDateRange(5));
      } else if (tableElement?.dateRange) {
        setDateRange({
          startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
          endDate: `${new Date().toISOString().split("T")[0]}T23:59`,
        });
      }

      // setStatusSwitch(true);
      if (tableElement?.rateSourceListSelect) {
        handleReload({
          isActive: true,
          rateSourceRefId: 1,
        });
        // } else if (tableElement?.isVirtual) {
        //   handleReload({
        //     isActive: true,
        //     isVirtual: 0,
        //   });
      } else {
        handleReload({
          isActive: true,
        });
      }
      setCurrentPage(0);
      if (serverCurrentPage) {
        setServerCurrentPage(0);
      }
    };

    // const handleTableReload = (e) => {
    //   e.preventDefault();
    //   setSearchTerm("");
    //   setTableActions({
    //     isActive: true,
    //   });
    //   setSelectedTableElements({
    //     rateSourceType: {
    //       value: 1,
    //       label: "Ratesource",
    //     },
    //     eventName: {
    //       value: 0,
    //       label: "Event List",
    //     },
    //     competition: {
    //       value: 0,
    //       label: "Competition",
    //     },
    //     commentary: {
    //       value: 0,
    //       label: "Commentary",
    //     },
    //     eventType: {
    //       value: 0,
    //       label: "Event Type",
    //     },
    //     matchType: {
    //       value: 0,
    //       label: "Match Type",
    //     },
    //     commentaryStatus: {
    //       value: 0,
    //       label: "Commentary Status",
    //     },
    //     displayType: {
    //       value: 0,
    //       label: "Display Type",
    //     },
    //     team: {
    //       value: 0,
    //       label: "Select Team",
    //     },
    //     statusType: {
    //       value: 0,
    //       label: "Select Status"
    //     },
    //     videoType: {
    //       value: 0,
    //       label: "Select Video Type"
    //     },
    //     createdTypeName: {
    //       value: 0,
    //       label: "Created Type"
    //     },
    //     sendDataType: {
    //       value: 0,
    //       label: "Send Data Type"
    //     },
    //     marketTypeName: {
    //       value: 0,
    //       label: "Market Type"
    //     },
    //     categoryName: {
    //       value: 0,
    //       label: "Category"
    //     },
    //   });
    //   if (tableElement?.dateRange && tableElement?.title === "Commentary History") {
    //     setDateRange(() => getDateRange(5));
    //   } else if (tableElement?.dateRange) {
    //     setDateRange({
    //       startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    //       endDate: `${new Date().toISOString().split("T")[0]}T23:59`,
    //     });
    //   }
    //   setStatusSwitch(true);
    //   if (tableElement?.rateSourceListSelect) {
    //     handleReload({
    //       isActive: true,
    //       rateSourceRefId: 1,
    //     });
    //   } else {
    //     handleReload({
    //       isActive: true,
    //     });
    //   }
    // };

    // const getTableAction = () => {
    //   return tableActions;
    // };

    useEffect(() => {
      if (!data || data.length === 0) return;

      const idSet = new Set(singleCheck); // Convert array to Set for faster lookup

      setData((prevData) =>
        prevData.map((item) => {
          // Find the first non-null ID in the given list
          const itemId =
            item.id ||
            item.commentaryId ||
            item.competitionId ||
            item.playerId ||
            item.teamId ||
            item.paneltyId ||
            item.eventTypeId ||
            item.matchTypeId ||
            item.marketTemplateId ||
            item.displayStatusId ||
            item.newsId ||
            item.bannerId ||
            item.photoLibraryId ||
            item.eventMarketId ||
            item.errId ||
            item.notificationId ||
            item.vendorId ||
            item.templateId ||
            item.clientId ||
            item.blockId ||
            item.configId ||
            item.clientSocketId ||
            item.apiId ||
            item.apiEndPointId;

          return {
            ...item,
            isIncluded: idSet.has(itemId), // Check in Set instead of array for efficiency
          };
        })
      );
    }, [singleCheck]);

    useEffect(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        setCurrentPage(0);
      }
    }, [searchTerm]);

    useEffect(() => {
      handleSearchFilter();
    }, [currentPage, searchTerm]);

    useEffect(() => {
      if(dataSource.length > 0 && playerSearch) {
        handleSearchFilter();
      }
    },[dataSource, playerSearch])

    // useEffect(() => {
    //   if (searchTerm.length >= 2 || searchTerm.length === 0) {
    //     debouncedHandleSearchFilter(searchTerm);
    //   }
    // }, [searchTerm, debouncedHandleSearchFilter]);

    useEffect(() => {
      if (searchTerm.length === 0) {
        setSearchedData([])
        if (setParentSearchedData) {
          setParentSearchedData([]);
        }
      }
    }, [searchTerm])
    // useEffect(() => {
    //       fetchData();
    // }, [dataSource]);

    useEffect(() => {
      if (setParentSearchedData && searchedData.length === 0 && dataSource.length > 0) {
        setParentSearchedData([]);
      }
    }, [searchedData, dataSource]);

    useEffect(() => {
      // If dataSource changes, dataSource has data but table shows no data available
      if (searchTerm.length <= 2) {
        fetchData();
      }
    }, [dataSource]);
    // useEffect(() => {
    //   return () => {
    //     debouncedHandleSearchFilter.cancel();
    //   };
    // }, [debouncedHandleSearchFilter]);
    // useImperativeHandle(ref, () => ({ getTableAction }));
    const getTableAction = () => tableActions;

    useImperativeHandle(ref, () => {
      return { getTableAction };
    }, [tableActions]);

    return (
      <Row>
        <Col lg={12}>
          <Card className="card">
            {tableElement?.title !== "Auto Events" && tableElement?.title !== "Dashboard" &&
              tableElement?.title !== "Manual Events" && tableElement?.title !== "Player Competition Listing" &&
              !tableElement.isNonCrud && (
                <CardHeader className="p-0 p-md-2">
                  <form>
                    {renderHeader && renderHeader()}
                    <Row className="g-2">
                      <Col className="col-sm-auto">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          {tableElement?.displayTitle && tableElement?.title}
                          {isAddPermission && (
                            <Button
                              color="success"
                              className="add-btn"
                              onClick={() => {
                                const data = isCommentaryList
                                  ? { state: "isPredict" }
                                  : {};

                                navigate(onAddNavigate, data);
                                // navigate(onAddNavigate);
                              }}
                              id="create-btn"
                            >
                              <i className="ri-add-line align-bottom me-1"></i>{" "}
                              Add
                            </Button>
                          )}
                          {tableElement?.clone ? (
                            <Button
                              color="warning"
                              className="btn"
                              onClick={() => {
                                setSearchTerm("");
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
                          {tableElement?.multiClone ? (
                            <Button
                              color="info"
                              className="btn"
                              onClick={() => {
                                setSearchTerm("");
                                singleCheck.length > 0
                                  ? multiCloneModelFunction(true)
                                  : dispatch(
                                    updateToastData({
                                      data: "Select at least one row",
                                      title: "Error",
                                      type: ERROR,
                                    })
                                  );
                              }}
                              id="create-btn"
                            >
                              <i className="ri-add-line align-bottom me-1"></i>{" "}
                              Multi Clone
                            </Button>
                          ) : null}
                          {tableElement?.sendDataListSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.sendDataType}
                                placeholder="Send Data Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.sendDataType?.value
                                  ) {
                                    handleTableActions("isSendData", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      sendDataType: e,
                                    });
                                  }
                                }}
                                options={sendDataList?.map((item) => ({
                                  label: item?.sendDataType,
                                  value: item?.isSendData,
                                }))}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.createdTypeListSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.createdTypeName}
                                placeholder="Created Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.createdTypeName
                                      ?.value
                                  ) {
                                    handleTableActions("createdType", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      createdTypeName: e,
                                    });
                                  }
                                }}
                                options={createdTypeList?.map((item) => ({
                                  label: item?.createdTypeName,
                                  value: item?.createdType,
                                }))}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.isDatePrice && (
                            <Button
                              color="btn btn-primary"
                              onClick={() => {
                                setSearchTerm("");
                                singleCheck.length >= 1
                                  ? datePriceModelFunction(true)
                                  : dispatch(
                                    updateToastData({
                                      data: "Select at least two rows to open request info modal",
                                      title: "Error",
                                      type: ERROR,
                                    })
                                  );
                              }}
                            >
                              Request Info
                            </Button>
                          )}
                          {tableElement?.loadCommentary ? (
                            <Button
                              color="success"
                              className="btn"
                              onClick={() => {
                                // setSearchTerm("");
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
                                // setSearchTerm("");
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
                                // setSearchTerm("");
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
                          {isCancelPermission && (
                            <Button
                              color="danger"
                              onClick={() => {
                                // setSearchTerm("");
                                singleCheck.length > 0
                                  ? cancelModelFunction(true)
                                  : dispatch(
                                    updateToastData({
                                      data: "Select at least one (only One) row",
                                      title: "Error",
                                      type: ERROR,
                                    })
                                  );
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                          {isDeletePermission && (
                            <Button
                              color="soft-danger"
                              onClick={() => {
                                // setSearchTerm("");
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
                          {tableElement?.isNotCalculate && (
                            <Button
                              color="danger"
                              onClick={() => {
                                setSearchTerm("");
                                singleCheck.length > 0
                                  ? noCalculateModelFunction(true)
                                  : dispatch(
                                    updateToastData({
                                      data: "Select at least one (only One) row",
                                      title: "Error",
                                      type: ERROR,
                                    })
                                  );
                              }}
                            >
                              Not Calculate
                            </Button>
                          )}
                          {tableElement?.displayTypeDropDown ? (
                            <div className="">
                              <Select
                                value={selectedTableElements?.displayType}
                                placeholder="Display Type"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 200,
                                  }), // Adjust width as needed
                                }}
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.displayType?.value
                                  ) {
                                    handleTableActions("displayType", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      displayType: e,
                                    });
                                  }
                                }}
                                options={tableElement?.displayTypes?.map(
                                  (item) => ({
                                    label: item?.label,
                                    value: item?.value,
                                  })
                                )}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {/* {renderCustomFilter && renderCustomFilter()} */}
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
                                  if (
                                    e?.value !==
                                    selectedTableElements?.rateSourceType?.value
                                  ) {
                                    setSearchTerm("");
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      rateSourceType: e,
                                    });
                                    setRatesource({
                                      rateSourceType: e?.label,
                                      rateSourceRefId: e?.value,
                                    });
                                    setCurrentPage(0)
                                  }
                                }}
                                options={rateSourceList?.map((item) => ({
                                  label: item?.rateSourceType,
                                  value: item?.rateSourceRefId,
                                }))}
                                classNamePrefix="filter-dropdown"
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
                                value={
                                  selectedTableElementsLogs?.eventType ||
                                  selectedTableElements?.eventType
                                }
                                isDisabled={
                                  selectedTableElementsLogs?.eventType
                                }
                                placeholder="Event Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.eventType?.value
                                  ) {
                                    handleTableActions("eventTypeId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      eventType: e,
                                      competition: {
                                        value: 0,
                                        label: "Competition",
                                      },
                                      eventName: {
                                        value: 0,
                                        label: "Event List",
                                      },
                                      commentary: {
                                        value: 0,
                                        label: "Commentary",
                                      },
                                    });
                                    setEventTypeId(e?.value);
                                    setCompetitionId(null);
                                  }
                                }}
                                options={[
                                  { label: "Select Event Type", value: null },
                                  ...eventTypes?.map((item) => ({
                                    label: item?.eventType,
                                    value: item?.eventTypeId,
                                  })),
                                ]}
                                classNamePrefix="filter-dropdown"
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
                                value={
                                  selectedTableElementsLogs?.competition ||
                                  selectedTableElements?.competition
                                }
                                isDisabled={
                                  selectedTableElementsLogs?.competition
                                }
                                placeholder="Competition List"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.competition?.value
                                  ) {
                                    setCompetitionId(e?.value);
                                    handleTableActions("competitionId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      competition: e,
                                      eventName: {
                                        value: 0,
                                        label: "Event List",
                                      },
                                    });
                                  }
                                }}
                                options={competitionList?.map((item) => ({
                                  label: item?.competition,
                                  value: item?.competitionId,
                                }))}
                                classNamePrefix="filter-dropdown"
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
                                value={
                                  selectedTableElementsLogs?.eventName ||
                                  selectedTableElements?.eventName
                                }
                                isDisabled={
                                  selectedTableElementsLogs?.eventName
                                }
                                placeholder="Event List"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.eventName?.value
                                  ) {
                                    handleTableActions("commentaryId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      eventName: e,
                                    });
                                  }
                                }}
                                options={eventList
                                  ?.sort(
                                    (a, b) =>
                                      new Date(a.eventDate) -
                                      new Date(b.eventDate)
                                  ) // Sort in ascending order
                                  ?.map((item) => ({
                                    label: `${item?.eventName
                                      } (${convertDateUTCToLocal(
                                        item?.eventDate,
                                        "index"
                                      )})`,
                                    value: item?.commentaryId,
                                  }))}
                                classNamePrefix="filter-dropdown"
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
                                // isDisabled={selectedTableElementsLogs?.status}
                                // defaultValue={statusList?.find(item => item.statusId === 1)?.statusType}
                                placeholder="Status Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.statusType?.value
                                  ) {
                                    handleTableActions("status", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      statusType: e,
                                    });
                                  }
                                }}
                                options={statusList?.map((item) => ({
                                  label: item?.statusType,
                                  value: item?.statusId,
                                }))}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.videoType ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.videoType}
                                placeholder="Video Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.videoType?.value
                                  ) {
                                    handleTableActions("videoType", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      videoType: e,
                                    });
                                  }
                                }}
                                options={matchType?.map((item) => ({
                                  label: item?.matchType,
                                  value: item?.matchTypeId,
                                }))}
                                classNamePrefix="filter-dropdown"
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
                                  if (
                                    e?.value !==
                                    selectedTableElements?.matchType?.value
                                  ) {
                                    handleTableActions("matchTypeId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      matchType: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select Match Type", value: null },
                                  ...(matchType?.map((item) => ({
                                    label: item?.matchType,
                                    value: item?.matchTypeId,
                                  })) || []),
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                        {tableElement?.scorecardSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }),
                              }}
                              value={selectedTableElements?.scorecard}
                              placeholder="Scorecard"
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.scorecard?.value
                                ) {
                                  handleTableActions("isApproved", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    scorecard: e,
                                  });
                                }
                              }}
                              options={tableElement?.scorecardOptions?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="filter-dropdown"
                            />
                          </div>
                        ) : null}

                        {tableElement?.streamSelect ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 180,
                                }),
                              }}
                              value={selectedTableElements?.stream}
                              placeholder="Stream"
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.stream?.value
                                ) {
                                  handleTableActions("isVideoApproved", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    stream: e,
                                  });
                                }
                              }}
                              options={tableElement?.streamOptions?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="filter-dropdown"
                            />
                          </div>
                        ) : null}
                          {/* {tableElement?.pythonApiSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.pythonApi}
                                placeholder="API"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.pythonApi?.value
                                  ) {
                                    handleTableActions("pythonId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      pythonApi: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select API", value: null },
                                  ...(pythonApis?.map((item) => ({
                                    label: item?.developerName,
                                    value: item?.id,
                                  })) || []),
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null} */}
                          {tableElement?.typeSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.type}
                                placeholder="Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.type?.value
                                  ) {
                                    handleTableActions("type", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      type: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select Type", value: null },
                                  { label: "International", value: 1 },
                                  { label: "Domestic", value: 2 },
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.compStatsTypeSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.compStatsType}
                                placeholder="Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.compStatsType?.value
                                  ) {
                                    handleTableActions("typeId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      compStatsType: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select Type", value: null },
                                  { label: "Batting", value: 1 },
                                  { label: "Bowling", value: 2 },
                                  { label: "Teams", value: 3 },
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                        ) : null}
                        {tableElement?.entityEnumSelect && selectedTableElements?.compStatsType?.value > 0 ? (
                          <div className="">
                            <Select
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 220,
                                }),
                              }}
                              value={selectedTableElements?.compStatsEntityType}
                              placeholder="Entity Type"
                              onChange={(e) => {
                                if (e?.value !== selectedTableElements?.compStatsEntityType?.value) {
                                  handleTableActions("entityEnum", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    compStatsEntityType: e,
                                  });
                                }
                              }}
                              options={[
                                { label: "Select Entity Type", value: 0 },
                                ...((() => {
                                  const typeId = selectedTableElements?.compStatsType?.value;
                                  if (typeId === 1 && compStatsEntityEnums?.batting) {
                                    return Object.entries(compStatsEntityEnums.batting).map(([label, data]) => ({
                                      label,
                                      value: data.enum,
                                    }));
                                  } else if (typeId === 2 && compStatsEntityEnums?.bowling) {
                                    return Object.entries(compStatsEntityEnums.bowling).map(([label, data]) => ({
                                      label,
                                      value: data.enum,
                                    }));
                                  } else if (typeId === 3 && compStatsEntityEnums?.team) {
                                    return Object.entries(compStatsEntityEnums.team).map(([label, data]) => ({
                                      label,
                                      value: data.enum,
                                    }));
                                  }
                                  return [];
                                })()),
                              ]}
                              classNamePrefix="filter-dropdown"
                            />
                          </div>
                        ) : null}
                          {tableElement.title !== "Event Markets" &&
                            tableElement.title !== "Manual Odds Markets" &&
                            tableElement?.marketTypeSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.marketTypeName}
                                placeholder="Market Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.marketTypeName?.value
                                  ) {
                                    handleTableActions("marketTypeId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      marketTypeName: e,
                                      categoryName: {
                                        value: 0,
                                        label: "Category",
                                      },
                                    });
                                    setSelectedMarketType(e?.value);
                                  }
                                }}
                                options={[
                                  { label: "Select Market Type", value: 0 },
                                  ...marketTypes?.map((item) => ({
                                    label: item?.marketTypeName,
                                    value: item?.marketTypeId,
                                  })),
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement.title !== "Event Markets" &&
                            tableElement.title !== "Manual Odds Markets" &&
                            tableElement?.categorySelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }),
                                }}
                                value={selectedTableElements?.categoryName}
                                placeholder="Category"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.categoryName?.value
                                  ) {
                                    handleTableActions(
                                      "marketTypeCategoryId",
                                      e
                                    );
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      categoryName: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select Category", value: 0 },
                                  ...categories?.map((item) => ({
                                    label: item?.categoryName,
                                    value: item?.marketTypeCategoryId,
                                  })),
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.competitionsSelect ? (
                            <div className="">
                              <Select
                                value={
                                  selectedTableElementsLogs?.competition ||
                                  selectedTableElements?.competition
                                }
                                isDisabled={
                                  selectedTableElementsLogs?.competition
                                }
                                placeholder="Competition"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 200,
                                  }), // Adjust width as needed
                                }}
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.competition?.value
                                  ) {
                                    setCompetitionId(e?.value);
                                    handleTableActions("competitionId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      competition: e,
                                      commentary: {
                                        value: 0,
                                        label: "Commentary",
                                      },
                                    });
                                  }
                                }}
                                options={competitions?.map((item) => ({
                                  label: item?.competition,
                                  value: item?.competitionId,
                                }))}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.commentarySelect ? (
                            <div className="">
                              <Select
                                value={
                                  selectedTableElementsLogs?.commentary ||
                                  selectedTableElements?.commentary
                                }
                                isDisabled={
                                  selectedTableElementsLogs?.commentary
                                }
                                placeholder="Commentary"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 200,
                                  }), // Adjust width as needed
                                }}
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.commentary?.value
                                  ) {
                                    handleTableActions("commentaryId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      commentary: e,
                                    });
                                  }
                                }}
                                options={commentary?.map((item) => ({
                                  label: `${item?.eventName
                                    } (${convertDateUTCToLocal(
                                      item?.eventDate,
                                      "index"
                                    )})`,
                                  value: item?.commentaryId,
                                }))}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.createdByIdSelect ? (
                            <div className="">
                              <Select
                                value={
                                  selectedTableElementsLogs?.createdById ||
                                  selectedTableElements?.createdById
                                }
                                placeholder="Created By"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 200,
                                  }), // Adjust width as needed
                                }}
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.createdById?.value
                                  ) {
                                    handleTableActions("createdById", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      createdById: e,
                                    });
                                  }
                                }}
                                isDisabled={
                                  selectedTableElementsLogs?.createdById
                                }
                                options={createdByList?.map((item) => ({
                                  label: item?.createdBy,
                                  value: item?.createdById,
                                }))}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.teamsList ? (
                            <Select
                              value={
                                selectedTableElementsLogs?.team
                                  ? selectedTableElementsLogs?.team
                                  : selectedTableElements?.team
                              }
                              isDisabled={selectedTableElementsLogs?.team}
                              placeholder="Team"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.team?.value
                                ) {
                                  handleTableActions("teamId", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    team: e,
                                  });
                                }
                              }}
                              options={teams?.map((item) => ({
                                label: item?.teamName,
                                value: item?.teamId,
                              }))}
                              classNamePrefix="filter-dropdown"
                            />
                          ) : null}
                          {/* {renderCustomFilter && renderCustomFilter()} */}
                          {tableElement?.commentaryStatus ? (
                            <Select
                              value={selectedTableElements?.commentaryStatus}
                              placeholder="Commentary Status"
                              isDisabled={defaultCommentrayStatus}
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.commentaryStatus?.value
                                ) {
                                  handleTableActions("commentaryStatus", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    commentaryStatus: e,
                                  });
                                }
                              }}
                              options={tableElement?.statusOptions?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="filter-dropdown"
                            />
                          ) : null}
                          {tableElement?.commStatus ? (
                            <Select
                              value={selectedTableElements?.commStatus}
                              placeholder="Competition Status"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.commStatus?.value
                                ) {
                                  handleTableActions("commStatus", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    commStatus: e,
                                  });
                                }
                              }}
                              options={tableElement?.commStatusOptions?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="filter-dropdown"
                            />
                          ) : null}
                          {tableElement?.isVirtual ? (
                            <Select
                              value={selectedTableElements?.isVirtual}
                              placeholder="Virtual Status"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.isVirtual?.value
                                ) {
                                  handleTableActions("isVirtual", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    isVirtual: e,
                                  });
                                }
                              }}
                              options={tableElement?.virtualOptions?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="filter-dropdown"
                            />
                          ) : null}
                          {tableElement?.pythonApiSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={selectedTableElements?.pythonApi}
                                placeholder="API"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.pythonApi?.value
                                  ) {
                                    handleTableActions("pythonId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      pythonApi: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select API", value: null },
                                  ...(pythonApis?.map((item) => ({
                                    label: item?.developerName,
                                    value: item?.id,
                                  })) || []),
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
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
                                    setSearchTerm("");
                                    setSelectedClientSocket(
                                      isEntitySocket ?
                                        {
                                          actionType: e?.value,
                                          entitySocketId: singleCheck,
                                        } :
                                        {
                                          actionType: e?.value,
                                          clientSocketId: singleCheck,
                                        }
                                    );
                                  }}
                                  options={actionTypeOptions}
                                  classNamePrefix="filter-dropdown"
                                />
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  e.preventDefault();
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

                          {tableElement?.isTrending ? (
                            <div className="d-flex align-items-center">
                              {/* <Switch
                                width={70}
                                uncheckedIcon={<OffsymbolTrendingStatus />}
                                checkedIcon={<OnSymbolTrendingStatus />}
                                className="pe-0"
                                onColor="#02a499"
                                onChange={() => {
                                  handleTableActions(
                                    "isTrending",
                                    !trendingStatusSwitch
                                  );
                                }}
                                checked={trendingStatusSwitch}
                              /> */}
                              <Select
                                styles={{
                                  control: (provided) => ({ ...provided, width: 140 }),
                                }}
                                value={selectedTableElements?.isTrending}
                                // value={isTrendingOptions.find((option) => option.value === trendingStatusSwitch) || isTrendingOptions[0]}
                                // onChange={(e) => setIsSquadSelectedOption(e?.value === "Select" ? null : e?.value)}
                                // onChange={(e) => {
                                //   handleTableActions(
                                //     "isTrending",
                                //     e?.value === "Select" ? null : e?.value
                                //   );
                                // }}
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.isTrending?.value
                                  ) {
                                    handleTableActions("isTrending", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      isTrending: e,
                                    });
                                  }
                                }}
                                placeholder="Trending"
                                options={[
                                  { value: null, label: "Select Trending" },
                                  { value: true, label: "Trending" },
                                  { value: false, label: "Non Trending" },
                                ]}
                                // placeholder="Is Trending"
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.isMen ? (
                            <div className="d-flex align-items-center">
                              {/* <Switch
                                width={70}
                                uncheckedIcon={<OffsymbolMenStatus />}
                                checkedIcon={<OnSymbolMenStatus />}
                                className="pe-0"
                                onColor="#02a499"
                                onChange={() => {
                                  handleTableActions("isMen", !menSwitch);
                                }}
                                checked={menSwitch}
                              /> */}
                              <Select
                                styles={{
                                  control: (provided) => ({ ...provided, width: 140 }),
                                }}
                                // value={isMenOptions.find((option) => option.value === menSwitch) || isMenOptions[0]}
                                // onChange={(e) => setIsSquadSelectedOption(e?.value === "Select" ? null : e?.value)}
                                // onChange={(e) => {
                                //   handleTableActions(
                                //     "isMen",
                                //     e?.value === "Select" ? null : e?.value
                                //   );
                                // }}
                                value={
                                  selectedTableElementsLogs?.isMen ||
                                  selectedTableElements?.isMen
                                }
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.isMen?.value
                                  ) {
                                    handleTableActions("isMen", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      isMen: e,
                                    });
                                  }
                                }}
                                options={[
                                  { value: null, label: "Select Gender" },
                                  { value: true, label: "Men" },
                                  { value: false, label: "Women" },
                                ]}
                                placeholder="Gender"
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.isCompetitionStatisticsCalculation ? (
                            <Select
                              value={selectedTableElements?.isCompetitionStatisticsCalculation}
                              placeholder="Competition Stats"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }), // Adjust width as needed
                              }}
                              onChange={(e) => {
                                if (
                                  e?.value !==
                                  selectedTableElements?.isCompetitionStatisticsCalculation?.value
                                ) {
                                  handleTableActions("isCompetitionStatisticsCalculation", e);
                                  setSelectedTableElements({
                                    ...selectedTableElements,
                                    isCompetitionStatisticsCalculation: e,
                                  });
                                }
                              }}
                              options={tableElement?.competitionStatsCalcOptions?.map(
                                (item) => ({
                                  label: item?.label,
                                  value: item?.value,
                                })
                              )}
                              classNamePrefix="filter-dropdown"
                            />
                          ) : null}
                          {tableElement?.isShowContent ? (
                            <div className="d-flex align-items-center">
                              <Switch
                                width={70}
                                uncheckedIcon={<OffsymbolShowStatus />}
                                checkedIcon={<OnSymbolShowStatus />}
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
                                  handleTableActions(
                                    "isApproved",
                                    !statusSwitch
                                  );
                                }}
                                checked={statusSwitch}
                              />
                            </div>
                          ) : null}
                          {!tableElement?.isDateRange &&
                            tableElement?.resetButton &&
                            tableElement?.title !== "Commentary History" ? (
                            <div>
                              <button
                                disabled={
                                  selectedTableElementsLogs?.competition ||
                                  selectedTableElementsLogs?.commentary ||
                                  selectedTableElementsLogs?.eventType ||
                                  selectedTableElementsLogs?.team
                                }
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
                          {!tableElement?.isDateRange &&
                            tableElement?.reloadButton &&
                            tableElement?.title !== "Error Logs" &&
                            tableElement?.title !== "Thirdparty Logs" &&
                            tableElement?.title !== "Commentary History" ? (
                            <div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  handleTableReload(e);
                                }}
                                type="reload"
                                id="create-btn"
                              >
                                Reload
                                {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                              </button>
                            </div>
                          ) : null}
                          {!tableElement?.isDateRange &&
                            tableElement?.isDateTypeSelect &&
                            (tableElement?.title == "Market Data Logs" ||
                              tableElement?.title == "Registration Pending" ||
                              tableElement?.title == "Commentary History" ||
                              tableElement?.title == "Registered Users" ||
                              tableElement?.title == "Events" ||
                              tableElement?.dateTypeTitle == "Market data logs" ||
                              tableElement?.title == "Competition" || tableElement?.dateTypeButNoDateRange ) ? (
                            <Select
                              value={dateType}
                              placeholder="Date Type"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  width: 200,
                                }),
                              }}
                              onChange={(e) => {
                                localStorage.setItem("DateType", JSON.stringify(e))
                                setDateType(e)
                              }
                              }
                              options={[
                                { label: "Local Timezone", value: 1 },
                                { label: "UTC Timezone", value: 2 },
                              ]}
                              classNamePrefix="filter-dropdown"
                            />
                          ) : null}
                          {tableElement?.importExport ? (
                            <div
                              className="d-flex align-items-center"
                              style={{}}
                            >
                              <span
                                className="btn btn-primary"
                                onClick={() => {
                                  setSearchTerm("");
                                  setImportExportModelVisable(true);
                                }}
                              >
                                Bulk Update
                              </span>
                            </div>
                          ) : null}
                          {tableElement?.importExport ? (
                            <div
                              className="d-flex align-items-center"
                              style={{}}
                            >
                              <span
                                className="btn btn-warning"
                                onClick={() => {
                                  setSearchTerm("");
                                  handlePlayerHistoryModalPopUp();
                                }}
                              >
                                Player History Update
                              </span>
                            </div>
                          ) : null}
                          {renderCustomFilter && renderCustomFilter()}
                        </div>
                      </Col>
                      {/* <Col className="col-sm-auto ms-auto">
                       
                      </Col> */}
                      <Col className="col-sm-auto ms-auto d-flex align-items-center">
                        {tableElement?.showBrokenImageButton && (
                          <Tooltip title={`Show ${tableElement.title} without image`} color={"#e8e8ea"} overlayInnerStyle={{ color: '#000' }}>
                            <Button
                              color={showBrokenOnly ? "warning" : "secondary"}
                              onClick={handleBrokenImageToggle}
                              disabled={isCheckingImages}
                              className="d-flex align-items-center gap-2 mx-3"
                            >
                              <>
                                {/* <i className={showBrokenOnly ? "ri-eye-off-line" : "ri-image-line"}></i> */}
                                {/* {showBrokenOnly ? `Broken Images (${brokenImages?.length || 0})` : "Show Broken"} */}
                                <i className="ri-image-line"></i>
                                {showBrokenOnly ? "Show All" : "Show Broken"}
                              </>
                            </Button>
                          </Tooltip>
                        )}
                        {tableElement?.importData && (
                          <Button
                            color="success"
                            onClick={() => {
                              importDataMethod();
                            }}
                            className="d-flex align-items-center gap-2 mx-3"
                          >
                            <i className="bx bx-plus"></i>
                            {importDataName || "Import Data"}
                          </Button>
                        )}
                        {!tableElement?.isDateRange &&
                          tableElement?.loadData ? (
                          <div>
                            <Button
                              color="warning"
                              onClick={() => {
                                loadDataModelFunction(true);
                              }}
                              className="d-flex align-items-center gap-1"
                            >
                              <i className="ri-refresh-line"></i>
                              Load Data
                            </Button>
                          </div>
                        ) : null}
                      </Col>
                    </Row>
                    <Col className="col-sm-auto ms-auto my-2">
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
                            {isSignalRStarted
                              ? "SignalR Started"
                              : "SignalR Stopped"}
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
                            // color="warning"
                            onClick={() => {
                              playerImageUpdateFunction();
                            }}
                            className="d-flex align-items-center gap-1 playerImageUpdate"
                          >
                            {/* <i className="ri-refresh-line"></i> */}
                            Player Image Update
                          </Button>
                        )}
                        {isDeleteAllPermission && (
                          <div className="ms-auto">
                            <Button
                              color="danger"
                              onClick={() => {
                                deleteAllModelFunction(true);
                              }}
                              className="d-flex align-items-center gap-1"
                            >
                              <i className="ri-delete-bin-2-line"></i>
                              Delete All Commentary
                            </Button>
                          </div>
                        )}
                      </div>
                    </Col>
                    {tableElement?.dateRange ? (
                      <Row className="">
                        {/* <Col className="bg-white p-2 m-2"> */}
                        <div className="d-flex flex-wrap align-items-center gap-2 p-2">
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
                              if (setServerCurrentPage) {
                                setServerCurrentPage(0);
                              }
                              setCurrentPage(0);
                              reFetchData();
                            }}
                            type="reset"
                            id="create-btn"
                          >
                            Search
                            {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                          </button>

                          {tableElement?.resetButton &&
                            tableElement?.title === "Commentary History" ? (
                            <div>
                              <button
                                disabled={
                                  selectedTableElementsLogs?.competition ||
                                  selectedTableElementsLogs?.commentary ||
                                  selectedTableElementsLogs?.eventType ||
                                  selectedTableElementsLogs?.team
                                }
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

                          {tableElement?.reloadButton &&
                            (tableElement?.title === "Error Logs" ||
                              tableElement?.title === "Thirdparty Logs" ||
                              tableElement?.title === "Commentary History") ? (
                            <div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  handleTableReload(e);
                                }}
                                type="reload"
                                id="create-btn"
                              >
                                Reload
                                {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                              </button>
                            </div>
                          ) : null}
                        </div>
                        {/* </Col> */}
                      </Row>
                    ) : null}
                    {tableElement?.isDateRange ? (
                      <Row className="g-2">
                        <Col className="col-sm-auto">
                          <div className="d-flex flex-wrap align-items-center gap-2 p-2">
                            <Button
                              color={`${isSearch ? "primary" : "danger"}`}
                              size="sm"
                              className="btn"
                              onClick={() => {
                                if (
                                  isSearch ||
                                  dateRange?.startDate < dateRange?.endDate
                                )
                                  setIsSearch(!isSearch);
                              }}
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
                                if (setServerCurrentPage) {
                                  setServerCurrentPage(0);
                                }
                                setCurrentPage(0);
                                reFetchData();
                              }}
                              disabled={
                                !isSearch ||
                                dateRange?.startDate > dateRange?.endDate
                              }
                              type="reset"
                              id="create-btn"
                            >
                              Search
                              {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                            </button>
                            {tableElement?.resetButton ? (
                              <div>
                                <button
                                  disabled={
                                    selectedTableElementsLogs?.competition ||
                                    selectedTableElementsLogs?.commentary ||
                                    selectedTableElementsLogs?.eventType ||
                                    selectedTableElementsLogs?.team
                                  }
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
                            {tableElement?.reloadButton ? (
                              <div>
                                <button
                                  className="btn btn-primary"
                                  onClick={(e) => {
                                    handleTableReload(e);
                                  }}
                                  type="reload"
                                  id="create-btn"
                                >
                                  Reload
                                  {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
                                </button>
                              </div>
                            ) : null}
                            {tableElement?.isDateTypeSelect ? (
                              <Select
                                value={dateType}
                                placeholder="Date Type"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 200,
                                  }),
                                }}
                                onChange={(e) => {

                                  localStorage.setItem("DateType", JSON.stringify(e))
                                  setDateType(e)
                                }}
                                options={[
                                  { label: "Local Timezone", value: 1 },
                                  { label: "UTC Timezone", value: 2 },
                                ]}
                                classNamePrefix="filter-dropdown"
                              />
                            ) : null}
                            {tableElement?.isReportTypeSelected ? (
                              <Select
                                value={reportTypeOption.find((option) => option.value === reportType)}
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 150,
                                  }),
                                }}
                                onChange={(e) => updateReportType(e?.value)}
                                options={reportTypeOption}
                                placeholder="Report Type"
                                classNamePrefix="filter-dropdown"
                              />
                            ) : null}
                            {/* {tableElement?.isDataprovider ? (
                          <Button
                            onClick={() => {
                              openDataProvider();
                            }}
                            className="d-flex align-items-center gap-1"
                          >
                            <i className="ri-refresh-line"></i>
                            Data Provider
                          </Button>
                        ) : null} */}
                            {tableElement?.isCloseAllMarket && (
                              <Button
                                color="warning"
                                onClick={() => {
                                  closeAllModelFunction(true);
                                }}
                              >
                                Close All Market
                              </Button>
                            )}
                            {tableElement?.isCloseMarket && (
                              <Button
                                color="danger"
                                onClick={() => {
                                  singleCheck.length > 0
                                    ? closeMarketModelFunction(true)
                                    : dispatch(
                                      updateToastData({
                                        data: "Select at least one row",
                                        title: "Error",
                                        type: ERROR,
                                      })
                                    );
                                }}
                              >
                                Close Market
                              </Button>
                            )}
                            {tableElement?.isCancelAllMarket && (
                              <Button
                                color="warning"
                                onClick={() => {
                                  cancelAllModelFunction(true);
                                }}
                              >
                                Cancel All Market
                              </Button>
                            )}
                            {tableElement?.isCancelMarket && (
                              <Button
                                color="danger"
                                onClick={() => {
                                  singleCheck.length > 0
                                    ? cancelModelFunction(true)
                                    : dispatch(
                                      updateToastData({
                                        data: "Select at least one row",
                                        title: "Error",
                                        type: ERROR,
                                      })
                                    );
                                }}
                              >
                                Cancel Market
                              </Button>
                            )}
                            {tableElement?.isResultMarket && (
                              <Button
                                color="warning"
                                onClick={() => {
                                  singleCheck.length > 0
                                    ? resultModelFunction(true)
                                    : dispatch(
                                      updateToastData({
                                        data: "Select at least one row",
                                        title: "Error",
                                        type: ERROR,
                                      })
                                    );
                                }}
                              >
                                Result
                              </Button>
                            )}
                          </div>
                        </Col>
                        <Col className="col-sm-auto ms-auto p-2">
                          {tableElement?.loadData ? (
                            <Button
                              color="warning"
                              onClick={() => {
                                loadDataModelFunction(true);
                              }}
                              className="d-flex align-items-center gap-1"
                            >
                              <i className="ri-refresh-line"></i>
                              Load Data
                            </Button>
                          ) : null}
                        </Col>
                      </Row>
                    ) : null}
                    {
                      <div className="text-danger">
                        {dateRange?.startDate > dateRange?.endDate
                          ? "Error: The Start date should be less than the end date."
                          : null}
                      </div>
                    }
                    {tableElement.title === "Event Markets" ||
                      tableElement?.delayTextBox ? (
                      <Row className="">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          {(tableElement.title === "Event Markets" ||
                            tableElement.title === "Manual Odds Markets") &&
                            tableElement?.marketTypeSelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }), // Adjust width as needed
                                }}
                                value={
                                  selectedTableElements?.marketTypeName ||
                                  selectedTableElementsLogs?.marketTypeName
                                }
                                placeholder="Market Type"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.marketTypeName?.value
                                  ) {
                                    handleTableActions("marketTypeId", e);
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      marketTypeName: e,
                                      categoryName: {
                                        value: 0,
                                        label: "Category",
                                      },
                                    });
                                    setSelectedMarketType(e?.value);
                                  }
                                }}
                                options={[
                                  { label: "Select Market Type", value: 0 },
                                  ...marketTypes?.map((item) => ({
                                    label: item?.marketTypeName,
                                    value: item?.marketTypeId,
                                  })),
                                ]}
                                isDisabled={
                                  selectedTableElementsLogs?.marketTypeName
                                }
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {(tableElement.title === "Event Markets" ||
                            tableElement.title === "Manual Odds Markets") &&
                            tableElement?.categorySelect ? (
                            <div className="">
                              <Select
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    width: 180,
                                  }),
                                }}
                                value={
                                  selectedTableElements?.categoryName ||
                                  selectedTableElementsLogs?.categoryName
                                }
                                placeholder="Category"
                                onChange={(e) => {
                                  if (
                                    e?.value !==
                                    selectedTableElements?.categoryName?.value
                                  ) {
                                    handleTableActions(
                                      "marketTypeCategoryId",
                                      e
                                    );
                                    setSelectedTableElements({
                                      ...selectedTableElements,
                                      categoryName: e,
                                    });
                                  }
                                }}
                                options={[
                                  { label: "Select Category", value: 0 },
                                  ...categories?.map((item) => ({
                                    label: item?.categoryName,
                                    value: item?.marketTypeCategoryId,
                                  })),
                                ]}
                                // options={[
                                //   { label: "Select Market Type", value: 0 },
                                //   ...(tableElement.title ===
                                //   "Manual Odds Markets"
                                //     ? marketTypes?.map((item) => ({
                                //         label: item?.marketTypeName,
                                //         value: item?.marketTypeId,
                                //       })) || []
                                //     : categories?.map((item) => ({
                                //         label: item?.categoryName,
                                //         value: item?.marketTypeCategoryId,
                                //       })) || []),
                                // ]}
                                // isDisabled={
                                //   selectedTableElementsLogs?.categoryName
                                // }
                                classNamePrefix="filter-dropdown"
                              />
                            </div>
                          ) : null}
                          {tableElement?.delayTextBox ? (
                            <>
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
                                  <div
                                    style={{ color: "red", marginTop: "2px" }}
                                  >
                                    {delayValidationMessage}
                                  </div>
                                )}
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!delay) {
                                    setDelayValidationMessage(
                                      "Delay value is required."
                                    );
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
                            </>
                          ) : null}
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
                {showtournamentList && tournamentList.length > 0 && (
                  <div className="d-flex align-items-center gap-2">
                    <Select
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: 280,
                        }),
                      }}
                      value={selectedTableElements?.tournamentType}
                      placeholder="Tournament List"
                      onChange={(e) => {
                        if (
                          e?.value !==
                          selectedTableElements?.tournamentType?.value
                        ) {
                          handleTableActions("onTournamentisChanges", e);
                          setSelectedTableElements({
                            ...selectedTableElements,
                            tournamentType: e,
                          });
                        }
                      }}
                      options={tournamentList?.map((item) => ({
                        label: `${item?.competition} - ${convertDateUTCToLocal(item?.startDate, "index")}`,
                        value: item?.competitionId,
                        compRefId: item?.competitionRefId
                      }))}
                      isDisabled={!isTournamentFilter}
                      classNamePrefix="filter-dropdown"
                    />
                    <Switch
                      width={70}
                      uncheckedIcon={<FalseSymbolStatus />}
                      checkedIcon={<TrueSymbolStatus />}
                      className="pe-0"
                      onColor="#02a499"
                      onChange={() => {
                        setIsTournamentFilter(!isTournamentFilter);
                      }}
                      checked={isTournamentFilter}
                    />
                  </div>
                )}
                {tableElement?.isServerPagination ? (
                  <Row className="g-2 d-flex align-items-center">
                    <Col className="col-sm-auto">
                      {Number(serverCurrentPage) != 0 &&
                        Number((Number(serverCurrentPage) - 1) * serverPageSize) +
                        1 >
                        serverTotal ==
                        false ? (
                        <span>
                          Showing{" "}
                          {Number(Number(serverCurrentPage) - 1) *
                            serverPageSize +
                            1}{" "}
                          -{" "}
                          {Number(Number(serverCurrentPage) - 1) *
                            serverPageSize +
                            data.length}{" "}
                          of{" "}
                          {/* {tableElement.title === "Tabs"
                            ? data?.length
                            : serverTotal}{" "} */}
                          {serverTotal} entries
                        </span>
                      ) : Number(
                        (Number(serverCurrentPage) - 1) * serverPageSize
                      ) +
                        1 >
                        serverTotal ? (
                        <span>
                          Showing{" "}
                          {Number(Number(serverCurrentPage) - 2) *
                            serverPageSize +
                            1}{" "}
                          -{" "}
                          {Number(Number(serverCurrentPage) - 2) *
                            serverPageSize +
                            data.length}{" "}
                          of{" "}
                          {/* {tableElement.title === "Tabs"
                            ? data?.length
                            : serverTotal}{" "} */}
                          {serverTotal} entries
                        </span>
                      ) : (
                        <span>
                          Showing {serverCurrentPage * serverPageSize + 1} -{" "}
                          {serverCurrentPage * serverPageSize + data.length} of{" "}
                          {/* {tableElement.title === "Tabs"
                          ? data?.length
                          : serverTotal}{" "} */}
                          {serverTotal} entries
                        </span>
                      )}

                      <div className="d-flex align-items-center justify-content-end"></div>
                    </Col>
                    <Col className="col-sm">
                      <div className="d-flex justify-content-sm-end align-items-end flex-sm-row flex-column">
                        {tableElement.title !== "Import Events" && tableElement.title !== "Dashboard" && (
                          <div className="me-1 d-flex">
                            <CSVLink
                              data={generateSimplifiedData().csvData}
                              filename={tableElement.title + ".csv"}
                            >
                              <Tooltip
                                title="save as csv"
                                color={"#e8e8ea"}
                                overlayInnerStyle={{ color: "#000" }}
                              >
                                <Button size="small" className="btn border">
                                  <i className="fas fa-file-csv"></i>
                                </Button>
                              </Tooltip>
                            </CSVLink>
                            <Tooltip
                              title="save as excel"
                              color={"#e8e8ea"}
                              overlayInnerStyle={{ color: "#000" }}
                            >
                              <Button
                                size="large"
                                className="btn border mx-1"
                                onClick={downloadExcel}
                              >
                                <i className="fas fa-file-excel"></i>
                              </Button>
                            </Tooltip>
                            <Tooltip
                              title="save as pdf"
                              color={"#e8e8ea"}
                              overlayInnerStyle={{ color: "#000" }}
                            >
                              <Button
                                onClick={generatePDF}
                                className="btn border"
                              >
                                <i className="bx bxs-file-pdf"></i>
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search Min. 2 characters"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                            }}
                          />
                          {isSearching && (
                            <span
                              className="position-absolute"
                              style={{
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              <i className="fas fa-spinner fa-spin"></i>
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : isPagination ? (
                  <Row className="g-2 d-flex align-items-center">
                    <Col className="col-sm-auto">
                      {Number(currentPage) != 0 &&
                        Number((Number(currentPage) - 1) * pageSize) + 1 >
                        (tableElement.title === "Tabs"
                          ? serverTotal : searchTerm.toString().length > 2 ? searchedData.length
                            : dataSource?.length) ==
                        false ? (
                        <span>
                          Showing{" "}
                          {Number((Number(currentPage) - 1) * pageSize) + 1} -{" "}
                          {
                            (() => {
                              const totalEntries =
                                tableElement.title === "Tabs"
                                  ? serverTotal
                                  : searchTerm.toString().length > 2
                                    ? searchedData.length
                                    : dataSource?.length;

                              const calculatedEnd =
                                Number((Number(currentPage) - 1) * pageSize) + data.length;

                              return calculatedEnd > totalEntries ? totalEntries : calculatedEnd;
                            })()
                          } of{" "}
                          {
                            tableElement.title === "Tabs"
                              ? serverTotal
                              : searchTerm.toString().length > 2
                                ? searchedData.length
                                : dataSource?.length
                          } entries
                        </span>

                      ) : Number((Number(currentPage) - 1) * pageSize) + 1 >
                        (tableElement.title === "Tabs"
                          ? serverTotal : searchTerm.toString().length > 2 ? searchedData.length
                            : dataSource?.length) ? (
                        <span>
                          Showing{" "}
                          {Number((Number(currentPage) - 2) * pageSize) + 1} -{" "}
                          {
                            (() => {
                              const totalEntries =
                                tableElement.title === "Tabs"
                                  ? serverTotal
                                  : searchTerm.toString().length > 2
                                    ? searchedData.length
                                    : dataSource?.length;

                              const calculatedEnd =
                                Number((Number(currentPage) - 2) * pageSize) + data.length;

                              return calculatedEnd > totalEntries ? totalEntries : calculatedEnd;
                            })()
                          } of{" "}
                          {
                            tableElement.title === "Tabs"
                              ? serverTotal
                              : searchTerm.toString().length > 2
                                ? searchedData.length
                                : dataSource?.length
                          } entries
                        </span>

                      ) : (
                        <span>
                          Showing {currentPage * pageSize + 1} -{" "}
                          {
                            (() => {
                              const totalEntries =
                                tableElement.title === "Tabs"
                                  ? serverTotal
                                  : searchTerm.toString().length > 2
                                    ? searchedData.length
                                    : dataSource?.length;

                              const calculatedEnd = searchTerm.toString().length > 2
                                ? (currentPage + 1) * pageSize
                                : currentPage * pageSize + data.length;
                              
                              return pageSize > totalEntries ? totalEntries : calculatedEnd;
                            })()
                          } of{" "}
                          {
                            tableElement.title === "Tabs"
                              ? serverTotal
                              : searchTerm.toString().length > 2
                                ? searchedData.length
                                : dataSource?.length
                          } entries
                        </span>

                      )}
                      <div className="d-flex align-items-center justify-content-end"></div>
                    </Col>
                    <Col className="col-sm">
                      <div className="d-flex justify-content-sm-end align-items-end flex-sm-row flex-column">
                        {tableElement.title !== "Import Events" && tableElement.title !== "Dashboard" && (
                          <div className="me-1 d-flex">
                            <CSVLink
                              data={generateSimplifiedData().csvData}
                              filename={tableElement.title + ".csv"}
                            >
                              <Tooltip
                                title="save as csv"
                                color={"#e8e8ea"}
                                overlayInnerStyle={{ color: "#000" }}
                              >
                                <Button size="small" className="btn border">
                                  <i className="fas fa-file-csv"></i>
                                </Button>
                              </Tooltip>
                            </CSVLink>
                            <Tooltip
                              title="save as excel"
                              color={"#e8e8ea"}
                              overlayInnerStyle={{ color: "#000" }}
                            >
                              <Button
                                size="large"
                                className="btn border mx-1"
                                onClick={downloadExcel}
                              >
                                <i className="fas fa-file-excel"></i>
                              </Button>
                            </Tooltip>
                            <Tooltip
                              title="save as pdf"
                              color={"#e8e8ea"}
                              overlayInnerStyle={{ color: "#000" }}
                            >
                              <Button
                                onClick={generatePDF}
                                className="btn border"
                              >
                                <i className="bx bxs-file-pdf"></i>
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search Min. 2 characters"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                            }}
                          />
                          {isSearching && (
                            <span
                              className="position-absolute"
                              style={{
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              <i className="fas fa-spinner fa-spin"></i>
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : <Row>
                  <Col className="col-sm-auto">

                    <span>
                      {`Showing 
                            ${dataSource?.length}
                           entries`}
                    </span>
                    <div className="d-flex align-items-center justify-content-end"></div>
                  </Col>
                  <Col className="col-sm">
                    <div className="d-flex justify-content-sm-end align-items-end flex-sm-row flex-column">
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Min. 2 characters"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                        />
                        {isSearching && (
                          <span
                            className="position-absolute"
                            style={{
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            <i className="fas fa-spinner fa-spin"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>}

                <div
                  className="table-responsive table-responsive2 table-card mt-3 mb-1"
                  id="myTable"
                  style={maxTableHeight ? {
                    maxHeight: maxTableHeight,
                    overflowY: 'auto',
                    // overflowX: 'hidden',
                  } : null}
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
                                    <div
                                      className="d-flex flex-row justify-content-between"
                                      style={{
                                        visibility:
                                           column?.key === "hidden",
                                          // column?.key === "select" && "hidden",
                                      }}
                                    >
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
                                              fontSize: "14px",
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
                                              marginTop: "-8px",
                                              fontSize: "14px",
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
                                        {...(!tableElement?.isDragHandle && provided.dragHandleProps)}
                                        className={`hover ${record.isIncluded && "selected"
                                          }`}
                                      >
                                        {columns.map((column) => (
                                          <>
                                            <td
                                              key={column.key}
                                              style={column.style}
                                              {...(tableElement?.isDragHandle &&
                                                column.key === "dragHandle" &&
                                                provided.dragHandleProps)}
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
                      <thead
                        className={`table-light ${setStickHeader !== false ? "sticky-header" : ""
                          }`}
                      >
                        <tr>
                          {columns.map((column) => (
                            <th
                              // style={{
                              //     ...column.style,
                              //     zIndex: column?.sticky && 100,
                              //     left: column?.sticky && 0,
                              //   }}
                              style={{
                                ...column.style,
                                zIndex: column?.sticky ? 100 : undefined,
                                left: column?.sticky ? column.style?.left ?? 0 : undefined,
                                position: column?.sticky ? "sticky" : undefined,
                              }}
                              className={column.className}
                            >
                              <div
                                className="d-flex flex-row justify-content-between"
                                style={{
                                  visibility:
                                    column?.key === "hidden",
                                    // column?.key === "select" && "hidden",
                                }}
                              >
                                <span>{column.title}</span>
                                {column.sort ? (
                                  <span className="d-flex flex-column align-items-center">
                                    <i
                                      className={
                                        "bx bx-caret-up " + column.className
                                      }
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
                                        fontSize: "14px",
                                        marginTop: "2px",
                                        cursor: "pointer",
                                      }}
                                    ></i>
                                    <i
                                      className={
                                        "bx bx-caret-down " + column.className
                                      }
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
                                        marginTop: "-8px",
                                        fontSize: "14px",
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
                          <React.Fragment key={index}>
                            <tr
                              onClick={() => toggleRow(index)}
                              className={`${tableElement.title === "Event Markets"
                                ? "hover1"
                                : "hover"
                                } ${record.isIncluded ? "selected" : ""}`}
                              style={{
                                backgroundColor:
                                  tableElement.title === "Event Markets" &&
                                  getStatusColor(+record?.status),
                                color:
                                  tableElement.title === "Event Markets" &&
                                  getStatusFontColor(+record?.status),
                                cursor:
                                  tableElement.title === "Market Data Logs" &&
                                  "pointer",
                              }}
                            >
                              {columns.map((column) => (
                                <td
                                  key={column.key}
                                  style={{
                                    color:
                                      tableElement.title === "Event Markets" &&
                                      getStatusFontColor(+record?.status),
                                    ...column.style,
                                  }}
                                  className={column?.sticky && "sticky-column"}
                                >
                                  {column.render
                                    ? column.render(
                                      record[column.dataIndex],
                                      record
                                    )
                                    : record[column.dataIndex]}
                                </td>
                              ))}
                            </tr>
                            {expandedRows[index] && record.nestedTable && (
                              <tr>
                                <td colSpan={columns.length} className="p-0">
                                  {record.nestedTable}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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
                      <p className="text-muted mb-0">No Result</p>
                    </div>
                  </div>
                </div>
                {!isEmpty(data) ? (
                  <Row>
                    <Col>{tableElement?.compToRender}</Col>
                    <Col className={tableElement.title === "Dashboard" ? "" : "d-flex justify-content-end"}>
                      {tableElement?.isServerPagination && tableElement.title != "Dashboard" ? (
                        <Pagination
                          total={serverTotal}
                          pageSize={serverPageSize}
                          currentPage={serverCurrentPage}
                          fetchData={fetchData}
                          setCurrentPage={setServerCurrentPage}
                          setPageSize={setServerPageSize}
                          isServerSide={true}
                          customPageSizeOptions={customPageSizeOptions} //for custom pageSizeOptions like in team import
                        />
                      ) : isPagination && tableElement.title != "Dashboard" ? (
                        <Pagination
                          total={total}
                          pageSize={pageSize}
                          currentPage={currentPage}
                          fetchData={fetchData}
                          setCurrentPage={setCurrentPage}
                          setPageSize={setPageSize}
                          isServerSide={false}
                        />
                      ) : null}
                    </Col>
                  </Row>
                ) : (
                  <div className="d-flex justify-content-center no-data-available" 
                    style={maxTableHeight ? {
                      minHeight: "100px",
                    } : null}
                  >
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
