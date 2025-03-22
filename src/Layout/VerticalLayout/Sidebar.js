import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import sidebarData from "./SidebarData";
import SimpleBar from "simplebar-react";
import withRouter from "../../components/Common/withRouter";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getAuthorisedTabs, getTabPermissions } from "../../Features/Authentication/authorizationSlice";
import MetisMenu from "metismenujs";
import { getMarketType } from "../../Features/Authentication/marketTypeSlice";
import { configInit } from "../../Features/Config/configSlice";
import "./sidebar.css";
import LogRocket from 'logrocket';
import { loadInit } from "../../config";
import { USER_DATA_KEY } from "../../components/Common/Const";

const Sidebar = (props) => {
  const ref = useRef();
  const newTabList = useSelector((state) => state.auth.tabList);
  const dispatch = useDispatch();
  const [openMenus, setOpenMenus] = useState({});
  const loadInitData = useSelector((state) => state.loadInit.loadInitData);
  const [isLogRocketInitialized, setIsLogRocketInitialized] = useState(false);

  let initLogRocket = loadInitData.find(item => item.key === loadInit.ENABLE_LOGROCKET)?.value;

  useEffect(() => {
    console.log("#####################_Is Log Rocket Enabled_#####################", { initLogRocket })
    if (initLogRocket && initLogRocket === "TRUE" && !isLogRocketInitialized) {
      const logRocketAppId = loadInitData.find(item => item.key === loadInit.LOG_ROCKET_AP_ID)?.value;
      LogRocket.init(logRocketAppId);
      const userObj = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}")
      LogRocket.identify(userObj?.userName, {
        name: userObj?.userName,
        email: userObj?.userName,
        subscriptionType: 'pro'
      });
      console.log("#####################_Log Rocket App Id._#####################", {
        logRocketAppId, name: userObj.userName
      })
      setIsLogRocketInitialized(true);
    }
  }, [initLogRocket, isLogRocketInitialized, loadInitData]);



  useEffect(() => {
    dispatch(getAuthorisedTabs());
    dispatch(getTabPermissions());
    dispatch(getMarketType());
    dispatch(configInit());
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }
    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;
      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag
        const parent3 = parent2.parentElement; // li tag
        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;
      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.length && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }
        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.remove("mm-show");
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");
            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = props.router.location.pathname;
    const fullPath = pathName;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu-item");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);
    for (let i = 0; i < items.length; ++i) {
      if (fullPath === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [props.router.location.pathname, activateParentDropdown]);

  function tToggle() {
    var body = document.body;
    if (window.screen.width <= 998) {
      body.classList.toggle("sidebar-enable");
    }
  }

  useEffect(() => {
    activeMenu();
  }, [activeMenu]);
  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  useEffect(() => {
    ref.current.recalculate();
    new MetisMenu("#side-menu-item");
    activeMenu();
  }, [newTabList]);

  return (
    <React.Fragment>
      <div className="vertical-menu">
        <SimpleBar className="h-100" ref={ref}>
          <div id="sidebar-menu">
            <ul className="metismenu list-unstyled" id="side-menu-item">
              {/* No use of sidebarData, it is jusst Backup */}
              {(newTabList || sidebarData)
                .slice() // Create a shallow copy
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((item, key) => (
                  <React.Fragment key={key}>
                    {item.isMainMenu && item.subItem?.length === 0 ? (
                      <li key={key}>
                        <Link to={item.url ? item.url : "/#"} onClick={tToggle}>
                          <i className={item.icon}></i>
                          <span>{props.t(item.label)}</span>
                        </Link>
                      </li>
                    ) : (
                      <>
                        {/* <li className={openMenus[item.label] ? "mm-active" : ""}>
                        <Link to="#" onClick={() => toggleMenu(item?.label)} className="menu-toggle">
                          <i className={item.icon}></i>
                          <span>{props.t(item.label)}</span>
                          <span className={`menu-arrow ${openMenus[item.label] ? "rotate-down" : ""}`}>&#9656;</span>
                        </Link>
                        {item.subItem && (
                          <ul className="sub-menu" style={{ display: openMenus[item.label] ? "block" : "none" }}>
                            {item.subItem
                              .slice()
                              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                              .map((subItem, subKey) => (
                                <li key={subKey}>
                                  <Link to={subItem.link}>{props.t(subItem.sublabel)}</Link>
                                </li>
                            ))}
                          </ul>
                        )}
                      </li> */}
                        <li key={key}>
                          <Link
                            to={item.url ? item.url : "/#"}
                            className={
                              item.issubMenubadge || item.isHasArrow
                                ? " "
                                : "has-arrow"
                            }
                          >
                            <i
                              className={item.icon}
                            ></i>
                            {item.issubMenubadge && (
                              <span
                                className={
                                  "badge rounded-pill float-end " + item.bgcolor
                                }
                              >
                                {" "}
                                {item.badgeValue}{" "}
                              </span>
                            )}
                            <span>{props.t(item.label)}</span>
                          </Link>
                          {item.subItem && item.subItem.length > 0 && (
                            <ul className="sub-menu" >
                              {item.subItem
                                .slice() // Create a shallow copy
                                .sort(
                                  (subA, subB) =>
                                    (subA.displayOrder || 0) -
                                    (subB.displayOrder || 0)
                                )
                                .map((subItem, subKey) => (
                                  <li key={subKey} >
                                    <Link to={subItem.link} onClick={tToggle} >
                                      {props.t(subItem.sublabel)}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </li>
                      </>
                    )}
                  </React.Fragment>
                ))}
            </ul>
          </div>
        </SimpleBar>
      </div>
    </React.Fragment>
  );
};
Sidebar.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};
export default withRouter(withTranslation()(Sidebar));
