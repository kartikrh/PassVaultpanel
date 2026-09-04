import React, { useCallback, useEffect } from 'react';
import PropTypes from "prop-types";
import withRouter from "../../components/Common/withRouter";

// import Components
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import RightSidebar from '../../components/Common/RightSideBar';

//redux
import { useSelector, useDispatch } from "react-redux";
import TopBar from '../../components/Common/TopBar';

const Layout = props => {
  const dispatch = useDispatch();
  const {
    layoutWidth,
    leftSideBarType,
    topbarTheme,
    isRightSidebar,
    panelTheme,
    layoutType, // Add this to get current layout type
  } = useSelector(state => ({
    leftSideBarType: state?.Layout?.leftSideBarType,
    layoutWidth: state?.Layout?.layoutWidth,
    topbarTheme: state?.Layout?.topbarTheme,
    isRightSidebar: state?.Layout?.isRightSidebar,
    panelTheme: state?.Layout?.panelTheme,
    layoutType: state.layout?.layoutType
  }));

  const state = useSelector((state) => state);

  const theme = useSelector((state) => state.layout.panelTheme);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Determine if we're using horizontal layout
  const isHorizontalLayout = layoutType === "horizontal";

  const toggleMenuCallback = () => {
    // Only handle menu toggle for vertical layout
    if (!isHorizontalLayout && leftSideBarType === "default") {
      // dispatch(changeSidebarType("condensed", isMobile));
    } else if (!isHorizontalLayout && leftSideBarType === "condensed") {
      // dispatch(changeSidebarType("default", isMobile));
    }
  };

  //hides right sidebar on body click
  const hideRightbar = useCallback((event) => {
    var rightbar = document.getElementById("right-bar");
    //if clicked in inside right bar, then do nothing
    if (rightbar && rightbar.contains(event.target)) {
      return;
    } else {
      //if clicked in outside of rightbar then fire action for hide rightbar
      // dispatch(showRightSidebar(false));
    }
  }, [dispatch]);

  /*
  layout  settings
  */

  useEffect(() => {
    //init body click event fot toggle rightbar
    document.body.addEventListener("click", hideRightbar, true);
  }, [hideRightbar]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect(() => {
  //   // dispatch(changeLayout("vertical"));
  // }, [dispatch]);

  useEffect(() => {
    if (panelTheme) {
      // dispatch(changeSidebarTheme(panelTheme));
    }
  }, [panelTheme, dispatch]);

  useEffect(() => {
    if (layoutWidth) {
      // dispatch(changeLayoutWidth(layoutWidth));
    }
  }, [layoutWidth, dispatch]);

  useEffect(() => {
    if (leftSideBarType) {
      // dispatch(changeSidebarType(leftSideBarType));
    }
  }, [leftSideBarType, dispatch]);

  useEffect(() => {
    if (topbarTheme) {
      // dispatch(changeTopbarTheme(topbarTheme));
    }
  }, [topbarTheme, dispatch]);

  return (
    <React.Fragment>
      <div id="layout-wrapper">
        <Header
          toggleMenuCallback={isHorizontalLayout ? null : toggleMenuCallback}
          isHorizontalLayout={isHorizontalLayout}
        />
        {/* <TopBar /> */}
        <Sidebar
          theme={panelTheme}
          type={leftSideBarType}
          isMobile={isMobile}
          style={isHorizontalLayout ? "horizontal" : "vertical"}
        />
        <div
          className="main-content"
          style={{
            marginLeft: isHorizontalLayout ? '0' : undefined,
            paddingTop: isHorizontalLayout ? 'calc(70px + 55px + 20px)' : undefined
          }}
        >
          {props.children}
        </div>
        {/* <Footer /> */}
      </div>
    </React.Fragment>
  );
};

Layout.propTypes = {
  changeLayoutWidth: PropTypes.func,
  changeSidebarTheme: PropTypes.func,
  changeSidebarType: PropTypes.func,
  changeTopbarTheme: PropTypes.func,
  children: PropTypes.object,
  layoutWidth: PropTypes.any,
  panelTheme: PropTypes.any,
  leftSideBarType: PropTypes.any,
  location: PropTypes.object,
  showRightSidebar: PropTypes.any,
  topbarTheme: PropTypes.any,
};

export default withRouter(Layout);