import { useState, useEffect, useCallback } from "react";
import { X, Save, Trash2, Edit, Plus, Upload, FileText, Lock, GripVertical } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import * as api from "../utils/api";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableSlide } from "../components/DraggableSlide";

interface Snippet {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

interface ContentData {
  logline: string;
  synopsis: string;
  synopsisThemes: Array<{
    id: number;
    text: string;
  }>;
  authorBio: {
    name: string;
    title: string;
    intro1: string;
    intro2: string;
    photoUrl: string;
  };
  posterImage: string;
  synopsisImage: string;
  contactEmail: string;
  copyright: {
    title: string;
    subtitle: string;
    copyrightNotice: {
      year: string;
      owner: string;
      description: string;
    };
    wgaRegistration: string;
    copyrightOfficeDate: string;
    rightsStatement: string;
    ndaNotice: string;
  };
}

interface PitchDeckSlide {
  id: number;
  title: string;
  content: string;
  image?: string;
}

const defaultSnippets: Snippet[] = [];

export function Settings() {
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<"snippets" | "logline" | "synopsis" | "author" | "pitch" | "images" | "contact" | "copyright" | "readerReviews" | "profEvaluations">("snippets");
  
  // Snippets state
  const [snippetsList, setSnippetsList] = useState<Snippet[]>([]);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isAddingSnippet, setIsAddingSnippet] = useState(false);
  const [snippetForm, setSnippetForm] = useState<Snippet>({
    id: 0,
    title: "",
    excerpt: "",
    date: new Date().toISOString().split('T')[0],
    image: ""
  });

  // Content state
  const [contentData, setContentData] = useState<ContentData>({
    logline: "A investigative journalist stumbles upon a conspiracy that reaches the highest levels of government, forcing her to team up with a former intelligence agent she's been hunting for years—only to discover they're both pawns in a game far more dangerous than either imagined.",
    synopsis: `Sarah Chen is at the top of her game. A Pulitzer-winning investigative journalist for the Washington Chronicle, she's built her career on exposing corruption and holding the powerful accountable. When she receives an encrypted USB drive containing classified documents, she thinks she's onto another major story.

The documents point to a vast conspiracy involving arms deals, political assassinations, and a shadow network operating within the U.S. intelligence community. At the center of it all is a name she knows well: Marcus Kane, a former CIA operative who went rogue three years ago. Sarah has been trying to expose Kane's crimes for years, publishing article after article about his alleged activities. He's her white whale.

But when Sarah starts following the leads in the documents, people around her start dying. Her source is found dead in an apparent suicide. Her editor receives threats. Someone is watching her every move, and they'll stop at nothing to keep the truth buried.

Sarah is cornered in a parking garage by armed men when Marcus Kane appears out of nowhere to save her. He claims he's not the villain she's made him out to be—he's been investigating the same conspiracy for years, and now they're both targets. Sarah doesn't trust him, but she has no choice. They go on the run together.

As they piece together the puzzle, Sarah learns that Marcus was set up by someone inside the agency. The conspiracy goes deeper than either of them realized, involving high-ranking officials in multiple government agencies. The documents Sarah received were bait, designed to flush out both of them so they could be eliminated.

Despite their mutual distrust, Sarah and Marcus develop a grudging respect for each other. She realizes that many of the stories she wrote about him were based on planted intelligence. He was fighting the good fight all along, but she helped destroy his reputation. The guilt weighs on her as they race to stay alive.

With time running out and their enemies closing in, Sarah and Marcus discover the conspiracy's true scope: a group of powerful individuals planning a false flag operation that would justify a new war and consolidate their power. The attack is set to happen in 48 hours.

They have evidence, but no one they can trust to deliver it to. Every channel is compromised. Sarah makes the bold decision to go public, using her platform and reputation to expose everything in a live broadcast. Marcus provides security and technical support, knowing that once the truth is out, there's no going back.`,
    synopsisThemes: [
      { id: 1, text: "The cost of truth in a world of lies" },
      { id: 2, text: "Redemption and the power of second chances" },
      { id: 3, text: "The corruption of power and institutional betrayal" },
      { id: 4, text: "Trust and partnership in impossible circumstances" },
      { id: 5, text: "The role of journalism in holding power accountable" }
    ],
    authorBio: {
      name: "Alexandra Morrison",
      title: "Screenwriter | Former Investigative Journalist",
      intro1: "Alexandra Morrison brings a unique perspective to screenwriting, drawing from over fifteen years of experience as an investigative journalist. Her work has appeared in major publications including The Washington Post, The Guardian, and ProPublica, where she covered government accountability, intelligence operations, and political corruption.",
      intro2: "After winning the Pulitzer Prize for her investigative series on government surveillance programs, Alexandra transitioned to screenwriting to explore these complex themes through compelling narratives that reach wider audiences.",
      photoUrl: ""
    },
    posterImage: "",
    synopsisImage: "",
    contactEmail: "contact@example.com",
    copyright: {
      title: "Copyright Protection",
      subtitle: "Protecting the intellectual property of \"Truth Protocol\"",
      copyrightNotice: {
        year: "2026",
        owner: "Alexandra Morrison",
        description: "\"Truth Protocol\" is an original screenplay and all associated materials, including but not limited to the story, characters, dialogue, and plot, are protected by United States and international copyright laws."
      },
      wgaRegistration: "Registration #: WGA-2026-XXXXXX",
      copyrightOfficeDate: "January 15, 2026",
      rightsStatement: "No part of this screenplay may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.\n\nAll rights for adaptation into film, television, digital media, or any other format are exclusively retained by the author. Unauthorized adaptations are strictly prohibited.\n\nThe screenplay and all excerpts published on this website are not authorized for commercial use, public performance, or derivative works without express written consent.\n\nIndividuals granted access to the full screenplay agree to maintain its confidentiality and not share, reproduce, or discuss its contents publicly without authorization.",
      ndaNotice: "Requests are reviewed on a case-by-case basis. Depending on the nature of the inquiry, a Non-Disclosure Agreement (NDA) may be required before granting access to the complete screenplay."
    }
  });

  // Pitch deck state
  const [pitchSlides, setPitchSlides] = useState<PitchDeckSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<PitchDeckSlide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [slideForm, setSlideForm] = useState<PitchDeckSlide>({ id: 0, title: "", content: "" });

  // Visual pitch deck state
  const [pitchDeckMode, setPitchDeckMode] = useState<"text" | "visual">("text");
  const [visualPitchSlides, setVisualPitchSlides] = useState<Array<{ id: number; imageUrl: string; caption?: string }>>([]);
  const [editingVisualSlide, setEditingVisualSlide] = useState<{ id: number; imageUrl: string; caption?: string } | null>(null);
  const [isAddingVisualSlide, setIsAddingVisualSlide] = useState(false);
  const [visualSlideForm, setVisualSlideForm] = useState<{ id: number; imageUrl: string; caption?: string }>({ id: 0, imageUrl: "", caption: "" });
  const [isUploadingVisualSlideImage, setIsUploadingVisualSlideImage] = useState(false);

  // Reader reviews state
  const [readerReviews, setReaderReviews] = useState<Array<{ id: number; readerName: string; rating: number; review: string; date: string }>>([]);
  const [editingReview, setEditingReview] = useState<{ id: number; readerName: string; rating: number; review: string; date: string } | null>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState<{ id: number; readerName: string; rating: number; review: string; date: string }>({ id: 0, readerName: "", rating: 5, review: "", date: new Date().toISOString().split('T')[0] });

  // Professional evaluations state
  const [profEvaluations, setProfEvaluations] = useState<Array<{ id: number; evaluatorName: string; evaluatorTitle: string; company: string; evaluation: string; date: string }>>([]);
  const [editingEvaluation, setEditingEvaluation] = useState<{ id: number; evaluatorName: string; evaluatorTitle: string; company: string; evaluation: string; date: string } | null>(null);
  const [isAddingEvaluation, setIsAddingEvaluation] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState<{ id: number; evaluatorName: string; evaluatorTitle: string; company: string; evaluation: string; date: string }>({ id: 0, evaluatorName: "", evaluatorTitle: "", company: "", evaluation: "", date: new Date().toISOString().split('T')[0] });

  // Career highlights state
  const [editingHighlight, setEditingHighlight] = useState<{ id: number; title: string; description: string } | null>(null);
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [highlightForm, setHighlightForm] = useState<{ id: number; title: string; description: string }>({ id: 0, title: "", description: "" });

  // Synopsis themes state
  const [editingTheme, setEditingTheme] = useState<{ id: number; text: string } | null>(null);
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [themeForm, setThemeForm] = useState<{ id: number; text: string }>({ id: 0, text: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAuthorPhoto, setIsUploadingAuthorPhoto] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingSynopsisImage, setIsUploadingSynopsisImage] = useState(false);
  const [isUploadingSnippetImage, setIsUploadingSnippetImage] = useState(false);
  const [isUploadingSlideImage, setIsUploadingSlideImage] = useState(false);

  // Visitor count state
  const [visitorCount, setVisitorCount] = useState<number>(0);

  const navigate = useNavigate();

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [content, snippets, slides, visualSlides, count, reviews, evaluations] = await Promise.all([
          api.fetchContent(),
          api.fetchSnippets(),
          api.fetchPitchSlides(),
          api.fetchVisualPitchSlides(),
          api.getVisitorCount(),
          api.fetchReaderReviews(),
          api.fetchProfessionalEvaluations()
        ]);
        
        setVisitorCount(count);
        
        console.log('Settings: Raw content from API:', content);
        
        // Normalize and fix data structure if corrupted
        // Extract genre, format, length from authorBio if stored there
        const authorBioData = typeof content.authorBio === 'object' && content.authorBio !== null && !Array.isArray(content.authorBio) && typeof content.authorBio.name === 'string' 
          ? content.authorBio 
          : (typeof content.posterImage === 'object' ? content.posterImage : {
              name: "Alexandra Morrison",
              title: "Screenwriter | Former Investigative Journalist",
              intro1: "",
              intro2: "",
              photoUrl: typeof content.authorBio === 'string' ? content.authorBio : "",
              careerHighlights: [],
              professionalBackground: { paragraph1: "", paragraph2: "", paragraph3: "" },
              inspiration: { paragraph1: "", paragraph2: "", paragraph3: "" }
            });
        
        const normalizedContent: ContentData = {
          logline: typeof content.logline === 'string' ? content.logline : '',
          synopsis: typeof content.synopsis === 'string' ? content.synopsis : (Array.isArray(content.synopsis) ? content.synopsis.map(s => s.content).join('\n\n') : ''),
          synopsisThemes: Array.isArray(content.synopsisThemes) ? content.synopsisThemes : [],
          authorBio: authorBioData,
          posterImage: typeof content.posterImage === 'string' ? content.posterImage : (typeof content.contactEmail === 'string' ? content.contactEmail : ''),
          synopsisImage: typeof content.synopsisImage === 'string' ? content.synopsisImage : '',
          contactEmail: typeof content.contactEmail === 'string' ? content.contactEmail : 'contact@example.com',
          copyright: content.copyright || {
            title: "Copyright Protection",
            subtitle: "Protecting the intellectual property of \"Truth Protocol\"",
            copyrightNotice: {
              year: "2026",
              owner: "Mike Surick",
              description: "\"Truth Protocol\" is an original screenplay and all associated materials, including but not limited to the story, characters, dialogue, and plot, are protected by United States and international copyright laws."
            },
            copyrightOfficeDate: "January 15, 2026",
            rightsStatement: "No part of this screenplay may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.\n\nAll rights for adaptation into film, television, digital media, or any other format are exclusively retained by the author. Unauthorized adaptations are strictly prohibited.\n\nThe screenplay and all excerpts published on this website are not authorized for commercial use, public performance, or derivative works without express written consent.\n\nIndividuals granted access to the full screenplay agree to maintain its confidentiality and not share, reproduce, or discuss its contents publicly without authorization.",
            ndaNotice: "Requests are reviewed on a case-by-case basis. Depending on the nature of the inquiry, a Non-Disclosure Agreement (NDA) may be required before granting access to the complete screenplay."
          }
        };
        
        console.log('Settings: Normalized content:', normalizedContent);
        
        setContentData(normalizedContent);
        
        // Ensure snippets is always an array
        console.log('📝 Settings: Fetched snippets:', snippets);
        console.log('📝 Settings: Is array?', Array.isArray(snippets));
        if (Array.isArray(snippets)) {
          setSnippetsList(snippets);
        } else {
          console.warn('⚠️ Settings: Snippets is not an array, defaulting to empty array');
          setSnippetsList([]);
        }
        
        // Ensure slides is always an array
        if (Array.isArray(slides)) {
          setPitchSlides(slides);
        } else if (slides && Array.isArray(slides.slides)) {
          setPitchSlides(slides.slides);
        } else {
          setPitchSlides([]);
        }

        // Ensure visual slides is always an array
        if (Array.isArray(visualSlides)) {
          setVisualPitchSlides(visualSlides);
        } else if (visualSlides && Array.isArray(visualSlides.slides)) {
          setVisualPitchSlides(visualSlides.slides);
        } else {
          setVisualPitchSlides([]);
        }

        // Ensure reviews is always an array
        if (Array.isArray(reviews)) {
          setReaderReviews(reviews);
        } else {
          setReaderReviews([]);
        }

        // Ensure evaluations is always an array
        if (Array.isArray(evaluations)) {
          setProfEvaluations(evaluations);
        } else {
          setProfEvaluations([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save functions
  const saveSnippets = async (newSnippets: Snippet[]) => {
    try {
      await api.saveSnippets(newSnippets);
      setSnippetsList(newSnippets);
      toast.success('Snippet saved successfully!');
    } catch (error) {
      console.error('Error saving snippets:', error);
      toast.error('Failed to save snippet');
    }
  };

  const resetCorruptedData = async () => {
    if (!confirm('Are you sure you want to reset all content data to defaults? This will clear corrupted data but you will need to re-enter your content.')) {
      return;
    }
    
    try {
      const { projectId, publicAnonKey } = await import('/utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9aaa8c9c/reset-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to reset data');
      
      toast.success('Data reset successfully! Reloading...');
      
      // Reload the page to fetch fresh defaults
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Failed to reset data');
    }
  };

  const saveContent = async (newContent: ContentData) => {
    try {
      console.log('Settings: Saving content to API:', newContent);
      
      await api.saveContent(newContent);
      console.log('Settings: Content saved successfully');
      
      setContentData(newContent);
      console.log('Settings: State updated');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('contentDataUpdated'));
      console.log('Settings: contentDataUpdated event dispatched');
      
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save changes');
    }
  };

  const savePitchSlides = async (newSlides: PitchDeckSlide[]) => {
    try {
      console.log('📤 Sending slides to API:', newSlides);
      await api.savePitchSlides(newSlides);
      setPitchSlides(newSlides);
      
      // Dispatch event to update PitchDeck page
      window.dispatchEvent(new Event('contentDataUpdated'));
      
      toast.success('Slide saved successfully!');
    } catch (error) {
      console.error('Error saving slides:', error);
      toast.error('Failed to save slide');
    }
  };

  // Snippet handlers
  const handleAddSnippet = () => {
    setSnippetForm({
      id: Math.max(...snippetsList.map(s => s.id), 0) + 1,
      title: "",
      excerpt: "",
      date: new Date().toISOString().split('T')[0],
      image: ""
    });
    setIsAddingSnippet(true);
    setEditingSnippet(null);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setSnippetForm(snippet);
    setEditingSnippet(snippet);
    setIsAddingSnippet(false);
  };

  const handleSaveSnippet = () => {
    if (isAddingSnippet) {
      const newSnippets = [snippetForm, ...snippetsList];
      saveSnippets(newSnippets);
    } else if (editingSnippet) {
      const newSnippets = snippetsList.map(s => 
        s.id === editingSnippet.id ? snippetForm : s
      );
      saveSnippets(newSnippets);
    }
    setEditingSnippet(null);
    setIsAddingSnippet(false);
  };

  const handleDeleteSnippet = (snippet: Snippet) => {
    if (confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      const newSnippets = snippetsList.filter(s => s.id !== snippet.id);
      saveSnippets(newSnippets);
    }
  };

  // Pitch slide handlers
  const handleAddSlide = () => {
    setSlideForm({
      id: Math.max(...pitchSlides.map(s => s.id), 0) + 1,
      title: "",
      content: "",
      image: ""
    });
    setIsAddingSlide(true);
    setEditingSlide(null);
  };

  const handleEditSlide = (slide: PitchDeckSlide) => {
    setSlideForm(slide);
    setEditingSlide(slide);
    setIsAddingSlide(false);
  };

  const handleSaveSlide = () => {
    console.log('💾 Saving slide with image:', slideForm.image);
    if (isAddingSlide) {
      const newSlides = [...pitchSlides, slideForm];
      console.log('💾 Adding new slide, all slides:', newSlides);
      savePitchSlides(newSlides);
    } else if (editingSlide) {
      const newSlides = pitchSlides.map(s => 
        s.id === editingSlide.id ? slideForm : s
      );
      console.log('💾 Updating slide, all slides:', newSlides);
      savePitchSlides(newSlides);
    }
    setEditingSlide(null);
    setIsAddingSlide(false);
  };

  const handleDeleteSlide = (slide: PitchDeckSlide) => {
    if (confirm(`Are you sure you want to delete the "${slide.title}" slide?`)) {
      const newSlides = pitchSlides.filter(s => s.id !== slide.id);
      savePitchSlides(newSlides);
    }
  };

  const moveTextSlide = useCallback((dragIndex: number, hoverIndex: number) => {
    const newSlides = [...pitchSlides];
    const dragSlide = newSlides[dragIndex];
    newSlides.splice(dragIndex, 1);
    newSlides.splice(hoverIndex, 0, dragSlide);
    setPitchSlides(newSlides);
  }, [pitchSlides]);

  const saveTextSlideOrder = useCallback(() => {
    savePitchSlides(pitchSlides);
  }, [pitchSlides]);

  const handleDeleteSlideImage = () => {
    setSlideForm({ ...slideForm, image: undefined });
    toast.success('Image removed');
  };

  // Visual pitch slide handlers
  const saveVisualPitchSlides = async (newSlides: Array<{ id: number; imageUrl: string; caption?: string }>) => {
    try {
      console.log('📤 Sending visual slides to API:', newSlides);
      await api.saveVisualPitchSlides(newSlides);
      setVisualPitchSlides(newSlides);
      
      // Dispatch event to update PitchDeck page
      window.dispatchEvent(new Event('contentDataUpdated'));
      toast.success('Visual pitch slides saved successfully!');
    } catch (error) {
      console.error('Error saving visual pitch slides:', error);
      toast.error('Failed to save visual pitch slides');
    }
  };

  const handleAddVisualSlide = () => {
    setVisualSlideForm({
      id: Math.max(...visualPitchSlides.map(s => s.id), 0) + 1,
      imageUrl: "",
      caption: ""
    });
    setIsAddingVisualSlide(true);
    setEditingVisualSlide(null);
  };

  const handleEditVisualSlide = (slide: { id: number; imageUrl: string; caption?: string }) => {
    setVisualSlideForm(slide);
    setEditingVisualSlide(slide);
    setIsAddingVisualSlide(false);
  };

  const handleVisualSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVisualSlideImage(true);
      console.log('📤 Uploading visual slide image...');
      const url = await api.uploadImage(file);
      console.log('✅ Visual slide image uploaded, URL:', url);
      setVisualSlideForm({ ...visualSlideForm, imageUrl: url });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading visual slide image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingVisualSlideImage(false);
    }
  };

  const handleSaveVisualSlide = () => {
    if (!visualSlideForm.imageUrl) {
      toast.error('Please upload an image for the slide');
      return;
    }

    console.log('💾 Saving visual slide:', visualSlideForm);
    if (isAddingVisualSlide) {
      const newSlides = [...visualPitchSlides, visualSlideForm];
      console.log('💾 Adding new visual slide, all slides:', newSlides);
      saveVisualPitchSlides(newSlides);
    } else if (editingVisualSlide) {
      const newSlides = visualPitchSlides.map(s => 
        s.id === editingVisualSlide.id ? visualSlideForm : s
      );
      console.log('💾 Updating visual slide, all slides:', newSlides);
      saveVisualPitchSlides(newSlides);
    }
    setEditingVisualSlide(null);
    setIsAddingVisualSlide(false);
  };

  const handleDeleteVisualSlide = (slide: { id: number; imageUrl: string; caption?: string }) => {
    if (confirm('Are you sure you want to delete this visual slide?')) {
      const newSlides = visualPitchSlides.filter(s => s.id !== slide.id);
      saveVisualPitchSlides(newSlides);
    }
  };

  const moveVisualSlide = useCallback((dragIndex: number, hoverIndex: number) => {
    const newSlides = [...visualPitchSlides];
    const dragSlide = newSlides[dragIndex];
    newSlides.splice(dragIndex, 1);
    newSlides.splice(hoverIndex, 0, dragSlide);
    setVisualPitchSlides(newSlides);
  }, [visualPitchSlides]);

  const saveVisualSlideOrder = useCallback(() => {
    saveVisualPitchSlides(visualPitchSlides);
  }, [visualPitchSlides]);

  const saveReaderReviewData = async (newReviews: Array<{ id: number; readerName: string; rating: number; review: string; date: string }>) => {
    console.log('💾 Saving reader reviews:', newReviews);
    await api.saveReaderReviews(newReviews);
    setReaderReviews(newReviews);
    console.log('✅ Reader reviews state updated');
    toast.success('Reader reviews saved successfully!');
  };

  const saveProfessionalEvaluationData = async (newEvaluations: Array<{ id: number; evaluatorName: string; evaluatorTitle: string; company: string; evaluation: string; date: string }>) => {
    console.log('💾 Saving professional evaluations:', newEvaluations);
    await api.saveProfessionalEvaluations(newEvaluations);
    setProfEvaluations(newEvaluations);
    console.log('✅ Professional evaluations state updated');
    toast.success('Professional evaluations saved successfully!');
  };

  const handleAddReview = () => {
    setReviewForm({ id: Math.max(...readerReviews.map(r => r.id), 0) + 1, readerName: "", rating: 5, review: "", date: new Date().toISOString().split('T')[0] });
    setIsAddingReview(true);
    setEditingReview(null);
  };

  const handleEditReview = (review: { id: number; readerName: string; rating: number; review: string; date: string }) => {
    setReviewForm(review);
    setEditingReview(review);
    setIsAddingReview(false);
  };

  const handleSaveReview = async () => {
    if (!reviewForm.readerName || !reviewForm.review) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newReviews = isAddingReview
      ? [...readerReviews, reviewForm]
      : readerReviews.map((review) => (review.id === reviewForm.id ? reviewForm : review));

    try {
      await saveReaderReviewData(newReviews);
      setReaderReviews(newReviews);
      setEditingReview(null);
      setIsAddingReview(false);
      setReviewForm({ id: 0, readerName: "", rating: 5, review: "", date: new Date().toISOString().split('T')[0] });
      console.log('✅ Review saved and state updated:', newReviews);
    } catch (error) {
      console.error('Failed to save review:', error);
      toast.error((error as Error).message || 'Failed to save review');
    }
  };

  const handleDeleteReview = async (review: { id: number; readerName: string; rating: number; review: string; date: string }) => {
    if (!confirm(`Are you sure you want to delete the review from ${review.readerName}?`)) {
      return;
    }

    try {
      await saveReaderReviewData(readerReviews.filter((item) => item.id !== review.id));
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error((error as Error).message || 'Failed to delete review');
    }
  };

  const handleAddEvaluation = () => {
    setEvaluationForm({ id: Math.max(...profEvaluations.map(e => e.id), 0) + 1, evaluatorName: "", evaluatorTitle: "", company: "", evaluation: "", date: new Date().toISOString().split('T')[0] });
    setIsAddingEvaluation(true);
    setEditingEvaluation(null);
  };

  const handleEditEvaluation = (evaluation: { id: number; evaluatorName: string; evaluatorTitle: string; company: string; evaluation: string; date: string }) => {
    setEvaluationForm(evaluation);
    setEditingEvaluation(evaluation);
    setIsAddingEvaluation(false);
  };

  const handleSaveEvaluation = async () => {
    if (!evaluationForm.evaluatorName || !evaluationForm.evaluation) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEvaluations = isAddingEvaluation
      ? [...profEvaluations, evaluationForm]
      : profEvaluations.map((evaluation) => (evaluation.id === evaluationForm.id ? evaluationForm : evaluation));

    try {
      await saveProfessionalEvaluationData(newEvaluations);
      setProfEvaluations(newEvaluations);
      setEditingEvaluation(null);
      setIsAddingEvaluation(false);
      setEvaluationForm({ id: 0, evaluatorName: "", evaluatorTitle: "", company: "", evaluation: "", date: new Date().toISOString().split('T')[0] });
      console.log('✅ Evaluation saved and state updated:', newEvaluations);
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      toast.error((error as Error).message || 'Failed to save evaluation');
    }
  };

  const handleDeleteEvaluation = async (evaluation: { id: number; evaluatorName: string; evaluatorTitle: string; company: string; evaluation: string; date: string }) => {
    if (!confirm(`Are you sure you want to delete the evaluation from ${evaluation.evaluatorName}?`)) {
      return;
    }

    try {
      await saveProfessionalEvaluationData(profEvaluations.filter((item) => item.id !== evaluation.id));
    } catch (error) {
      console.error('Failed to delete evaluation:', error);
      toast.error((error as Error).message || 'Failed to delete evaluation');
    }
  };

  // Career highlight handlers
  const handleAddHighlight = () => {
    setHighlightForm({
      id: Math.max(...contentData.authorBio.careerHighlights.map(h => h.id), 0) + 1,
      title: "",
      description: ""
    });
    setIsAddingHighlight(true);
    setEditingHighlight(null);
  };

  const handleEditHighlight = (highlight: { id: number; title: string; description: string }) => {
    setHighlightForm(highlight);
    setEditingHighlight(highlight);
    setIsAddingHighlight(false);
  };

  const handleSaveHighlight = () => {
    if (isAddingHighlight) {
      const newHighlights = [...contentData.authorBio.careerHighlights, highlightForm];
      const newContent = { ...contentData, authorBio: { ...contentData.authorBio, careerHighlights: newHighlights } };
      saveContent(newContent);
    } else if (editingHighlight) {
      const newHighlights = contentData.authorBio.careerHighlights.map(h => 
        h.id === editingHighlight.id ? highlightForm : h
      );
      const newContent = { ...contentData, authorBio: { ...contentData.authorBio, careerHighlights: newHighlights } };
      saveContent(newContent);
    }
    setEditingHighlight(null);
    setIsAddingHighlight(false);
  };

  const handleDeleteHighlight = (highlight: { id: number; title: string; description: string }) => {
    if (confirm(`Are you sure you want to delete the "${highlight.title}" highlight?`)) {
      const newHighlights = contentData.authorBio.careerHighlights.filter(h => h.id !== highlight.id);
      const newContent = { ...contentData, authorBio: { ...contentData.authorBio, careerHighlights: newHighlights } };
      saveContent(newContent);
    }
  };

  // Synopsis theme handlers
  const handleAddTheme = () => {
    setThemeForm({
      id: Math.max(...contentData.synopsisThemes.map(t => t.id), 0) + 1,
      text: ""
    });
    setIsAddingTheme(true);
    setEditingTheme(null);
  };

  const handleEditTheme = (theme: { id: number; text: string }) => {
    setThemeForm(theme);
    setEditingTheme(theme);
    setIsAddingTheme(false);
  };

  const handleSaveTheme = () => {
    if (isAddingTheme) {
      const newThemes = [...contentData.synopsisThemes, themeForm];
      const newContent = { ...contentData, synopsisThemes: newThemes };
      saveContent(newContent);
    } else if (editingTheme) {
      const newThemes = contentData.synopsisThemes.map(t => 
        t.id === editingTheme.id ? themeForm : t
      );
      const newContent = { ...contentData, synopsisThemes: newThemes };
      saveContent(newContent);
    }
    setEditingTheme(null);
    setIsAddingTheme(false);
  };

  const handleDeleteTheme = (theme: { id: number; text: string }) => {
    if (confirm(`Are you sure you want to delete the "${theme.text}" theme?`)) {
      const newThemes = contentData.synopsisThemes.filter(t => t.id !== theme.id);
      const newContent = { ...contentData, synopsisThemes: newThemes };
      saveContent(newContent);
    }
  };

  // Image upload handlers
  const handleAuthorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingAuthorPhoto(true);
      const url = await api.uploadImage(file);
      const newContent = { ...contentData, authorBio: { ...contentData.authorBio, photoUrl: url } };
      await saveContent(newContent);
      toast.success('Author photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading author photo:', error);
      toast.error('Failed to upload author photo');
    } finally {
      setIsUploadingAuthorPhoto(false);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingPoster(true);
      console.log('Settings: Uploading poster image...');
      const url = await api.uploadImage(file);
      console.log('Settings: Poster uploaded, URL:', url);

      const newContent = { ...contentData, posterImage: url };
      console.log('Settings: Saving content with new poster:', newContent);

      await saveContent(newContent);
      console.log('Settings: Poster image saved successfully');

      toast.success('Poster image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading poster:', error);
      toast.error('Failed to upload poster image');
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleSynopsisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingSynopsisImage(true);
      console.log('Settings: Uploading synopsis image...');
      const url = await api.uploadImage(file);
      console.log('Settings: Synopsis image uploaded, URL:', url);

      const newContent = { ...contentData, synopsisImage: url };
      console.log('Settings: Saving content with new synopsis image:', newContent);

      await saveContent(newContent);
      console.log('Settings: Synopsis image saved successfully');

      toast.success('Synopsis image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading synopsis image:', error);
      toast.error('Failed to upload synopsis image');
    } finally {
      setIsUploadingSynopsisImage(false);
    }
  };

  const handleSnippetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, snippetId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingSnippetImage(true);
      const url = await api.uploadImage(file);
      const newSnippets = snippetsList.map(s => 
        s.id === snippetId ? { ...s, image: url } : s
      );
      await saveSnippets(newSnippets);
      toast.success('Snippet image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading snippet image:', error);
      toast.error('Failed to upload snippet image');
    } finally {
      setIsUploadingSnippetImage(false);
    }
  };

  const handleSnippetImageUploadInModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingSnippetImage(true);
      const url = await api.uploadImage(file);
      setSnippetForm({ ...snippetForm, image: url });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingSnippetImage(false);
    }
  };

  const handleSlideImageUploadInModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingSlideImage(true);
      const url = await api.uploadImage(file);
      console.log('🖼️ Image uploaded, received from API:', url);
      console.log('🖼️ Type of received value:', typeof url);
      setSlideForm({ ...slideForm, image: url });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingSlideImage(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-4xl mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground text-lg">
            You must be logged in as an administrator to access the Settings page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-8 text-center">Settings</h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Manage your website content and settings
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("snippets")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "snippets" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Sneak Peeks
          </button>
          <button
            onClick={() => setActiveTab("logline")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "logline" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Logline
          </button>
          <button
            onClick={() => setActiveTab("synopsis")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "synopsis" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Synopsis
          </button>
          <button
            onClick={() => setActiveTab("author")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "author" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Author Bio
          </button>
          <button
            onClick={() => setActiveTab("pitch")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "pitch" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Pitch Deck
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "images" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "contact" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Contact Info
          </button>
          <button
            onClick={() => setActiveTab("readerReviews")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "readerReviews" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Reader Reviews
          </button>
          <button
            onClick={() => setActiveTab("profEvaluations")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "profEvaluations" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Professional Evaluations
          </button>
          <button
            onClick={() => setActiveTab("copyright")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "copyright" ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Copyright
          </button>
        </div>

        {/* Sneak Peeks Tab */}
        {activeTab === "snippets" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Sneak Peeks</h2>
              <Button onClick={handleAddSnippet}>
                <Plus className="w-4 h-4 mr-2" />
                Add Sneak Peek
              </Button>
            </div>
            <div className="space-y-4">
              {snippetsList.map((snippet) => (
                <div key={snippet.id} className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl mb-2">{snippet.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{snippet.date}</p>
                      <p className="text-foreground line-clamp-2">{snippet.excerpt}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditSnippet(snippet)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSnippet(snippet)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logline Tab */}
        {activeTab === "logline" && (
          <div>
            <h2 className="text-2xl mb-6">Edit Logline</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Logline</label>
                <textarea
                  value={contentData.logline}
                  onChange={(e) => setContentData({ ...contentData, logline: e.target.value })}
                  className="w-full p-3 border border-border bg-input-background rounded-md min-h-[150px] text-foreground"
                  placeholder="Enter the logline"
                />
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">The logline will be displayed on the Logline page.</p>
              </div>
              
              <Button onClick={() => saveContent(contentData)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Synopsis Tab */}
        {activeTab === "synopsis" && (
          <div>
            <h2 className="text-2xl mb-6">Edit Synopsis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Synopsis</label>
                <textarea
                  value={contentData.synopsis}
                  onChange={(e) => setContentData({ ...contentData, synopsis: e.target.value })}
                  className="w-full p-3 border border-border bg-input-background rounded-md min-h-[400px] text-foreground"
                  placeholder="Enter the synopsis (use blank lines to separate paragraphs)"
                />
              </div>

              {/* Synopsis Themes Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">Synopsis Themes</label>
                  <Button onClick={handleAddTheme} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Theme
                  </Button>
                </div>
                <div className="space-y-3">
                  {contentData.synopsisThemes.map((theme) => (
                    <div key={theme.id} className="p-4 border border-border rounded-lg bg-card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{theme.text}</h4>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditTheme(theme)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTheme(theme)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => saveContent(contentData)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Author Bio Tab */}
        {activeTab === "author" && (
          <div>
            <h2 className="text-2xl mb-6">Edit Author Bio</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Author Name</label>
                <input
                  type="text"
                  value={contentData.authorBio.name}
                  onChange={(e) => setContentData({ ...contentData, authorBio: { ...contentData.authorBio, name: e.target.value } })}
                  className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={contentData.authorBio.title}
                  onChange={(e) => setContentData({ ...contentData, authorBio: { ...contentData.authorBio, title: e.target.value } })}
                  className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Introduction Paragraph 1</label>
                <textarea
                  value={contentData.authorBio.intro1}
                  onChange={(e) => setContentData({ ...contentData, authorBio: { ...contentData.authorBio, intro1: e.target.value } })}
                  className="w-full p-3 border border-border bg-input-background rounded-md min-h-[100px] text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Introduction Paragraph 2</label>
                <textarea
                  value={contentData.authorBio.intro2}
                  onChange={(e) => setContentData({ ...contentData, authorBio: { ...contentData.authorBio, intro2: e.target.value } })}
                  className="w-full p-3 border border-border bg-input-background rounded-md min-h-[100px] text-foreground"
                />
              </div>

              <Button onClick={() => saveContent(contentData)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Pitch Deck Tab */}
        {activeTab === "pitch" && (
          <div>
            {/* Mode Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Pitch Deck Slides</h2>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${pitchDeckMode === "text" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  Text Slides
                </span>
                <button
                  onClick={() => setPitchDeckMode(pitchDeckMode === "text" ? "visual" : "text")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pitchDeckMode === "visual" ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pitchDeckMode === "visual" ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${pitchDeckMode === "visual" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  Visual Slides
                </span>
              </div>
            </div>

            {/* Text Slides Section */}
            {pitchDeckMode === "text" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-muted-foreground text-sm">
                    Create text-based pitch slides with titles and content. Drag to reorder.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={saveTextSlideOrder} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save Order
                    </Button>
                    <Button onClick={handleAddSlide}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text Slide
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {pitchSlides.map((slide, index) => (
                    <DraggableSlide key={slide.id} id={slide.id} index={index} moveSlide={moveTextSlide}>
                      <div className="p-4 border border-border rounded-lg bg-card">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <h3 className="text-xl mb-2">{slide.title}</h3>
                              <p className="text-foreground whitespace-pre-line">{slide.content}</p>
                              {slide.image && (
                                <img
                                  src={slide.image}
                                  alt="Slide"
                                  className="w-full h-auto max-h-48 object-contain mt-2 rounded"
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => handleEditSlide(slide)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteSlide(slide)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DraggableSlide>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Slides Section */}
            {pitchDeckMode === "visual" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-muted-foreground text-sm">
                    Create visual pitch slides with images and optional captions. Drag to reorder.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={saveVisualSlideOrder} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save Order
                    </Button>
                    <Button onClick={handleAddVisualSlide}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Visual Slide
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {visualPitchSlides.map((slide, index) => (
                    <DraggableSlide key={slide.id} id={slide.id} index={index} moveSlide={moveVisualSlide}>
                      <div className="p-4 border border-border rounded-lg bg-card">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              {slide.imageUrl && (
                                <img
                                  src={slide.imageUrl}
                                  alt="Visual slide"
                                  className="w-full h-auto max-h-64 object-contain mb-2 rounded"
                                />
                              )}
                              {slide.caption && (
                                <p className="text-sm text-muted-foreground">{slide.caption}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditVisualSlide(slide)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteVisualSlide(slide)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DraggableSlide>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Images</h2>
              <Button 
                onClick={resetCorruptedData}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Corrupted Data
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Author Photo</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleAuthorPhotoUpload}
                      className="hidden"
                      id="author-photo-upload"
                      disabled={isUploadingAuthorPhoto}
                    />
                    <label
                      htmlFor="author-photo-upload"
                      className={`cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                        isUploadingAuthorPhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploadingAuthorPhoto ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      Accepts .jpg and .png files (max 5MB)
                    </span>
                  </div>
                  {contentData.authorBio.photoUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Current Photo:</p>
                      <img 
                        src={contentData.authorBio.photoUrl} 
                        alt="Author preview" 
                        className="w-48 h-48 object-cover rounded-lg border border-border" 
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Poster Image</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handlePosterUpload}
                      className="hidden"
                      id="poster-upload"
                      disabled={isUploadingPoster}
                    />
                    <label
                      htmlFor="poster-upload"
                      className={`cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                        isUploadingPoster ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploadingPoster ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      Accepts .jpg and .png files (max 5MB)
                    </span>
                  </div>
                  {contentData.posterImage && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Current Poster:</p>
                      <img
                        src={contentData.posterImage}
                        alt="Poster preview"
                        className="w-64 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Synopsis Page Image</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleSynopsisImageUpload}
                      className="hidden"
                      id="synopsis-image-upload"
                      disabled={isUploadingSynopsisImage}
                    />
                    <label
                      htmlFor="synopsis-image-upload"
                      className={`cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                        isUploadingSynopsisImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploadingSynopsisImage ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      Accepts .jpg and .png files (max 5MB)
                    </span>
                  </div>
                  {contentData.synopsisImage && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Current Synopsis Image:</p>
                      <img
                        src={contentData.synopsisImage}
                        alt="Synopsis preview"
                        className="w-full h-64 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === "contact" && (
          <div>
            <h2 className="text-2xl mb-6">Edit Contact Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <input
                  type="email"
                  value={contentData.contactEmail}
                  onChange={(e) => setContentData({ ...contentData, contactEmail: e.target.value })}
                  className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  placeholder="contact@example.com"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This email will be used for script requests and general inquiries.
                </p>
              </div>

              {/* Visitor Counter */}
              <div className="bg-muted/30 p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📊 Visitor Statistics
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-primary">{visitorCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Visits</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to reset the visitor count to 0?')) {
                        await api.resetVisitorCount();
                        setVisitorCount(0);
                        toast.success('Visitor count has been reset');
                      }
                    }}
                  >
                    Reset Counter
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  This counter tracks unique page loads. It increments each time someone visits the site.
                </p>
              </div>

              <Button onClick={() => saveContent(contentData)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Reader Reviews Tab */}
        {activeTab === "readerReviews" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Reader Reviews</h2>
              <Button onClick={handleAddReview}>
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </div>

            <div className="space-y-4">
              {readerReviews.length === 0 ? (
                <div className="p-6 rounded-lg border border-border bg-card text-muted-foreground">
                  No reader reviews have been added yet.
                </div>
              ) : (
                readerReviews.map((review) => (
                  <div key={review.id} className="p-4 border border-border rounded-lg bg-card">
                    <div className="flex justify-between gap-4 items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          <span className="font-semibold">{review.readerName}</span>
                          <span className="text-sm text-muted-foreground">Rating: {review.rating}/5</span>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-line">{review.review}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteReview(review)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 p-6 border border-border rounded-lg bg-card">
              <h3 className="text-xl mb-4">{editingReview ? "Edit Review" : "Add Review"}</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reader Name</label>
                  <input
                    type="text"
                    value={reviewForm.readerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, readerName: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={reviewForm.date}
                    onChange={(e) => setReviewForm({ ...reviewForm, date: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <textarea
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md min-h-[140px] text-foreground"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveReview}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Review
                  </Button>
                  {(editingReview || isAddingReview) && (
                    <Button variant="outline" onClick={() => {
                      setEditingReview(null);
                      setIsAddingReview(false);
                      setReviewForm({ id: 0, readerName: "", rating: 5, review: "", date: new Date().toISOString().split('T')[0] });
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Evaluations Tab */}
        {activeTab === "profEvaluations" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Manage Professional Evaluations</h2>
              <Button onClick={handleAddEvaluation}>
                <Plus className="w-4 h-4 mr-2" />
                Add Evaluation
              </Button>
            </div>

            <div className="space-y-4">
              {profEvaluations.length === 0 ? (
                <div className="p-6 rounded-lg border border-border bg-card text-muted-foreground">
                  No professional evaluations have been added yet.
                </div>
              ) : (
                profEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="p-4 border border-border rounded-lg bg-card">
                    <div className="flex justify-between gap-4 items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          <span className="font-semibold">{evaluation.evaluatorName}</span>
                          <span className="text-sm text-muted-foreground">{evaluation.evaluatorTitle}</span>
                          <span className="text-sm text-muted-foreground">{evaluation.company}</span>
                          <span className="text-sm text-muted-foreground">{evaluation.date}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-line">{evaluation.evaluation}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditEvaluation(evaluation)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvaluation(evaluation)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 p-6 border border-border rounded-lg bg-card">
              <h3 className="text-xl mb-4">{editingEvaluation ? "Edit Evaluation" : "Add Evaluation"}</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Evaluator Name</label>
                  <input
                    type="text"
                    value={evaluationForm.evaluatorName}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluatorName: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Evaluator Title</label>
                  <input
                    type="text"
                    value={evaluationForm.evaluatorTitle}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluatorTitle: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={evaluationForm.company}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, company: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={evaluationForm.date}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, date: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Evaluation</label>
                  <textarea
                    value={evaluationForm.evaluation}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluation: e.target.value })}
                    className="w-full p-3 border border-border bg-input-background rounded-md min-h-[140px] text-foreground"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveEvaluation}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Evaluation
                  </Button>
                  {(editingEvaluation || isAddingEvaluation) && (
                    <Button variant="outline" onClick={() => {
                      setEditingEvaluation(null);
                      setIsAddingEvaluation(false);
                      setEvaluationForm({ id: 0, evaluatorName: "", evaluatorTitle: "", company: "", evaluation: "", date: new Date().toISOString().split('T')[0] });
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copyright Tab */}
        {activeTab === "copyright" && (
          <div>
            <h2 className="text-2xl mb-6">Edit Copyright Protection Content</h2>
            <div className="space-y-6">
              {/* Title and Subtitle */}
              <div>
                <label className="block text-sm font-medium mb-2">Page Title</label>
                <input
                  type="text"
                  value={contentData.copyright.title}
                  onChange={(e) => setContentData({
                    ...contentData,
                    copyright: { ...contentData.copyright, title: e.target.value }
                  })}
                  className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Page Subtitle</label>
                <input
                  type="text"
                  value={contentData.copyright.subtitle}
                  onChange={(e) => setContentData({
                    ...contentData,
                    copyright: { ...contentData.copyright, subtitle: e.target.value }
                  })}
                  className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                />
              </div>

              {/* Copyright Notice Section */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Copyright Notice</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <input
                      type="text"
                      value={contentData.copyright.copyrightNotice.year}
                      onChange={(e) => setContentData({
                        ...contentData,
                        copyright: {
                          ...contentData.copyright,
                          copyrightNotice: { ...contentData.copyright.copyrightNotice, year: e.target.value }
                        }
                      })}
                      className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Copyright Owner</label>
                    <input
                      type="text"
                      value={contentData.copyright.copyrightNotice.owner}
                      onChange={(e) => setContentData({
                        ...contentData,
                        copyright: {
                          ...contentData.copyright,
                          copyrightNotice: { ...contentData.copyright.copyrightNotice, owner: e.target.value }
                        }
                      })}
                      className="w-full p-3 border border-border bg-input-background rounded-md text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={contentData.copyright.copyrightNotice.description}
                      onChange={(e) => setContentData({
                        ...contentData,
                        copyright: {
                          ...contentData.copyright,
                          copyrightNotice: { ...contentData.copyright.copyrightNotice, description: e.target.value }
                        }
                      })}
                      className="w-full p-3 border border-border bg-input-background rounded-md text-foreground min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* NDA Notice */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">NDA Notice</h3>

                <div>
                  <textarea
                    value={contentData.copyright.ndaNotice}
                    onChange={(e) => setContentData({
                      ...contentData,
                      copyright: { ...contentData.copyright, ndaNotice: e.target.value }
                    })}
                    className="w-full p-3 border border-border bg-input-background rounded-md text-foreground min-h-[100px]"
                    placeholder="Enter NDA notice..."
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div>
                <label className="block text-sm font-medium mb-2">Disclaimer</label>
                <textarea
                  value={contentData.copyright.disclaimer}
                  onChange={(e) => setContentData({
                    ...contentData,
                    copyright: { ...contentData.copyright, disclaimer: e.target.value }
                  })}
                  className="w-full p-3 border border-border bg-input-background rounded-md text-foreground min-h-[100px]"
                />
              </div>

              <Button onClick={() => saveContent(contentData)}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Snippet Edit Modal */}
      {(editingSnippet || isAddingSnippet) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setEditingSnippet(null);
              setIsAddingSnippet(false);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-2xl font-semibold">
                  {isAddingSnippet ? "Add New Sneak Peek" : "Edit Sneak Peek"}
                </h3>
                <button
                  onClick={() => {
                    setEditingSnippet(null);
                    setIsAddingSnippet(false);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={snippetForm.title}
                    onChange={(e) => setSnippetForm({ ...snippetForm, title: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="Enter snippet title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={snippetForm.date}
                    onChange={(e) => setSnippetForm({ ...snippetForm, date: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Snippet Image (optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleSnippetImageUploadInModal}
                        className="hidden"
                        id="snippet-image-modal-upload"
                        disabled={isUploadingSnippetImage}
                      />
                      <label
                        htmlFor="snippet-image-modal-upload"
                        className={`cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                          isUploadingSnippetImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploadingSnippetImage ? 'Uploading...' : 'Choose Image'}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        Accepts .jpg and .png files (max 5MB)
                      </span>
                    </div>
                    {snippetForm.image && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                        <img 
                          src={snippetForm.image} 
                          alt="Snippet preview" 
                          className="w-48 h-32 object-cover rounded-lg border border-border" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <textarea
                    value={snippetForm.excerpt}
                    onChange={(e) => setSnippetForm({ ...snippetForm, excerpt: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md min-h-[200px] text-foreground"
                    placeholder="Enter the excerpt text"
                  />
                </div>
              </div>
              <div className="flex gap-2 p-6 border-t border-border">
                <Button onClick={handleSaveSnippet} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditingSnippet(null);
                    setIsAddingSnippet(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pitch Slide Edit Modal */}
      {(editingSlide || isAddingSlide) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setEditingSlide(null);
              setIsAddingSlide(false);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-2xl font-semibold">
                  {isAddingSlide ? "Add New Slide" : "Edit Slide"}
                </h3>
                <button
                  onClick={() => {
                    setEditingSlide(null);
                    setIsAddingSlide(false);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={slideForm.title}
                    onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="Enter slide title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slide Image (optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleSlideImageUploadInModal}
                        className="hidden"
                        id="slide-image-modal-upload"
                        disabled={isUploadingSlideImage}
                      />
                      <label
                        htmlFor="slide-image-modal-upload"
                        className={`cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                          isUploadingSlideImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploadingSlideImage ? 'Uploading...' : 'Choose Image'}
                      </label>
                      {slideForm.image && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteSlideImage}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Image
                        </Button>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Accepts .jpg and .png files (max 5MB)
                      </span>
                    </div>
                    {slideForm.image && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                        <img
                          src={slideForm.image}
                          alt="Slide preview"
                          className="w-full h-48 object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={slideForm.content}
                    onChange={(e) => setSlideForm({ ...slideForm, content: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md min-h-[200px] text-foreground"
                    placeholder="Enter the slide content (use line breaks for bullet points)"
                  />
                </div>
              </div>
              <div className="flex gap-2 p-6 border-t border-border">
                <Button onClick={handleSaveSlide} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditingSlide(null);
                    setIsAddingSlide(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Visual Pitch Slide Edit Modal */}
      {(editingVisualSlide || isAddingVisualSlide) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setEditingVisualSlide(null);
              setIsAddingVisualSlide(false);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-2xl font-semibold">
                  {isAddingVisualSlide ? "Add New Visual Slide" : "Edit Visual Slide"}
                </h3>
                <button
                  onClick={() => {
                    setEditingVisualSlide(null);
                    setIsAddingVisualSlide(false);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Slide Image (required)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleVisualSlideImageUpload}
                        className="hidden"
                        id="visual-slide-image-upload"
                        disabled={isUploadingVisualSlideImage}
                      />
                      <label
                        htmlFor="visual-slide-image-upload"
                        className={`cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                          isUploadingVisualSlideImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploadingVisualSlideImage ? 'Uploading...' : 'Choose Image'}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        Accepts .jpg and .png files (max 5MB)
                      </span>
                    </div>
                    {visualSlideForm.imageUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                        <img 
                          src={visualSlideForm.imageUrl} 
                          alt="Visual slide preview" 
                          className="w-full h-auto max-h-96 object-contain rounded-lg border border-border" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Caption (optional)</label>
                  <input
                    type="text"
                    value={visualSlideForm.caption || ""}
                    onChange={(e) => setVisualSlideForm({ ...visualSlideForm, caption: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="Enter an optional caption for this slide"
                  />
                </div>
              </div>
              <div className="flex gap-2 p-6 border-t border-border">
                <Button onClick={handleSaveVisualSlide} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditingVisualSlide(null);
                    setIsAddingVisualSlide(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Career Highlight Edit Modal */}
      {(editingHighlight || isAddingHighlight) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setEditingHighlight(null);
              setIsAddingHighlight(false);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-2xl font-semibold">
                  {isAddingHighlight ? "Add New Highlight" : "Edit Highlight"}
                </h3>
                <button
                  onClick={() => {
                    setEditingHighlight(null);
                    setIsAddingHighlight(false);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={highlightForm.title}
                    onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="Enter highlight title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={highlightForm.description}
                    onChange={(e) => setHighlightForm({ ...highlightForm, description: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md min-h-[200px] text-foreground"
                    placeholder="Enter the highlight description"
                  />
                </div>
              </div>
              <div className="flex gap-2 p-6 border-t border-border">
                <Button onClick={handleSaveHighlight} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditingHighlight(null);
                    setIsAddingHighlight(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Synopsis Theme Edit Modal */}
      {(editingTheme || isAddingTheme) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setEditingTheme(null);
              setIsAddingTheme(false);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-2xl font-semibold">
                  {isAddingTheme ? "Add New Theme" : "Edit Theme"}
                </h3>
                <button
                  onClick={() => {
                    setEditingTheme(null);
                    setIsAddingTheme(false);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme Text</label>
                  <input
                    type="text"
                    value={themeForm.text}
                    onChange={(e) => setThemeForm({ ...themeForm, text: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="Enter theme text"
                  />
                </div>
              </div>
              <div className="flex gap-2 p-6 border-t border-border">
                <Button onClick={handleSaveTheme} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditingTheme(null);
                    setIsAddingTheme(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </DndProvider>
  );
}