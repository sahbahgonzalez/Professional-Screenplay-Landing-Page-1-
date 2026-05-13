import { Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { fetchAuthorData } from "../utils/getAuthorData";

export function Author() {
  const [authorBio, setAuthorBio] = useState({
    name: "",
    title: "Screenwriter | Former Investigative Journalist",
    intro1: "",
    intro2: "",
    photoUrl: "",
    fullBio: ""
  });

  useEffect(() => {
    // Load from Supabase
    const loadAuthorData = async () => {
      try {
        const data = await fetchAuthorData();
        console.log('Fetched author data:', data);
        
        // Ensure all fields are properly structured
        const normalizedData = {
          name: data.name || "",
          title: data.title || "Screenwriter | Former Investigative Journalist",
          intro1: data.intro1 || "",
          intro2: data.intro2 || "",
          photoUrl: data.photoUrl || "",
          fullBio: data.fullBio || ""
        };
        
        setAuthorBio(normalizedData);
      } catch (error) {
        console.error('Error loading author data:', error);
      }
    };

    loadAuthorData();
    
    // Also listen for custom event when settings are saved
    window.addEventListener('contentDataUpdated', loadAuthorData);

    return () => {
      window.removeEventListener('contentDataUpdated', loadAuthorData);
    };
  }, []);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-12 text-center">About the Author</h1>

        {/* Main Bio Section - Centered */}
        <div className="flex flex-col items-center mb-16">
          <div className="max-w-md mb-8">
            <img
              src={authorBio.photoUrl}
              alt={authorBio.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="max-w-3xl text-center">
            <h2 className="text-3xl mb-4">{authorBio.name}</h2>
            <p className="text-xl text-muted-foreground mb-6">
              {authorBio.title}
            </p>
            <p className="text-lg text-foreground leading-relaxed mb-4">
              {authorBio.intro1}
            </p>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {authorBio.intro2}
            </p>
            <Link to="/request-script">
              <Button size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>

        {/* Full Biography */}
        {authorBio.fullBio && (
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed whitespace-pre-line">
                {authorBio.fullBio}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}