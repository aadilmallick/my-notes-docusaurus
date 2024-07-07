import React from "react";
import Layout from "@theme/Layout";
import "./button";

const index = () => {
  return (
    <Layout>
      <div id="loading">
        <button className="loadingBtn">login</button>
      </div>
    </Layout>
  );
};

// Docusauraus react components must be a default export
export default index;
