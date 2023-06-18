console.log("Started 'Voice Over AI Netflix' extension.");

let subtitles = [];

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  });
}

waitForElm("video").then((video) => {
  console.log(video.currentTime);
  console.log({ subtitles });
});

/// end part 1

const s = document.createElement("script");
s.src = chrome.runtime.getURL("inject.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

document.addEventListener("yourCustomEvent", function (e) {
  const data = e.detail;

  const xmlStr = data;
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, "application/xml");
  // print the name of the root element or error message
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    console.log("error while parsing xml");
  } else {
    const listDom = Array.from(doc.querySelectorAll("p"));
    subtitles = listDom.map((itemDom) => ({
      id: itemDom.getAttribute("xml:id"),
      begin: itemDom.getAttribute("begin"),
      end: itemDom.getAttribute("end"),
      text: itemDom.textContent,
    }));
    console.log("Subtitles parsed");
  }
});

// 1057723332t
// 106.890269
