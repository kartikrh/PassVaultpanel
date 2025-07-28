import React, { useState, useEffect } from "react";
import { Pagination } from "antd";
const Index = ({
  total,
  pageSize,
  currentPage,
  fetchData,
  setCurrentPage,
  setPageSize,
  customPageSizeOptions, //for customising page options
}) => {
  const shouldShowSizeChanger = total >= 10;
  const [prev, setPrev] = useState(pageSize);
  const onShowSizeChange = (currentPage, pageSize) => {
    localStorage.setItem("pageSize", pageSize);
    setPageSize(pageSize);
    Number(pageSize) === Number(prev)
      ? setCurrentPage(currentPage)
      : setCurrentPage(0);
    setPrev(pageSize);
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const defaultOptions = ["10", "20", "50", "100", "500", "1000", "5000", "10000"];

  return (
    <Pagination
      showSizeChanger={shouldShowSizeChanger}
      onShowSizeChange={onShowSizeChange}
      onChange={onShowSizeChange}
      current={currentPage}
      pageSizeOptions={customPageSizeOptions || defaultOptions}
      // defaultCurrent={currentPage}
      total={total}
      pageSize={pageSize}
    />
  );
};

export default Index;
