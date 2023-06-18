console.log("Script Injected");
(function (xhr) {
  var XHR = XMLHttpRequest.prototype;
  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;
  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = new Date().toISOString();
    return open.apply(this, arguments);
  };
  XHR.setRequestHeader = function (header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };
  XHR.send = function (postData) {
    this.addEventListener("load", function () {
      var endTime = new Date().toISOString();
      var myUrl = this._url ? this._url.toLowerCase() : this._url;
      if (myUrl) {
        if (myUrl.indexOf("?o=1") !== -1 && myUrl.indexOf("/range/") === -1) {
          console.log("InterceptedL: ", myUrl);
          var responseData = this.response;
          document.dispatchEvent(
            new CustomEvent("yourCustomEvent", {
              url: myUrl,
              detail: responseData,
            })
          );
        }
      }
    });
    return send.apply(this, arguments);
  };
})(XMLHttpRequest);
