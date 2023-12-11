import React, { useState, useEffect } from "react";

import { Toast, ToastHeader,ToastBody } from "reactstrap";
const Index = () => {
  const [toast, settoast] = useState(true);
  const toggleToast9 = () => {
    settoast(!toast);
  };
  useEffect(()=>{
    setTimeout(()=>{
        settoast(false)
    }, 8000)
  },[])
  return (
    <div  className="position-fixed top-0 end-0 p-3 "
    style={{ zIndex: "1005", }}>
      <Toast isOpen={toast} style={{border:"solid red 2px" }}>
        <ToastHeader toggle={toggleToast9}>
          Warning
        </ToastHeader>
        <ToastBody color="primary">
                        Hello, world! This is a toast message.
        </ToastBody>
      </Toast>
    </div>
  );
};

export default Index;
