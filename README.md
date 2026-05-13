# Truth Protocol - Professional Screenplay Landing Page

A professional landing website for the unproduced screenplay "Truth Protocol" that showcases the story, presents the pitch deck, introduces the author, and allows producers/industry professionals to request the script.

## Features

- **Multi-page Navigation**: Home, Logline, Synopsis, Pitch Deck, Snippets, Author, Request Script, and Copyright pages
- **Admin System**: Secure login with full content management capabilities
- **Dynamic Content**: All content stored in Supabase and editable through Settings page
- **Image Uploads**: File upload system for author photos, poster images, and snippet images (.jpg, .png)
- **Responsive Design**: Mobile-friendly layout throughout
- **Real-time Sync**: Changes in Settings update across all pages instantly
- **Dark Theme**: Orange and black color scheme optimized for readability

## Tech Stack

- **Frontend**: React + TypeScript
- **Routing**: React Router (Data mode)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Database, Storage, Edge Functions)
- **Server**: Hono web server running on Supabase Edge Functions
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm installed
- A Supabase account (free tier works)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Supabase** (Optional - already configured for Figma Make)
   
   The project comes pre-configured with Supabase credentials in `/utils/supabase/info.tsx`. If you want to use your own Supabase project:
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Update `/utils/supabase/info.tsx` with your project credentials:
     ```typescript
     export const projectId = "your-project-id"
     export const publicAnonKey = "your-anon-key"
     ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Admin Access

To access the Settings page and manage content:

1. Navigate to `/admin` page
2. Default credentials:
   - **Username**: `admin`
   - **Password**: `truthprotocol2024`
3. Change these credentials in Settings → Admin tab after first login

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (AdminContext)
│   │   ├── data/           # Data types and interfaces
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions and API layer
│   │   ├── App.tsx         # Main app component
│   │   └── routes.ts       # React Router configuration
│   ├── styles/             # Global CSS and Tailwind config
│   └── main.tsx            # App entry point
├── supabase/
│   └── functions/
│       └── server/         # Hono server and API routes
├── utils/
│   └── supabase/
│       └── info.tsx        # Supabase credentials
└── package.json
```

## Content Management

### Editable Content (via Settings page)

- **Logline**: Main tagline for the screenplay
- **Synopsis**: Multi-act story breakdown
- **Pitch Deck**: Presentation slides
- **Snippets**: Story excerpts with images
- **Author Bio**: Name, photo, bio, career highlights, background
- **Images**: Author photo, poster image, snippet images
- **Contact**: Email address for script requests

**Note for Local Development**: The Truth Protocol poster image is embedded in Figma Make but won't be available when running locally. After downloading the project, upload your poster image through Settings → General → Poster Image to display it on the home page.

### Static Content

The following pages have static content that can be edited directly in their files:
- Copyright page (`/src/app/pages/Copyright.tsx`)
- Request Script form (`/src/app/pages/RequestScript.tsx`)

## Database Structure

The app uses Supabase's key-value store table (`kv_store_9aaa8c9c`) with the following keys:

- `content` - All editable content (logline, synopsis, author bio, etc.)
- `snippets` - Array of story snippets
- `pitchSlides` - Array of pitch deck slides
- `adminCredentials` - Hashed admin login credentials

## Image Storage

Images are stored in Supabase Storage:
- Bucket: `make-9aaa8c9c-images` (private)
- Access: Via signed URLs (auto-generated)
- Accepted formats: .jpg, .jpeg, .png
- Max size: 5MB per image

## API Endpoints

Server runs at: `/functions/v1/make-server-9aaa8c9c/`

- `GET /make-server-9aaa8c9c/content` - Fetch all content
- `POST /make-server-9aaa8c9c/content` - Save content
- `GET /make-server-9aaa8c9c/snippets` - Fetch snippets
- `POST /make-server-9aaa8c9c/snippets` - Save snippets
- `GET /make-server-9aaa8c9c/pitch-slides` - Fetch pitch deck slides
- `POST /make-server-9aaa8c9c/pitch-slides` - Save pitch deck slides
- `POST /make-server-9aaa8c9c/upload-image` - Upload image to storage
- `POST /make-server-9aaa8c9c/admin/login` - Admin authentication
- `POST /make-server-9aaa8c9c/admin/update-credentials` - Update admin credentials

## Deployment

### Deploying to Production

1. **Supabase**: Already configured and hosted
2. **Frontend**: Can be deployed to:
   - Vercel
   - Netlify
   - Cloudflare Pages
   - Any static hosting service

### Environment Variables (if using custom Supabase)

When deploying, set these environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Domain Connection

To connect your GoDaddy domain (TRUTHPROTOCOLofficial.com):

1. Deploy your frontend to a hosting service (Vercel, Netlify, etc.)
2. Get the deployment URL
3. In GoDaddy DNS settings, add a CNAME record:
   - Name: `@` or `www`
   - Value: Your deployment URL
4. Follow your hosting provider's custom domain setup guide

## Customization

### Color Scheme

The orange and black theme is defined in `/src/styles/theme.css`:
- Primary: Orange (#FF6B00)
- Accent: Dark orange/amber tones
- Background: Black and dark grays

### Typography

Font styles are in `/src/styles/theme.css` and `/src/styles/fonts.css`

## Security Notes

- Admin credentials are hashed using bcrypt
- Supabase Storage buckets are private
- Images use signed URLs with expiration
- CORS headers configured for API access
- Service role key kept secure on server-side only

## Troubleshooting

### "figma:asset not found" error

This error occurs when running locally because `figma:asset` is a Figma Make-specific import. This has been fixed in the codebase - make sure you have the latest version.

### Images not loading

- Check Supabase Storage bucket exists: `make-9aaa8c9c-images`
- Verify signed URLs are being generated
- Check browser console for CORS errors

### Admin login not working

- Default credentials: username `admin`, password `truthprotocol2024`
- Check browser console for authentication errors
- Verify Supabase connection is working

## License

Copyright © 2024. All rights reserved.

## Support

For issues or questions about this codebase, please check:
- Browser console for error messages
- Network tab for API request/response details
- Supabase dashboard for database/storage status