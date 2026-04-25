import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CareerShift AI database...");

  // Clear existing data
  await prisma.savedJob.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.roadmapResult.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // Create 5 sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Sarah Chen",
        email: "sarah@example.com",
        passwordHash,
        emailVerified: true,
        currentJobTitle: "Data Entry Specialist",
        skills: ["Excel", "Data Entry", "Microsoft Office", "Typing", "Attention to Detail"],
        bio: "Transitioning from data entry to UX design after discovering AI was automating my role.",
        provider: "local",
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Johnson",
        email: "marcus@example.com",
        passwordHash,
        emailVerified: true,
        currentJobTitle: "Paralegal",
        skills: ["Legal Research", "Document Review", "Microsoft Word", "Case Management"],
        bio: "10-year paralegal navigating the AI disruption in the legal industry.",
        provider: "local",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Patel",
        email: "priya@example.com",
        passwordHash,
        emailVerified: true,
        currentJobTitle: "Accountant",
        skills: ["Bookkeeping", "QuickBooks", "Excel", "Tax Preparation", "Financial Reporting"],
        bio: "CPA who successfully pivoted to ML engineering. Happy to share my journey!",
        provider: "local",
      },
    }),
    prisma.user.create({
      data: {
        name: "James Rivera",
        email: "james@example.com",
        passwordHash,
        emailVerified: true,
        currentJobTitle: "Customer Service Representative",
        skills: ["Communication", "CRM Systems", "Problem Solving", "Salesforce"],
        bio: "Exploring AI product management after years in customer success.",
        provider: "local",
      },
    }),
    prisma.user.create({
      data: {
        name: "Emma Kowalski",
        email: "emma@example.com",
        passwordHash,
        emailVerified: true,
        currentJobTitle: "Graphic Designer",
        skills: ["Adobe Photoshop", "Illustrator", "Figma", "Brand Identity", "Print Design"],
        bio: "Designer adapting to the AI art revolution by focusing on human-centered UX.",
        provider: "local",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample posts
  const postContents = [
    "Just got my AI risk score — 78%! 😰 But the roadmap CareerShift gave me is actually really actionable. Week 1 starts with Python basics on freeCodeCamp. Anyone else starting their Python journey?",
    "3 months ago I was a paralegal terrified of losing my job to AI. Today I accepted an offer as an AI Legal Analyst at $45K MORE than my old salary. This community kept me going. Thank you all! 🎉🚀",
    "Sharing my experience: The UX design path was recommended for me as a data entry worker, and after 2 months of the roadmap, I just finished my first real project — a redesign of our company's internal tool. Portfolio piece done! ✅",
    "Question for the community: Is anyone else finding that the 90-day roadmap is a bit ambitious? I'm on week 6 and feeling behind. Any tips for staying motivated when progress feels slow?",
    "Hot take: The AI disruption is actually the best thing that happened to my career. It forced me out of a dead-end role I'd been in for 8 years. Now I'm learning things I actually love. Don't fear the shift — embrace it.",
  ];

  const posts = await Promise.all(
    postContents.map((content, i) =>
      prisma.post.create({
        data: {
          userId: users[i].id,
          content,
          likesCount: Math.floor(Math.random() * 40) + 5,
        },
      })
    )
  );

  console.log(`✅ Created ${posts.length} posts`);

  // Add comments
  await prisma.comment.createMany({
    data: [
      { postId: posts[0].id, userId: users[1].id, text: "Just starting too! Let's keep each other accountable 💪" },
      { postId: posts[0].id, userId: users[2].id, text: "Python was game-changing for me. You've got this!" },
      { postId: posts[1].id, userId: users[0].id, text: "This is incredible! You're my inspiration 🙌" },
      { postId: posts[1].id, userId: users[3].id, text: "Which resources helped you the most for the transition?" },
      { postId: posts[3].id, userId: users[4].id, text: "I was behind too. The key is consistency over intensity. 30 mins/day beats 5-hour weekends." },
    ],
  });

  console.log("✅ Created sample comments");

  // Add likes
  await prisma.postLike.createMany({
    data: [
      { postId: posts[1].id, userId: users[0].id },
      { postId: posts[1].id, userId: users[2].id },
      { postId: posts[4].id, userId: users[0].id },
      { postId: posts[4].id, userId: users[1].id },
      { postId: posts[4].id, userId: users[3].id },
    ],
  });

  console.log("✅ Created sample likes");

  // Create a sample roadmap result
  await prisma.roadmapResult.create({
    data: {
      userId: users[0].id,
      jobTitle: "Data Entry Specialist",
      inputSkills: ["Excel", "Data Entry", "Microsoft Office", "Typing"],
      displacementRisk: 78,
      safeAlternatives: [
        { title: "UX Designer", match: 72, description: "Design user-centered digital experiences.", avgSalary: "$65,000–$95,000", growth: "+23% by 2030", requiredSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "CSS"] },
      ],
      roadmapData: {
        riskExplanation: "Data entry roles face high automation risk due to advancements in OCR and AI-powered data processing.",
        skillGaps: [
          { skill: "Figma", currentLevel: 0, requiredLevel: 80, priority: "high" },
          { skill: "User Research", currentLevel: 20, requiredLevel: 75, priority: "high" },
        ],
        roadmap: [
          {
            week: 1,
            title: "Design Foundations",
            focus: "Learn core UX/UI principles",
            tasks: ["Complete Google UX Design Certificate intro", "Study Apple HIG and Material Design"],
            resources: [
              { name: "Google UX Design Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "course", free: false },
            ],
          },
        ],
      },
    },
  });

  console.log("✅ Created sample roadmap result");
  console.log("\n🎉 Database seeded successfully!");
  console.log("\nTest credentials:");
  users.forEach((u: { email: string }) => console.log(`  ${u.email} / Password123!`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
