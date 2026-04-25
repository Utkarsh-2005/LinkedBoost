# LinkedBoost - Documentation

## Project Overview

**LinkedBoost** is an AI-powered LinkedIn profile reviewer application that helps individuals optimize their LinkedIn profiles. This platform evaluates profiles, providing insights into areas of improvement and assigning scores for various sections, along with an overall score out of 100. It is built using Next.js and leverages TypeScript, Prisma/MongoDB, Redis, and Gemini-powered Retrieval-Augmented Generation (RAG) systems. 

The application makes your LinkedIn experience much simpler—just paste your LinkedIn profile link, and LinkedBoost generates automated insights and scores for sections like posts, headline, experience, and education. This tool has already been instrumental in enhancing LinkedIn profiles, including the developer's own profile!

You can access LinkedBoost live at [linkedboost.vercel.app](https://linkedboost.vercel.app/).

---

## How it Works

### Workflow
1. **Profile Data Retrieval**: The application fetches data from a given LinkedIn profile using the RapidAPI-hosted "LinkedIn Profile Data" service.
2. **Data Enrichment**:
   - For profile evaluations, GeminiAPI and AstraDB are used in the backend.
   - A RAG-based approach leverages vectorized data stored in AstraDB to generate enhanced insights dynamically.
3. **AI Processing**:
   - Insights are powered and refined using a Generative AI engine by Google (Gemini-model) to provide an in-depth quantitative analysis.
4. **Evaluation**:
   - Profile sections are broken down and analyzed, generating scores for each of the following:
     - Headline
     - Education
     - Experience
     - Summary
     - Posts
5. **Actionable Report**:
   - Results are delivered as JSON, including AI-suggested optimizations for major profile weaknesses and social media engagement improvements.

---

## Technology Stack

### Frontend
- **Next.js**: Responsible for rendering and page management within the React framework.
- **TypeScript**: Provides robust type-checking for better code quality during development.
- **Tailwind CSS**: Framework for creating modern, responsive designs.

### Backend
- **Prisma/MongoDB**: Database access layer to store user details and their profile scores.
- **Redis**: State widget or caching server for dynamically delivering real-time results more efficiently.
- **Gemini-powered AI**:
   - Google Generative AI serves as the evaluation and analysis component seamlessly integrated with insights designed tailored LinkedIn Reviewer input.

---

## Features

1. **LinkedIn Profile Review**:
   - Parses and evaluates LinkedIn profiles.
   - Assigns detailed scores for specific segments of a professional’s public portfolios (Headline Posts networking).

  Summarised breakdowns summarized meaningful conversational-side impact responded comparing headlined weak impact summary effectively attended distributed-building
