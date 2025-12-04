import React from "react";
import { Link } from "react-router-dom";
import NetworkGraph from "../components/NetworkGraph.jsx";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
     <div>
        <NetworkGraph/>
     </div>

    </div>
  );
}
