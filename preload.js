const uris = require("./uris");

window.addEventListener("DOMContentLoaded", () => {
  for (const uri of uris) {
    document
      .getElementById("targets")
      .appendChild(document.createTextNode(uri + ', '));
  }
});
