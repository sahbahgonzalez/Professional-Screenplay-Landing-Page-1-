import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test endpoint
app.post("/make-server-9aaa8c9c/test", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Test endpoint received:", body);
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
    await kv.mdel(["logline", "synopsis", "synopsisThemes", "authorBio", "posterImage", "contactEmail"]);
    
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
    const keys = ["logline", "synopsis", "synopsisThemes", "authorBio", "posterImage", "contactEmail"];
    const values = await kv.mget(keys);
    
    console.log("Server: Retrieved values from KV store:");
    console.log("- logline type:", typeof values[0]);
    console.log("- synopsis type:", typeof values[1], "isArray:", Array.isArray(values[1]));
    console.log("- synopsisThemes type:", typeof values[2], "isArray:", Array.isArray(values[2]));
    console.log("- authorBio type:", typeof values[3], "isObject:", typeof values[3] === 'object' && values[3] !== null);
    console.log("- posterImage type:", typeof values[4], "value:", values[4]);
    console.log("- contactEmail type:", typeof values[5], "value:", values[5]);
    
    const content = {
      logline: values[0] || "A investigative journalist stumbles upon a conspiracy that reaches the highest levels of government, forcing her to team up with a former intelligence agent she's been hunting for years—only to discover they're both pawns in a game far more dangerous than either imagined.",
      synopsis: values[1] || "Sarah Chen is at the top of her game. A Pulitzer-winning investigative journalist for the Washington Chronicle, she's built her career on exposing corruption and holding the powerful accountable. When she receives an encrypted USB drive containing classified documents, she thinks she's onto another major story.\n\nThe documents point to a vast conspiracy involving arms deals, political assassinations, and a shadow network operating within the U.S. intelligence community. At the center of it all is a name she knows well: Marcus Kane, a former CIA operative who went rogue three years ago. Sarah has been trying to expose Kane's crimes for years, publishing article after article about his alleged activities. He's her white whale.\n\nBut when Sarah starts following the leads in the documents, people around her start dying. Her source is found dead in an apparent suicide. Her editor receives threats. Someone is watching her every move, and they'll stop at nothing to keep the truth buried.\n\nSarah is cornered in a parking garage by armed men when Marcus Kane appears out of nowhere to save her. He claims he's not the villain she's made him out to be—he's been investigating the same conspiracy for years, and now they're both targets. Sarah doesn't trust him, but she has no choice. They go on the run together.\n\nAs they piece together the puzzle, Sarah learns that Marcus was set up by someone inside the agency. The conspiracy goes deeper than either of them realized, involving high-ranking officials in multiple government agencies. The documents Sarah received were bait, designed to flush out both of them so they could be eliminated.\n\nDespite their mutual distrust, Sarah and Marcus develop a grudging respect for each other. She realizes that many of the stories she wrote about him were based on planted intelligence. He was fighting the good fight all along, but she helped destroy his reputation. The guilt weighs on her as they race to stay alive.\n\nWith time running out and their enemies closing in, Sarah and Marcus discover the conspiracy's true scope: a group of powerful individuals planning a false flag operation that would justify a new war and consolidate their power. The attack is set to happen in 48 hours.\n\nThey have evidence, but no one they can trust to deliver it to. Every channel is compromised. Sarah makes the bold decision to go public, using her platform and reputation to expose everything in a live broadcast. Marcus provides security and technical support, knowing that once the truth is out, there's no going back.",
      synopsisThemes: values[2] || [
        { id: 1, text: "The cost of truth in a world of lies" },
        { id: 2, text: "Redemption and the power of second chances" },
        { id: 3, text: "The corruption of power and institutional betrayal" },
        { id: 4, text: "Trust and partnership in impossible circumstances" },
        { id: 5, text: "The role of journalism in holding power accountable" }
      ],
      authorBio: values[3] || {
        name: "Alexandra Morrison",
        title: "Screenwriter | Former Investigative Journalist",
        intro1: "Alexandra Morrison brings a unique perspective to screenwriting, drawing from over fifteen years of experience as an investigative journalist. Her work has appeared in major publications including The Washington Post, The Guardian, and ProPublica, where she covered government accountability, intelligence operations, and political corruption.",
        intro2: "After winning the Pulitzer Prize for her investigative series on government surveillance programs, Alexandra transitioned to screenwriting to explore these complex themes through compelling narratives that reach wider audiences.",
        photoUrl: "",
        careerHighlights: [
          { id: 1, title: "Pulitzer Prize", description: "Winner of the Pulitzer Prize for Investigative Reporting" },
          { id: 2, title: "Washington Post", description: "Published investigative series on government surveillance programs" },
          { id: 3, title: "The Guardian", description: "Covered intelligence operations and political corruption" },
          { id: 4, title: "ProPublica", description: "Contributed to major investigative projects" }
        ],
        professionalBackground: {
          paragraph1: "Alexandra Morrison has over fifteen years of experience as an investigative journalist, working for major publications such as The Washington Post, The Guardian, and ProPublica.",
          paragraph2: "Her work has focused on government accountability, intelligence operations, and political corruption, earning her the Pulitzer Prize for Investigative Reporting.",
          paragraph3: "Alexandra transitioned to screenwriting to explore these complex themes through compelling narratives that reach wider audiences."
        },
        inspiration: {
          paragraph1: "Alexandra's inspiration for her screenwriting comes from her extensive experience as an investigative journalist, where she uncovered numerous high-profile cases of corruption and abuse of power.",
          paragraph2: "She is particularly drawn to stories that highlight the struggles of whistleblowers and the lengths to which those in power will go to protect their interests.",
          paragraph3: "Alexandra aims to bring these stories to the screen, using her platform to shed light on important issues and inspire change."
        }
      },
      posterImage: values[4] || "",
      contactEmail: values[5] || "contact@example.com"
    };
    
    console.log("Server: Returning content with posterImage:", content.posterImage);
    console.log("Server: posterImage type in response:", typeof content.posterImage);
    
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
      hasContactEmail: !!body.contactEmail
    });
    
    // Save each key-value pair individually
    await kv.set("logline", body.logline);
    await kv.set("synopsis", body.synopsis);
    await kv.set("synopsisThemes", body.synopsisThemes);
    await kv.set("authorBio", body.authorBio);
    await kv.set("posterImage", body.posterImage);
    await kv.set("contactEmail", body.contactEmail);
    
    console.log("Server: Content saved successfully");
    console.log("Server: Saved posterImage:", body.posterImage);
    
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
    const snippets = await c.req.json();
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
    return c.json(slides || [
      { id: 1, title: "Project Summary", content: "Title: Truth Protocol\nGenre: Political Thriller\nFormat: Feature Film\nRuntime: Approx. 120 minutes" },
      { id: 2, title: "Target Audience", content: "Adults 25-54\nThriller enthusiasts\nPolitical drama fans\nInternational appeal" },
      { id: 3, title: "Comparable Films", content: "All the President's Men\nThe Bourne Identity\nSpotlight\nThe Post" },
      { id: 4, title: "Market Potential", content: "Strong theatrical potential\nStreaming platform appeal\nFestival consideration\nAwards potential" }
    ]);
  } catch (error) {
    console.error("Error fetching pitch slides:", error);
    return c.json({ error: "Failed to fetch pitch slides" }, 500);
  }
});

// Update pitch slides
app.post("/make-server-9aaa8c9c/pitch-slides", async (c) => {
  try {
    const slides = await c.req.json();
    await kv.set("pitchSlides", slides);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving pitch slides:", error);
    return c.json({ error: "Failed to save pitch slides" }, 500);
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

// Send script request email endpoint
app.post("/make-server-9aaa8c9c/send-script-request", async (c) => {
  try {
    const { name, email, companyRole, reason, message } = await c.req.json();
    
    // Get contact email from KV store
    const contactEmail = await kv.get("contactEmail");
    const recipientEmail = contactEmail || "sgonzalez3276@eagle.fgcu.edu"; // Default to testing email
    
    console.log("Server: Attempting to send script request email");
    console.log("Server: Recipient (TO):", recipientEmail);
    console.log("Server: Form submitter:", name, email);
    
    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      return c.json({ error: "Email service not configured. Please add your Resend API key." }, 500);
    }
    
    // Validate recipient email matches testing requirement
    if (recipientEmail !== "sgonzalez3276@eagle.fgcu.edu") {
      console.error("Server: Contact email is not set to testing email. Current:", recipientEmail);
      return c.json({ 
        error: `Contact email must be set to sgonzalez3276@eagle.fgcu.edu for testing. Current email: ${recipientEmail}. Please update in Settings.`,
        currentEmail: recipientEmail,
        requiredEmail: "sgonzalez3276@eagle.fgcu.edu"
      }, 400);
    }
    
    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Truth Protocol <onboarding@resend.dev>', // Resend's test domain
        to: [recipientEmail], // Must be sgonzalez3276@eagle.fgcu.edu
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
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      
      // Check if it's the domain verification error
      if (emailResult.statusCode === 403 && emailResult.message?.includes('verify a domain')) {
        return c.json({ 
          error: "Email requires domain verification. Please ensure contact email in Settings is set to sgonzalez3276@eagle.fgcu.edu, or verify your domain at resend.com/domains.",
          details: emailResult,
          currentRecipient: recipientEmail
        }, 403);
      }
      
      return c.json({ 
        error: `Failed to send email: ${emailResult.message || 'Unknown error'}`,
        details: emailResult 
      }, 500);
    }
    
    console.log("Email sent successfully:", emailResult);
    
    return c.json({ success: true, emailId: emailResult.id });
  } catch (error) {
    console.error("Error sending script request email:", error);
    return c.json({ error: `Failed to send email: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);