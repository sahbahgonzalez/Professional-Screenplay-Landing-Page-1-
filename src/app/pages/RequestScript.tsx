import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { CheckCircle, Mail, Shield, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import * as api from "../utils/api";

export function RequestScript() {
  const [submitted, setSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState("contact@truthprotocol.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyRole: "",
    reason: "",
    message: "",
  });

  // Check if contact email is the testing email
  const isTestingEmail = contactEmail === "Mikesurick@gmail.com";
  const showDomainWarning = !isTestingEmail;

  useEffect(() => {
    const loadContactEmail = async () => {
      try {
        const content = await api.fetchContent();
        setContactEmail(content.contactEmail);
      } catch (error) {
        console.error('Error loading contact email:', error);
      }
    };

    loadContactEmail();

    window.addEventListener('contentDataUpdated', loadContactEmail);

    return () => {
      window.removeEventListener('contentDataUpdated', loadContactEmail);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsDomainError(false);
    
    try {
      // Map formData to match server expectations
      const requestData = {
        name: formData.name,
        email: formData.email,
        company: formData.companyRole, // Map companyRole to company
        message: formData.message
      };
      
      console.log('📧 Sending script request:', requestData);
      await api.sendScriptRequest(requestData);
      console.log("✅ Script request sent successfully to:", contactEmail);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send script request:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send request. Please try again.";
      
      // Check if it's a domain verification or contact email error
      if (errorMessage.includes('domain verification') || 
          errorMessage.includes('verify a domain') ||
          errorMessage.includes('Contact email must be set to')) {
        setIsDomainError(true);
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-3xl mb-4">Request Submitted!</h1>
            <p className="text-lg text-foreground mb-6">
              Thank you for your interest in "Truth Protocol." Your request has been
              received and will be reviewed shortly.
            </p>
            <p className="text-muted-foreground mb-8">
              You will receive a response at <strong>{formData.email}</strong> within 2-3
              business days.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another Request
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Request the Script</h1>
          <p className="text-lg text-muted-foreground">
            Industry professionals and producers can request access to the full screenplay.
          </p>
        </div>

        {/* Proactive Domain Verification Warning */}
        {showDomainWarning && (
          <Card className="p-6 mb-8 border-orange-500/50 bg-orange-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 mt-1 text-orange-500 flex-shrink-0" />
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-500">Action Required: Email Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Your contact email is currently set to <strong>{contactEmail}</strong>, but Resend can only send to <strong>Mikesurick@gmail.com</strong> in testing mode.
                </p>
                <div className="text-sm space-y-2">
                  <p className="font-medium">Choose one option to enable email functionality:</p>
                  <ol className="list-decimal ml-5 space-y-2 text-muted-foreground">
                    <li>
                      <strong>Quick Fix (Testing):</strong>{" "}
                      <Link to="/settings" className="text-primary hover:underline font-semibold">
                        Go to Settings
                      </Link>{" "}
                      and change Contact Email to <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">Mikesurick@gmail.com</code>
                    </li>
                    <li>
                      <strong>Production Solution:</strong> Verify your domain at{" "}
                      <a 
                        href="https://resend.com/domains" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                        resend.com/domains
                      </a>{" "}
                      to send to any email address (including Gmail)
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Domain Verification Warning - Shows after failed submission */}
        {isDomainError && (
          <Card className="p-6 mb-8 border-orange-500/50 bg-orange-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 mt-1 text-orange-500 flex-shrink-0" />
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-500">Email Setup Required</h3>
                <p className="text-sm text-muted-foreground">
                  The email service is in testing mode and can only send to <strong>Mikesurick@gmail.com</strong> (the Resend account email).
                </p>
                <div className="text-sm space-y-2">
                  <p className="font-medium">To fix this, you have two options:</p>
                  <ol className="list-decimal ml-5 space-y-1 text-muted-foreground">
                    <li>
                      <strong>Quick Test:</strong> Go to{" "}
                      <Link to="/settings" className="text-primary hover:underline">
                        Settings → Contact Info
                      </Link>{" "}
                      and change your contact email to <code className="bg-black/20 px-1 rounded">Mikesurick@gmail.com</code>
                    </li>
                    <li>
                      <strong>For Production:</strong> Verify your domain at{" "}
                      <a 
                        href="https://resend.com/domains" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        resend.com/domains
                      </a>{" "}
                      to send emails to any address
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold mb-2">Confidentiality</h3>
                <p className="text-sm text-muted-foreground">
                  All script requests are reviewed carefully. The screenplay is protected by
                  copyright and provided under NDA when appropriate.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 mt-1 text-primary" />
              <div>
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  Requests are typically reviewed within 2-3 business days. You will receive
                  a response via email.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Request Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="companyRole">Company / Role *</Label>
              <Input
                id="companyRole"
                name="companyRole"
                type="text"
                required
                value={formData.companyRole}
                onChange={handleChange}
                placeholder="e.g., Producer at XYZ Productions"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason for Request *</Label>
              <Input
                id="reason"
                name="reason"
                type="text"
                required
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., Interested in producing, talent attachment, etc."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="message">Additional Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any additional information you'd like to share..."
                className="mt-2 min-h-32"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>

            {error && !isDomainError && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <p className="text-sm text-muted-foreground text-center">
              By submitting this request, you agree to respect the copyright and
              confidentiality of the screenplay material.
            </p>
          </form>
        </Card>

        <div className="mt-8 text-center text-muted-foreground">
          <p>
            Questions? See our{" "}
            <Link to="/copyright" className="text-primary hover:underline">
              Copyright
            </Link>{" "}
            page for more information.
          </p>
        </div>
      </div>
    </div>
  );
}