import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowRight, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "../utils/api";

export function Home() {
  // Default poster - will be replaced when uploaded via Settings
  const [logline, setLogline] = useState("");
  const [authorPhoto, setAuthorPhoto] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [latestSnippet, setLatestSnippet] = useState<any>(null);
  const [authorName, setAuthorName] = useState("Alexandra Morrison");
  const [authorIntro, setAuthorIntro] = useState("Alexandra Morrison is an award-winning screenwriter and former investigative journalist with over fifteen years of experience in uncovering stories that matter. Her unique background gives her an insider's perspective on the world of journalism and intelligence that infuses every page of this screenplay.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load content from Supabase
    const loadContent = async () => {
      try {
        console.log('🏠 Home: Starting to load content...');
        const [content, snippets] = await Promise.all([
          api.fetchContent(),
          api.fetchSnippets()
        ]);
        console.log('🏠 Home: Loaded content:', content);
        console.log('🏠 Home: Loaded snippets:', snippets);
        console.log('🏠 Home: Poster image URL:', content.posterImage);
        console.log('🏠 Home: Poster image type:', typeof content.posterImage);
        
        setLogline(content.logline);
        
        // Handle authorBio - might be corrupted as a string
        if (typeof content.authorBio === 'object' && content.authorBio !== null) {
          setAuthorPhoto(content.authorBio.photoUrl || '');
          setAuthorName(content.authorBio.name || '');
          setAuthorIntro(content.authorBio.intro1 || '');
        } else {
          console.warn('🏠 Home: authorBio is not an object, using defaults');
          setAuthorPhoto('');
          setAuthorName('');
          setAuthorIntro('');
        }
        
        // Handle posterImage - might be corrupted as an object, try contactEmail field as fallback
        let posterImageUrl = '';
        if (typeof content.posterImage === 'string') {
          posterImageUrl = content.posterImage;
        } else if (typeof content.contactEmail === 'string' && content.contactEmail.includes('supabase.co')) {
          // Data is rotated - posterImage is in contactEmail field
          console.warn('🏠 Home: posterImage corrupted, using contactEmail field');
          posterImageUrl = content.contactEmail;
        }
        
        if (posterImageUrl && posterImageUrl.trim() !== '') {
          console.log('🏠 Home: Setting poster URL to:', posterImageUrl);
          setPosterUrl(posterImageUrl);
        } else {
          console.log('🏠 Home: No poster image found, using default');
        }
        
        if (snippets && snippets.length > 0) {
          setLatestSnippet(snippets[0]);
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    // Listen for content updates from Settings
    const handleContentUpdate = () => {
      console.log('Home: Content updated event received, reloading...');
      loadContent();
    };

    window.addEventListener('contentDataUpdated', handleContentUpdate);

    return () => {
      window.removeEventListener('contentDataUpdated', handleContentUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden bg-black py-4 min-h-[770px] h-screen">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="text-primary text-2xl">Loading...</div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              {posterUrl && (
                <img
                  key={posterUrl}
                  src={posterUrl}
                  alt="Truth Protocol Movie Poster"
                  className="h-full w-auto object-contain"
                  style={{
                    maskImage: 'radial-gradient(ellipse 89% 94% at 50% 50%, black 74%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 89% 94% at 50% 50%, black 74%, transparent 100%)',
                  }}
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* Logline Preview */}
      <section className="py-16 px-4 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-6 text-primary">The Logline</h2>
          <p className="text-xl text-foreground mb-6">
            {logline}
          </p>
          <Link to="/logline">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Read More <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Story Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-6 text-center">The Story</h2>
          <p className="text-lg text-foreground mb-6 leading-relaxed">
            Michael R. Riley is a decorated Special Forces veteran trying to live a quiet life with his wife, Michele, in small-town Ohio when a car accident lands him in the hospital where he is mistakenly identified as a participant in the government's "Truth Protocol," a program that reveals the full scope of humanity's hidden history, conspiracies, and predicted extinction to volunteers moments before medically assisted death.
          </p>
          <div className="text-center">
            <Link to="/synopsis">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Full Synopsis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Excerpt Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-8 text-center">Latest Excerpt</h2>
          <Card className="overflow-hidden">
            {latestSnippet && latestSnippet.image && (
              <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url('${latestSnippet.image}')` }} />
            )}
            <div className="p-6">
              {latestSnippet ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl">{latestSnippet.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(latestSnippet.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-foreground mb-4">
                    {latestSnippet.excerpt.length > 200
                      ? latestSnippet.excerpt.substring(0, 200) + '...'
                      : latestSnippet.excerpt}
                  </p>
                </>
              ) : (
                <p className="text-foreground mb-4 text-center">
                  No excerpts available yet. Check back soon!
                </p>
              )}
              <Link to="/snippets">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  View All Excerpts <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Author Preview */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-8 text-center">About the Author</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src={authorPhoto}
                alt="Author"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div>
              <p className="text-lg text-foreground mb-4 leading-relaxed">
                {authorIntro}
              </p>
              <Link to="/author">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Full Biography <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Script Request CTA */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Interested in the Full Script?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Industry professionals and producers can request the complete screenplay.
          </p>
          <Link to="/request-script">
            <Button size="lg" className="bg-primary text-white hover:bg-accent">
              <Mail className="w-4 h-4 mr-2" />
              Request the Script
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}