console.log("[QR Code Reader Addon] Injection successful");
// ==================================== GLOBALS ====================================
var qrInput = document.createElement("input");
var qrButton = document.createElement("button");
var btnWrapper = document.createElement("div");
const qrImageHolder = new Image();
const regexQR = /(IDC: .+ \/)/;
const multiplier = 0.01;
let typedArray;
let ny = 0;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js";

qrInput.id = "fileInput";
qrInput.type = "file";
qrInput.accept = "application/pdf";
qrInput.style.display = "none";
qrInput.addEventListener("change", function (e) {
  var file = e.target.files[0];

  var fileReader = new FileReader();

  fileReader.onload = function () {
    typedArray = new Uint8Array(this.result);
    renderPDF(typedArray, ny, multiplier);
  };
  fileReader.readAsArrayBuffer(file);
});

qrButton.className = "btn btn--primary";
qrButton.innerText = "Ler QR Code";
qrButton.addEventListener("click", () => {
  qrInput.click();
});

btnWrapper.style.textAlign = "right";
btnWrapper.append(qrInput);
btnWrapper.append(qrButton);

// Crawls into a specific page and adds the button
if (location.href.includes("fechamento/protocolo")) {
  queryElement("div.ember-view", document)
    .then((element) => {
      queryElement("div.home-refi.closing.protocol", element).then(
        (element) => {
          queryElement(":nth-child(3)", element).then((element) => {
            getShadowRoot(element).then((shadowRoot) => {
              queryElement("div.container", shadowRoot).then((element) => {
                queryElement("div.row", element).then((element) => {
                  queryElement("div.col-medium-8", element).then((element) => {
                    queryElement("div.row", element).then((element) => {
                      queryElement("div.col-medium-12", element).then(
                        (element) => {
                          element.append(btnWrapper);
                        }
                      );
                    });
                  });
                });
              });
            });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
}

qrImageHolder.onload = () => {
  let codeReader = new ZXing.BrowserQRCodeReader();

  codeReader
    .decodeFromImage(qrImageHolder)
    .then((result) => {
      var qrID = result.text
        .match(regexQR)[0]
        .slice(5, result.text.match(regexQR)[0].length - 2);
      if (qrID) {
        queryElement("div.ember-view", document)
          .then((element) => {
            queryElement("div.home-refi.closing.protocol", element).then(
              (element) => {
                queryElement(":nth-child(3)", element).then((element) => {
                  getShadowRoot(element).then((shadowRoot) => {
                    queryElement("div.container", shadowRoot).then(
                      (element) => {
                        queryElement("div.row", element).then((element) => {
                          queryElement("div.col-medium-8", element).then(
                            (element) => {
                              queryElement("div.row", element).then(
                                (element) => {
                                  queryElementAll(
                                    "div.col-medium-6",
                                    element
                                  ).then((elements) => {
                                    queryElement("div", elements[1]).then(
                                      (element) => {
                                        queryElement("div", element).then(
                                          (element) => {
                                            queryElement("div", element).then(
                                              (element) => {
                                                queryElement(
                                                  "input",
                                                  element
                                                ).then((element) => {
                                                  element.value = qrID;
                                                  qrInput.value = "";
                                                  triggerChange(element);
                                                });
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  });
                                }
                              );
                            }
                          );
                        });
                      }
                    );
                  });
                });
              }
            );
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return ny * multiplier < 1
          ? renderPDF(typedArray, ny++, multiplier)
          : null;
      }
    })
    .catch((err) => {
      console.log(err);
      return ny * multiplier < 1
        ? renderPDF(typedArray, ny++, multiplier)
        : null;
    });
};

function triggerChange(el) {
  var ev = document.createEvent("Event");
  ev.initEvent("change", true, false);
  el.dispatchEvent(ev);
}

function renderPDF(typedArray, ny, multiplier) {
  // Render PDF to canvas
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  pdfjsLib.getDocument(typedArray).then((pdf) => {
    pdf.getPage(1).then((page) => {
      var viewport = page.getViewport(2.0);
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page
        .render({
          canvasContext: ctx,
          viewport: viewport,
        })
        .then(() => {
          decodeQR(
            ctx.getImageData(
              canvas.width * 0.81,
              canvas.height * (multiplier * ny),
              canvas.width * 0.14,
              canvas.height * 0.14
            )
          );
        });
    });
  });
}

function decodeQR(imageData) {
  var canvasAux = document.createElement("canvas");

  ctxAux = canvasAux.getContext("2d");
  ctxAux.putImageData(imageData, 0, 0);

  if (location.href.includes("fechamento/protocolo")) {
    queryElement("div.ember-view", document)
      .then((element) => {
        queryElement("div.home-refi.closing.protocol", element).then(
          (element) => {
            queryElement(":nth-child(3)", element).then((element) => {
              getShadowRoot(element).then((shadowRoot) => {
                queryElement("div.container", shadowRoot).then((element) => {
                  queryElement("div.row", element).then((element) => {
                    queryElement("div.col-medium-8", element).then(
                      (element) => {
                        element.append(qrImageHolder);
                      }
                    );
                  });
                });
              });
            });
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  qrImageHolder.src = canvasAux.toDataURL();
}

function queryElement(queryStr, doc) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (doc.querySelector(queryStr)) {
        clearInterval(timer);
        resolve(doc.querySelector(queryStr));
      }
    }, 10);
  });
}

function queryElementAll(queryStr, doc) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (doc.querySelectorAll(queryStr)) {
        clearInterval(timer);
        resolve(doc.querySelectorAll(queryStr));
      }
    }, 10);
  });
}

function getShadowRoot(element) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (element.shadowRoot) {
        clearInterval(timer);
        resolve(element.shadowRoot);
      }
    }, 10);
  });
}
