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
  console.log({ subtitles });
  startPlayAudio(video);
});

const s = document.createElement("script");
s.src = chrome.runtime.getURL("inject.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

// this should happen before video is loader
document.addEventListener("InterceptedSubtitles", function (e) {
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
      begin: convertNetflixTime(itemDom.getAttribute("begin")),
      end: convertNetflixTime(itemDom.getAttribute("end")),
      text: itemDom.textContent,
      played: false,
    }));
    console.log("Subtitles parsed");
  }
});

function convertNetflixTime(netflixTime) {
  const wholePart = netflixTime.split("").reverse().slice(8).reverse().join("");
  const decimalPart = netflixTime
    .split("")
    .reverse()
    .slice(1, 8)
    .reverse()
    .join("");
  return Number(wholePart + "." + decimalPart);
}

function startPlayAudio(video) {
  video.addEventListener("timeupdate", function () {
    var currentTime = video.currentTime;

    // Find the matching subtitle
    const matchingSubtitleIndex = subtitles.findIndex(function (subtitle) {
      return (
        currentTime >= subtitle.begin &&
        currentTime < subtitle.end &&
        !subtitle.played
      );
    });

    // Log the subtitle if found
    if (subtitles[matchingSubtitleIndex]) {
      subtitles[matchingSubtitleIndex].played = true;

      const timeLimit = subtitles[matchingSubtitleIndex + 1]
        ? subtitles[matchingSubtitleIndex + 1].begin -
          subtitles[matchingSubtitleIndex].begin
        : subtitles[matchingSubtitleIndex].end -
          subtitles[matchingSubtitleIndex].begin;

      console.log({
        matchingSubtitleIndex,
        currentTime,
        subtitleText: subtitles[matchingSubtitleIndex].text,
        subtitle: subtitles[matchingSubtitleIndex],
        subtitleIndexByText: subtitles.findIndex(
          (subtitle) => subtitle.text === subtitles[matchingSubtitleIndex].text
        ),
        subtitles,
      });

      fetchAndPlayWavFile(
        `http://localhost:9666/synthesize/${encodeURIComponent(
          subtitles[matchingSubtitleIndex].text
        )}`,
        timeLimit
      );
    }
  });
}

function fetchAndPlayWavFile(url, timeLimit) {
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.arrayBuffer();
    })
    .then(function (buffer) {
      // Create an Audio element
      var audio = new Audio();

      // Create a Blob from the fetched data
      var blob = new Blob([buffer], { type: "audio/wav" });

      // Set the Blob as the source of the Audio element
      audio.src = URL.createObjectURL(blob);

      audio.addEventListener("loadedmetadata", function () {
        // Access the duration property of the audio element
        const duration = audio.duration;

        if (duration > timeLimit) {
          audio.playbackRate = duration / timeLimit + 0.05;
        }
        audio.play();
      });

      // Play the audio
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}
