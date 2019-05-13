//Structures
import FilePath from "./filePath";

//Libraries
const fs = require("fs");
const { remote } = require("electron");
const phantomJsPath = require("phantomjs-prebuilt").path;

//Local
const commonFunctions = require("./commonFunctions");
const emlReader = require("./emlReader");
const webshot = require("./webshotAsync");
const pdfMaker = require("./phantomPDFAsync");
const config = require("./configLoader")();
const dom = require("./domObjects");
const popup = require("./popUp");

//stores files created and selected by the user
let files: FilePath[] = [];

//browse email files to process
const onBrowsebuttonClick = () => {
  //ask user to select (multiple) email files
  const emails: string[] = remote.dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Email (.eml, .msg)", extensions: ["eml", "msg"] }, { name: "All", extensions: ["*"] }]
  });
  //if the user selects emails create folders for caching each email
  if (!emails || emails.length <= 0) return;

  files = [];

  emails.forEach((emailPath, index, arr) => {
    if (!fs.existsSync(emailPath + ".cache/"))
      fs.mkdirSync(emailPath + ".cache/");
    files.push({
      eml: emailPath,
      email: emailPath + ".cache/email.jpg",
      webpage: emailPath + ".cache/land.jpg",
      document: emailPath + ".cache/document.html",
      cacheDir: emailPath + ".cache/"
    });
  });

  //after the user selects emails, enable screenshot and pdf buttons
  dom.convertToHTMLButton.style.display = "inline-block";
  dom.screenShotsButton.style.display = "inline-block";
  dom.toSinglePdfButton.style.display = "inline-block";
  //output a log
  commonFunctions.outputLog(emails.length + " files selected");
};

//IMPORTANT: don't get multiple screenshots at the same time because scottishpower.co.uk will block you!
//get screenshots of the emails and the landing pages
const onGetScreenShotsClick = async () => {
  if (!files || files.length <= 0) {
    return;
  }
  //Set progress to 0% and hide all buttons so user cannot start the task multiple times
  commonFunctions.updateProgress(0, 1);
  commonFunctions.hideButtons();

  //check if there are previously cached files
  let useCache = -1;
  let isEmailCached = false;
  let isWebPageCached = false;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    isEmailCached = fs.existsSync(file.email);
    isWebPageCached = fs.existsSync(file.webpage);
    if ((isEmailCached || isWebPageCached) && useCache == -1) {
      //ask user if they would like to use the previosuly taken screenshots?
      const popUpResponse = await popup.asyncShow(
        "Found previously taken screenshots. Would you like to use the cached screenshots?",
        [
          {
            text: "Cancel Task"
          },
          {
            text: "No"
          },
          {
            text: "Yes"
          }
        ],
        true
      );
      switch (popUpResponse) {
        default:
        case 0:
          commonFunctions.showButtons();
          return;
        case 1:
          useCache = 0;
          break;
        case 2:
          useCache = 1;
          break;
      }
    }

    //take screenshots of the email
    const emailHTML = await emlReader(file.eml);
    if (!isEmailCached || useCache != 1) {
      commonFunctions.outputLog("fetching: " + file.eml);
      try {
        await webshot(emailHTML, file.email, {
          siteType: "html", //input data is in html format
          format: "jpg", //output is required to be a jpg
          defaultWhiteBackground: true, //make sure the background it is rendered on is white
          quality: 100, //image quality (0 = high compression)
          timeout: 60000, //how long should it wait for a response (milliseconds)
          screenSize: {
            //how big the renderer is when taking screenshots
            width: 768,
            height: 1024
          },
          shotSize: {
            //make sure to take screenshots of the entire page
            width: "all",
            height: "all"
          },
          phantomConfig: {
            //for more information please look into phantomjs
            "ignore-ssl-errors": "true",
            "ssl-protocol": "ANY"
          },
          phantomPath: phantomJsPath //path for phantomjs
        });
        commonFunctions.outputLog(
          file.email + " <span style='color: green;'>[OK]</span>"
        );
      } catch (e) {
        file.email + " <span style='color: red;'>[ERROR]</span>"
      }
    } else {
      commonFunctions.outputLog(
        file.email + " <span style='color: green;'>[CACHE]</span>"
      );
    }

    if (config.includeLandingPage) {
      //update progress bar
      commonFunctions.updateProgress(i * 2 + 1, files.length * 2);
      //take screenshots of the landing page
      if (!isWebPageCached || useCache != 1) {
        const searchPattern: string =
          "(" +
          commonFunctions.addSlashes(config.urls[0]) +
          "[a-zA-Z0-9:/.&?=_;+#-% ]+)";
        let webpageUrl = commonFunctions.extractWebpageURL(
          [searchPattern],
          emailHTML
        );
        if (webpageUrl != "") {
          if (config.sendPrintCommand) webpageUrl += "&print=true";
          commonFunctions.outputLog("fetching: " + webpageUrl);
          try {
            await webshot(webpageUrl, file.webpage, {
              siteType: "url", //the input is a url
              format: "jpg",
              renderDelay: config.snapshotRenderDelay, //delay before taking screenshot (milliseconds)
              takeShotOnCallback: config.waitForLandingPageCallback, //wait for js to tell, when to take screenshot window.callPhantom('takeShot');
              defaultWhiteBackground: true,
              quality: 100,
              timeout: config.timeout,
              errorIfJSException: true,
              screenSize: {
                width: 768,
                height: 1024
              },
              shotSize: {
                width: "all",
                height: "all"
              },
              phantomConfig: {
                "ignore-ssl-errors": "true",
                "ssl-protocol": "ANY"
                /* "proxy": "proxyMA.corp.iberdrola.com:8080" */
              },
              phantomPath: phantomJsPath
            });
            commonFunctions.outputLog(
              file.webpage + " <span style='color: green;'>[OK]</span>"
            );
          } catch (e) {
            commonFunctions.outputLog(
              file.webpage + " <span style='color: red;'>[ERROR]</span>"
            );
          }
        } else {
          commonFunctions.outputLog(
            file.webpage +
            " <span style='color: red'>[FAIL] could not get url</span>"
          );
        }
      } else {
        commonFunctions.outputLog(
          file.webpage + " <span style='color: green;'>[CACHE]</span>"
        );
      }
    }
    //update progress bar
    commonFunctions.updateProgress(i * 2 + 2, files.length * 2);
  }
  //update progress bar & enable user buttons
  commonFunctions.showButtons();
  commonFunctions.updateProgress(100, 100);
  //show popup that task is complete
  await popup.asyncShow(
    "Done!",
    [
      {
        text: "Okay"
      }
    ],
    true
  );
};

//convert all cached screenshots to pdf
const onCreatePDFClick = async () => {
  //set progress to 0% and hide interactable buttons
  commonFunctions.updateProgress(0, 1);
  commonFunctions.hideButtons();

  //ask user to provide the output path for the pdf
  const outputPath: string = remote.dialog.showSaveDialog({
    filters: [{ name: "Portable Document Format", extensions: ["pdf"] }]
  });
  console.log(outputPath);
  if (!outputPath) {
    commonFunctions.showButtons();
    return;
  }

  //get cached screenshots and create a html string
  const skippedFiles: string[] = [];
  let pdfHTML: string = "";

  files.forEach(file => {
    if (!fs.existsSync(file.email)) {
      skippedFiles.push(file.email);
    } else {
      pdfHTML += "<img src='file:///" + file.email + "' /> <br />";
    }

    if (!fs.existsSync(file.webpage)) {
      skippedFiles.push(file.webpage);
    } else {
      pdfHTML += "<img src='file:///" + file.webpage + "' /> <br />";
    }

    //add a blank page
    pdfHTML += "<div style='page-break-after: always; height: 1000px;'></div>";
    pdfHTML += "<div style='page-break-after: always; height: 1000px;'></div>";
    pdfHTML += "<div style='page-break-after: always; height: 1000px;'></div>";
  });

  //convert html to a pdf file
  await pdfMaker(
    {
      html: pdfHTML, //html data
      allowLocalFilesAccess: true, //allow phantom js to access localy stored files
      paperSize: {
        //size of the paper for the pdf file (keep in mind the screenshot size)
        width: 850,
        height: 1200,
        margin: 0 //margin for the content of the pdf (there is an extra white space around the border anyway)
      },
      format: {
        //quality of the pdf
        quality: 100
      }
    },
    outputPath //output path for the pdf
  );

  //update progress bar and show buttons
  commonFunctions.updateProgress(1, 1);
  commonFunctions.showButtons();
  //show popup that task is done
  await popup.asyncShow(
    "Done!",
    [
      {
        text: "Okay"
      }
    ],
    true
  );
};

//minimize window
const onMinimizeButtonClick = () => {
  const window = remote.getCurrentWindow();
  window.minimize();
};

//close window
const onCloseButtonClick = () => {
  const window = remote.getCurrentWindow();
  window.close();
};

//view selected files
const onViewSelectedFilesClick = async () => {
  let str: string = "";
  files.forEach(file => {
    str += file.eml + "<br />";
  });
  await popup.asyncShow(
    str,
    [
      {
        text: "Close"
      }
    ],
    true
  );
};

const onSettingsButtonClick = async () => {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modalBody");
  const modalButtonsContainer = document.getElementById("modalbuttons");
  const modalContent = document.getElementById("modalContent");
  if (!modalButtonsContainer || !modalBody || !modal || !modalContent) return;

  //Container
  modal.style.display = "block";
  modalBody.style.display = "none";

  //Buttons
  modalButtonsContainer.appendChild(
    dom.createButton("Close", () => {
      //Save
      console.log(config);
      fs.writeFileSync(__dirname + "/config.json", JSON.stringify(config));

      modalContent.innerHTML = "";
      modalButtonsContainer.innerHTML = "";
      modal.style.display = "none";
      modalBody.style.display = "block";
    })
  );

  //Body
  const landingPageOptions = [
    dom.createForumContainer([
      dom.createLabel("Landing Page URL (without variables)"),
      dom.createTextField(
        "Regex Pattern",
        config.urls[0],
        "text",
        (text: string) => {
          config.urls[0] = text;
        }
      )
    ]),
    dom.createForumContainer([
      dom.createLabel("Landing Page Render Delay"),
      document.createElement("br"),
      dom.createTextField(
        "Miliseconds",
        config.snapshotRenderDelay,
        "number",
        (text: string) => {
          config.snapshotRenderDelay = text;
        }
      )
    ]),
    dom.createForumContainer([
      dom.createLabel("Landing Page Timeout"),
      document.createElement("br"),
      dom.createTextField(
        "Miliseconds",
        config.timeout,
        "number",
        (text: string) => {
          config.timeout = text;
        }
      )
    ]),
    dom.createForumContainer([
      dom.createToggle(
        config.waitForLandingPageCallback,
        (isChecked: boolean) => {
          config.waitForLandingPageCallback = isChecked;
        }
      ),
      dom.createLabel("Wait for landing page to trigger screenshot")
    ]),
    dom.createForumContainer([
      dom.createToggle(config.sendPrintCommand, (isChecked: boolean) => {
        config.sendPrintCommand = isChecked;
      }),
      dom.createLabel("Pass print parameter in url")
    ])
  ];

  modalContent.appendChild(
    dom.createForumContainer([
      dom.createToggle(config.includeLandingPage, (isChecked: boolean) => {
        config.includeLandingPage = isChecked;

        landingPageOptions.forEach(landingOption => {
          if (isChecked) landingOption.style.display = "block";
          else landingOption.style.display = "none";
        });
      }),
      dom.createLabel("Include Landing Page?")
    ])
  );

  landingPageOptions.forEach(landingOption => {
    if (config.includeLandingPage) landingOption.style.display = "block";
    else landingOption.style.display = "none";
    modalContent.appendChild(landingOption);
  });
};

const onConvertToHTMLClick = async () => {
  if (!files || files.length <= 0) {
    return;
  }
  //Set progress to 0% and hide all buttons so user cannot start the task multiple times
  commonFunctions.updateProgress(0, 1);
  commonFunctions.hideButtons();

  files.forEach(async file => {
    const emailHTML = await emlReader(file.eml);
    fs.writeFileSync(file.eml + file.webpage, emailHTML);
  });

  commonFunctions.updateProgress(1, 1);
  commonFunctions.showButtons();
};
