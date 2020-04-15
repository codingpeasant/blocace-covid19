/*!

=========================================================
* Black Dashboard React v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line } from "react-chartjs-2";
import { connect } from 'react-redux';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import _ from 'lodash';
import Blocace from 'blocace';
import { fetchCovid19 } from '../actions';

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
} from "reactstrap";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bigChartData: "US"
    };
  }

  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };

  componentDidMount() {
    this.props.fetchCovid19();
  }

  renderTable() {
    const accounts = this.props.accounts

    return this.props.covid19.map(tx => {
      const source = JSON.parse(tx._source)
      const account = _.find(accounts, { '_address': tx._address })

      if (source.country === this.state.bigChartData) {
        const verificationPassed = Blocace.verifySignature(tx._source, tx._signature, tx._address)
        return (
          <tr key={tx._id}>
            <th>{source.date.substring(0, 10)}</th>
            <th>{source.country}</th>
            <th>{source.confirmed}</th>
            <th>{source.deaths}</th>
            <th>{source.recovered}</th>
            <th>
              {account ?
                <UncontrolledDropdown group>
                  <DropdownToggle caret color="primary" data-toggle="dropdown">
                    {account.firstName} {account.lastName}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem>{tx._address}</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem>{account.firstName} {account.lastName}</DropdownItem>
                    <DropdownItem>{account.position}</DropdownItem>
                    <DropdownItem>{account.organization}</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem>{account.phone}</DropdownItem>
                    <DropdownItem>{account.address}</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                : 'Fetching...'}

            </th>
            <th>
              <UncontrolledDropdown group>
                <DropdownToggle caret color={verificationPassed ? 'success' : 'danger'} data-toggle="dropdown">
                  {verificationPassed ? 'Valid' : 'Invalid'}
                </DropdownToggle>
                <DropdownMenu className="dropdown-black">
                  <DropdownItem disabled>{tx._signature}</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </th>
          </tr>
        );
      }
      return null
    });
  }

  getTotalConfirmed() {
    const country = this.state.bigChartData
    const covid19 = this.props.covid19

    if (covid19.length > 0) {
      const newest = covid19.find(tx => JSON.parse(tx._source).country === country)
      if (newest !== undefined) {
        return JSON.parse(newest._source).confirmed
      }
    }
    return 'Loading...'
  }

  renderChart() {
    if (this.props.covid19 === undefined) {
      return 'Loading...'
    }

    const covid19 = this.props.covid19.map(tx => JSON.parse(tx._source)).filter(source => source.country === this.state.bigChartData).slice(0, 30).reverse()
    const labels = covid19.map(source => source.date.substring(5, 10))
    const data = covid19.map(source => source.confirmed)

    let chartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "#f5f5f5",
        titleFontColor: "#333",
        bodyFontColor: "#666",
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            barPercentage: 1.6,
            gridLines: {
              drawBorder: false,
              color: "rgba(29,140,248,0.0)",
              zeroLineColor: "transparent"
            },
            ticks: {
              suggestedMin: 60,
              suggestedMax: 125,
              padding: 20,
              fontColor: "#9a9a9a"
            }
          }
        ],
        xAxes: [
          {
            barPercentage: 1.6,
            gridLines: {
              drawBorder: false,
              color: "rgba(29,140,248,0.1)",
              zeroLineColor: "transparent"
            },
            ticks: {
              padding: 20,
              fontColor: "#9a9a9a"
            }
          }
        ]
      }
    };

    const chartBody = canvas => {
      let ctx = canvas.getContext("2d");

      let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

      gradientStroke.addColorStop(1, "rgba(29,140,248,0.2)");
      gradientStroke.addColorStop(0.4, "rgba(29,140,248,0.0)");
      gradientStroke.addColorStop(0, "rgba(29,140,248,0)"); //blue colors

      return {
        labels,
        datasets: [
          {
            label: "Total Confirmed",
            fill: true,
            backgroundColor: gradientStroke,
            borderColor: "#1f8ef1",
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: "#1f8ef1",
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: "#1f8ef1",
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data
          }
        ]
      };
    }

    return (
      <div className="chart-area">
        <Line
          data={chartBody}
          options={chartOptions}
        />
      </div>
    )
  }

  render() {
    return (
      <div className="content">
        <Row>
          <Col xs="12">
            <Card className="card-chart">
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <h5 className="card-category">Total Confirmed</h5>
                    <CardTitle tag="h2">
                      <i className="tim-icons icon-alert-circle-exc text-info" />{" "}
                      {this.getTotalConfirmed()}
                    </CardTitle>
                  </Col>
                  <Col sm="6">
                    <ButtonGroup
                      className="btn-group-toggle float-right"
                      data-toggle="buttons"
                    >
                      <Button
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "US"
                        })}
                        color="info"
                        id="0"
                        size="sm"
                        onClick={() => this.setBgChartData("US")}
                      >
                        <input
                          defaultChecked
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          US
                          </span>
                      </Button>
                      <Button
                        color="info"
                        id="1"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "Canada"
                        })}
                        onClick={() => this.setBgChartData("Canada")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Canada
                          </span>
                      </Button>
                      <Button
                        color="info"
                        id="2"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "Spain"
                        })}
                        onClick={() => this.setBgChartData("Spain")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Spain
                          </span>
                      </Button>
                      <Button
                        color="info"
                        id="3"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "France"
                        })}
                        onClick={() => this.setBgChartData("France")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          France
                        </span>
                      </Button>
                      <Button
                        color="info"
                        id="4"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "Italy"
                        })}
                        onClick={() => this.setBgChartData("Italy")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Italy
                        </span>
                      </Button>
                      <Button
                        color="info"
                        id="4"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "Germany"
                        })}
                        onClick={() => this.setBgChartData("Germany")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Germany
                        </span>
                      </Button>
                      <Button
                        color="info"
                        id="4"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "United Kingdom"
                        })}
                        onClick={() => this.setBgChartData("United Kingdom")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          UK
                        </span>
                      </Button>
                      <Button
                        color="info"
                        id="5"
                        size="sm"
                        tag="label"
                        className={classNames("animation-on-hover", {
                          active: this.state.bigChartData === "China"
                        })}
                        onClick={() => this.setBgChartData("China")}
                      >
                        <input
                          className="d-none"
                          name="options"
                          type="radio"
                        />
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          China
                        </span>
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {this.renderChart()}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="12" md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Official Records - {this.state.bigChartData}</CardTitle>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Date</th>
                      <th>Country</th>
                      <th>Confirmed</th>
                      <th>Deaths</th>
                      <th>Recovered</th>
                      <th>Issuer</th>
                      <th>Digital Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.renderTable()}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { covid19: state.covid19, accounts: state.accounts }
}
export default connect(mapStateToProps, { fetchCovid19 })(Dashboard);