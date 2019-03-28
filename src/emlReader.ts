const emlformat = require("eml-format");

const htmlEncoder = (html: string): string => {
  return html.replace(/([a-zA-Z]+)'/g, "$1&#39;");
};

module.exports = (file: string) => {
  return new Promise((resolve, reject) => {
    emlformat.read(fs.readFileSync(file, "utf-8"), (err: any, data: any) => {
      if (err) {
        commonFunctions.outputLog(
          "<span style='color: #ff0000;'>" + err + "</span>"
        );
        reject(err);
        return;
      }
      const encodedHTML = htmlEncoder(data.html);
      resolve(encodedHTML);
    });
  });
};
