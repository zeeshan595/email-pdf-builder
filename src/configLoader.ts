const fs = require("fs");
const configPath: string = __dirname + "/config.json";

module.exports = () => {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
  return {
    urls: []
  };
};
