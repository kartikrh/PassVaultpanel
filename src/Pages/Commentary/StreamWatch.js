import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadInit } from "../../config";
import { configInit } from "../../Features/Config/configSlice";

export default function StreamWatch() {
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const streamUrl = sessionStorage.getItem("streamingUrl");
  const dispatch = useDispatch();

  let iframeURL = null;
  if (streamUrl && loadInitData) {
    const baseUrl = loadInitData.find(
      (item) => item.key === loadInit.STREAMINGWATCHURL
    )?.value;

    if (baseUrl) {
      iframeURL = `${baseUrl}${streamUrl}`;
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