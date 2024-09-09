const API_KEY = 'sk-xxx';
const BASE_URL = 'https://api.deepseek.com';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeContent") {
    summarizeText(request.content, sender.tab.id);
  }
  return true;  // 保持消息通道开放，以便异步发送响应
});

async function summarizeText(content, tabId) {
  try {
    console.log('Sending request to API...');
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个网页内容摘要助手。请简洁地总结给定的文本。" },
          { role: "user", content: `请总结以下内容：\n\n${content}` }
        ]
      })
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const summary = data.choices[0].message.content;

    chrome.tabs.sendMessage(tabId, { action: "showSummary", summary: summary });
  } catch (error) {
    console.error('Error in summarizeText:', error);
    let errorMessage = error.message;
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = '网络错误，请检查你的网络连接。';
    }
    chrome.tabs.sendMessage(tabId, { action: "showError", error: errorMessage });
  }
}