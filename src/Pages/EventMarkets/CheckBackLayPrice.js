import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const CheckBackLayPrice = ({
  dateModelVisable,
  setDateModelVisable,
  datePriceValues,
  setDatePriceValues,
  setCheckedList,
  marketDetails,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [prices, setPrices] = useState([]);

  const formatDateToIST = (date) => {
    const options = {
      weekday: "short",
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
        // Parse the date and check for min/max
        const createdDate = new Date(item.createdDate);
        
        if (createdDate < minDate) {
          minDate = createdDate;
        }
        if (createdDate > maxDate) {
          maxDate = createdDate;
        }

        // Parse data and collect unique back and lay prices
        const logObject = item?.data && JSON.parse(item.data);

        logObject?.runner?.forEach((runner) => {
          if (runner?.backPrice) backPrices.add(runner?.backPrice);
          if (runner?.layPrice) layPrices.add(runner?.layPrice);
        });
      });

      // Set the min and max dates
      setStartDate(formatDateToIST(minDate.toISOString()));
      setEndDate(formatDateToIST(maxDate.toISOString()));

      const combinedPrices = [...backPrices, ...layPrices];
      const uniquePrices = [...new Set(combinedPrices)];

      uniquePrices.sort((a, b) => a - b);
      setPrices(uniquePrices);
    }
  }, [datePriceValues]);

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
        {marketDetails?.marketName}
      </ModalHeader>
      <div className="tablelist-form">
        <ModalBody>
          <div
            className="d-flex flex-column align-items-start mx-2"
            id="modal-id"
          >
            <div className="my-1">
              <span className="margin-right-10">Event :</span>
              <span className="font-bold">{marketDetails?.eventName}</span>
            </div>
            <div className="my-1">
              <span className="margin-right-10">Id :</span>
              <span className="font-bold">{marketDetails?.eventMarketId}</span>
            </div>
            <div className="my-1">
              <span className="margin-right-10">Market :</span>
              <span className="font-bold">{marketDetails?.marketName}</span>
            </div>
            <div className="my-1">
              <span className="margin-right-10">Start Time :</span>
              <span className="font-bold">{startDate} IST</span>
            </div>
            <div className="my-1">
              <span className="margin-right-10">End Time :</span>
              <span className="font-bold">{endDate} IST</span>
            </div>
            <div className="my-1 d-flex align-items-center justify-content-start">
              <span className="margin-right-10 label-price-width">Price :</span>
              <input className="form-control" type="text" value={prices.length > 0 ? prices.join(", ") : ""} disabled />
            </div>
            <div className="hstack gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setDateModelVisable(false);
                  setDatePriceValues([]);
                  setCheckedList([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default CheckBackLayPrice;
