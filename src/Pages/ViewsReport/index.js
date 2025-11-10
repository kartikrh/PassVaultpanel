import React, { useState, useEffect, useMemo } from "react";
import { Button, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Pagination from "../../components/Pagination";
import SpinnerModel from "../../components/Model/SpinnerModel";
import axiosInstance from "../../Features/axios";
import Chart from "./Chart";

const virtualStatusOptions = [
    {
    label: "All",
    value: 0,
    },
    {
    label: "True",
    value: true,
    },
    {
    label: "False",
    value: "false",
    },
]
const statusOptions = [
    {
    label: "All",
    value: 0,
    },
    {
    label: "Open",
    value: 1,
    },
    {
    label: "Toss Done",
    value: 2,
    },
    {
    label: "In Progress",
    value: 3,
    },
    {
    label: "End",
    value: 4,
    },
    {
    label: "Innings Break",
    value: 5,
    },
    {
    label: "Cancel",
    value: 10,
    },
]

const Index = () => {
  document.title = "Views Report";
  const globalPageSize = parseInt(localStorage.getItem("pageSize")) || 10;

  const [isSearch, setIsSearch] = useState(true);

  const [dataSource, setDataSource] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pageSize, setPageSize] = useState(globalPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypeSelect, setEventTypeSelect] = useState(null);

  const [competitions, setCompetitions] = useState([]);
  const [compSelect, setCompSelect] = useState(null);

  const [commentaryStatusSelect, setCommentaryStatusSelect] = useState(null);
  const [virtualStatusSelect, setVirtualStatusSelect] = useState(null);
  
  const [pythonApis, setPythonApis] = useState(null);
  const [pythonApisSelect, setPythonApisSelect] = useState(null);

  const [isServerPagination, setIsServerPagination] = useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
    endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]}T23:59:00`,
  });

  useEffect(() => {
    eventTypeListOptions();
    pythonAPIData()
  }, []);

  useEffect(() => {
    if(eventTypeSelect){
        compListOptions(eventTypeSelect)
    }
  }, [eventTypeSelect])

  useEffect(() => {
    fetchAndSetData();
  }, [eventTypeSelect, compSelect, commentaryStatusSelect, virtualStatusSelect, pythonApisSelect, isSearch]);

  useEffect(() => {
    if (!isServerPagination && dataSource.length > 0) {
      sliceData(dataSource, currentPage, pageSize);
    }
  }, [currentPage, dataSource, isServerPagination]);

  const eventTypeListOptions = async () => {
    try {
      const response = await axiosInstance.post(`/admin/commentary/eventTypeList`, {
        isActive: true,
      });
      const formatted = response.result.map((item) => ({
        value: item.eventTypeId,
        label: item.eventType,
      }));
    //   setEventTypes((prev) => ({...prev, formatted}));
    setEventTypes([{ label: "Select Event Type", value: null }, ...formatted]);
    } catch (error) {
      console.error("Error loading event types:", error);
    }
  };
  const compListOptions = async (value) => {
    try {
      const response = await axiosInstance.post(`/admin/commentary/competitionListByEventTypeId`, {
        eventTypeId: value,
      });
      const formatted = response.result.map((item) => ({
        value: item.competitionId,
        label: item.competition,
      }));
    //   setCompetitions(formatted);
      setCompetitions([{ label: "Select Competition", value: null }, ...formatted]);
    } catch (error) {
      console.error("Error loading event types:", error);
    }
  };
  const pythonAPIData = async () => {
    await axiosInstance
      .post(`/admin/commentary/pythonAPIs`, {})
      .then((response) => {
        const formatted = response.result.map((item) => ({
            value: item.id,
            label: item.developerName,
        }));
        // setPythonApis(formatted);
        setPythonApis([{ label: "Select API", value: null }, ...formatted]);
      })
      .catch((error) => { });
  };

  console.log("isSearch", isSearch)

  const fetchAndSetData = async (resetToFirstPage = false) => {
    if (resetToFirstPage === true) return;

    try {
      setIsLoading(true);

      // Step 1: Prepare raw payload
      const rawPayload = {
        startDate: isSearch ? dateRange.startDate : null,
        endDate: isSearch ? dateRange.endDate : null,
        eventTypeId: eventTypeSelect,
        competitionId: compSelect,
        commentaryStatus: commentaryStatusSelect,
        isVirtual: virtualStatusSelect === "false" ? false : virtualStatusSelect,
        pythonId: pythonApisSelect,
      };

      // Step 2: Remove all null, undefined, or empty keys
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(
          ([, value]) => value !== null && value !== undefined && value !== ""
        )
      );

      // Step 3: Make API call
      const response = await axiosInstance.post(`/admin/commentary/all`, payload);
      const apiData = response?.result || [];

      setDataSource(apiData);
      setTotal(apiData.length);
      sliceData(apiData, currentPage, pageSize);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };


  const sliceData = (dataArr, page, size) => {
    const start = (page - 1) * size;
    const end = start + size;
    setDisplayedData(dataArr.slice(start, end));
  };

  const totalEntries = total;
  const safePage = Math.max(currentPage, 1);
  const safePageSize = Math.max(pageSize, 1);
  const startEntry =
    totalEntries === 0 ? 0 : Math.min((safePage - 1) * safePageSize + 1, totalEntries);
  const endEntry =
    totalEntries === 0 ? 0 : Math.min(safePage * safePageSize, totalEntries);

  const customPageSizeOptions = ["10", "20"];

  // ✅ Stable data reference (prevents Chart infinite updates)
  const data = useMemo(
    () => (isServerPagination ? displayedData : displayedData),
    [isServerPagination, displayedData]
  );
  console.log("data", data)

  return (
    <div className="page-content bg-white min-vh-100">
      <Container fluid>
        <Breadcrumbs title="ScoreCard" breadcrumbItem="Views Report" />
        {isLoading && <SpinnerModel />}

        <div className="d-flex flex-wrap mb-3">
          <Select
            styles={{
              control: (provided) => ({ ...provided, width: 160 }),
            }}
            value={
              eventTypeSelect
                ? eventTypes.find((option) => option.value === eventTypeSelect)
                : null
            }
            onChange={(e) => {
              setEventTypeSelect(e?.value || null);
              setCurrentPage(1);
            }}
            options={eventTypes}
            placeholder="Event Type"
            classNamePrefix="filter-dropdown"
            className="me-2 py-2"
          />
          <Select
            styles={{
              control: (provided) => ({ ...provided, width: 160 }),
            }}
            value={
              compSelect
                ? competitions.find((option) => option.value === compSelect)
                : null
            }
            onChange={(e) => {
              setCompSelect(e?.value || null);
              setCurrentPage(1);
            }}
            options={competitions}
            placeholder="Competition"
            classNamePrefix="filter-dropdown"
            className="me-2 py-2"
          />
          <Select
            styles={{
              control: (provided) => ({ ...provided, width: 200 }),
            }}
            value={
              commentaryStatusSelect
                ? statusOptions.find((option) => option.value === commentaryStatusSelect)
                : null
            }
            onChange={(e) => {
              setCommentaryStatusSelect(e?.value || null);
              setCurrentPage(1);
            }}
            options={statusOptions}
            placeholder="Commentary Status"
            classNamePrefix="filter-dropdown"
            className="me-2 py-2"
          />
          <Select
            styles={{
              control: (provided) => ({ ...provided, width: 200 }),
            }}
            value={
              virtualStatusSelect
                ? virtualStatusOptions.find((option) => option.value === virtualStatusSelect)
                : null
            }
            onChange={(e) => {
              setVirtualStatusSelect(e?.value || null);
              setCurrentPage(1);
            }}
            options={virtualStatusOptions}
            placeholder="Virtual Status"
            classNamePrefix="filter-dropdown"
            className="me-2 py-2"
          />
          <Select
            styles={{
              control: (provided) => ({ ...provided, width: 200 }),
            }}
            value={
              pythonApisSelect
                ? pythonApis.find((option) => option.value === pythonApisSelect)
                : null
            }
            onChange={(e) => {
              setPythonApisSelect(e?.value || null);
              setCurrentPage(1);
            }}
            options={pythonApis}
            placeholder="API"
            classNamePrefix="filter-dropdown"
            className="me-2 py-2"
          />
        </div>
        <Row className="align-items-center g-2 p-2 rounded shadow-sm">
          {/* 🔹 Search Toggle (checkbox style button) */}
          <Col xs="auto">
            <Button
              color={`${isSearch ? "primary" : "danger"}`}
              size="sm"
              lassName="btn"
              onClick={() => setIsSearch(!isSearch)}
            >
              <i className={`bx ${isSearch ? "bx-check" : "bx-block"}`}></i>
            </Button>
          </Col>

          {/* 🔹 From Date */}
          <Col xs="auto">
            <input
              className="form-control"
              type="datetime-local"
              defaultValue={dateRange?.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              id="example-datetime-local-input"
            />
          </Col>

          {/* 🔹 To Date */}
          <Col xs="auto" className="d-flex">
            <span className="pe-2 align-items-center">To</span>
            <input
              className="form-control"
              type="datetime-local"
              defaultValue={dateRange?.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              id="example-datetime-local-input"
            />
          </Col>

          {/* 🔹 Search Button */}
          <Col xs="auto">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
                  alert("Start date cannot be greater than end date!");
                  return;
                }
                setCurrentPage(1);
                fetchAndSetData();
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
          </Col>

          {/* 🔹 Reset Button */}
          <Col xs="auto">
            <div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEventTypeSelect(null);
                  setCompSelect(null);
                  setCommentaryStatusSelect(null);
                  setVirtualStatusSelect(null);
                  setPythonApisSelect(null);
                  setDateRange({
                    startDate: `${new Date().toISOString().split("T")[0]}T00:00:00`,
                    endDate: `${new Date(Date.now() + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]}T23:59:00`,
                  });
                  setCurrentPage(1);
                  fetchAndSetData();
                }}
                type="reset"
                id="create-btn"
              >
                Reset
                {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
              </button>
            </div>
          </Col>

          {/* 🔹 Reload Button */}
          <Col xs="auto">
            <div>
              <button
                className="btn btn-primary"
                onClick={() => fetchAndSetData()}
                type="reload"
                id="create-btn"
              >
                Reload
                {/* <i className="ri-add-line align-bottom me-1"></i> Reset */}
              </button>
            </div>
          </Col>
        </Row>



        <div className="text-muted mb-2 mb-md-0">
          {totalEntries > 0 ? (
            <span>
              Showing <strong>{startEntry}</strong> - <strong>{endEntry}</strong> of{" "}
              <strong>{totalEntries}</strong> entries
            </span>
          ) : (
            "Showing 1 - 0 of 0 entries"
          )}
        </div>

        <Chart eventData={data} />

        <div className="d-flex justify-content-end pt-4">
          <Pagination
            total={totalEntries}
            pageSize={pageSize}
            currentPage={currentPage}
            fetchData={() => fetchAndSetData(false)}
            setCurrentPage={(page) => setCurrentPage(page < 1 ? 1 : page)}
            setPageSize={(size) => {
              setPageSize(size);
              fetchAndSetData(true);
            }}
            customPageSizeOptions={customPageSizeOptions}
          />
        </div>
      </Container>
    </div>
  );
};

export default Index;
