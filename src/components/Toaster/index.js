import React, { useState, useEffect } from "react";

import { Toast, ToastHeader, ToastBody } from "reactstrap";
const Index = ({ toast, setToast, toastStatus, setToastStatus }) => {
  // const [status, setStatus] = useState(false)
  const toggleToast = () => {
    toastStatus? setToastStatus(false) : setToastStatus(true);
  };
  useEffect(() => {
    setTimeout(() => {
      setToastStatus(false)
    }, 5000);
  }, [toastStatus]);
  return (
    <div className="position-fixed top-0 end-0 p-3 " style={{ zIndex: "1005" }}>
      <Toast isOpen={toastStatus} style={{ border: `solid ${toast.color} 2px` }}>
        <ToastHeader toggle={toggleToast}>{toast.header}</ToastHeader>
        <ToastBody color="primary">{toast.message}</ToastBody>
      </Toast>
    </div>
  );
};

export default Index;
