document.getElementById('revealBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: "getApplicants" }, (response) => {
    const resultDiv = document.getElementById('result');
    if (chrome.runtime.lastError) {
      resultDiv.innerText = "Please refresh the page and try again.";
    } else if (response && response.count) {
      resultDiv.innerText = `Exact applicants count: ${response.count}`;
      resultDiv.style.color = "green";
    } else {
      resultDiv.innerText = "No data found (try refreshing).";
      resultDiv.style.color = "red";
    }
  });
});