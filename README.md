# Writer Akashic

A character management application built with Next.js and Supabase.

## Getting Started

The main application logic starts at `src/app/page.tsx`. The core features revolve around creating, viewing, updating, and deleting characters, which are stored in your Supabase project.

## Deployment to Vercel

To deploy this application to Vercel, you need to configure both your Supabase project and your Vercel project to communicate with each other.

### 1. Configure Supabase

Supabase needs to know the URL of your live application to handle authentication redirects correctly (e.g., for email confirmation links).

1.  Go to your Supabase project dashboard.
2.  Navigate to **Project Settings** (the cog icon in the left menu).
3.  Click on **Authentication**.
4.  Under the **Site Configuration** section, add your Vercel deployment URL to the **Site URL** field.
    -   Example: `https://your-project-name.vercel.app`
5.  It's also a good practice to add URLs for local development and Vercel preview deployments to the **Additional Redirect URLs** list:
    -   `http://localhost:9002/**` (or whatever port you use locally)
    -   For Vercel Previews, you can use wildcards: `https://*-your-project-slug.vercel.app/**`

### 2. Configure Vercel

Your Vercel project needs credentials to connect to your Supabase backend.

**First, get your Supabase API keys:**

1.  In your Supabase project, go back to **Project Settings** (the cog icon).
2.  Click on **API**.
3.  In the `Project API keys` section, you will find your `Project URL` and your `anon` `public` key. You will need these for the next step.

**Next, add them to Vercel as Environment Variables:**

1.  Go to your project's dashboard on Vercel.
2.  Click the **Settings** tab.
3.  Click on **Environment Variables** from the side menu.
4.  Create two new variables:
    *   **Name:** `NEXT_PUBLIC_SUPABASE_URL`
    *   **Value:** Paste the `Project URL` from your Supabase API settings.
    *   **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   **Value:** Paste the `anon` `public` key from your Supabase API settings.
5.  Ensure the variables are applied to all environments (Production, Preview, and Development).
6.  Go to the **Deployments** tab and trigger a new deployment to apply the environment variables.

After completing these steps, your Vercel deployment will be successfully connected to your Supabase project.
