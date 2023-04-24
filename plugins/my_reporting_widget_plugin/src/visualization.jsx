import { Label } from "@qualtrics/ui-react";
import React, { useState, useEffect, Text } from "react";
import ReactDOM from "react-dom";
import WithClient from "./with-client";
import render from "./render";
import Chart from "chart.js";
import isEqual from "lodash/isEqual";

function Visualization() {
  return (
    <WithClient>
      {(props) => (
        // <Content
        //   // Force re-mount when chart type has changed
        //   key={props.viewConfiguration.chartType}
        //   {...props}
        // />
        <TextContent key={props.viewconfiguration} {...props}></TextContent>
      )}
    </WithClient>
  );
}

function TextContent({ data, viewConfiguration }) {
  const [ref, setRef] = useState();
  console.log("data:", data);
  // let mets = [];
  // for (let i = 0; i < 4; i++) {
  //   console.log(data.data[i]);
  //   mets.push(data.data[0].children[i].label);
  // }
  let loyal = "0",
    acces = "0",
    trap = "0",
    risk = "0";
  // let mydata = data.data[0].children;
  let mydata = data.data[0].children;
  for (let i = 0; i < mydata.length; i++) {
    let myId = mydata[i].id;
    let myVal = (mydata[i].value * 100).toFixed(1);
    if (myId == "truly-loyal") {
      loyal = myVal.toString();
    }
    if (myId == "trapped") {
      trap = myVal.toString();
    }
    if (myId == "accessible") {
      acces = myVal.toString();
    }
    if (myId == "high-risk") {
      risk = myVal.toString();
    }
  }
  return (
    <>
      <table className="matrix-table">
        <tbody>
          <tr>
            <td className="square-cell">
              <p className="square-header">Accessible</p>
              <p className="square-text" style={{ color: "#A4C660" }}>{acces}%</p>
            </td>
            <td className="square-cell">
              <p className="square-header">Truly Loyal</p>
              <p className="square-text" style={{ color: "#58B0E3" }}>{loyal}%</p>
            </td>
          </tr>
          <tr>
            <td className="square-cell">
              <p className="square-header">High Risk</p>
              <p className="square-text" style={{ color: "#D94020" }}>{risk}%</p>
            </td>
            <td className="square-cell">
              <p className="square-header">Trapped</p>
              <p className="square-text" style={{ color: "#F8971D" }}>{trap}%</p>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function Content({ data, viewConfiguration }) {
  console.log("data:", data);
  const [ref, setRef] = useState();
  const [chart, setChart] = useState();

  useEffect(() => {
    if (ref) {
      const config = getConfig();
      if (!chart) {
        setChart(new Chart(ref, config));
      } else {
        chart.data = config.data;
        chart.update();
      }
    }
  }, [ref, data, viewConfiguration]);

  return (
    <canvas
      ref={(ref) => {
        if (ref) {
          setRef(ref);
        }
      }}
    ></canvas>
  );

  function getConfig() {
    return {
      data: transformData(data),
      type: viewConfiguration.chartType || "bar",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    };
  }
}

function transformData(cube) {
  const { members, label } = cube.axes[0].dimensions[0];
  const labels = [];
  const dataset = {
    data: [],
    label,
    backgroundColor: [],
    borderColor: [],
    hoverBackgroundColor: [],
    hoverBorderColor: [],
    borderWidth: 1,
  };

  cube.data.forEach((datum, index) => {
    labels.push(members[datum.id].label);
    dataset.data.push(datum.value);
    const color = [0, 0, 0].map((_, i) => rainbow(i, index));
    dataset.backgroundColor.push(`rgba(${color}, 0.2)`);
    dataset.borderColor.push(`rgba(${color}, 1)`);
    dataset.hoverBackgroundColor.push(`rgba(${color}, .8)`);
  });

  return {
    labels,
    datasets: [dataset],
  };
}

function rainbow(color, index) {
  const frequency = 0.9;
  return Math.round(Math.sin(frequency * index + color * 2) * 127 + 128);
}

render(Visualization);
