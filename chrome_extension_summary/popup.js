document.getElementById('summarize').addEventListener('click', () => {
  const resultDiv = document.getElementById('result');
  resultDiv.innerText = "正在生成摘要，请稍候...";
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "summarize"});
  });
});

document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({url: 'chrome-extension://' + chrome.runtime.id + '/options.html'});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showSummary") {
    document.getElementById('result').innerText = "摘要已生成，请查看网页上的弹出框。";
  } else if (request.action === "showError") {
    document.getElementById('result').innerText = "生成摘要失败。错误：" + request.error;
  }
});