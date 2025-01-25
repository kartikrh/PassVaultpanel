import React from "react"
import { useSelector } from "react-redux";
import { Container, Row, Col } from "reactstrap"

const Footer = () => {
  const theme = useSelector((state) => state.layout.panelTheme);
  return (
    <React.Fragment>
      <footer className="footer" style={{background: theme === "dark" && "#1a2942", color: theme === "dark" && "#0bb197"}}>
        <Container fluid={true}>
          <Row>
            <Col sm={6}>{/* {new Date().getFullYear()} © Upzet. */}</Col>
            <Col sm={6}>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>

  );
}

export default Footer;