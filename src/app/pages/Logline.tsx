import { useState, useEffect } from "react";
import * as api from "../utils/api";

export function Logline() {
  const [logline, setLogline] = useState("A investigative journalist stumbles upon a conspiracy that reaches the highest levels of government, forcing her to team up with a former intelligence agent she's been hunting for years—only to discover they're both pawns in a game far more dangerous than either imagined.");

  useEffect(() => {
    const loadLogline = async () => {
      try {
        const content = await api.fetchContent();
        setLogline(content.logline);
      } catch (error) {
        console.error('Error loading logline:', error);
      }
    };

    loadLogline();

    window.addEventListener('contentDataUpdated', loadLogline);

    return () => {
      window.removeEventListener('contentDataUpdated', loadLogline);
    };
  }, []);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'Courier, "Courier New", monospace', fontSize: '12pt' }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1689163455695-9270912cdda2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBzdW5zZXQlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzczMTYzNTMzfDA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl mb-12 text-center">Logline</h1>

        <div className="bg-white shadow-lg rounded-lg p-12 flex flex-col justify-center min-h-[300px] text-black">
          <h2 className="text-3xl mb-8 text-center text-grey-800">TRUTH PROTOCOL</h2>

          <p className="text-xl md:text-2xl leading-relaxed text-black text-center" style={{ fontSize: '12pt' }}>
            {logline}
          </p>
        </div>
      </div>
    </div>
  );
}