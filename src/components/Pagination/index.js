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
  const onShowSizeChange = (currentPage, pageSize) => {
    setPageSize(pageSize);
    setCurrentPage(currentPage);
    console.log(currentPage, pageSize);
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);
  return (
    <Pagination
      showSizeChanger
      onShowSizeChange={onShowSizeChange}
      onChange={onShowSizeChange}
      defaultCurrent={currentPage}
      total={total}
      pageSize={pageSize}
    />
  );
};

export default Index;
