const {data} = require("self");
const {WindowListener} = require("browserid/window_listener");
const {Panel} = require("panel");
const {PageMod} = require("page-mod");
const {Cc, Ci} = require("chrome");
const {Helpers} = require("helpers");
const tabs = require("tabs");

exports.MainBrowserID = function() {
  createWindowListener();

  function createWindowListener() {
      let windowListener = new WindowListener();
      windowListener.on("windowopen", onNewWindow);
      windowListener.init();
      return windowListener;
  }

  function onNewWindow(window) {
      var pageMod = PageMod({
          include: "*",
          contentScriptWhen: "start",
          contentScriptFile: data.url("browserid/injector.js"),
          onAttach: function(worker) {
              worker.port.on("getAssertion", function(payload) {
                  createShowPanel(payload.host, worker);
              });
          }
      });
  }

  function createShowPanel(host, worker) {
      let panel = createPanel();

      panel.port.on("controllerReady", function() {
          panel.port.emit("getVerifiedEmail", {
              host: host 
          });
      });

      panel.port.on("assertionReady", emitAndHide.bind(null, "assertionReady"));
      panel.port.on("assertionFailure", emitAndHide.bind(null, "assertionFailure"));

      let el = Helpers.chrome.getElementById("identity-box-inner");
      panel.show(el);

      function emitAndHide(message, payload) {
          worker.port.emit(message, payload);
          panel.hide();
          panel.destroy();
          panel = null;
      }

      tabs.once("activate", function() {
          emitAndHide("assertionFailure", { reason: "new tab" });
      });

      return panel;
  }


  function createPanel() {
      let panel = Panel({
          contentURL: "https://browserid.org/sign_in",
          contentScriptFile: [
              data.url("browserid/channel.js")
          ],
          contentScriptWhen: "start",
          allow: { script: true },
          width: 540,
          height: 370
      });


      return panel;
  }
};

