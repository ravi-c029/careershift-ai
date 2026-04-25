import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// AI-safe job categories
const AI_SAFE_KEYWORDS = [
  "AI Engineer",
  "Machine Learning",
  "Data Science",
  "Product Manager",
  "UX Designer",
  "DevOps",
  "Cybersecurity",
  "Cloud Architect",
  "Full Stack",
  "Healthcare",
  "Therapist",
  "Educator",
  "Human Resources",
];



export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get("filter") || "";
  const page = Number(req.nextUrl.searchParams.get("page") || "1");
  const country = req.nextUrl.searchParams.get("country") || "in";
  const limit = 6;

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.error("Missing ADZUNA API keys");
    return NextResponse.json({ jobs: [], total: 0, page: 1, pages: 1 });
  }

  try {
    // If no filter provided, we default to "AI" or "Technology" to ensure we show AI-safe jobs
    const searchQuery = filter ? encodeURIComponent(filter) : "technology OR AI OR data";
    
    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}&what=${searchQuery}`;
    
    const response = await fetch(adzunaUrl);
    const data = await response.json();

    if (!data || !data.results) {
      return NextResponse.json({ jobs: [], total: 0, page, pages: 1 });
    }

    const jobs = data.results.map((job: any) => {
      // Calculate a deterministic AI Safe Score based on the job content
      let score = 75;
      const content = (job.title + " " + job.description).toLowerCase();
      
      AI_SAFE_KEYWORDS.forEach((keyword) => {
        if (content.includes(keyword.toLowerCase())) {
          score += 4;
        }
      });
      score = Math.min(99, score + (job.title.length % 10)); // max 99

      return {
        id: String(job.id),
        title: job.title,
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || "Remote",
        salary: job.salary_min && job.salary_max 
          ? `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k` 
          : "Competitive",
        type: job.contract_time === "contract" ? "Contract" : "Full-time",
        url: job.redirect_url,
        description: job.description.replace(/<[^>]*>?/gm, ''), // strip html
        tags: [job.category?.label || "Tech"].filter(Boolean),
        aiSafeScore: score,
        postedAt: job.created,
      };
    });

    return NextResponse.json({
      jobs,
      total: data.count || 0,
      page,
      pages: Math.ceil((data.count || 0) / limit),
    });
  } catch (error) {
    console.error("Adzuna API Error:", error);
    return NextResponse.json({ jobs: [], total: 0, page: 1, pages: 1 }, { status: 500 });
  }
}
