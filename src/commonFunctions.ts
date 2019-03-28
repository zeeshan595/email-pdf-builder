const decode = require("unescape");
const dom = require("./domObjects");

const logs: string[] = [];

module.exports = {
  waitForSeconds: async (seconds: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  },
  extractWebpageURL: (patterns: string[], emailFullHTML: string) => {
    let matchFound: string = "";
    patterns.forEach(pattern => {
      const r = new RegExp(pattern);
      const matches = emailFullHTML.match(r);
      if (matches && matches.length > 0) {
        matchFound = decode(matches[1]);
      }
    });
    return matchFound;
  },
  outputLog: (message: string) => {
    const fullMessage =
      "<div class='log-entery'>[" +
      new Date(Date.now()).toLocaleTimeString() +
      "]: " +
      message;
    logs.push(fullMessage);
    dom.logArea.innerHTML += fullMessage + "</div>";
  },
  updateProgress: (current: number, max: number) => {
    dom.progressBar.setAttribute("value", (current / max) * 100);
  },
  hideButtons: () => {
    dom.browseButton.disabled = true;
    dom.convertToHTMLButton.disabled = true;
    dom.screenShotsButton.disabled = true;
    dom.toSinglePdfButton.disabled = true;
    dom.settingsButton.disabled = true;
  },
  showButtons: () => {
    dom.browseButton.disabled = false;
    dom.convertToHTMLButton.disabled = false;
    dom.screenShotsButton.disabled = false;
    dom.toSinglePdfButton.disabled = false;
    dom.settingsButton.disabled = false;
  },
  addSlashes: (str: string): string => {
    return str.replace(/\//g, "\\/");
  }
};
