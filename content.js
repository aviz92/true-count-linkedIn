chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getApplicants") {
    revealApplicants().then(count => {
      sendResponse({ count: count });
    });
    return true; // Keeps the channel open for asynchronous response
  }
});

async function revealApplicants() {
  // 1. Extract Job ID from URL
  // Supports URLs like /jobs/view/123456 and /jobs/search/?currentJobId=123456
  let jobId = null;
   
  // Attempt 1: From URL path
  const urlMatch = window.location.href.match(/jobs\/view\/(\d+)/);
  if (urlMatch) {
    jobId = urlMatch[1];
  } else {
    // Attempt 2: From URL parameters
    const params = new URLSearchParams(window.location.search);
    jobId = params.get("currentJobId");
  }

  if (!jobId) return "Job ID not found";

  try {
    // 2. Call LinkedIn Public API (Guest API)
    // credentials: 'omit' ensures we don't send your cookies, getting the public exposed page
    const response = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`, {
      credentials: 'omit' 
    });

    if (!response.ok) return "Blocked by LinkedIn";

    const text = await response.text();

    // 3. Search for the number in the public response
    // In this API, the number usually appears within specific tags
    
    // Pattern 1: Simple text
    // "num_applicants__caption">123 applicants</span>
    const match = text.match(/num_applicants__caption["'][^>]*>\s*(\d+)\s*applicants/i);
    if (match && match[1]) return match[1];

    // Pattern 2: JSON inside Guest HTML
    const jsonMatch = text.match(/"userInteractionCount":(\d+)/);
    if (jsonMatch && jsonMatch[1]) return jsonMatch[1];

    // Pattern 3: Loose search
    const looseMatch = text.match(/(\d+)\s+applicants\b/i);
    if (looseMatch && looseMatch[1]) return looseMatch[1];

    return "Hidden in public view";

  } catch (e) {
    console.error(e);
    return "Connection error";
  }
}