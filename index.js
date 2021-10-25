const chalk = require("chalk");
const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const fileName = "./mudscrape-client/content/players.json";
const save = require(fileName);
const { exec } = require("child_process");

const url = "http://greatermud.com:22234/GreaterMUD/TopList";

console.log(chalk.green("running..."));

(async () => {
  const response = await got(url);
  const dom = new JSDOM(response.body);

  const nodeList = [...dom.window.document.querySelectorAll("span")];

  let currentPlayer = { name: "", exp: "" };
  let isPlayer = false;
  let count = 0;

  const savedPlayers = save.players;

  nodeList.forEach((node) => {
    count++;
    const text = node.innerHTML.replace(/&nbsp;/g, "");
    if (isPlayer) {
      isPlayer = false;
      const name = node.innerHTML.substring(0, node.innerHTML.indexOf("&nbsp"));
      currentPlayer.name = name;
      count = 1;
    } else if (text.indexOf(".") > 0 && parseInt(text) <= 50) {
      isPlayer = true;
      isExp = false;
    } else {
      if (count === 4) {
        currentPlayer.exp = parseInt(text);
        if (currentPlayer.name && currentPlayer.exp) {
          const savedPlayer = savedPlayers.find(
            (p) => p.name === currentPlayer.name
          );
          if (savedPlayer) {
            savedPlayer.exp.unshift(currentPlayer.exp);
            if (savedPlayer.exp.length > 168) {
              savedPlayer.exp.pop();
            }
          } else {
            savedPlayers.push({
              name: currentPlayer.name,
              exp: [currentPlayer.exp],
            });
          }
        }
        currentPlayer = { name: "", exp: "" };
      }
    }
  });

  await fs.writeFile(
    fileName,
    JSON.stringify({ players: savedPlayers }),
    function writeJSON(err) {
      if (err) return console.log(err);
      console.log("writing to " + fileName);
    }
  );

  exec(
    "bash update.sh",
    {
      env: { PATH: "C:\\Program Files\\git\\usr\\bin" },
      shell: "C:\\Program Files\\git\\usr\\bin\\bash.exe",
    },
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    }
  );
})();
