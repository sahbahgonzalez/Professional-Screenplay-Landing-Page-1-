import { FileText, Download, Layout, Image as ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import * as api from "../utils/api";

interface PitchSlide {
  id: number;
  title: string;
  content: string;
  image?: string;
}

interface VisualSlide {
  id: number;
  imageUrl: string;
  caption?: string;
}

export function PitchDeck() {
  const [slides, setSlides] = useState<PitchSlide[]>([]);
  const [visualSlides, setVisualSlides] = useState<VisualSlide[]>([]);
  const [mode, setMode] = useState<"text" | "visual">("text");

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const [pitchSlides, visualPitchSlides] = await Promise.all([
          api.fetchPitchSlides(),
          api.fetchVisualPitchSlides()
        ]);
        
        // Ensure we always have an array for text slides
        if (Array.isArray(pitchSlides)) {
          setSlides(pitchSlides);
        } else if (pitchSlides && Array.isArray(pitchSlides.slides)) {
          setSlides(pitchSlides.slides);
        } else {
          setSlides([]);
        }

        // Load visual slides
        if (Array.isArray(visualPitchSlides)) {
          setVisualSlides(visualPitchSlides);
        } else {
          setVisualSlides([]);
        }
      } catch (error) {
        console.error('Error loading pitch slides:', error);
        setSlides([]);
        setVisualSlides([]);
      }
    };

    loadSlides();

    window.addEventListener('contentDataUpdated', loadSlides);

    return () => {
      window.removeEventListener('contentDataUpdated', loadSlides);
    };
  }, []);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4 text-center">Pitch Deck</h1>
        
        <p className="text-center text-muted-foreground mb-8 text-lg max-w-3xl mx-auto">
          A comprehensive visual presentation of the project vision, characters, story beats, and cinematic moments.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setMode("text")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                mode === "text"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layout className="w-4 h-4" />
              Text Pitch
            </button>
            <button
              onClick={() => setMode("visual")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                mode === "visual"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Visual Pitch
            </button>
          </div>
        </div>

        {/* Text Pitch Mode */}
        {mode === "text" && (
          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex flex-col">
                  {/* Image Section */}
                  {slide.image && (
                    <div className="w-full bg-black/5">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-auto object-contain max-h-[500px]"
                      />
                    </div>
                  )}
                  
                  {/* Content Section */}
                  <div className="p-8 w-full">
                    <h3 className="text-2xl font-semibold mb-4 text-primary">
                      {slide.title}
                    </h3>
                    <div className="text-muted-foreground whitespace-pre-line text-lg leading-relaxed">
                      {slide.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {slides.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pitch slides available yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Visual Pitch Mode */}
        {mode === "visual" && (
          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {visualSlides.map((slide) => (
              <div
                key={slide.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-full bg-black">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.caption || "Visual Pitch Slide"}
                    className="w-full h-auto object-contain"
                  />
                </div>
                {slide.caption && (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground text-sm">{slide.caption}</p>
                  </div>
                )}
              </div>
            ))}

            {visualSlides.length === 0 && (
              <div className="text-center py-16">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No visual pitch slides available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}