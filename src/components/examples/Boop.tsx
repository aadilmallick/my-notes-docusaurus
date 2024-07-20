import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useBoop from "./useBoop";

const Boop = ({ rotation = 20, timing = 150, children }) => {
  const { isBooped, trigger } = useBoop(timing);
  const style = {
    display: "inline-block",
    transform: isBooped ? `rotate(${rotation}deg)` : `rotate(0deg)`,
    transition: `transform ${timing}ms`,
  };
  return (
    <span onMouseEnter={trigger} style={style}>
      {children}
    </span>
  );
};

function BoopExample(): React.ReactNode {
  return (
    <Boop rotation={45}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sparkle-svg"
      >
        <path
          d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
          fill="#FFC700"
        />
      </svg>
    </Boop>
  );
}

export default function BoopExample2() {
  return <BrowserOnly>{() => <BoopExample />}</BrowserOnly>;
}
