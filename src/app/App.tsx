import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AdminProvider } from "./context/AdminContext";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { trackVisit } from "./utils/api";

export default function App() {
  // Hard-coded values to ensure they work in the build environment
  const projectId = 'xdlmzstbeqakicqhijrk';
  const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbG16c3RiZXFha2ljcWhpanJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzYwMDUsImV4cCI6MjA4ODc1MjAwNX0.WA3FnPHIda-f5w_k6qAIhmYcc7SBV0v3Lo9smeiN110';
  
  // Test Edge Function connectivity and track visitor on app load
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🔍 Testing Edge Function connection...");
        console.log("Project ID:", projectId);
        console.log("API URL:", `https://${projectId}.supabase.co/functions/v1/make-server-9aaa8c9c/health`);
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9aaa8c9c/health`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Edge Function is responding:", data);
          
          // Track visitor after confirming connection works
          trackVisit();
        } else {
          console.error("❌ Edge Function returned error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("❌ Failed to connect to Edge Function:", error);
      }
    };
    
    testConnection();
  }, []);

  console.log("🚀 App component rendering...");

  return (
    <AdminProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AdminProvider>
  );
}