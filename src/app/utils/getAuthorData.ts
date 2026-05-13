import * as api from './api';

export function getAuthorData() {
  // For now, return default data synchronously
  // The actual data will be loaded async in components
  return {
    name: "Alexandra Morrison",
    title: "Screenwriter | Former Investigative Journalist",
    intro1: "Alexandra Morrison brings a unique perspective to screenwriting, drawing from over fifteen years of experience as an investigative journalist. Her work has appeared in major publications including The Washington Post, The Guardian, and ProPublica, where she covered government accountability, intelligence operations, and political corruption.",
    intro2: "After winning the Pulitzer Prize for her investigative series on government surveillance programs, Alexandra transitioned to screenwriting to explore these complex themes through compelling narratives that reach wider audiences.",
    photoUrl: "https://images.unsplash.com/photo-1771894428645-4787aa167bc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzY3JlZW53cml0ZXIlMjBhdXRob3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMxNjM1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    careerHighlights: [
      { id: 1, title: "Pulitzer Prize", description: "Winner of the Pulitzer Prize for Investigative Reporting" },
      { id: 2, title: "Washington Post", description: "Published investigative series on government surveillance programs" },
      { id: 3, title: "The Guardian", description: "Covered intelligence operations and political corruption" },
      { id: 4, title: "ProPublica", description: "Contributed to major investigative projects" }
    ],
    professionalBackground: {
      paragraph1: "Alexandra Morrison has over fifteen years of experience as an investigative journalist, working for major publications such as The Washington Post, The Guardian, and ProPublica.",
      paragraph2: "Her work has focused on government accountability, intelligence operations, and political corruption, earning her the Pulitzer Prize for Investigative Reporting.",
      paragraph3: "Alexandra transitioned to screenwriting to explore these complex themes through compelling narratives that reach wider audiences."
    },
    inspiration: {
      paragraph1: "Alexandra's inspiration for her screenwriting comes from her extensive experience as an investigative journalist, where she uncovered numerous high-profile cases of corruption and abuse of power.",
      paragraph2: "She is particularly drawn to stories that highlight the struggles of whistleblowers and the lengths to which those in power will go to protect their interests.",
      paragraph3: "Alexandra aims to bring these stories to the screen, using her platform to shed light on important issues and inspire change."
    }
  };
}

// Async function to fetch from API
export async function fetchAuthorData() {
  try {
    const content = await api.fetchContent();
    console.log('API fetchContent response:', content);
    
    // Ensure authorBio is properly structured
    if (!content || !content.authorBio) {
      console.warn('No authorBio found in content, using defaults');
      return getAuthorData();
    }
    
    // Validate and normalize the data
    const authorBio = content.authorBio;
    return {
      name: authorBio.name || "Alexandra Morrison",
      title: authorBio.title || "Screenwriter | Former Investigative Journalist",
      intro1: authorBio.intro1 || "",
      intro2: authorBio.intro2 || "",
      photoUrl: authorBio.photoUrl || "https://images.unsplash.com/photo-1771894428645-4787aa167bc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzY3JlZW53cml0ZXIlMjBhdXRob3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzMxNjM1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      careerHighlights: Array.isArray(authorBio.careerHighlights) ? authorBio.careerHighlights : [],
      professionalBackground: authorBio.professionalBackground || { paragraph1: "", paragraph2: "", paragraph3: "" },
      inspiration: authorBio.inspiration || { paragraph1: "", paragraph2: "", paragraph3: "" }
    };
  } catch (error) {
    console.error('Error fetching author data:', error);
    return getAuthorData(); // Fallback to default
  }
}