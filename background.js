browser.action.onClicked.addListener((tab) => {
	browser.scripting.executeScript({
		target: { tabId: tab.id },
		function: () => {
			openSettingsModal();
		},
	});
});
