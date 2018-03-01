//toggle display of the warning UI when the pageAction is clicked
chrome.browserAction.onClicked.addListener(function (tab) {

    'use strict';

    chrome.tabs.create({url: 'options.html'}, function (tab) {
        console.log("New tab launched with "+installationUrl);
    });
});
