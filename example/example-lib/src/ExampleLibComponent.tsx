import React from "react";

export const ExampleLibComponent = () => {
  return <div style={{ backgroundColor: "red" }}>This is a component from the lib with a shared react value of {React.version}</div>;
};
