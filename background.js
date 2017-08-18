
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  browser.pageAction.show(tab.id);
});
