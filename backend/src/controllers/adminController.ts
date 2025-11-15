import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/appError";
import { rget, rset, rdel } from '../../utils/rcache';
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const KUserMetrics = (period: string) => `rr:v1:admin:userMetrics:${period}`;
const KRevenueMetrics = (period: string) => `rr:v1:admin:revenueMetrics:${period}`;
const KResumeMetrics = (period: string) => `rr:v1:admin:resumeMetrics:${period}`;

export const userMetrics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { period = "all" } = req.query; // 'day', 'week', 'month', 'all'

  // Calculate date ranges
  const now = new Date();
  let startDate: Date | undefined;
  
  if (period === "day") {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Total users
  const totalUsers = await prisma.user.count();

  // New signups per period
  const newSignups = startDate
    ? await prisma.user.count({
        where: { createdAt: { gte: startDate } },
      })
    : totalUsers;

  // Active users (users who have generated at least one resume in the period)
  const activeUsers = startDate
    ? await prisma.user.count({
        where: {
          resumes: {
            some: {
              createdAt: { gte: startDate },
            },
          },
        },
      })
    : await prisma.user.count({
        where: {
          resumes: {
            some: {},
          },
        },
      });

  // Returning users (users with multiple resumes)
  const returningUsers = await prisma.user.count({
    where: {
      resumes: {
        some: {},
      },
    },
  });

  // Users who generated at least 1 resume
  const usersWithResumes = await prisma.user.count({
    where: {
      resumes: {
        some: {},
      },
    },
  });

  // Users with 0 profile data (no profile or empty profile)
  // Use a raw query to check for empty JSON arrays
  const usersWithNoProfile = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM "User" u
    LEFT JOIN "Profile" p ON p."userId" = u.id
    WHERE p.id IS NULL
       OR (
         (p.experience::text = '[]' OR p.experience::text = 'null' OR p.experience IS NULL)
         AND (p.education::text = '[]' OR p.education::text = 'null' OR p.education IS NULL)
         AND (p.projects::text = '[]' OR p.projects::text = 'null' OR p.projects IS NULL)
         AND (p.skills::text = '[]' OR p.skills::text = 'null' OR p.skills IS NULL)
       )
  `;
  
  const usersWithNoProfileCount = Number(usersWithNoProfile[0]?.count || 0);

  // Signups breakdown by day/week/month
  const signupsBreakdown = startDate
    ? await prisma.$queryRaw<
        Array<{ date: string; count: bigint }>
      >`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 90
      `
    : await prisma.$queryRaw<
        Array<{ date: string; count: bigint }>
      >`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*)::int as count
        FROM "User"
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 90
      `;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      newSignups,
      activeUsers,
      returningUsers,
      usersWithResumes,
      usersWithNoProfile: usersWithNoProfileCount,
      signupsBreakdown: signupsBreakdown.map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),
      period,
    },
  });
});

export const revenueMetrics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { period = "all" } = req.query; // 'day', 'week', 'month', 'all'

  // Calculate date ranges
  const now = new Date();
  let startDate: Date | undefined;
  
  if (period === "day") {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Total credits purchased (positive deltas)
  const totalCreditsPurchased = await prisma.creditLedger.aggregate({
    where: {
      delta: { gt: 0 },
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    },
    _sum: {
      delta: true,
    },
  });

  // Credits used (negative deltas)
  const totalCreditsUsed = await prisma.creditLedger.aggregate({
    where: {
      delta: { lt: 0 },
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    },
    _sum: {
      delta: true,
    },
  });

  // Daily credit usage trend
  const creditUsageTrend = startDate
    ? await prisma.$queryRaw<
        Array<{ date: string; creditsUsed: bigint; creditsPurchased: bigint }>
      >`
        SELECT 
          DATE("createdAt") as date,
          SUM(CASE WHEN "delta" < 0 THEN ABS("delta") ELSE 0 END)::bigint as "creditsUsed",
          SUM(CASE WHEN "delta" > 0 THEN "delta" ELSE 0 END)::bigint as "creditsPurchased"
        FROM "CreditLedger"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 90
      `
    : await prisma.$queryRaw<
        Array<{ date: string; creditsUsed: bigint; creditsPurchased: bigint }>
      >`
        SELECT 
          DATE("createdAt") as date,
          SUM(CASE WHEN "delta" < 0 THEN ABS("delta") ELSE 0 END)::bigint as "creditsUsed",
          SUM(CASE WHEN "delta" > 0 THEN "delta" ELSE 0 END)::bigint as "creditsPurchased"
        FROM "CreditLedger"
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 90
      `;

  // Get Stripe revenue data
  let stripeRevenue = {
    total: 0,
    daily: [] as Array<{ date: string; amount: number }>,
    monthly: [] as Array<{ month: string; amount: number }>,
  };

  try {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    // Get all successful payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      ...(startDate ? { created: { gte: Math.floor(startDate.getTime() / 1000) } } : {}),
    });

    let totalRevenue = 0;
    const dailyRevenue: Record<string, number> = {};
    const monthlyRevenue: Record<string, number> = {};

    for (const pi of paymentIntents.data) {
      if (pi.status === "succeeded" && pi.amount) {
        const amount = pi.amount / 100; // Convert from cents
        totalRevenue += amount;

        const date = new Date(pi.created * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + amount;
        monthlyRevenue[monthStr] = (monthlyRevenue[monthStr] || 0) + amount;
      }
    }

    stripeRevenue = {
      total: totalRevenue,
      daily: Object.entries(dailyRevenue)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 90),
      monthly: Object.entries(monthlyRevenue)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 12),
    };
  } catch (error) {
    console.error("Error fetching Stripe revenue:", error);
  }

  // Failed payments (payment intents that failed)
  let failedPaymentsCount = 0;
  try {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    const failedPayments = await stripe.paymentIntents.list({
      limit: 100,
      ...(startDate ? { created: { gte: Math.floor(startDate.getTime() / 1000) } } : {}),
    });
    failedPaymentsCount = failedPayments.data.filter(
      (pi) => pi.status === "requires_payment_method" || pi.status === "canceled"
    ).length;
  } catch (error) {
    console.error("Error fetching failed payments:", error);
  }

  // Conversion rates
  const totalSignups = await prisma.user.count();
  const usersWhoGenerated = await prisma.user.count({
    where: {
      resumes: {
        some: {},
      },
    },
  });

  const conversionRate = totalSignups > 0 ? (usersWhoGenerated / totalSignups) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      credits: {
        totalPurchased: totalCreditsPurchased._sum.delta || 0,
        totalUsed: Math.abs(totalCreditsUsed._sum.delta || 0),
        usageTrend: creditUsageTrend.map((row) => ({
          date: row.date,
          creditsUsed: Number(row.creditsUsed),
          creditsPurchased: Number(row.creditsPurchased),
        })),
      },
      revenue: {
        stripe: stripeRevenue,
        failedPayments: failedPaymentsCount,
      },
      conversion: {
        signupsToGenerators: conversionRate,
        totalSignups,
        usersWhoGenerated,
      },
      period,
    },
  });
});

export const resumeMetrics = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { period = "all" } = req.query; // 'day', 'week', 'month', 'all'

  // Calculate date ranges
  const now = new Date();
  let startDate: Date | undefined;
  
  if (period === "day") {
    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Total resumes generated
  const totalResumes = await prisma.resume.count({
    ...(startDate ? { where: { createdAt: { gte: startDate } } } : {}),
  });

  // Average generation time (using createdAt to updatedAt as proxy)
  // Note: This is approximate since we don't have actual generation time
  const resumesWithTiming = await prisma.resume.findMany({
    where: {
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
      status: { in: ["ready", "failed"] },
    },
    select: {
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  const generationTimes = resumesWithTiming
    .map((r) => {
      const diff = r.updatedAt.getTime() - r.createdAt.getTime();
      return diff / 1000 / 60; // Convert to minutes
    })
    .filter((t) => t > 0 && t < 60); // Filter out unrealistic times (more than 1 hour)

  const averageGenerationTime =
    generationTimes.length > 0
      ? generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length
      : 0;

  // Resume quality issues (check for missing fields in JSON)
  const allResumes = await prisma.resume.findMany({
    where: {
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
      status: "ready",
    },
    select: {
      content: true,
    },
  });

  const qualityIssues = {
    missingHeader: 0,
    missingExperience: 0,
    missingEducation: 0,
    missingSkills: 0,
    emptyContent: 0,
    totalChecked: allResumes.length,
  };

  for (const resume of allResumes) {
    if (!resume.content || typeof resume.content !== "object") {
      qualityIssues.emptyContent++;
      continue;
    }

    const content = resume.content as any;
    if (!content.header) qualityIssues.missingHeader++;
    if (!content.experience || !Array.isArray(content.experience) || content.experience.length === 0)
      qualityIssues.missingExperience++;
    if (!content.education || !Array.isArray(content.education) || content.education.length === 0)
      qualityIssues.missingEducation++;
    if (!content.skills || !Array.isArray(content.skills) || content.skills.length === 0)
      qualityIssues.missingSkills++;
  }

  // % of users generating multiple resumes
  const usersWithMultipleResumes = startDate
    ? await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM (
          SELECT "userId", COUNT(*) as resume_count
          FROM "Resume"
          WHERE "createdAt" >= ${startDate}
          GROUP BY "userId"
          HAVING COUNT(*) > 1
        ) as multi_resume_users
      `
    : await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM (
          SELECT "userId", COUNT(*) as resume_count
          FROM "Resume"
          GROUP BY "userId"
          HAVING COUNT(*) > 1
        ) as multi_resume_users
      `;

  const totalUsersWithResumes = await prisma.user.count({
    where: {
      resumes: {
        ...(startDate ? { some: { createdAt: { gte: startDate } } } : { some: {} }),
      },
    },
  });

  const percentageMultipleResumes =
    totalUsersWithResumes > 0
      ? (Number(usersWithMultipleResumes[0]?.count || 0) / totalUsersWithResumes) * 100
      : 0;

  // Most common job roles attempted (from JobDescription parsedData)
  const jobDescriptions = await prisma.jobDescription.findMany({
    where: {
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    },
    select: {
      parsedData: true,
    },
  });

  const jobRoles: Record<string, number> = {};
  for (const jd of jobDescriptions) {
    if (jd.parsedData && typeof jd.parsedData === "object") {
      const parsed = jd.parsedData as any;
      const role = parsed.jobTitle || parsed.title || parsed.position || "Unknown";
      jobRoles[role] = (jobRoles[role] || 0) + 1;
    }
  }

  const mostCommonJobRoles = Object.entries(jobRoles)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([role, count]) => ({ role, count }));

  // Resume status breakdown
  const statusBreakdown = await prisma.resume.groupBy({
    by: ["status"],
    where: {
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    },
    _count: {
      id: true,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      totalResumes,
      averageGenerationTimeMinutes: Math.round(averageGenerationTime * 100) / 100,
      qualityIssues,
      percentageMultipleResumes: Math.round(percentageMultipleResumes * 100) / 100,
      mostCommonJobRoles,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      period,
    },
  });
});