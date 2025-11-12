import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import "./chart.css";

const Chart = ({ eventData = [] }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });

  const [chartHeight, setChartHeight] = useState(600);

  useEffect(() => {
    const updateHeight = () => {
      const h = window.innerHeight;
      if (h < 500) setChartHeight(200);
      else if (h < 700) setChartHeight(300);
      else if (h < 900) setChartHeight(400);
      else if (h <= 1024) setChartHeight(500);
      else setChartHeight(650);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    // if (eventData.length === 0) return;

    // Prepare data from props
    const labels = eventData.map((item) => {
      const eventDate = new Date(item.eventDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const date = new Date(item.eventDate).toLocaleString();
      // Combine name and date (multi-line label)
      return ` ${item.eventName} ${eventDate}`;
    });

    const views = eventData.map((item) => Number(item.views || 0));
    const eventNames = eventData.map((item) => item.eventName || "Unknown Event");

    setChartData({
      series: [
        {
          name: "Views",
          type: "column",
          data: views,
        },
      ],
      options: {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: "40%",
            borderRadius: 6,
          },
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}`,
            style: {
                colors: ["#ffffff"], // <-- This will now work!
                fontSize: "10px",
                fontWeight: 600,
            },
            background: {
                enabled: false, // <-- Crucial line: Disable the background
            },
        },
        colors: ["#0ab39c"],
        stroke: { width: 1 },
        grid: { borderColor: "#f1f1f1" },
        xaxis: {
          categories: labels,
          title: {
            text: "Events",
            style: { fontSize: "14px", fontWeight: 600 },
          },
          labels: {
          rotate: -45,
          style: {
            fontSize: "10px",
            colors: "#555",
          },
          formatter: function (val) {
            return val.length > 15 ? val.slice(0, 15) + "..." : val;
          },
        },
        // tooltip: {
        //   enabled: true,
        // },
        },
        yaxis: {
          title: {
            text: "Views",
            style: { fontSize: "14px", fontWeight: 600 },
          },
        },
        tooltip: {
          x: {
            formatter: (val, { dataPointIndex }) => {
              const date = new Date(eventData[dataPointIndex].eventDate).toLocaleString();
              return `${date} ${eventData[dataPointIndex].eventName}`;
            },
          },
          y: {
            formatter: (val, { dataPointIndex }) => {
              const date = new Date(eventData[dataPointIndex].eventDate).toLocaleString();
              return `${val}`;
            },
          },
        },
        legend: { show: false },
      },
    });
  }, [eventData]);

  return (
    <div>
      {chartData.series.length > 0 ? (
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          className="apex-charts"
          // height={chartHeight}
          height={window.innerHeight - 400}
        />
      ) : (
        <p className="text-center">Loading chart...</p>
      )}
    </div>
  );
};

export default Chart;
