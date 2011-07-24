"use strict";

const {TabManager} = require("tab_manager");
const tabs = require("tabs");

let tm;

exports.setup = function() {
    tm = new TabManager();
};

exports["can create"] = function(test) {
    test.assertStrictEqual(!!tm, true, "we have a tab manager");
};

exports["each initially open tab has a session"] = function(test) {
  let success = true;
  for each(let tab in tabs) {
      success = success && !!tab.session;
  }

  test.assertStrictEqual(success, true, "all tabs have a session");
};


exports["new tabs get a session"] = function(test) {
  tabs.on("open", function(tab) {
      test.assertStrictEqual(!!tab.session, true, "new tab has a session");
      test.done();
  });
  tabs.open("http://www.mozilla.com");
  test.waitUntilDone();
};

exports["sessionsUpdate with status set to null sets session status to none"] = function(test) {
  let tab = tabs.activeTab;
  let session = tab.session;

  let status = tm.sessionsUpdate(tab, {
      sessions: null
  });

  test.assertEqual(session.status, "none", "session\'s status set to none");
  test.assertEqual(status, "none", "returned status set to none");
};

exports["sessionsUpdate with status set to undefined sets session status to none"] = function(test) {
  let tab = tabs.activeTab;
  let session = tab.session;

  tm.sessionsUpdate(tab, {
      sessions: undefined 
  });

  test.assertEqual(session.status, "none", "session\'s status set to none");
};

exports["sessionsUpdate with status set to [] sets session status to login"] = function(test) {
  let tab = tabs.activeTab;
  let session = tab.session;

  tm.sessionsUpdate(tab, {
      sessions: [] 
  });

  test.assertEqual(session.status, "login", "session\'s status set to login");
};

exports["sessionsUpdate with status set to ['idname'] sets session status to loggedin"] = function(test) {
  let tab = tabs.activeTab;
  let session = tab.session;

  tm.sessionsUpdate(tab, {
      sessions: ['idname'] 
  });

  test.assertEqual(session.status, "loggedin", "session\'s status set to loggedin");
};


