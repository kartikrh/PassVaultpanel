import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadInit } from "../../config";
import { configInit } from "../../Features/Config/configSlice";
import SpinnerModel from "../../components/Model/SpinnerModel";

export default function StreamWatch() {
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const streamData = JSON.parse(
    sessionStorage.getItem("streamingData") || "{}"
  );
  const dispatch = useDispatch();

  let iframeURL = null;
  if (
    streamData?.streamingUrl &&
    streamData?.streamingType &&
    streamData?.streamingType != 0 &&
    loadInitData
  ) {
    const baseUrl = loadInitData.find(
      (item) => item.key === loadInit.STREAMINGWATCHURL
    )?.value;

    if (baseUrl) {
      if (parseInt(streamData.streamingType) === 1) {
        let videoUrl = streamData.streamingUrl;

        if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
          const idMatch = videoUrl.match(
            /(?:v=|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
          );
          if (idMatch && idMatch[1]) {
            iframeURL = `https://www.youtube.com/embed/${idMatch[1]}`;
          } else {
            iframeURL = videoUrl;
          }
        } else {
          iframeURL = videoUrl;
        }
      } else if (parseInt(streamData.streamingType) === 2) {
        iframeURL = `${baseUrl}${streamData.streamingUrl}`;
      }
    }
  }

  useEffect(() => {
    dispatch(configInit());
  }, []);

  return (
    <React.Fragment>
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 9999,
          overflow: "hidden",
        }}
      >
        {iframeURL ? (
          <iframe
            src={iframeURL}
            title="Stream Player"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            allowFullScreen
          />
        ) : (
        <SpinnerModel />
      )}
      </div>
    </React.Fragment>
  );
}