import { Card } from "../components/ui/card";
import { Calendar, Edit, Trash2, Plus, X } from "lucide-react";
import { Snippet } from "../data/snippets";
import { useAdmin } from "../context/AdminContext";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import * as api from "../utils/api";

export function Snippets() {
  const { isAdmin } = useAdmin();
  const [snippetsList, setSnippetsList] = useState<Snippet[]>([]);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Snippet>({
    id: 0,
    title: "",
    excerpt: "",
    date: new Date().toISOString().split('T')[0],
    image: ""
  });

  // Load snippets from Supabase
  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const snippets = await api.fetchSnippets();
        console.log('📝 Fetched snippets:', snippets);
        console.log('📝 Is array?', Array.isArray(snippets));
        
        // Ensure we always have an array
        if (Array.isArray(snippets)) {
          setSnippetsList(snippets);
        } else {
          console.warn('⚠️ Snippets is not an array, defaulting to empty array');
          setSnippetsList([]);
        }
      } catch (error) {
        console.error('Error loading snippets:', error);
        setSnippetsList([]); // Set to empty array on error
      }
    };

    loadSnippets();

    window.addEventListener('contentDataUpdated', loadSnippets);

    return () => {
      window.removeEventListener('contentDataUpdated', loadSnippets);
    };
  }, []);

  // Save snippets to Supabase
  const saveSnippets = async (newSnippets: Snippet[]) => {
    try {
      await api.saveSnippets(newSnippets);
      setSnippetsList(newSnippets);
    } catch (error) {
      console.error('Error saving snippets:', error);
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setFormData(snippet);
    setEditingSnippet(snippet);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setFormData({
      id: Math.max(...snippetsList.map(s => s.id), 0) + 1,
      title: "",
      excerpt: "",
      date: new Date().toISOString().split('T')[0],
      image: ""
    });
    setIsAddingNew(true);
    setEditingSnippet(null);
  };

  const handleSave = () => {
    if (isAddingNew) {
      // Add new snippet
      const newSnippets = [formData, ...snippetsList];
      saveSnippets(newSnippets);
    } else if (editingSnippet) {
      // Update existing snippet
      const newSnippets = snippetsList.map(s => 
        s.id === editingSnippet.id ? formData : s
      );
      saveSnippets(newSnippets);
    }
    
    setEditingSnippet(null);
    setIsAddingNew(false);
  };

  const handleDelete = (snippet: Snippet) => {
    if (confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      const newSnippets = snippetsList.filter(s => s.id !== snippet.id);
      saveSnippets(newSnippets);
    }
  };

  const handleCancel = () => {
    setEditingSnippet(null);
    setIsAddingNew(false);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4 text-center">Screenplay Excerpts</h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Selected scenes and character moments from the screenplay, showcasing the narrative's voice, tension, and emotional depth.
        </p>

        <div className="space-y-8">
          {snippetsList.map((snippet) => (
            <Card key={snippet.id} className="overflow-hidden">
              {snippet.image && (
                <div
                  className="h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url('${snippet.image}')` }}
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(snippet.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl mb-4">{snippet.title}</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{snippet.excerpt}</p>
                {isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(snippet)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(snippet)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-2">
            New excerpts are posted regularly. Check back for more scenes from the screenplay.
          </p>
          <p className="text-sm text-muted-foreground">
            Note: These excerpts are protected by copyright. See the{" "}
            <Link to="/copyright" className="text-primary hover:underline">
              Copyright page
            </Link>{" "}
            for details.
          </p>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {(editingSnippet || isAddingNew) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-2xl font-semibold">
                  {isAddingNew ? "Add New Excerpt" : "Edit Excerpt"}
                </h3>
                <button
                  onClick={handleCancel}
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="Enter excerpt title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL (optional)</label>
                  <input
                    type="text"
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md text-foreground"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full p-2 border border-border bg-input-background rounded-md min-h-[200px] text-foreground"
                    placeholder="Enter the excerpt text"
                  />
                </div>
              </div>
              <div className="flex gap-2 p-6 border-t border-border">
                <Button onClick={handleSave} className="flex-1">
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}