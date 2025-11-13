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
    if (!eventData || eventData.length === 0) return;

    // Prepare data from props
    const labels = eventData.map((item) => {
      const eventDate = new Date(item.eventDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      //  UPDATED HERE → cleaner multi-line or combined label
      return `${item.eventName} (${eventDate})`;
    });

    const views = eventData.map((item) => Number(item.views || 0));

    // Compute max value
    const numericViews = views.map((v) => Number(v) || 0);
    const rawMax = numericViews.length ? Math.max(...numericViews) : 0;
    const padding = Math.ceil(rawMax * 0.02);
    const yMax = rawMax + padding;

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
            dataLabels: { position: "top" },
          },
        },
        dataLabels: {
          enabled: true,
          offsetY: -15,
          formatter: (val) => {
            val = Number(val.toFixed(0)); // fix floating point issues

            if (val >= 1000000) return (val / 1000000).toFixed(1).replace(".0", "") + "M";
            if (val >= 1000) return (val / 1000).toFixed(1).replace(".0", "") + "k";
            return val;
          },
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
          max: yMax,
          forceNiceScale: false,

          labels: {
            formatter: function (val) {
              // FIX floating point issues
              val = Number(val.toFixed(0));

              if (val >= 1000000) return (val / 1000000).toFixed(1).replace(".0", "") + "M";
              if (val >= 1000) return (val / 1000).toFixed(1).replace(".0", "") + "k";
              return val;
            },
          },
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
            formatter: (val) => {
              if (val >= 1000000) return (val / 1000000).toFixed(1).replace(".0", "") + "M";
              if (val >= 1000) return (val / 1000).toFixed(1).replace(".0", "") + "k";
              return val;
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
          height={window.innerHeight - 380}
        />
      ) : (
        <p className="text-center">Loading chart...</p>
      )}
    </div>
  );
};

export default Chart;
