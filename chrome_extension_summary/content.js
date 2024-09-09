chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    const pageContent = document.body.innerText;
    chrome.runtime.sendMessage({action: "summarizeContent", content: pageContent});
  } else if (request.action === "showSummary") {
    showSummaryOnPage(request.summary);
  } else if (request.action === "showError") {
    showErrorOnPage(request.error);
  }
});

function showSummaryOnPage(summary) {
  showMessageOnPage("页面摘要", summary);
}

function showErrorOnPage(error) {
  showMessageOnPage("错误", error);
}

function showMessageOnPage(title, message) {
  let messageDiv = document.getElementById('extension-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'extension-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 80%;
      overflow-y: auto;
      background-color: white;
      border: 1px solid black;
      padding: 10px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(messageDiv);
  }
  messageDiv.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
}