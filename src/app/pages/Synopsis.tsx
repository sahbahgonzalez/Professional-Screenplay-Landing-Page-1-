import { useEffect, useState } from "react";
import * as api from "../utils/api";

export function Synopsis() {
  const [synopsisText, setSynopsisText] = useState("");
  const [themes, setThemes] = useState<Array<{ id: number; text: string }>>([]);
  const [synopsisImage, setSynopsisImage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "One Page Synopsis - Truth Protocol";

    const loadSynopsis = async () => {
      try {
        console.log("📖 Synopsis: Loading content...");

        const content = await api.fetchContent();

        console.log("📖 Synopsis: Content loaded:", content);
        console.log(
          "📖 Synopsis: synopsisImage value:",
          content.synopsisImage
        );

        if (typeof content.synopsis === "string") {
          setSynopsisText(content.synopsis);
        } else if (Array.isArray(content.synopsis)) {
          setSynopsisText(
            content.synopsis
  .map((s: { content: string }) => s.content)
  .join("\n\n")
          );
        }

        if (Array.isArray(content.synopsisThemes)) {
          setThemes(content.synopsisThemes);
        }

        // Only use a custom image if one actually exists.
        // No fallback image will be shown.
        const imageToUse =
          typeof content.synopsisImage === "string" &&
          content.synopsisImage.trim() !== ""
            ? content.synopsisImage.trim()
            : null;

        setSynopsisImage(imageToUse);

        console.log("📖 Synopsis: Image state set to:", imageToUse);
      } catch (error) {
        console.error("Error loading synopsis:", error);
      }
    };

    void loadSynopsis();

    const handleContentDataUpdated = () => {
      void loadSynopsis();
    };

    window.addEventListener(
      "contentDataUpdated",
      handleContentDataUpdated
    );

    return () => {
      window.removeEventListener(
        "contentDataUpdated",
        handleContentDataUpdated
      );
    };
  }, []);

  return (
    <div
      className="min-h-screen py-16 px-4"
      style={{
        fontFamily: 'Courier, "Courier New", monospace',
        fontSize: "12pt",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-8 text-center">
          One Page Synopsis
        </h1>

        {synopsisImage && (
          <div className="mb-12">
            <img
              src={synopsisImage}
              alt="Synopsis artwork"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl mb-4">TRUTH PROTOCOL</h2>

          {synopsisText.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="leading-relaxed mb-6"
              style={{
                fontSize: "12pt",
                color: "#999999",
              }}
            >
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