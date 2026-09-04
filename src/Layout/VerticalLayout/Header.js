import React, { useState } from "react";
import { Tooltip } from "antd";
import { connect, useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  MdDarkMode,
  MdOutlineDarkMode,
  MdLightMode,
  MdOutlineLightMode,
} from "react-icons/md";

// import LanguageDropdown from "../../components/Common/TopbarDropdown/LanguageDropdown";
// import NotificationDropdown from "../../components/Common/TopbarDropdown/NotificationDropdown";

//i18n
import { withTranslation } from "react-i18next";

//import images
import logoSm from "../../assets/images/logo-sm.png";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

// // Redux Store
// import {
//   showRightSidebarAction,
//   toggleLeftmenu,
//   changeSidebarType,
// } from "../../store/actions";
import ProfileMenu from "../../components/Common/TopbarDropdown/ProfileMenu";
import {
  Col,
  FormGroup,
  Label,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  changeSidebarTheme,
  changeLayout,
  changeDateType,
} from "../../Features/Layout";
// import AppsDropdown from "../../components/Common/TopbarDropdown/AppsDropdown";

const Header = (props) => {
  const [search, setsearch] = useState(false);
  const theme = useSelector((state) => state.layout.panelTheme);
  const isDarkMode = theme === "dark";
  const dateType = useSelector((state) => state.layout.dateType);
  const [isDateTypeOpen, setIsDateTypeOpen] = useState(false);
  const dispatch = useDispatch();
  const layoutType = useSelector((state) => state.layout.layoutType);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(layoutType); // Add this state

  function toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  function tToggle() {
    var body = document.body;
    if (window.screen.width <= 998) {
      body.classList.toggle("sidebar-enable");
    } else {
      body.classList.toggle("vertical-collpsed");
      body.classList.toggle("sidebar-enable");
    }
  }

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box text-center">
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logoSm} alt="logo-sm-dark" height="22" />
                </span>
                <span
                  className="logo-lg text-black"
                  style={{ fontSize: "medium" }}
                >
                  <img src={logoDark} alt="logo-dark" height="24" />{" "}
                  <strong className="panel-name">Panel</strong>
                </span>
              </Link>

              <Link to="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logoSm} alt="logo-sm-light" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoLight} alt="logo-light" height="24" />
                </span>
              </Link>
            </div>
            {!props.isHorizontalLayout && (
              <button
                type="button"
                className="btn btn-sm px-3 font-size-24 header-item waves-effect"
                id="vertical-menu-btn"
                onClick={() => {
                  tToggle();
                }}
              >
                <i className="fa fa-fw fa-bars"></i>
              </button>
            )}

            {/* <form className="app-search d-none d-lg-block">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                />
                <span className="ri-search-line"></span>
              </div>
            </form> */}
          </div>

          <div className="d-flex align-items-center">
            <div className="dropdown d-inline-block d-lg-none ms-2">
              <button
                onClick={() => {
                  setsearch(!search);
                }}
                type="button"
                className="btn header-item noti-icon "
                id="page-header-search-dropdown"
              >
                <i className="ri-search-line" />
              </button>
              <div
                className={
                  search
                    ? "dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 show"
                    : "dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                }
                aria-labelledby="page-header-search-dropdown"
              >
                <form className="p-3">
                  <div className="form-group m-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search ..."
                        aria-label="Recipient's username"
                      />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                          <i className="ri-search-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* <LanguageDropdown /> */}
            {/* <AppsDropdown /> */}

            {/* Global "which timezone" preference -- always visible in the
                header bar itself (not tucked inside the gear-icon settings
                panel) so it's a one-click change from any page. Drives both
                how every listing page displays dates and how a date/time
                picked in an Add/Edit form is converted before it's sent to
                the API (see reusableMethods.js's convertDateForBackend).
                A reactstrap Dropdown, not a native <select> -- a native
                select's option list renders as an OS-level popup outside
                normal DOM stacking, which visually clashed with
                ProfileMenu's own dropdown opening right next to it. */}
            <Dropdown
              isOpen={isDateTypeOpen}
              toggle={() => setIsDateTypeOpen((open) => !open)}
              className="d-none d-lg-inline-block ms-1"
            >
              {/* .date-format-toggle (_topbar.scss) -- header-item forces
                  the FULL header-bar height (meant for square icon
                  buttons), reactstrap's default DropdownToggle color
                  ("secondary") adds an unwanted dark background, and even a
                  plain inline style loses a separate color leak from the
                  dark theme's $gray-800. A dedicated !important class
                  sidesteps all three. */}
              <DropdownToggle caret className="border date-format-toggle">
                {dateType?.label || "Local Timezone"}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem
                  active={dateType?.value === 1}
                  onClick={() => dispatch(changeDateType({ value: 1, label: "Local Timezone" }))}
                >
                  Local Timezone
                </DropdownItem>
                <DropdownItem
                  active={dateType?.value === 2}
                  onClick={() => dispatch(changeDateType({ value: 2, label: "UTC Timezone" }))}
                >
                  UTC Timezone
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <div className="dropdown d-none d-lg-inline-block ms-1">
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                }}
                className="btn header-item noti-icon"
                data-toggle="fullscreen"
              >
                <i className="ri-fullscreen-line" />
              </button>
            </div>

            {/* <NotificationDropdown /> */}

            <ProfileMenu />

            <div
              className="dropdown d-inline-block"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            >
              <button
                type="button"
                className="btn header-item noti-icon right-bar-toggle waves-effect"
              >
                <i className="mdi mdi-cog"></i>
              </button>
            </div>
            {/* Right Sidebar */}
            {isSidebarOpen && (
              <div
                style={{
                  position: "fixed",
                  top: currentLayout === "horizontal" ? "120px" : "71px", // Use local state
                  right: 0,
                  width: "200px",
                  height: `calc(100% - ${
                    currentLayout === "horizontal" ? "120px" : "71px"
                  })`,
                  backgroundColor: isDarkMode ? "#333333" : "#f8f9fa",
                  boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.15)",
                  padding: "20px",
                  zIndex: 1000,
                  textAlign: "left",
                }}
              >
                <h6 style={{ color: isDarkMode ? "#ffffff" : "#74788d " }}>
                  Change Layout
                </h6>
                <button
                  className="btn btn-primary mb-4"
                  onClick={() => {
                    const newLayout =
                      currentLayout === "vertical" ? "horizontal" : "vertical";
                    setCurrentLayout(newLayout); // Update local state
                    dispatch(changeLayout(newLayout)); // Dispatch to Redux
                  }}
                >
                  Switch to{" "}
                  {currentLayout === "vertical" ? "Horizontal" : "Vertical"}
                </button>

                <Row>
                  <h6 style={{ color: isDarkMode ? "#ffffff" : "#74788d " }}>
                    Change Theme
                  </h6>
                </Row>
                <Row>
                  <Col className={"p-0"}>
                    <Tooltip
                      title="Dark"
                      color={"#e8e8ea"}
                      overlayInnerStyle={{ color: "#000" }}
                      placement="bottom"
                    >
                      <button
                        className={`btn btn-primary ${
                          isDarkMode ? "" : "bg-white"
                        } w-100`}
                        onClick={() => {
                          dispatch(changeSidebarTheme("dark"));
                        }}
                        // disabled={isDarkMode}
                      >
                        {isDarkMode ? (
                          <MdDarkMode color={isDarkMode ? "" : "black"} />
                        ) : (
                          <MdOutlineDarkMode
                            color={isDarkMode ? "" : "black"}
                          />
                        )}
                      </button>
                    </Tooltip>
                  </Col>
                  <Col className={"p-0 px-1"}>
                  <Tooltip
                      title="Light"
                      color={"#e8e8ea"}
                      overlayInnerStyle={{ color: "#000" }}
                      placement="bottom"
                    >
                    <button
                      className={`btn btn-primary ${
                        isDarkMode ? "bg-white" : ""
                      } w-100`}
                      onClick={() => {
                        dispatch(changeSidebarTheme("light"));
                      }}
                      // disabled={!isDarkMode}
                    >
                      {isDarkMode ? (
                        <MdOutlineLightMode color={isDarkMode ? "black" : ""} />
                      ) : (
                        <MdLightMode color={isDarkMode ? "black" : " "} />
                      )}
                    </button></Tooltip>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};
export default Header;
