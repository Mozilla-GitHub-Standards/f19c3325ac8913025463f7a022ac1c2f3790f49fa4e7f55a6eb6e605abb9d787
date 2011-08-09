"use strict";
const {data} = require("self");
const {PageMod} = require("page-mod");
const {Helpers} = require("helpers");
const {WindowManager} = require("sessions/window_manager");
const {TabManager} = require("sessions/tab_manager");
const tabs = require("tabs");

exports.MainSession = function() {
  let windowManager = new WindowManager();
  windowManager.on("login", emitEvent.bind(null, "emitevent.login"));
  windowManager.on("logout", emitEvent.bind(null, "emitevent.logout"));
  let tabManager = new TabManager();

  let currWorker;

  let pageMod = PageMod({
      include: ["*"],
      contentScriptWhen: "start",
      contentScriptFile: data.url("sessions/page_interaction.js"),
      onAttach: function(worker) {
          // only do this if we are in a tab - jetpack panels cause
          // a worker to be created as well, but we don't want to bind
          // to them.
          if(worker.tab) {
              worker.tab.worker = worker;
              worker.port.on("sessions.set", onSessionSet.bind(worker));
              worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker));
              worker.port.on("sessions.tabready", onSessionTabReady.bind(worker));
          }
      }
  });



  function onSessionSet(data) {
      this.tab.worker = this;
      tabManager.sessionUpdate(this.tab, data);
  }


  function onSessionTabOpen(data) {
      this.tab.worker = this;
      tabManager.sessionReset(this.tab, data);
  };

  function onSessionTabReady() {
      tabManager.tabReady(this.tab);
  };

  function emitEvent(eventName) {
      let tab = tabs.activeTab;
      if(tab) {
          tab.worker.port.emit(eventName);
      }
  };

}

