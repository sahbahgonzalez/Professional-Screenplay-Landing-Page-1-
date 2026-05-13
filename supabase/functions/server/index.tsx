import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { defaultPitchSlides } from "./defaultPitchSlides.tsx";
import { defaultContent } from "./defaultContent.tsx";

// Truth Protocol Server - Edge Function
const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Create storage bucket on startup
const BUCKET_NAME = 'make-9aaa8c9c-images';
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`Storage bucket already exists: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error setting up storage bucket:', error);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9aaa8c9c/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString(), version: "3.0-no-validation" });
});

// Test endpoint
app.post("/make-server-9aaa8c9c/test", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Test endpoint received:", body);
    console.log("📧 Checking fields:", {
      hasName: !!body.name,
      hasEmail: !!body.email,
      hasCompany: !!body.company,
      hasMessage: !!body.message,
      nameValue: body.name,
      emailValue: body.email,
      companyValue: body.company,
      messageValue: body.message
    });
    
    // CHECK IF THIS IS AN EMAIL REQUEST (use /test endpoint since it's already deployed)
    if (body.name && body.email && body.company && body.message) {
      console.log("📧 EMAIL REQUEST DETECTED in /test endpoint!");
      console.log("📧 All fields present, proceeding with email...");
      
      // Get contact email from KV store
      const contactEmail = await kv.get("contactEmail");
      const recipientEmail = contactEmail || "Mikesurick@gmail.com";
      
      console.log("📧 Recipient:", recipientEmail);
      
      // Get Resend API key
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (!resendApiKey) {
        console.error("❌ No RESEND_API_KEY");
        return c.json({ error: "Email service not configured." }, 500);
      }
      
      console.log("📧 Sending to Resend API...");
      
      // Send email using Resend API
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Truth Protocol <onboarding@resend.dev>',
          to: [recipientEmail],
          reply_to: body.email,
          subject: `Script Request from ${body.name}`,
          html: `
            <h2>New Script Request for Truth Protocol</h2>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Company/Role:</strong> ${body.company}</p>
            <p><strong>Message:</strong> ${body.message}</p>
          `,
        }),
      });
      
      const emailResult = await emailResponse.json();
      console.log("📧 Resend response:", emailResult);
      
      if (!emailResponse.ok) {
        console.error("❌ Resend error:", emailResult);
        return c.json({ 
          error: `Email failed: ${emailResult.message || 'Unknown error'}`,
          details: emailResult 
        }, 500);
      }
      
      console.log("✅ Email sent!");
      return c.json({ success: true, emailId: emailResult.id });
    }
    
    // Otherwise, normal test response
    return c.json({ success: true, received: body });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Reset corrupted data endpoint
app.post("/make-server-9aaa8c9c/reset-content", async (c) => {
  try {
    console.log("Server: Resetting corrupted content data...");

    // Delete all content keys to start fresh
    await kv.mdel(["logline", "synopsis", "synopsisThemes", "authorBio", "posterImage", "synopsisImage", "contactEmail"]);

    console.log("Server: Content data reset successfully");

    return c.json({ success: true, message: "Content data has been reset to defaults" });
  } catch (error) {
    console.error("Error resetting content:", error);
    return c.json({ error: `Failed to reset content: ${error.message}` }, 500);
  }
});

// Get all content data
app.get("/make-server-9aaa8c9c/content", async (c) => {
  try {
    const keys = ["logline", "synopsis", "synopsisThemes", "authorBio", "posterImage", "synopsisImage", "contactEmail", "copyright"];
    const values = await kv.mget(keys);

    console.log("Server: Retrieved values from KV store:");
    console.log("- logline type:", typeof values[0]);
    console.log("- synopsis type:", typeof values[1], "isArray:", Array.isArray(values[1]));
    console.log("- synopsisThemes type:", typeof values[2], "isArray:", Array.isArray(values[2]));
    console.log("- authorBio type:", typeof values[3], "isObject:", typeof values[3] === 'object' && values[3] !== null);
    console.log("- posterImage type:", typeof values[4], "value:", values[4]);
    console.log("- synopsisImage type:", typeof values[5], "value:", values[5]);
    console.log("- contactEmail type:", typeof values[6], "value:", values[6]);
    console.log("- copyright type:", typeof values[7], "isObject:", typeof values[7] === 'object' && values[7] !== null);

    const content = {
      logline: values[0] || defaultContent.logline,
      synopsis: values[1] || defaultContent.synopsis,
      synopsisThemes: values[2] || defaultContent.synopsisThemes,
      authorBio: values[3] || defaultContent.authorBio,
      posterImage: values[4] || defaultContent.posterImage,
      synopsisImage: values[5] || defaultContent.synopsisImage,
      contactEmail: values[6] || defaultContent.contactEmail,
      copyright: values[7] || defaultContent.copyright
    };

    console.log("Server: Returning content with posterImage:", content.posterImage);
    console.log("Server: posterImage type in response:", typeof content.posterImage);
    console.log("Server: Returning content with synopsisImage:", content.synopsisImage);

    return c.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return c.json({ error: "Failed to fetch content" }, 500);
  }
});

// Update content data
app.post("/make-server-9aaa8c9c/content", async (c) => {
  try {
    const body = await c.req.json();

    console.log("Server: Saving content data:", {
      hasLogline: !!body.logline,
      hasSynopsis: !!body.synopsis,
      hasSynopsisThemes: !!body.synopsisThemes,
      hasAuthorBio: !!body.authorBio,
      hasPosterImage: !!body.posterImage,
      posterImageValue: body.posterImage,
      posterImageLength: body.posterImage?.length,
      hasSynopsisImage: !!body.synopsisImage,
      synopsisImageValue: body.synopsisImage,
      hasContactEmail: !!body.contactEmail,
      hasCopyright: !!body.copyright
    });

    // Save each key-value pair individually
    await kv.set("logline", body.logline);
    await kv.set("synopsis", body.synopsis);
    await kv.set("synopsisThemes", body.synopsisThemes);
    await kv.set("authorBio", body.authorBio);
    await kv.set("posterImage", body.posterImage);
    await kv.set("synopsisImage", body.synopsisImage);
    await kv.set("contactEmail", body.contactEmail);
    if (body.copyright) {
      await kv.set("copyright", body.copyright);
    }

    console.log("Server: Content saved successfully");
    console.log("Server: Saved posterImage:", body.posterImage);
    console.log("Server: Saved synopsisImage:", body.synopsisImage);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
    console.error("Error details:", error.message, error.stack);
    return c.json({ error: `Failed to save content: ${error.message}` }, 500);
  }
});

// Get all snippets
app.get("/make-server-9aaa8c9c/snippets", async (c) => {
  try {
    const snippets = await kv.get("snippets");
    return c.json(snippets || []);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return c.json({ error: "Failed to fetch snippets" }, 500);
  }
});

// Update snippets
app.post("/make-server-9aaa8c9c/snippets", async (c) => {
  try {
    const body = await c.req.json();
    
    // Handle both formats: direct array or object with snippets property
    let snippets;
    if (Array.isArray(body)) {
      snippets = body;
    } else if (body.snippets && Array.isArray(body.snippets)) {
      snippets = body.snippets;
    } else {
      console.error("Invalid snippets format:", body);
      return c.json({ error: "Invalid snippets format" }, 400);
    }
    
    await kv.set("snippets", snippets);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving snippets:", error);
    return c.json({ error: "Failed to save snippets" }, 500);
  }
});

// Get all pitch slides
app.get("/make-server-9aaa8c9c/pitch-slides", async (c) => {
  try {
    const slides = await kv.get("pitchSlides");

    // Ensure we always return an array
    if (Array.isArray(slides)) {
      return c.json(slides);
    } else if (slides && Array.isArray(slides.slides)) {
      return c.json(slides.slides);
    } else {
      return c.json(defaultPitchSlides);
    }
  } catch (error) {
    console.error("Error fetching pitch slides:", error);
    return c.json({ error: "Failed to fetch pitch slides" }, 500);
  }
});

// Update pitch slides
app.post("/make-server-9aaa8c9c/pitch-slides", async (c) => {
  try {
    const body = await c.req.json();
    
    // Extract slides from body if it's wrapped, otherwise use the body itself
    const slides = Array.isArray(body) ? body : (body.slides || body);
    
    // Ensure we're saving an array
    if (!Array.isArray(slides)) {
      return c.json({ error: "Invalid slides format - expected array" }, 400);
    }
    
    await kv.set("pitchSlides", slides);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving pitch slides:", error);
    return c.json({ error: "Failed to save pitch slides" }, 500);
  }
});

// Get visual pitch slides
app.get("/make-server-9aaa8c9c/visual-pitch-slides", async (c) => {
  try {
    const slides = await kv.get("visualPitchSlides");

    // Ensure we always return an array
    if (Array.isArray(slides)) {
      return c.json(slides);
    } else if (slides && Array.isArray(slides.slides)) {
      return c.json(slides.slides);
    } else {
      return c.json([]);
    }
  } catch (error) {
    console.error("Error fetching visual pitch slides:", error);
    return c.json({ error: "Failed to fetch visual pitch slides" }, 500);
  }
});

// Update visual pitch slides
app.post("/make-server-9aaa8c9c/visual-pitch-slides", async (c) => {
  try {
    const body = await c.req.json();

    // Extract slides from body if it's wrapped, otherwise use the body itself
    const slides = Array.isArray(body) ? body : (body.slides || body);

    // Ensure we're saving an array
    if (!Array.isArray(slides)) {
      return c.json({ error: "Invalid slides format - expected array" }, 400);
    }

    await kv.set("visualPitchSlides", slides);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving visual pitch slides:", error);
    return c.json({ error: "Failed to save visual pitch slides" }, 500);
  }
});

// Upload image endpoint
app.post("/make-server-9aaa8c9c/upload-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error("Error uploading to storage:", error);
      return c.json({ error: `Failed to upload image: ${error.message}` }, 500);
    }

    // Get signed URL (valid for 10 years)
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 315360000); // 10 years in seconds

    if (!signedUrlData?.signedUrl) {
      return c.json({ error: "Failed to create signed URL" }, 500);
    }

    console.log("Image uploaded successfully:", filePath);

    return c.json({ 
      success: true, 
      url: signedUrlData.signedUrl,
      path: filePath 
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json({ error: `Failed to upload image: ${error.message}` }, 500);
  }
});

// NEW ENDPOINT - V3 completely fresh endpoint
app.post("/make-server-9aaa8c9c/send-email-v3", async (c) => {
  try {
    const { name, email, companyRole, reason, message } = await c.req.json();
    
    // Get contact email from KV store
    const contactEmail = await kv.get("contactEmail");
    const recipientEmail = contactEmail || "Mikesurick@gmail.com";
    
    console.log("V3: Sending email to:", recipientEmail);
    console.log("V3: From requester:", name, email);
    
    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return c.json({ error: "Email service not configured." }, 500);
    }
    
    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Truth Protocol <onboarding@resend.dev>',
        to: [recipientEmail],
        reply_to: email,
        subject: `Script Request from ${name}`,
        html: `
          <h2>New Script Request for Truth Protocol</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company/Role:</strong> ${companyRole}</p>
          <p><strong>Reason for Request:</strong> ${reason}</p>
          ${message ? `<p><strong>Additional Message:</strong></p><p>${message}</p>` : ''}
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This email was sent from the Truth Protocol website.</p>
        `,
      }),
    });
    
    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      return c.json({ 
        error: `Email error: ${emailResult.message || 'Unknown error'}`,
        details: emailResult 
      }, 500);
    }
    
    console.log("V3: Email sent successfully!");
    return c.json({ success: true, emailId: emailResult.id });
  } catch (error) {
    console.error("V3 Error:", error);
    return c.json({ error: `Failed: ${error.message}` }, 500);
  }
});

// BRAND NEW ENDPOINT - March 2026 - Email sending endpoint
app.post("/make-server-9aaa8c9c/make-email-send-march-2026", async (c) => {
  try {
    const body = await c.req.json();
    console.log("📧 NEW March endpoint called with:", body);
    
    // Get contact email from KV store
    const contactEmail = await kv.get("contactEmail");
    const recipientEmail = contactEmail || "Mikesurick@gmail.com";
    
    console.log("📧 Recipient email:", recipientEmail);
    
    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error("❌ No RESEND_API_KEY found");
      return c.json({ error: "Email service not configured." }, 500);
    }
    
    console.log("📧 Calling Resend API...");
    
    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Truth Protocol <info@truthprotocolofficial.com>',
        to: [recipientEmail],
        reply_to: body.email,
        subject: `Script Request from ${body.name}`,
        html: `
          <h2>New Script Request for Truth Protocol</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Company/Role:</strong> ${body.company}</p>
          <p><strong>Message:</strong> ${body.message}</p>
        `,
      }),
    });
    
    const emailResult = await emailResponse.json();
    console.log("📧 Resend response:", emailResult);
    
    if (!emailResponse.ok) {
      console.error("❌ Resend API error:", emailResult);
      return c.json({ 
        error: `Email failed: ${emailResult.message || 'Unknown error'}`,
        details: emailResult 
      }, 500);
    }
    
    console.log("✅ Email sent successfully!");
    return c.json({ success: true, emailId: emailResult.id });
  } catch (error) {
    console.error("❌ March endpoint error:", error);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

// Send script request email endpoint
app.post("/make-server-9aaa8c9c/send-script-request", async (c) => {
  try {
    const { name, email, companyRole, reason, message } = await c.req.json();

    // Get contact email from KV store
    const contactEmail = await kv.get("contactEmail");
    const recipientEmail = contactEmail || "mikesurick@gmail.com"; // Default to your email

    console.log("📧 Server: Attempting to send script request email");
    console.log("📧 Server: Recipient (TO):", recipientEmail);
    console.log("📧 Server: Form submitter:", name, email);

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      return c.json({ error: "Email service not configured. Please add your Resend API key." }, 500);
    }

    // Send email using Resend API
    console.log("📧 Calling Resend API...");
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Truth Protocol <info@truthprotocolofficial.com>',
        to: [recipientEmail],
        reply_to: email, // Set reply-to as the requester's email
        subject: `Script Request from ${name}`,
        html: `
          <h2>New Script Request for Truth Protocol</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company/Role:</strong> ${companyRole}</p>
          <p><strong>Reason for Request:</strong> ${reason}</p>
          ${message ? `<p><strong>Additional Message:</strong></p><p>${message}</p>` : ''}
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This email was sent from the Truth Protocol website script request form.</p>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("📧 Resend API response:", emailResult);

    if (!emailResponse.ok) {
      console.error("❌ Resend API error:", emailResult);

      // Check if it's the domain verification error
      if (emailResult.statusCode === 403 && emailResult.message?.includes('verify a domain')) {
        return c.json({
          error: `Email cannot be sent with onboarding@resend.dev to ${recipientEmail}. Please verify this email address in your Resend account at https://resend.com/settings/audience or set up a custom domain at https://resend.com/domains`,
          details: emailResult,
          currentRecipient: recipientEmail
        }, 403);
      }

      return c.json({
        error: `Failed to send email: ${emailResult.message || 'Unknown error'}`,
        details: emailResult
      }, 500);
    }

    console.log("✅ Email sent successfully! Email ID:", emailResult.id);

    return c.json({ success: true, emailId: emailResult.id, recipient: recipientEmail });
  } catch (error) {
    console.error("Error sending script request email:", error);
    return c.json({ error: `Failed to send email: ${error.message}` }, 500);
  }
});

// Visitor tracking endpoints
app.post("/make-server-9aaa8c9c/track-visit", async (c) => {
  try {
    // Get current visitor count
    const currentCount = await kv.get("visitorCount") || 0;
    const newCount = currentCount + 1;

    // Increment visitor count
    await kv.set("visitorCount", newCount);

    console.log(`📊 Visitor tracked. Total visits: ${newCount}`);
    return c.json({ success: true, count: newCount });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return c.json({ error: `Failed to track visit: ${error.message}` }, 500);
  }
});

app.get("/make-server-9aaa8c9c/visitor-count", async (c) => {
  try {
    const count = await kv.get("visitorCount") || 0;
    return c.json({ count });
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return c.json({ error: `Failed to fetch visitor count: ${error.message}` }, 500);
  }
});

app.post("/make-server-9aaa8c9c/reset-visitor-count", async (c) => {
  try {
    await kv.set("visitorCount", 0);
    console.log("📊 Visitor count reset to 0");
    return c.json({ success: true, count: 0 });
  } catch (error) {
    console.error("Error resetting visitor count:", error);
    return c.json({ error: `Failed to reset visitor count: ${error.message}` }, 500);
  }
});

// Copyright endpoint
app.get("/make-server-9aaa8c9c/copyright", async (c) => {
  try {
    const copyright = await kv.get("copyright");
    if (copyright) {
      return c.json(copyright);
    }

    // Return default copyright info if not found
    return c.json({
      title: "Copyright Protection",
      subtitle: "Protecting the intellectual property of \"Truth Protocol\"",
      copyrightNotice: {
        year: "2026",
        owner: "Alexandra Morrison",
        description: "\"Truth Protocol\" is an original screenplay and all associated materials, including but not limited to the story, characters, dialogue, and plot, are protected by United States and international copyright laws."
      },
      wgaRegistration: "Registration #: WGA-2026-XXXXXX",
      copyrightOfficeDate: "January 15, 2026",
      reproduction: "No part of this screenplay may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.",
      adaptationRights: "All rights for adaptation into film, television, digital media, or any other format are exclusively retained by the author. Unauthorized adaptations are strictly prohibited.",
      commercialUse: "The screenplay and all excerpts published on this website are not authorized for commercial use, public performance, or derivative works without express written consent.",
      confidentiality: "Individuals granted access to the full screenplay agree to maintain its confidentiality and not share, reproduce, or discuss its contents publicly without authorization.",
      industryProfessionals: "Industry professionals, producers, agents, and production companies interested in \"Truth Protocol\" are invited to request access to the full screenplay through our official request process.",
      ndaNotice: "Requests are reviewed on a case-by-case basis. Depending on the nature of the inquiry, a Non-Disclosure Agreement (NDA) may be required before granting access to the complete screenplay.",
      contactInfo: "For questions regarding copyright, permissions, rights acquisition, or other legal matters related to \"Truth Protocol,\" please use the Request Script form for all correspondence.",
      disclaimer: "This screenplay is a work of fiction. Any resemblance to actual persons, living or dead, or actual events is purely coincidental. The opinions and views expressed in the screenplay are those of the fictional characters and do not necessarily reflect the views of the author."
    });
  } catch (error) {
    console.error("Error fetching copyright:", error);
    return c.json({ error: `Failed to fetch copyright: ${error.message}` }, 500);
  }
});

// Reader reviews endpoints
app.get("/make-server-9aaa8c9c/reader-reviews", async (c) => {
  try {
    const reviews = await kv.get("readerReviews");
    return c.json(reviews || []);
  } catch (error) {
    console.error("Error fetching reader reviews:", error);
    return c.json({ error: "Failed to fetch reader reviews" }, 500);
  }
});

app.post("/make-server-9aaa8c9c/reader-reviews", async (c) => {
  try {
    const body = await c.req.json();
    const reviews = Array.isArray(body) ? body : (body.reviews || body);

    if (!Array.isArray(reviews)) {
      return c.json({ error: "Invalid reviews format - expected array" }, 400);
    }

    await kv.set("readerReviews", reviews);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving reader reviews:", error);
    return c.json({ error: "Failed to save reader reviews" }, 500);
  }
});

// Professional evaluations endpoints
app.get("/make-server-9aaa8c9c/professional-evaluations", async (c) => {
  try {
    const evaluations = await kv.get("professionalEvaluations");
    return c.json(evaluations || []);
  } catch (error) {
    console.error("Error fetching professional evaluations:", error);
    return c.json({ error: "Failed to fetch professional evaluations" }, 500);
  }
});

app.post("/make-server-9aaa8c9c/professional-evaluations", async (c) => {
  try {
    const body = await c.req.json();
    const evaluations = Array.isArray(body) ? body : (body.evaluations || body);

    if (!Array.isArray(evaluations)) {
      return c.json({ error: "Invalid evaluations format - expected array" }, 400);
    }

    await kv.set("professionalEvaluations", evaluations);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving professional evaluations:", error);
    return c.json({ error: "Failed to save professional evaluations" }, 500);
  }
});

Deno.serve(app.fetch); 