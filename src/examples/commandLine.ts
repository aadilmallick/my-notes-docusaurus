import * as child_process from "child_process";

async function runLinuxCommandLevel1() {
  try {
    let listing = child_process.execSync("ls -l .", {
      encoding: "utf8",
    });
    console.log(listing);
  } catch (err) {
    console.log(err);
  }
}

async function runLinuxCommandLevel2() {
  try {
    //   let listing = child_process.
    let listing = child_process.execFileSync("ls", ["-l", "."], {
      encoding: "utf8",
    });
    console.log(listing);
  } catch (err) {
    console.log(err);
  }
}

runLinuxCommandLevel2();
