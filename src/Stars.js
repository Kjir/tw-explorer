import React from "react";
import "./Stars.css";

export function Stars({ stars }) {
  const starElements = [...Array(7).keys()].map(star => (
    <div
      key={`star-${star + 1}`}
      className={`star star-${star + 1}` + (stars >= star + 1 ? " active" : "")}
    >
      {" "}
    </div>
  ));
  return <div className="stars">{starElements}</div>;
}
