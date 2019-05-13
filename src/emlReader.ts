const emlformat = require("eml-format");
declare var MSGReader: any;

const htmlEncoder = (html: string): string => {
  return html.replace(/([a-zA-Z]+)'/g, "$1&#39;");
};

module.exports = (file: string) => {
  return new Promise((resolve, reject) => {
    switch (file.substring(file.length - 3)) {
      case "msg":
        const fileContent = fs.readFileSync(file);
        const textMsg: any = new MSGReader(fileContent);
        console.log(textMsg);
        const encodedHtml = htmlEncoder(textMsg.getFileData().body);
        resolve(encodedHtml);
        break;
      case "eml":
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
        break;
    }
    reject("Unsupported Format: " + file)
  });
};
