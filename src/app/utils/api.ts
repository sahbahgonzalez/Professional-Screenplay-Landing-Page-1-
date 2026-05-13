import { projectId, publicAnonKey } from '/utils/supabase/info';

// Hard-coded values to ensure they work in the build environment
const SUPABASE_PROJECT_ID = 'xdlmzstbeqakicqhijrk';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbG16c3RiZXFha2ljcWhpanJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzYwMDUsImV4cCI6MjA4ODc1MjAwNX0.WA3FnPHIda-f5w_k6qAIhmYcc7SBV0v3Lo9smeiN110';

const API_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-9aaa8c9c`;

console.log('🔧 API Configuration:');
console.log('  Project ID:', SUPABASE_PROJECT_ID);
console.log('  API Base:', API_BASE);
console.log('  Anon Key:', SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

// Test the connection on load
(async () => {
  try {
    console.log('🔍 Testing Edge Function connection...');
    const response = await fetch(`${API_BASE}/health`, { headers });
    const data = await response.json();
    console.log('✅ Edge Function is responding:', data);
  } catch (error) {
    console.error('❌ Edge Function connection failed:', error);
  }
})();

export async function fetchContent() {
  const response = await fetch(`${API_BASE}/content`, { headers });
  if (!response.ok) throw new Error('Failed to fetch content');
  return response.json();
}

export async function updateContent(data: any) {
  const response = await fetch(`${API_BASE}/content`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update content');
  return response.json();
}

// Alias for backward compatibility
export const saveContent = updateContent;

export async function fetchSnippets() {
  const response = await fetch(`${API_BASE}/snippets`, { headers });
  if (!response.ok) throw new Error('Failed to fetch snippets');
  const data = await response.json();
  
  // Handle both formats: direct array or {snippets: [...]}
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.snippets)) {
    return data.snippets;
  } else {
    console.warn('⚠️ Unexpected snippets format:', data);
    return [];
  }
}

export async function updateSnippets(snippets: any[]) {
  const response = await fetch(`${API_BASE}/snippets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ snippets })
  });
  if (!response.ok) throw new Error('Failed to update snippets');
  return response.json();
}

// Alias for backward compatibility
export const saveSnippets = updateSnippets;

export async function fetchPitchSlides() {
  const response = await fetch(`${API_BASE}/pitch-slides`, { headers });
  if (!response.ok) throw new Error('Failed to fetch pitch slides');
  return response.json();
}

export async function updatePitchSlides(slides: any[]) {
  const response = await fetch(`${API_BASE}/pitch-slides`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ slides })
  });
  if (!response.ok) throw new Error('Failed to update pitch slides');
  return response.json();
}

// Alias for backward compatibility
export const savePitchSlides = updatePitchSlides;

export async function fetchVisualPitchSlides() {
  try {
    const response = await fetch(`${API_BASE}/visual-pitch-slides`, { headers });
    if (!response.ok) {
      console.warn('Visual pitch slides endpoint not ready yet');
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn('Visual pitch slides not available yet:', error);
    return [];
  }
}

export async function updateVisualPitchSlides(slides: any[]) {
  const response = await fetch(`${API_BASE}/visual-pitch-slides`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ slides })
  });
  if (!response.ok) throw new Error('Failed to update visual pitch slides');
  return response.json();
}

// Alias for backward compatibility
export const saveVisualPitchSlides = updateVisualPitchSlides;

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: formData
  });
  
  if (!response.ok) throw new Error('Failed to upload image');
  const data = await response.json();
  
  console.log('📦 Upload response from server:', data);
  console.log('🔗 Extracting URL:', data.url);
  console.log('✅ Returning:', data.url);
  
  // Return just the URL string
  return data.url;
}

export async function sendScriptRequest(data: { name: string; email: string; company: string; message: string }) {
  // Use the deployed /send-script-request endpoint
  console.log('📧 Sending script request to /send-script-request endpoint');
  console.log('📧 Request data:', data);
  
  const response = await fetch(`${API_BASE}/send-script-request`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      companyRole: data.company, // Map 'company' to 'companyRole' as expected by server
      reason: 'Script Request', // Default reason
      message: data.message
    })
  });
  
  // Log the raw response for debugging
  const responseText = await response.text();
  console.log('📧 Server response:', responseText);
  console.log('📧 Status:', response.status);
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse JSON response:', e);
    console.error('Response was:', responseText);
    throw new Error(`Server returned invalid response: ${responseText.substring(0, 200)}`);
  }
  
  if (!response.ok) {
    console.error('Script request failed:', result);
    throw new Error(result.error || 'Failed to send script request');
  }
  
  console.log('✅ Email sent successfully! Email ID:', result.emailId);
  return result;
}

// Visitor tracking functions
export async function trackVisit(): Promise<void> {
  try {
    await fetch(`${API_BASE}/track-visit`, {
      method: 'POST',
      headers,
    });
  } catch (error) {
    // Fail silently - visitor tracking shouldn't break the site
    console.log('Visitor tracking failed:', error);
  }
}

export async function getVisitorCount(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE}/visitor-count`, {
      headers,
    });
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Failed to get visitor count:', error);
    return 0;
  }
}

export async function resetVisitorCount(): Promise<void> {
  await fetch(`${API_BASE}/reset-visitor-count`, {
    method: 'POST',
    headers,
  });
}

export async function fetchCopyright() {
  const response = await fetch(`${API_BASE}/copyright`, { headers });
  if (!response.ok) {
    // Return default if not found
    return {
      title: "Copyright Protection",
      subtitle: "Protecting the intellectual property of \"Truth Protocol\"",
      copyrightNotice: {
        year: "2026",
        owner: "Alexandra Morrison",
        description: "\"Truth Protocol\" is an original screenplay and all associated materials, including but not limited to the story, characters, dialogue, and plot, are protected by United States and international copyright laws."
      },
      wgaRegistration: "Registration #: WGA-2026-XXXXXX",
      copyrightOfficeDate: "January 15, 2026",
      reproduction: "No part of this screenplay may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.",
      adaptationRights: "All rights for adaptation into film, television, digital media, or any other format are exclusively retained by the author. Unauthorized adaptations are strictly prohibited.",
      commercialUse: "The screenplay and all excerpts published on this website are not authorized for commercial use, public performance, or derivative works without express written consent.",
      confidentiality: "Individuals granted access to the full screenplay agree to maintain its confidentiality and not share, reproduce, or discuss its contents publicly without authorization.",
      industryProfessionals: "Industry professionals, producers, agents, and production companies interested in \"Truth Protocol\" are invited to request access to the full screenplay through our official request process.",
      ndaNotice: "Requests are reviewed on a case-by-case basis. Depending on the nature of the inquiry, a Non-Disclosure Agreement (NDA) may be required before granting access to the complete screenplay.",
      contactInfo: "For questions regarding copyright, permissions, rights acquisition, or other legal matters related to \"Truth Protocol,\" please use the Request Script form for all correspondence.",
      disclaimer: "This screenplay is a work of fiction. Any resemblance to actual persons, living or dead, or actual events is purely coincidental. The opinions and views expressed in the screenplay are those of the fictional characters and do not necessarily reflect the views of the author."
    };
  }
  return response.json();
}

export async function fetchReaderReviews() {
  try {
    const response = await fetch(`${API_BASE}/reader-reviews`, { headers });
    if (!response.ok) {
      console.warn('Reader reviews endpoint not ready yet');
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn('Reader reviews not available yet:', error);
    return [];
  }
}

export async function updateReaderReviews(reviews: any[]) {
  const response = await fetch(`${API_BASE}/reader-reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reviews })
  });
  if (!response.ok) throw new Error('Failed to update reader reviews');
  return response.json();
}

export const saveReaderReviews = updateReaderReviews;

export async function fetchProfessionalEvaluations() {
  try {
    const response = await fetch(`${API_BASE}/professional-evaluations`, { headers });
    if (!response.ok) {
      console.warn('Professional evaluations endpoint not ready yet');
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn('Professional evaluations not available yet:', error);
    return [];
  }
}

export async function updateProfessionalEvaluations(evaluations: any[]) {
  const response = await fetch(`${API_BASE}/professional-evaluations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ evaluations })
  });
  if (!response.ok) throw new Error('Failed to update professional evaluations');
  return response.json();
}

export const saveProfessionalEvaluations = updateProfessionalEvaluations;