import React, { useEffect } from "react";
// import UsePanel from "./UserPanel";
// import OrderStatus from "./OrderStatus";
// import Notifications from "./Notifications";
// import SocialSource from "./SocialSource";
// import OverView from "./OverView";
// import RevenueByLocation from "./RevenueByLocation";
// import LatestTransation from "./LatestTransation";

import { Row, Container } from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useDispatch } from "react-redux";
import { getAuthorisedTabs } from "../../Features/Authentication/authorizationSlice";


const Dashboard = () => {
  const dispatch = useDispatch()
  document.title = "Dashboard | Upzet - React Admin & Dashboard Template";

  useEffect(() => {
    dispatch(getAuthorisedTabs());
    // fetchData(id);
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Dashboard" />
          {/* User Panel Charts */}
          {/* <UsePanel /> */}

          {/* <Row> */}
            {/* Overview Chart */}
            {/* <OverView /> */}
            {/* Social Source Chart */}
            {/* <SocialSource /> */}
          {/* </Row> */}

          {/* <Row> */}
            {/* Order Stats */}
            {/* <OrderStatus /> */}
            {/* Notifications */}
            {/* <Notifications /> */}
            {/* Revenue by Location Vector Map */}
            {/* <RevenueByLocation /> */}
          {/* </Row> */}

          {/* Latest Transaction Table */}
          {/* <LatestTransation /> */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
