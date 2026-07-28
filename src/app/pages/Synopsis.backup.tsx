import { useState, useEffect } from "react";
import * as api from "../utils/api";

const DEFAULT_SYNOPSIS_IMAGE = 'https://images.unsplash.com/photo-1771245784382-a4ef7873a042?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBld3JpdGVyJTIwdmludGFnZSUyMHdyaXRpbmd8ZW58MXx8fHwxNzczMTYzNTMzfDA&ixlib=rb-4.1.0&q=80&w=1080';

export function Synopsis() {
  const [synopsisText, setSynopsisText] = useState('');
  const [themes, setThemes] = useState<Array<{ id: number; text: string }>>([]);
  const [synopsisImage, setSynopsisImage] = useState(DEFAULT_SYNOPSIS_IMAGE);

  useEffect(() => {
    // Set document title for browser tab
    document.title = 'One Page Synopsis - Truth Protocol';

    // Load from Supabase
    const loadSynopsis = async () => {
      try {
        console.log('📖 Synopsis: Loading content...');
        const content = await api.fetchContent();
        console.log('📖 Synopsis: Content loaded:', content);
        console.log('📖 Synopsis: synopsisImage value:', content.synopsisImage);

        // Handle both string and array formats for backwards compatibility
        if (typeof content.synopsis === 'string') {
          setSynopsisText(content.synopsis);
        } else if (Array.isArray(content.synopsis)) {
          // Convert old array format to string
          setSynopsisText(content.synopsis.map(s => s.content).join('\\n\\n'));
        }
        // Load themes
        if (Array.isArray(content.synopsisThemes)) {
          setThemes(content.synopsisThemes);
        }
        // Load synopsis image - use custom image if available, otherwise use default
        const imageToUse = content.synopsisImage || DEFAULT_SYNOPSIS_IMAGE;
        setSynopsisImage(imageToUse);
        console.log('📖 Synopsis: Image state set to:', imageToUse);
      } catch (error) {
        console.error('Error loading synopsis:', error);
      }
    };

    loadSynopsis();

    // Also listen for custom event when settings are saved
    window.addEventListener('contentDataUpdated', loadSynopsis);

    return () => {
      window.removeEventListener('contentDataUpdated', loadSynopsis);
    };
  }, []);

  return (
    <div className="min-h-screen py-16 px-4" style={{ fontFamily: 'Courier, "Courier New", monospace', fontSize: '12pt' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-8 text-center">One Page Synopsis</h1>
        
        <div className="mb-12">
          <img
            src={synopsisImage}
            alt="Synopsis artwork"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl mb-4">TRUTH PROTOCOL</h2>
          
          {synopsisText.split('\n\n').map((paragraph, index) => (
            <p key={index} className="leading-relaxed mb-6" style={{ fontSize: '12pt', color: '#999999' }}>
              {paragraph}
            </p>
          ))}

          {themes.length > 0 && (
            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h3 className="text-2xl mb-4">Themes</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                {themes.map((theme) => (
                  <li key={theme.id}>{theme.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}