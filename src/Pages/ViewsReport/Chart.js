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

    // compute numeric max safely, add optional padding if you want some space above the highest bar
    const numericViews = views.map(v => Number(v) || 0);
    const rawMax = numericViews.length ? Math.max(...numericViews) : 0;
    // const padding = Math.ceil(rawMax * 0.05); // 5% padding (set to 0 if you want exact top)
    const yMax = rawMax ;

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
            columnWidth: "40px",
            borderRadius: 6,
            dataLabels: {
              position: "top",
            },
          },
        },
        dataLabels: {
          enabled: true,
          offsetY: -15,
          formatter: (val) => `${val}`,
          style: {
            colors: ["#000000"],
            fontSize: "10px",
            fontWeight: 600,
          },
          background: { enabled: false },
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
            style: { fontSize: "10px", colors: "#555" },
            formatter: function (val) {
              return val.length > 15 ? val.slice(0, 15) + "..." : val;
            },
          },
        },

        yaxis: {
          min: 0,
          max: yMax,               // <-- set max here (not inside title)
          forceNiceScale: false,   // <-- also here
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
            formatter: (val) => `${val}`,
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
          height={window.innerHeight - 380}
        />
      ) : (
        <p className="text-center">Loading chart...</p>
      )}
    </div>
  );
};

export default Chart;
