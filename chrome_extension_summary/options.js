document.getElementById('settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const apiKey = document.getElementById('api-key').value;
  const baseUrl = document.getElementById('base-url').value;
  const language = document.getElementById('language').value;
  const prompt = document.getElementById('prompt').value;

  chrome.storage.sync.set({
    apiKey: apiKey,
    baseUrl: baseUrl,
    language: language,
    prompt: prompt
  }, () => {
    alert('设置已保存');
  });
});

// 加载保存的设置
chrome.storage.sync.get(['apiKey', 'baseUrl', 'language', 'prompt'], (result) => {
  document.getElementById('api-key').value = result.apiKey || '';
  document.getElementById('base-url').value = result.baseUrl || '';
  document.getElementById('language').value = result.language || 'zh';
  document.getElementById('prompt').value = result.prompt || '帮我总结这个网页的要点';
});