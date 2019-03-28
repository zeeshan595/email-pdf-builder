const webshot = require("webshot");
const commonFunctions = require("./commonFunctions");

module.exports = (input: string, output: string, options: any) => {
  return new Promise((resolve: any, reject: any) => {
    webshot(input, output, options, (err: any) => {
      if (err) {
        commonFunctions.outputLog("<span style='color: #ff0000;'>"+err+"</span>");
        reject(err);
        return;
      }
      resolve();
    });
  });
};
