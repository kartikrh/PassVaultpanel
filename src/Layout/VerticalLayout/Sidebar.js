import React, { useCallback, useEffect, useRef, useState } from "react";
import { validateTabResponse } from "./functions";
import axios from "axios";
import { decryptData } from "../../Pages/Utility/encryptionUtils";
import PropTypes from "prop-types";
import sidebarData from "./SidebarData";
//Simple bar
import SimpleBar from "simplebar-react";
// MetisMenu
import MetisMenu from "metismenujs";
import withRouter from "../../components/Common/withRouter";
import { Link } from "react-router-dom";
//i18n
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
const Sidebar = (props) => {
  const ref = useRef();
  const [tabList, setTabList] = useState([]);
  const newTabList = useSelector(state => state.auth.tabList);

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

  useEffect(() => {
    ref.current.recalculate();
  }, []);

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

  return (
    <React.Fragment>
      <div className="vertical-menu">
        <SimpleBar className="h-100" ref={ref}>
          <div id="sidebar-menu">
            <ul className="metismenu list-unstyled" id="side-menu-item">
              {console.log(newTabList)}
              {/* {tabList.map((val, key) => (
                <React.Fragment key={key}>
                  <li className="menu-title" >{props.t(val.displayName)}</li>
                  {val.children.map((val) => {
                    return (
                      <li>
                        <Link
                          to={val.webPage ? val.webPage : "/#"}
                        >
                          <i
                            className="bx bx-circle"
                            style={{ marginRight: "5px" }}
                          ></i>
                          <span
                          >
                            {" "}
                          </span>
                          <span>{props.t(val.displayName)}</span>
                        </Link>
                      </li>)
                  })}
                </React.Fragment>
              ))} */}
              {(newTabList || sidebarData).map((item, key) => (
                <React.Fragment key={key}>
                  {item.isMainMenu ? (
                    <li className="menu-title">{props.t(item.label)}</li>
                  ) : (
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
                          style={{ marginRight: "5px" }}
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
                      {item.subItem && (
                        <ul className="sub-menu">
                          {item.subItem.map((item, key) => (
                            <li key={key}>
                              <Link
                                to={item.link}
                                className={
                                  item.subMenu && "has-arrow waves-effect"
                                }
                              >
                                {props.t(item.sublabel)}
                              </Link>
                              {item.subMenu && (
                                <ul className="sub-menu">
                                  {item.subMenu.map((item, key) => (
                                    <li key={key}>
                                      <Link to="#">{props.t(item.title)} ++++</Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
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
