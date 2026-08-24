import React, { useEffect, useState } from "react";
import { Row, Container, Col, Card, CardBody } from "reactstrap";
import { useNavigate } from "react-router-dom";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axiosInstance from "../../Features/axios";

// Each tile reuses the same "/all" list endpoint the corresponding CMS page
// already calls, and just shows the number of records returned.
const DASHBOARD_TILES = [
  { key: "news", label: "News", icon: "ri-newspaper-line", color: "primary", url: "/admin/news/all", path: "/news" },
  { key: "banners", label: "Banners", icon: "ri-gallery-line", color: "success", url: "/admin/banner/all", path: "/banner" },
  { key: "users", label: "Users", icon: "ri-group-line", color: "info", url: "/admin/user/all", path: "/users" },
  { key: "pages", label: "Pages", icon: "ri-file-list-3-line", color: "warning", url: "/admin/page/all", path: "/Page" },
  { key: "photoLibrary", label: "Photo Library", icon: "ri-image-2-line", color: "secondary", url: "/admin/photoLibrary/all", path: "/photoLibrary" },
  { key: "videoLibrary", label: "Video Library", icon: "ri-video-line", color: "danger", url: "/admin/videoLibrary/all", path: "/videoLibrary" },
];

const Dashboard = () => {
  document.title = "Dashboard";
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchCounts = async () => {
    setIsLoading(true);
    const results = await Promise.allSettled(
      DASHBOARD_TILES.map((tile) => axiosInstance.post(tile.url, {}))
    );

    const newCounts = {};
    results.forEach((res, index) => {
      const { key } = DASHBOARD_TILES[index];
      if (res.status === "fulfilled" && Array.isArray(res.value?.result)) {
        newCounts[key] = res.value.result.length;
      } else {
        newCounts[key] = null;
      }
    });
    setCounts(newCounts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="ScoreCard" breadcrumbItem="Dashboard" />
          <Row>
            {DASHBOARD_TILES.map((tile) => (
              <Col xl={2} md={4} sm={6} key={tile.key}>
                <Card
                  role="button"
                  onClick={() => navigate(tile.path)}
                  style={{ cursor: "pointer" }}
                >
                  <CardBody>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 me-3">
                        <div className="avatar-sm">
                          <div
                            className={`avatar-title bg-light rounded-circle text-${tile.color} font-size-20`}
                          >
                            <i className={tile.icon}></i>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="mb-1 text-truncate">{tile.label}</p>
                        <h4 className="mb-0">
                          {isLoading
                            ? "-"
                            : counts[tile.key] === null || counts[tile.key] === undefined
                              ? "-"
                              : counts[tile.key]}
                        </h4>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
