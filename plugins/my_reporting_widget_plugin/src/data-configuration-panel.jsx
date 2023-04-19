import "./styles.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import WithClient from "./with-client";
import {
  Button,
  Label,
  LoadingSpinner,
  SelectMenu,
  MenuItem,
} from "@qualtrics/ui-react";

export default function DataConfigurationPanel({ client, configuration }) {
  const [definition, setDefinition] = useState();
  const [attitude, setAttitude] = useState(null);
  const [behavior, setBehavior] = useState(null);

  useEffect(() => {
    console.log("full config:", configuration);
    let canceled = false;
    if (!definition) {
      const fetchDefinition = async () => {
        const { fieldsetDefinition } = await client.postMessage(
          "getDataSourceDefinition"
        );
        if (canceled) {
          return;
        }
        setDefinition(fieldsetDefinition);
      };
      fetchDefinition();
    }
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (attitude && behavior) {
      change((configuration) => ({
        ...configuration,
        metrics: [
          {
            id: "metric",
            label: "Attitude",
            field: attitude.field,
            function: "avg",
          },
          {
            id: "metric2",
            label: "Behavior",
            field: behavior.field,
            function: "avg",
          },
          {
            type: "custom",
            id: "truly-loyal",
            label: "Truly Loyal",
            equation: "Loyal / Total",
            function: "count",
            metrics: [
              {
                id: "Loyal",
                field: "_recordId",
                function: "count",
                label: "Loyal Count",
                filters: [
                  {
                    type: "filter",
                    filter: {
                      field: attitude.field,
                      operator: "greaterThanOrEqualTo",
                      operand: 4,
                    },
                  },
                  {
                    type: "filter",
                    filter: {
                      field: behavior.field,
                      operator: "greaterThanOrEqualTo",
                      operand: 4,
                    },
                  },
                ],
              },
              {
                id: "Total",
                field: "_recordId",
                label: "Total",
                function: "count",
              },
            ],
          },
          {
            type: "custom",
            id: "trapped",
            label: "Trapped",
            equation: "Trapped / Total",
            function: "count",
            metrics: [
              {
                id: "Trapped",
                field: "_recordId",
                function: "count",
                label: "Trapped Count",
                filters: [
                  {
                    type: "filter",
                    filter: {
                      field: attitude.field,
                      operator: "greaterThanOrEqualTo",
                      operand: 4,
                    },
                  },
                  {
                    type: "filter",
                    filter: {
                      field: behavior.field,
                      operator: "lessThan",
                      operand: 4,
                    },
                  },
                ],
              },
              {
                id: "Total",
                field: "_recordId",
                label: "Total",
                function: "count",
              },
            ],
          },
          {
            type: "custom",
            id: "accessible",
            label: "Accessible",
            equation: "Accessible / Total",
            function: "count",
            metrics: [
              {
                id: "Accessible",
                field: "_recordId",
                function: "count",
                label: "Accessible Count",
                filters: [
                  {
                    type: "filter",
                    filter: {
                      field: attitude.field,
                      operator: "lessThan",
                      operand: 4,
                    },
                  },
                  {
                    type: "filter",
                    filter: {
                      field: behavior.field,
                      operator: "greaterThanOrEqualTo",
                      operand: 4,
                    },
                  },
                ],
              },
              {
                id: "Total",
                field: "_recordId",
                label: "Total",
                function: "count",
              },
            ],
          },
          {
            type: "custom",
            id: "high-risk",
            label: "High Risk",
            equation: "HighRisk / Total",
            function: "count",
            metrics: [
              {
                id: "HighRisk",
                field: "_recordId",
                function: "count",
                label: "High Risk Count",
                filters: [
                  {
                    type: "filter",
                    filter: {
                      field: attitude.field,
                      operator: "lessThan",
                      operand: 4,
                    },
                  },
                  {
                    type: "filter",
                    filter: {
                      field: behavior.field,
                      operator: "lessThan",
                      operand: 4,
                    },
                  },
                ],
              },
              {
                id: "Total",
                field: "_recordId",
                label: "Total",
                function: "count",
              },
            ],
          },
        ],
        axes: [
          {
            id: "x-axis",
            label: "X-Axis",
            dimensions: [
              {
                id: "x-axis-dimension",
                label: "Survey Metadata - Progress",
                fieldId: "progress",
              },
            ],
          },
          {
            id: "z-axis",
            label: "Z-Axis",
            dimensions: [
              {
                id: "metrics",
                label: "filler dimension",
                fieldId: "progress",
              },
            ],
          },
        ],
      }));
      console.log("after change config:", configuration);
    } else {
      // TODO: setup a dummy config that does not include both dimensions
      console.log("not setting up new config!")
    }

  }, [attitude, behavior])

  if (!definition) {
    return (
      <div className="spinner">
        <LoadingSpinner show size="medium" />
      </div>
    );
  }

  let metric;
  let metric2;
  let dimension;
  if (configuration) {
    const { metrics, axes } = configuration;
    console.log("configuration:", configuration);
    if (metrics) {
      metric = configuration.metrics[0];
      metric2 = configuration.metrics[1];
      console.log("mymetrics", metrics);
    }
    if (axes) {
      dimension = configuration.axes[0].dimensions[0];
    }
  }

  return (
    <>
      <FieldSelectMenu
        client={client}
        label={client.getText("configurationPanel.metric")}
        defaultValue={metric && metric.field}
        fields={getFieldsOfType("ScalarValue", "EnumerableScalarValue")}
        placement="top-start"
        onChange={onAttitudeChange}
      />
      <FieldSelectMenu
        client={client}
        label={client.getText("configurationPanel.metric2")}
        defaultValue={metric2 && metric2.field}
        fields={getFieldsOfType("ScalarValue", "EnumerableScalarValue")}
        placement="top-start"
        onChange={onBehaviorChange}
      />
      {/* <FieldSelectMenu
        client={client}
        label={client.getText("configurationPanel.dimension")}
        defaultValue={dimension && dimension.fieldId}
        fields={getFieldsOfType("ScalarValue", "EnumerableScalarValue")}
        placement="bottom-start"
        onChange={onDimensionChange}
      /> */}
    </>
  );

  function onMetricChange(field) {
    console.log("Field:", field);
    change((configuration) => ({
      ...configuration,
      metrics: [
        {
          id: "metric",
          label: "Attitude",
          field: attitude.field,
          function: "avg",
        },
        {
          id: "metric2",
          label: "Behavior",
          field: behavior.field,
          function: "avg",
        },
        {
          type: "custom",
          id: "truly-loyal",
          label: "Truly Loyal",
          equation: "Loyal / Total",
          function: "count",
          metrics: [
            {
              id: "Loyal",
              field: "_recordId",
              function: "count",
              label: "Loyal Count",
              filters: [
                {
                  type: "filter",
                  filter: {
                    field: attitude.field,
                    operator: "greaterThanOrEqualTo",
                    operand: 4,
                  },
                },
                {
                  type: "filter",
                  filter: {
                    field: behavior.field,
                    operator: "greaterThanOrEqualTo",
                    operand: 4,
                  },
                },
              ],
            },
            {
              id: "Total",
              field: "_recordId",
              label: "Total",
              function: "count",
            },
          ],
        },
        {
          type: "custom",
          id: "trapped",
          label: "Trapped",
          equation: "Trapped / Total",
          function: "count",
          metrics: [
            {
              id: "Trapped",
              field: "_recordId",
              function: "count",
              label: "Trapped Count",
              filters: [
                {
                  type: "filter",
                  filter: {
                    field: attitude.field,
                    operator: "greaterThanOrEqualTo",
                    operand: 4,
                  },
                },
                {
                  type: "filter",
                  filter: {
                    field: behavior.field,
                    operator: "lessThan",
                    operand: 4,
                  },
                },
              ],
            },
            {
              id: "Total",
              field: "_recordId",
              label: "Total",
              function: "count",
            },
          ],
        },
        {
          type: "custom",
          id: "accessible",
          label: "Accessible",
          equation: "Accessible / Total",
          function: "count",
          metrics: [
            {
              id: "Accessible",
              field: "_recordId",
              function: "count",
              label: "Accessible Count",
              filters: [
                {
                  type: "filter",
                  filter: {
                    field: attitude.field,
                    operator: "lessThan",
                    operand: 4,
                  },
                },
                {
                  type: "filter",
                  filter: {
                    field: behavior.field,
                    operator: "greaterThanOrEqualTo",
                    operand: 4,
                  },
                },
              ],
            },
            {
              id: "Total",
              field: "_recordId",
              label: "Total",
              function: "count",
            },
          ],
        },
        {
          type: "custom",
          id: "high-risk",
          label: "High Risk",
          equation: "HighRisk / Total",
          function: "count",
          metrics: [
            {
              id: "HighRisk",
              field: "_recordId",
              function: "count",
              label: "High Risk Count",
              filters: [
                {
                  type: "filter",
                  filter: {
                    field: attitude.field,
                    operator: "lessThan",
                    operand: 4,
                  },
                },
                {
                  type: "filter",
                  filter: {
                    field: behavior.field,
                    operator: "lessThan",
                    operand: 4,
                  },
                },
              ],
            },
            {
              id: "Total",
              field: "_recordId",
              label: "Total",
              function: "count",
            },
          ],
        },
      ],
      axes: [
        {
          id: "x-axis",
          label: "X-Axis",
          dimensions: [
            {
              id: "x-axis-dimension",
              label: "Survey Metadata - Progress",
              fieldId: "progress",
            },
          ],
        },
        {
          id: "z-axis",
          label: "Z-Axis",
          dimensions: [
            {
              id: "metrics",
              label: "filler dimension",
              fieldId: "progress",
            },
          ],
        },
      ],
    }));
    console.log("after change config:", configuration);
  }

  function onAttitudeChange(field) {
    let att = {
      id: "metric",
      label: field.name,
      field: field.id,
      function: "avg",
    };
    setAttitude(att)
  }

  function onBehaviorChange(field) {
    let behav = {
      id: "metric",
      label: field.name,
      field: field.id,
      function: "avg",
    };
    setBehavior(behav);
  }

  function onDimensionChange(field) {
    console.log("Dimension Field:", field);
    change((configuration) => ({
      ...configuration,
      axes: [
        {
          id: "x-axis",
          label: "X-Axis",
          dimensions: [
            {
              id: "x-axis-dimension",
              label: field.name,
              fieldId: field.fieldId,
            },
          ],
        },
        {
          id: "z-axis",
          label: "Z-Axis",
          dimensions: [
            {
              id: "metrics",
              label: "filler dimension",
              fieldId: "progress",
            },
          ],
        },
      ],
    }));
  }

  function change(map) {
    console.log("definition", definition);
    if (definition) {
      const newConfiguration = {
        ...map(configuration),
        component: "fieldsets-aggregate",
        fieldsetId: definition.fieldSetId,
      };

      newConfiguration.isComplete =
        newConfiguration.metrics && newConfiguration.axes;

      console.log("newConfiguration:", newConfiguration);
      client.postMessage("onDataConfigurationChange", newConfiguration);
    } else {
      console.warn("Change called before definition is setup")
    }
  }

  function getFieldsOfType(...types) {
    return definition.fieldSetView.filter((field) =>
      types.includes(field.type)
    );
  }
}

function FieldSelectMenu({
  client,
  defaultValue,
  fields,
  label,
  onChange,
  placement,
}) {
  console.log("Label ->", label);
  if (label == "Chart Style") {
    return <></>;
  }
  return (
    <div className="form-group">
      <Label className="label">{label}</Label>
      <SelectMenu
        defaultValue={defaultValue}
        defaultLabel={client.getText("configurationPanel.selectAField")}
        placement={placement}
        maxHeight="100px"
        disabled={fields.length === 0}
        onChange={(fieldId) => {
          onChange(fields.find((field) => field.fieldId === fieldId));
        }}
      >
        {fields.map(({ fieldId, name }) => (
          <MenuItem key={fieldId} className="menu-item" value={fieldId}>
            {name}
          </MenuItem>
        ))}
      </SelectMenu>
    </div>
  );
}
