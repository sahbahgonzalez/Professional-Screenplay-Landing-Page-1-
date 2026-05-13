import { Link, useLocation } from "react-router";
import { Film, Menu, X, Share2, Check, LogIn, LogOut, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAdmin } from "../context/AdminContext";

export function Navigation() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  // Sidebar starts open on Home page, closed on other pages
  const [sidebarOpen, setSidebarOpen] = useState(isHomePage);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  const { isAdmin, login, logout } = useAdmin();

  // Handle scroll to auto-show/hide sidebar on Home page
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Reset sidebar state when navigating between pages
  useEffect(() => {
    setSidebarOpen(isHomePage);
  }, [location.pathname, isHomePage]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = async () => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback method for when clipboard API is blocked
      try {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('Fallback copy failed');
        }
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setLoginModalOpen(false);
      setUsername("");
      setPassword("");
      setLoginError("");
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 3000);
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    setLogoutSuccess(true);
    setTimeout(() => setLogoutSuccess(false), 3000);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/logline", label: "Logline" },
    { to: "/synopsis", label: "One Page Synopsis" },
    { to: "/pitch-deck", label: "Pitch Deck" },
    { to: "/snippets", label: "Sneak Peeks" },
    { to: "/author", label: "Author" },
    { to: "/reader-reviews", label: "Reader Reviews" },
    { to: "/professional-evaluations", label: "Professional Evaluations" },
    { to: "/request-script", label: "Request Script" },
    { to: "/copyright", label: "Copyright Protection" },
    { to: "/settings", label: "Settings", adminOnly: true },
  ];

  return (
    <>
      {/* Home Button - Top Right (right of share button) */}
      <Link to="/">
        <button
          className={`fixed top-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg hover:bg-accent transition-all duration-300 ${
            sidebarOpen ? "right-[352px]" : "right-28"
          }`}
        >
          <Home className="w-6 h-6" />
        </button>
      </Link>

      {/* Share Button - Top Right (left of menu) */}
      <button
        className={`fixed top-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg hover:bg-accent transition-all duration-300 ${
          sidebarOpen ? "right-72" : "right-16"
        }`}
        onClick={() => setShareModalOpen(true)}
      >
        <Share2 className="w-6 h-6" />
      </button>

      {/* Hamburger Menu Button - Top Right */}
      {!isHomePage && (
        <button
          className="fixed top-4 right-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg hover:bg-accent transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Overlay - only on non-home pages */}
      {sidebarOpen && !isHomePage && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-black shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center gap-2 text-primary" onClick={() => setSidebarOpen(false)}>
              <Film className="w-6 h-6" />
              <span className="font-semibold">Truth Protocol</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col gap-1 px-3">
              {navLinks.map((link) => {
                const isAdminOnlyLink = link.adminOnly;
                const isDisabled = isAdminOnlyLink && !isAdmin;
                
                return isDisabled ? (
                  <div
                    key={link.to}
                    className="px-4 py-3 rounded-md text-gray-600 opacity-50 cursor-not-allowed"
                  >
                    {link.label}
                  </div>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-3 rounded-md transition-colors ${
                      location.pathname === link.to
                        ? "bg-primary text-white font-medium"
                        : "text-gray-300 hover:bg-gray-800 hover:text-primary"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Share Button */}
          <div className="p-4 border-t border-gray-800">
            <Button
              className="w-full"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Admin Login/Logout */}
          {isAdmin ? (
            <div className="p-4 border-t border-gray-800">
              <Button
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-800">
              <Button
                className="w-full"
                onClick={() => setLoginModalOpen(true)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Share Modal */}
      {shareModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setShareModalOpen(false)}
          />
          
          {/* Share Dropdown */}
          <div className="fixed top-16 right-16 z-[70] bg-white rounded-lg shadow-xl p-4 w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Share Link</h3>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setShareModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={currentUrl}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-900"
                readOnly
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Login Modal */}
      {loginModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setLoginModalOpen(false)}
          />
          
          {/* Login Dropdown */}
          <div className="fixed top-16 right-16 z-[70] bg-white rounded-lg shadow-xl p-4 w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Admin Login</h3>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setLoginModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-900"
                  placeholder="Username"
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-900"
                  placeholder="Password"
                />
              </div>
              {loginError && (
                <div className="text-red-500 text-sm mb-3">
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="text-green-500 text-sm mb-3">
                  Login successful!
                </div>
              )}
              <Button
                className="w-full"
                type="submit"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </form>
          </div>
        </>
      )}

      {/* Login Success Notification */}
      {loginSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[80] bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">Successfully logged in as Admin!</span>
        </div>
      )}

      {/* Logout Success Notification */}
      {logoutSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[80] bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">Successfully logged out!</span>
        </div>
      )}
    </>
  );
}