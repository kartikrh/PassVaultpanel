import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";

const CheckBackLayPrice = ({
  dateModelVisable,
  setDateModelVisable,
  datePriceValues,
  setDatePriceValues,
  setCheckedList,
  marketDetails,
  sendWrongRateRequest
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [prices, setPrices] = useState([]);
  const [newPrices, setNewPrices] = useState("");
  const [difference, setDifference] = useState(2);
  const [rawMinDate, setRawMinDate] = useState(null);
  const [rawMaxDate, setRawMaxDate] = useState(null);
  const [prevDifference, setPrevDifference] = useState(0); // track previous value
  const [remark, setRemark] = useState('');

  const formatDateToIST = (date) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kolkata", // IST timezone
      hour12: false, // 24-hour format
    };
    return new Date(date).toLocaleString("en-IN", options);
  };

    useEffect(() => {
      if (datePriceValues && datePriceValues.length > 0) {
        let minDate = new Date(datePriceValues[0].createdDate);
        let maxDate = new Date(datePriceValues[0].createdDate);

        const backPrices = new Set();
        const layPrices = new Set();

        datePriceValues.forEach((item) => {
          const createdDate = new Date(item.createdDate);
          if (createdDate < minDate) minDate = createdDate;
          if (createdDate > maxDate) maxDate = createdDate;
          const logObject = item?.data && JSON.parse(item.data);
          logObject?.runner?.forEach((runner) => {
            if (runner?.backPrice) backPrices.add(runner?.backPrice);
            if (runner?.layPrice) layPrices.add(runner?.layPrice);
          });
        });

        setRawMinDate(minDate);
        setRawMaxDate(maxDate);

        const diffMs = difference * 1000;
        setStartDate(new Date(minDate.getTime() - diffMs));
        setEndDate(new Date(maxDate.getTime() + diffMs));
        setPrevDifference(difference); // store initial diff for later comparison

        const combinedPrices = [...backPrices, ...layPrices];
        const uniquePrices = [...new Set(combinedPrices)];
        uniquePrices.sort((a, b) => a - b);
        setPrices(uniquePrices);
        setNewPrices(uniquePrices.join(","));
      }
    }, [datePriceValues]);

    // ✅ When difference changes, shift relative to current state
    useEffect(() => {
      if (startDate && endDate) {
        const diffChange = difference - prevDifference; // how much diff changed
        const diffMs = diffChange * 1000;

        setStartDate((prev) => new Date(prev.getTime() - diffMs));
        setEndDate((prev) => new Date(prev.getTime() + diffMs));

        setPrevDifference(difference); // update stored diff
      }
    }, [difference]);

  // useEffect(() => {
  //   if (datePriceValues && datePriceValues.length > 0) {
  //     let minDate = new Date(datePriceValues[0].createdDate);
  //     let maxDate = new Date(datePriceValues[0].createdDate);

  //     const backPrices = new Set();
  //     const layPrices = new Set();

  //     datePriceValues.forEach((item) => {
  //       // Parse the date and check for min/max
  //       const createdDate = new Date(item.createdDate);
        
  //       if (createdDate < minDate) {
  //         minDate = createdDate;
  //       }
  //       if (createdDate > maxDate) {
  //         maxDate = createdDate;
  //       }

  //       // Parse data and collect unique back and lay prices
  //       const logObject = item?.data && JSON.parse(item.data);

  //       logObject?.runner?.forEach((runner) => {
  //         if (runner?.backPrice) backPrices.add(runner?.backPrice);
  //         if (runner?.layPrice) layPrices.add(runner?.layPrice);
  //       });
  //     });
      
  //     // Set the min and max dates
  //     setStartDate(formatDateToIST(minDate.toISOString()));
  //     setEndDate(formatDateToIST(maxDate.toISOString()));

  //     const combinedPrices = [...backPrices, ...layPrices];
  //     const uniquePrices = [...new Set(combinedPrices)];

  //     uniquePrices.sort((a, b) => a - b);
  //     setPrices(uniquePrices);
  //   }
  // }, [datePriceValues]);

  function formatFullDate(dateInput) {
    const date = new Date(dateInput);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

  return (
    <Modal
      isOpen={dateModelVisable}
      toggle={() => {
        setDateModelVisable(false);
      }}
      centered
    >
      <ModalHeader
        className="bg-light p-3"
        id="exampleModalLabel"
        toggle={() => {
          setDateModelVisable(false);
        }}
      >
        {marketDetails?.eventName} - [{marketDetails.eventRefId}]
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column align-items-start mx-2"
            id="modal-id"
          >
            <div className="d-flex justify-content-between w-100">
              <div className="my-1">
              <span className="margin-right-10">Id :</span>
              <span className="font-bold">{marketDetails?.eventMarketId}</span>
            </div>
              <input
                type="number"
                className="form-control"
                value={difference}
                style={{width: '80px'}}
                onChange={(e) => setDifference(Number(e.target.value))}
              />

            </div>
            {/* <div className="my-1">
              <span className="margin-right-10">Event :</span>
              <span className="font-bold">{marketDetails?.eventName}</span>
            </div> */}
            
            <div className="my-1">
              <span className="margin-right-10">Market :</span>
              <span className="font-bold">{marketDetails?.marketName}</span>
            </div>
            <div className="my-1 d-flex align-items-center justify-content-start">
              <span className="margin-right-10 label-price-width">Start Time :</span>
              <input
                className="form-control"
                type="datetime-local"
                step="1"
                value={startDate ? startDate.toISOString().slice(0, 19) : ""}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div className="my-1 d-flex align-items-center justify-content-start">
              <span className="margin-right-10 label-price-width">End Time :</span>
              {/* <input className="form-control" type="text" value={`${endDate}`} /> */}
              <input
                className="form-control"
                type="datetime-local"
                step="1"
                value={endDate ? endDate.toISOString().slice(0, 19) : ""}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            {/* <div className="my-1 d-flex align-items-center justify-content-start">
              <span className="margin-right-10 label-price-width">Price :</span>
              <input className="form-control" type="text" value={prices.length > 0 ? prices.join(",") : ""} />
            </div> */}
            <div className="my-1 d-flex align-items-center justify-content-start">
              <span className="margin-right-10 label-price-width">Price :</span>
              <input
                className="form-control"
                type="text"
                value={newPrices}
                onChange={(e) => setNewPrices(e.target.value)}
              />
            </div>
            <div className="my-1 d-flex align-items-center justify-content-start">
              <span className="margin-right-10 label-price-width">*Remark :</span>
              <input className="form-control" type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
            <div className="hstack gap-2 justify-content-end">
              {/* <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setDateModelVisable(false);
                  setDatePriceValues([]);
                  setCheckedList([]);
                }}
              >
                Close
              </button> */}
              <Button
                color={'primary'}
                // size="sm"
                disabled={remark == ""}
                className="btn"
                onClick={()=>{
                  sendWrongRateRequest(
                  {
                    "startDate" : formatFullDate(startDate),
                    "endDate" :formatFullDate(endDate),
                    "remark" : remark,
                    "rate" : newPrices,
                    "centrId" : marketDetails.eventMarketId
                  }
                )
                }}
              >
                Request
              </Button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default CheckBackLayPrice;
