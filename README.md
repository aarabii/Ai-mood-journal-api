# AI Mood Journal

A modern web application that allows users to save journal entries with AI-powered sentiment analysis and keyword extraction, providing valuable insights into their mood trends.

## 🚀 Core Features

- **Smart Journal Entries**: Write and save personal journal entries.
- **AI-Powered Analysis**: Automatic sentiment analysis and Named Entity Recognition (keyword extraction).
- **Insightful Dashboard**: Visualize mood distribution and see trending keywords at a glance.
- **Full CRUD Operations**: Create, read, update, and delete entries seamlessly.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **AI/ML**: Hugging Face Inference API
- **Deployment**: Vercel

## 🔧 Getting Started

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/aarabii/Ai-mood-journal-api.git
cd Ai-mood-journal-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env.local` in the root of your project and add the following variables.

```env
# .env.local

# Get this from your Neon project dashboard or vercel storage dashboard
DATABASE_URL="neon_database_connection_string"

# Get this from your Hugging Face account settings with read access
HF_TOKEN="your_hugging_face_token"
```

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

### 5. Set Up the Database

With the application running, open your browser and go to the following URL to automatically create the necessary database table:

**http://localhost:3000/api/setup**

You only need to do this once. Your application is now ready to use at `http://localhost:3000`.

## 📚 API Endpoints

The application uses the following API endpoints to function:

| Method   | Endpoint                 | Description                                                       |
| -------- | ------------------------ | ----------------------------------------------------------------- |
| `GET`    | `/api/entries`           | Retrieves a list of all journal entries.                          |
| `POST`   | `/api/entries`           | Creates a new journal entry after AI analysis.                    |
| `PUT`    | `/api/entries/[id]`      | Updates a specific journal entry.                                 |
| `DELETE` | `/api/entries/[id]`      | Deletes a specific journal entry.                                 |
| `GET`    | `/api/stats`             | Gets aggregated data like total entries and mood breakdown.       |
| `GET`    | `/api/keywords/trending` | Gets a list of the most frequently used keywords.                 |
| `GET`    | `/api/setup`             | **(Dev only)** A one-time route to initialize the database table. |

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1. Push your code to a Git provider (GitHub, GitLab, etc.).
2. Import your repository into Vercel.
3. Add your `DATABASE_URL` and `HF_TOKEN` as Environment Variables in the Vercel project settings.
4. Deploy!

## 📁 Project Structure

The project uses the Next.js App Router. Key directories include:

```
src/
├── app/
│   ├── api/                         # API route handlers
│   │   ├── entries/                 # CRUD operations for journal entries
│   │   │   ├── [id]/route.ts       # PUT & DELETE: Update/Delete a specific journal entry
│   │   │   └── route.ts            # GET & POST: Get all or create a journal entry
│   │   ├── keywords/
│   │   │   └── trending/route.ts   # GET: Trending keywords
│   │   ├── setup/route.ts          # GET: Initialize DB (for dev setup)
│   │   └── stats/route.ts          # GET: Aggregated stats
│   ├── (main)/                     # Main route group for pages
│   │   └── page.tsx                # Home or main UI page
│   ├── font.ts                     # Centralized font imports
│   ├── globals.css                 # Global CSS styles
│   └── layout.tsx                  # Root layout for all routes
├── components/                     # Reusable components
├── constant/                       # Static definitions and constants
├── lib/                            # Utility libraries and integrations
```
