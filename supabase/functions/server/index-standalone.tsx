import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Inline KV store functions
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const kv = {
  async get(key: string) {
    const { data } = await supabaseClient
      .from('kv_store_9aaa8c9c')
      .select('value')
      .eq('key', key)
      .single();
    return data?.value;
  },
  async set(key: string, value: any) {
    await supabaseClient
      .from('kv_store_9aaa8c9c')
      .upsert({ key, value });
  },
  async mget(keys: string[]) {
    const { data } = await supabaseClient
      .from('kv_store_9aaa8c9c')
      .select('key, value')
      .in('key', keys);
    return keys.map(key => data?.find(d => d.key === key)?.value);
  },
  async mdel(keys: string[]) {
    await supabaseClient
      .from('kv_store_9aaa8c9c')
      .delete()
      .in('key', keys);
  }
};

// Default content inline
const defaultContent = {
  logline: "A investigative journalist stumbles upon a conspiracy that reaches the highest levels of government, forcing her to team up with a former intelligence agent she's been hunting for years—only to discover they're both pawns in a game far more dangerous than either imagined.",
  synopsis: "Sarah Chen is at the top of her game. A Pulitzer-winning investigative journalist for the Washington Chronicle, she's built her career on exposing corruption and holding the powerful accountable. When she receives an encrypted USB drive containing classified documents, she thinks she's onto another major story.\\n\\nThe documents point to a vast conspiracy involving arms deals, political assassinations, and a shadow network operating within the U.S. intelligence community. At the center of it all is a name she knows well: Marcus Kane, a former CIA operative who went rogue three years ago. Sarah has been trying to expose Kane's crimes for years, publishing article after article about his alleged activities. He's her white whale.\\n\\nBut when Sarah starts following the leads in the documents, people around her start dying. Her source is found dead in an apparent suicide. Her editor receives threats. Someone is watching her every move, and they'll stop at nothing to keep the truth buried.\\n\\nSarah is cornered in a parking garage by armed men when Marcus Kane appears out of nowhere to save her. He claims he's not the villain she's made him out to be—he's been investigating the same conspiracy for years, and now they're both targets. Sarah doesn't trust him, but she has no choice. They go on the run together.\\n\\nAs they piece together the puzzle, Sarah learns that Marcus was set up by someone inside the agency. The conspiracy goes deeper than either of them realized, involving high-ranking officials in multiple government agencies. The documents Sarah received were bait, designed to flush out both of them so they could be eliminated.\\n\\nDespite their mutual distrust, Sarah and Marcus develop a grudging respect for each other. She realizes that many of the stories she wrote about him were based on planted intelligence. He was fighting the good fight all along, but she helped destroy his reputation. The guilt weighs on her as they race to stay alive.\\n\\nWith time running out and their enemies closing in, Sarah and Marcus discover the conspiracy's true scope: a group of powerful individuals planning a false flag operation that would justify a new war and consolidate their power. The attack is set to happen in 48 hours.\\n\\nThey have evidence, but no one they can trust to deliver it to. Every channel is compromised. Sarah makes the bold decision to go public, using her platform and reputation to expose everything in a live broadcast. Marcus provides security and technical support, knowing that once the truth is out, there's no going back.",
  synopsisThemes: [
    { id: 1, text: "The cost of truth in a world of lies" },
    { id: 2, text: "Redemption and the power of second chances" },
    { id: 3, text: "The corruption of power and institutional betrayal" },
    { id: 4, text: "Trust and partnership in impossible circumstances" },
    { id: 5, text: "The role of journalism in holding power accountable" }
  ],
  authorBio: {
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
  posterImage: "",
  contactEmail: "mikesurick@gmail.com"
};

// Default pitch slides inline
const defaultPitchSlides = [
  { id: 1, title: "Slide 1 — Title", content: "TRUTH PROTOCOL\\n\\nAction / Adventure / Conspiracy / Military Thriller\\n\\nWritten by\\nMike Surick\\n\\nA man accidentally learns the most dangerous truths in human history. Now, the powers that be will stop at nothing to find him." },
  { id: 2, title: "Slide 2 — The Truth Protocol", content: "The Truth Protocol is a classified program designed to reveal humanity's deepest secrets to all who wish to know them, but only in the moments prior death by medically assisted euthanasia.\\n\\nArtificial Intelligence Systems International (AISI) is responsible for facilitating the program where participants are injected with a powerful neurotropic drug and connected to an advanced neural AI interface before being exposed to Truth Data — a hidden archive of suppressed intelligence, secret programs, and manipulated historical events.\\n\\nThe purpose of the program is simple:\\n\\nAllow the truth to be seen… and then die with the witness.\\n\\nUntil one mistake changes everything." },
  { id: 3, title: "Slide 3 — Michael Riley", content: "Michael R. Riley\\n\\nDecorated Special Forces veteran.\\nElite tactical operator.\\n\\nAfter decades of combat deployments, Riley is trying to live a quiet life with his wife Michele and their daughter Lauren.\\n\\nBut Riley is about to become the most dangerous liability the Truth Protocol has ever faced." },
  { id: 4, title: "Slide 4 — The Accident", content: "After a minor car accident, Riley is hospitalized and mistakenly identified as a volunteer for the Truth Protocol.\\n\\nBefore anyone realizes the mistake, Riley is injected with the program's cognitive compound and connected to the neural interface.\\n\\nFor the first time in history the entire truth data archive is shown to the wrong person." },
  { id: 5, title: "Slide 5 — They Try to Kill Him", content: "Program operatives quickly realize the catastrophic mistake.\\n\\nRiley was never meant to see the data.\\n\\nTheir solution is immediate.\\n\\nEliminate the witness.\\n\\nBut Riley escapes the facility with Michele." },
  { id: 6, title: "Slide 6 — The Manhunt", content: "Riley and Michele go on the run as a covert operation is launched to hunt him down.\\n\\nAISI brings in rogue CIA SOG Operator Jack Turner to help find Riley.\\n\\nThe forces pursuing him include:\\n\\nAISI Corporate Security Contractors\\nCIA Special Operations Group (SOG) assets\\nCorporate black-site security teams\\n\\nThe goal: Kill or capture Riley before he can tell anyone what he saw." },
  { id: 7, title: "Slide 7 — The Ambush", content: "During a brutal roadside ambush, Riley and Michele fight off multiple SOG Operators.\\n\\nThe firefight leaves several operatives dead.\\n\\nBut Michele is fatally wounded.\\n\\nIn her final moments, she makes Riley promise to protect their daughter Lauren." },
  { id: 8, title: "Slide 8 — Riley Disappears", content: "Devastated and hunted, Riley reconnects with his former Special Forces brothers who trust him and know how to fight a war that officially doesn't exist." },
  { id: 9, title: "Slide 9 — They Take His Daughter", content: "Unable to locate Riley, Jack Turner and his team escalates the operation.\\n\\nThey abduct Riley's daughter Lauren.\\n\\nShe is taken to a classified black-site facility and held as leverage.\\n\\nThe message to Riley is clear:\\n\\nSurrender… or she dies." },
  { id: 10, title: "Slide 10 — Richard Sullivan", content: "Richard Sullivan\\nSenior Security Operations executive at AISI.\\n\\nFor years, Sullivan has helped oversee the Truth Protocol.\\n\\nBut Riley's escape forces him to question everything.\\n\\nWhen Lauren is kidnapped to lure Riley into the open, Sullivan realizes the organization has crossed a line.\\n\\nInstead of helping eliminate Riley…\\n\\nSullivan secretly decides to help him.\\n\\nHe helps Riley identify the black-site facility holding Lauren.\\n\\nFor the first time, someone inside the system turns against it." },
  { id: 11, title: "Slide 11 — The Counterattack", content: "Riley agrees to surrender. He will trade his life for Lauren's.\\n\\nBut is that really his plan?\\n\\nHe and the remaining member of his old Special Forces team put together a plan to rescue Lauren.\\n\\nThe hunted becomes the hunter." },
  { id: 12, title: "Slide 12 — The Final Mission", content: "A high-risk tactical assault to rescue Lauren and destroy the program that started it all.\\n\\nA mission complete with Blackhawk assault, fast roping to the objective, breeching and clearing, all in the name of brotherhood and duty.\\n\\nOf course, in the real world, nothing ever goes as planned and not everyone makes it home.\\n\\nBut who is it?" },
  { id: 13, title: "Slide 13 — Key Cinematic Moments", content: "The Hospital Mistake\\nRiley is accidentally subjected to the Truth Protocol.\\n\\nThe Escape\\nRiley fights his way out of the hospital.\\n\\nThe Roadside Ambush\\nMichele is killed during a violent assault.\\n\\nLauren's Kidnapping\\nJack Turner abducts Lauren to force him into the open.\\n\\nThe Black-Site Assault\\nRiley and his team launch the tactical assault to rescue Lauren." },
  { id: 14, title: "Slide 14 — Tone", content: "Grounded\\nRelentless\\nEmotionally driven\\nHigh-stakes tactical action\\n\\nComparable to:\\n\\nThe Bourne Identity\\nSicario\\nZero Dark Thirty\\nJack Ryan" },
  { id: 15, title: "Slide 15 — Closing", content: "The Truth Protocol was designed to ensure the truth died with its witnesses.\\n\\nBut one man survived." }
];

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
    
    const content = {
      logline: values[0] || defaultContent.logline,
      synopsis: values[1] || defaultContent.synopsis,
      synopsisThemes: values[2] || defaultContent.synopsisThemes,
      authorBio: values[3] || defaultContent.authorBio,
      posterImage: values[4] || defaultContent.posterImage,
      contactEmail: values[5] || defaultContent.contactEmail
    };
    
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
    
    await kv.set("logline", body.logline);
    await kv.set("synopsis", body.synopsis);
    await kv.set("synopsisThemes", body.synopsisThemes);
    await kv.set("authorBio", body.authorBio);
    await kv.set("posterImage", body.posterImage);
    await kv.set("contactEmail", body.contactEmail);
    
    console.log("Server: Content saved successfully");
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
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
    const snippets = Array.isArray(body) ? body : (body.snippets || body);
    
    if (!Array.isArray(snippets)) {
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
    const slides = Array.isArray(body) ? body : (body.slides || body);
    
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

// Upload image endpoint
app.post("/make-server-9aaa8c9c/upload-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

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

    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 315360000);

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

// Send script request email endpoint - NO VALIDATION
app.post("/make-server-9aaa8c9c/send-script-request", async (c) => {
  try {
    const { name, email, companyRole, reason, message } = await c.req.json();
    
    // Get contact email from KV store
    const contactEmail = await kv.get("contactEmail");
    const recipientEmail = (contactEmail || "mikesurick@gmail.com").toLowerCase(); // Normalize to lowercase
    
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
        reply_to: email,
        subject: `Script Request from ${name}`,
        html: `
          <h2>New Script Request for Truth Protocol</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company/Role:</strong> ${companyRole}</p>
          <p><strong>Reason for Request:</strong> ${reason}</p>
          ${message ? `<strong>Additional Message:</strong></p><p>${message}</p>` : ''}
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

// Visitor counter endpoints
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

Deno.serve(app.fetch);