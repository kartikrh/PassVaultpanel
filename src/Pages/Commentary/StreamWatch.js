import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadInit } from "../../config";
import { configInit } from "../../Features/Config/configSlice";

export default function StreamWatch() {
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const streamData = JSON.parse(
    sessionStorage.getItem("streamingData") || "{}"
  );
  const dispatch = useDispatch();

  let iframeURL = null;
  if (streamData?.streamingUrl && streamData?.streamingType && streamData?.streamingType != 0 && loadInitData) {
    const baseUrl = loadInitData.find(
      (item) => item.key === loadInit.STREAMINGWATCHURL
    )?.value;

    if (baseUrl) {
      if (parseInt(streamData.streamingType) === 1) {
        try {
          // Extract only the origin (protocol + domain)
          const urlObj = new URL(baseUrl);
          const streamURL = encodeURIComponent(streamData.streamingUrl);
          iframeURL = `${urlObj.origin}?url=${streamURL}`;
        } catch (e) {
          console.error("Invalid baseUrl", e);
        }
      } else if (parseInt(streamData.streamingType) === 2){
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
          <p
            style={{
              color: "#999",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            No stream URL provided.
          </p>
        )}
      </div>
    </React.Fragment>
  );
}