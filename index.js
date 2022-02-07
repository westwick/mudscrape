const chalk = require("chalk");
const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const fileName = "";

const { exec } = require("child_process");

console.log(chalk.green("starting..."));

(async () => {
  const updateRealm = async (filename, url) => {
    const response = await got(url);
    const dom = new JSDOM(response.body);

    const nodeList = [...dom.window.document.querySelectorAll("span")];

    let currentPlayer = { name: "", exp: "" };
    let isPlayer = false;
    let count = 0;

    const save = require(filename);
    let savedPlayers = save.players;
    const updatedPlayers = [];

    nodeList.forEach((node) => {
      count++;
      const text = node.innerHTML.replace(/&nbsp;/g, "");
      if (isPlayer) {
        isPlayer = false;
        const name = node.innerHTML.substring(
          0,
          node.innerHTML.indexOf("&nbsp")
        );
        currentPlayer.name = name;
        count = 1;
      } else if (text.indexOf(".") > 0 && parseInt(text) <= 100) {
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
            updatedPlayers.push(currentPlayer.name);
          }
          currentPlayer = { name: "", exp: "" };
        }
      }
    });

    // remove players that are no longer on the top 50
    savedPlayers = savedPlayers.filter((p) => {
      return updatedPlayers.includes(p.name);
    });

    await fs.writeFile(
      filename,
      JSON.stringify(
        { players: savedPlayers, lastUpdate: new Date() },
        null,
        2
      ),
      function writeJSON(err) {
        if (err) return console.log(err);
      }
    );
  };

  console.log(chalk.white("updating realm 1"));
  await updateRealm(
    "./mudscrape-client/content/players.json",
    "http://greatermud.com:22234/GreaterMUD/TopList"
  );
  console.log(chalk.white("done"));
  console.log(chalk.white("updating realm 2"));
  await updateRealm(
    "./mudscrape-client/content/players2.json",
    "http://greatermud.com:22233/GreaterMUD/TopList"
  );
  console.log(chalk.white("done"));

  const h = new Date().getHours();
  if (h < 8 || h > 13) {
    console.log(chalk.white("updating git..."));
    exec(
      "./update.sh",
      //{
      //  env: { PATH: "C:\\Program Files\\git\\usr\\bin" },
      //  shell: "C:\\Program Files\\git\\usr\\bin\\bash.exe",
      //},
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      }
    );
  } else {
    console.log(chalk.white("skipping git update"));
  }

  console.log(chalk.green("Complete!"));
})();
