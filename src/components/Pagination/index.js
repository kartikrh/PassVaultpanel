import React, { useState, useEffect } from "react";
import { Pagination } from "antd";
const Index = ({
  total,
  pageSize,
  currentPage,
  fetchData,
  setCurrentPage,
  setPageSize,
}) => {
  const shouldShowSizeChanger = total >= 10;
  const onShowSizeChange = (currentPage, pageSize) => {
    console.log("this is page Size", pageSize)
    console.log("this is total", total)
    setPageSize(pageSize);
    setCurrentPage(currentPage - 1);
  };
  useEffect(() => {

    fetchData();
  }, [currentPage, pageSize]);
  return (
    <Pagination
      showSizeChanger={shouldShowSizeChanger}
      onShowSizeChange={onShowSizeChange}
      onChange={onShowSizeChange}
      defaultCurrent={currentPage}
      total={total}
      pageSize={pageSize}

    />
  );
};

export default Index;
