import React from "react";
import { sharedValue } from "example-shared";

export const ExampleLibComponent = () => {
  return <div style={{ backgroundColor: "green" }}>This is a component from the lib with a shared value of {sharedValue}</div>;
};
