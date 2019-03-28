var conversion = require("phantom-html-to-pdf")({
  phantomPath: require("phantomjs-prebuilt").path
});

module.exports = (options: any, output: string) => {
  return new Promise((resolve, reject) => {
    conversion(options, (err: any, pdf: any) => {
      if (err) {
        commonFunctions.outputLog("<span style='color: #ff0000;'>"+err+"</span>");
        reject(err);
        return;
      }
      const outputStream = fs.createWriteStream(output);
      console.log(pdf.logs);
      console.log(pdf.numberOfPages);
      pdf.stream.pipe(outputStream);
      resolve();
    });
  });
};
