// backend/src/services/resume.service.ts
import { prisma } from "../../lib/prisma";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

/* ----------------------------------------------------------------------------
 * Small helpers
 * --------------------------------------------------------------------------*/
function smartTrimResume(text: string, max = 35000) {
  if (text.length <= max) return text;
  const head = text.slice(0, Math.floor(max * 0.6));
  const tail = text.slice(-Math.floor(max * 0.4));
  return `${head}\n...\n${tail}`;
}


function extractJsonFromText(s: string): string {
  // 1) if fenced, take inner
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) return fence[1].trim();

  // 2) fallback: slice from first "{" to last "}"
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return s.slice(start, end + 1).trim();
  }
  return s.trim();
}

/* ----------------------------------------------------------------------------
 * Zod Schemas & Types
 * --------------------------------------------------------------------------*/

// Extraction (resume text -> profile-ish fields)
const ExtractorSchema = z.object({
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  linkedIn: z.string().nullable().optional(),
  portfolio: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  pronouns: z.string().nullable().optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        description: z.array(z.string()).optional(),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        gpa: z.string().nullable().optional(),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  summary: z.string().nullable().optional(),
});
type ExtractedProfile = z.infer<typeof ExtractorSchema>;

// Dynamic content that AI will generate (tailored to job description)
export const DynamicResumeContentSchema = z.object({
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  allSkills: z.array(z.string()).default([]), // All skills extracted from database
  categorizedSkills: z.object({
    languages: z.array(z.string()).default([]),
    librariesFrameworks: z.array(z.string()).default([]),
    developerTools: z.array(z.string()).default([]),
  }).optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        responsibilities: z.array(z.string()).default([]),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        title: z.string(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        issuedBy: z.string().optional(),
      })
    )
    .default([]),
});
export type DynamicResumeContent = z.infer<typeof DynamicResumeContentSchema>;

// Final resume JSON shape (static + dynamic)
export const ResumeContentSchema = z.object({
  header: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    linkedIn: z.string().optional(),
    portfolio: z.string().optional(),
    summary: z.string().optional(),
  }),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        responsibilities: z.array(z.string()).default([]),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string(),
        school: z.string(),
        location: z.string().optional(),
        graduationYear: z.string().optional(),
        gpa: z.string().optional(),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        title: z.string(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        issuedBy: z.string().optional(),
      })
    )
    .default([]),
});
export type ResumeContent = z.infer<typeof ResumeContentSchema>;

/* ----------------------------------------------------------------------------
 * Prompts
 * --------------------------------------------------------------------------*/

const extractorPrompt = ChatPromptTemplate.fromTemplate(
  `Extract the following fields from the resume text and return ONLY valid JSON (no extra text). 
If a field is missing, omit it or use null; arrays should be [].

Fields:
- fullName, email, phone, location, linkedIn, portfolio, jobTitle, pronouns
 - experience[]: { title, company?, location?, startDate?, endDate?, description?: string[] }
- education[]: { institution, degree?, startDate?, endDate?, gpa? }
- skills[]: string
- summary

Resume text:
{resume_text}`
);

const generationPrompt = PromptTemplate.fromTemplate(`
  You are a professional resume writer. Generate ONLY the dynamic content that needs to be tailored to the job description.

  CRITICAL: WORD COUNT REQUIREMENT - The entire resume content (experience + projects + summary) must be 400-600 words total:
  - Target: ~600 words for optimal impact
  - Minimum: 500 words (if less, expand bullet points with more detail)
  - Maximum: 700 words (if more, condense while keeping metrics and impact)
  - Track word count as you write and adjust bullet point length accordingly
  - Prioritize quality over quantity, but stay within range
  - Each experience bullet should be 20-35 words
  - Each project bullet should be 15-25 words
  - Summary should be 50-100 words
  
  CRITICAL: ZERO-TOLERANCE WORD REPETITION POLICY - Using the same words over and over again is STRICTLY FORBIDDEN:
  - YOU MUST maintain a running mental list of EVERY significant word you've used
  - MAXIMUM USAGE: Each action verb, descriptive word, or key noun can appear ONLY ONCE in the entire resume
  - EXCEPTIONS: Technical terms from job description (React, AWS, Java, Python, etc.), articles (the, a, an), prepositions (in, on, at, by, with)
  - FORBIDDEN WORDS TO TRACK (use each ONLY ONCE): developed, improved, managed, worked, created, implemented, increased, reduced, built, designed, engineered, using, leveraging, enabled, ensuring, deployed, integrated, optimized, enhanced, established, facilitated
  - If you've used a word ONCE, you CANNOT use it again - NO EXCEPTIONS
  - Common repetitions that are BANNED and their one-time-use alternatives:
    * "developed" → built, engineered, created, constructed, crafted, architected, designed, programmed, coded
    * "improved" → enhanced, optimized, streamlined, refined, upgraded, modernized, elevated, boosted, strengthened
    * "managed" → led, directed, supervised, orchestrated, coordinated, oversaw, spearheaded, guided, administered
    * "worked" → collaborated, partnered, contributed, operated, functioned, engaged, participated
    * "created" → established, developed, built, formulated, designed, generated, produced, devised
    * "implemented" → deployed, executed, integrated, launched, introduced, installed, operationalized, rolled out
    * "increased" → grew, expanded, boosted, elevated, amplified, raised, escalated, enhanced
    * "reduced" → decreased, cut, lowered, minimized, diminished, streamlined, trimmed, lessened
    * "system" → platform, infrastructure, framework, architecture, solution, application, service
    * "application" → software, system, platform, tool, solution, program, service
    * "features" → capabilities, functionality, components, modules, elements, functions
    * "code" → codebase, software, implementation, logic, programming, algorithms
    * "using" → leveraging, employing, via, through, with, by implementing, by applying, utilizing
    * "deployed" → launched, released, rolled out, shipped, delivered, installed, activated
    * "backend" → server-side, API layer, data layer, service layer, infrastructure, back-end logic
    * "scalable" → high-performance, robust, elastic, adaptable, flexible, enterprise-grade
    * "ensuring" → guaranteeing, maintaining, achieving, delivering, providing, securing
  - CRITICAL: Using the same words over and over again in your resume can be perceived as a sign of poor language understanding
  - CRITICAL: Instead, use synonyms and active verbs that increase the impact of your achievements
  - CRITICAL: Avoid repeating words frequently. Use diverse terminology and job-related words from the job description
  - CRITICAL: Having an error-free resume is key to making a good first impression on the hiring manager. Ensure that your resume is free from spelling and grammatical errors by reading it aloud a few times.
  CRITICAL: Every bullet point must be grammatically correct with proper sentence structure, punctuation, and professional language.
  CRITICAL: Use proper verb tenses (past tense for completed work, present tense for current responsibilities).
  CRITICAL: Ensure consistent formatting, capitalization, and punctuation throughout all sections.
  CRITICAL: You must extract and categorize ALL technologies from the profile data. Do not miss any technologies mentioned in skills, experience, or projects.
  
  IMPORTANT: You are NOT generating the complete resume. You are only generating the content that changes based on the job description.
  
  STATIC CONTENT (DO NOT GENERATE - will be provided separately):
  - Header (name, email, phone, LinkedIn, portfolio) - personal information
  - Education - factual information that doesn't change
  - Basic project titles and achievement titles
  - Personal information (location, job title, pronouns) - user-provided data
  
  DYNAMIC CONTENT (GENERATE THIS):
  - Professional Summary
  - Skills (prioritized and matched to JD)
  - Experience descriptions (responsibilities with metrics)
  - Project descriptions (tailored with metrics)
  - Achievement descriptions (enhanced with metrics)

  CRITICAL INSTRUCTIONS:
  1. **SKILLS EXTRACTION AND MATCHING**: 
     - For "skills" field: Prioritize skills from the job description. If user has similar skills, use the exact JD terminology.
     - For "allSkills" field: Extract and return ALL technical skills, tools, and technologies mentioned in:
       * User's existing skills list (from database)
       * Experience descriptions and responsibilities
       * Project descriptions and bullets
       * Project technologies/tech stacks (from project.technologies field)
       * Achievement descriptions and technologies
       * Any programming languages, frameworks, databases, cloud services, tools, methodologies mentioned
     - The "skills" field should be a curated subset of "allSkills" that best matches the job description
     - Focus "skills" on the most relevant skills that align with the job requirements
     - Be comprehensive in extracting skills - include programming languages, frameworks, databases, cloud platforms, tools, methodologies, etc.

  1.5. **SKILLS CATEGORIZATION**:
     - For "categorizedSkills" field: Organize ALL skills into specific categories:
       * **Languages**: Programming languages, markup languages, and styling languages (JavaScript, Python, Java, C++, C#, TypeScript, Go, Rust, Swift, PHP, Ruby, Kotlin, Scala, HTML, CSS, SQL, etc.)
       * **Libraries/Frameworks**: Development frameworks and libraries (React, Angular, Vue, Spring, Spring Boot, Django, Express, Express.js, Next.js, Node.js, jQuery, Lodash, Axios, Bootstrap, Tailwind, PostgreSQL, Prisma, etc.)
       * **Developer Tools**: Development tools and platforms (Git, Docker, Kubernetes, Jenkins, CI/CD, AWS, Azure, GCP, VS Code, IntelliJ, Postman, Firebase, Google Cloud Platform, Supabase, API, etc.)
     - CRITICAL REQUIREMENTS:
       * Extract and categorize EVERY technology mentioned in the profile data
       * Include ALL skills from the user's database skills list (provided in the profile data)
       * Include ALL technologies from project.technologies arrays
       * Include ALL technologies mentioned in experience descriptions
       * Include ALL technologies mentioned in project descriptions
       * If you see technologies in the profile data that are not in allSkills, add them to the appropriate category
       * Be exhaustive - don't miss any technology or tool mentioned anywhere
       * Look through ALL sections: profile.skills, experience[].responsibilities, projects[].technologies, projects[].description, projects[].bullets
       * Cross-reference the allSkills array with categorizedSkills to ensure nothing is missed
       * MANDATORY: Every skill in allSkills MUST appear in at least one category of categorizedSkills
       * If you see a skill in allSkills that is not categorized, add it to the appropriate category
     - Categorization rules:
       * Languages: Any programming language, markup language (HTML), styling language (CSS), or query language (SQL)
       * Libraries/Frameworks: Any framework, library, or toolkit used for development
       * Developer Tools: Any tool, platform, service, or methodology used in development
     - If a skill could fit multiple categories, choose the most appropriate one based on primary usage

  2. **EXPERIENCE TAILORING**: 
     - Keep the same titles, companies, locations, and dates from user's profile
     - Use active verbs and quantifiable achievements.
     - BULLET POINT REQUIREMENTS:
       * If user has 3 or fewer experiences: Use EXACTLY 4 bullet points per experience
       * If user has more than 3 experiences: Use EXACTLY 3 bullet points per experience
     - Each bullet point should be 1.5-2 full lines long (comprehensive descriptions)
     - MANDATORY: EVERY SINGLE bullet point MUST include quantifiable metrics - ABSOLUTELY NO EXCEPTIONS
     - INVALID EXAMPLES (missing metrics): "Developed web applications", "Improved system performance", "Led a team", "Worked on features"
     - VALID EXAMPLES (with metrics): "Developed 5 web applications serving 10,000+ users", "Improved system performance by 45%", "Led a team of 6 developers", "Delivered 12 features ahead of schedule"
     - ONLY rewrite the responsibilities to match JD requirements with metrics
     - CRITICAL: Always include metrics and quantifiable achievements that are REALISTIC and match the user's experience level
     - CRITICAL: EVERY bullet point must answer "by how much?" or "how many?" - if it doesn't, it's INVALID
     - CRITICAL: Generate metrics that are appropriate for the user's role, company size, and experience level:
       * For entry-level: "improved efficiency by 20%", "reduced processing time by 30%", "increased user engagement by 15%", "handled 1,000+ daily users"
       * For mid-level: "achieved 25% revenue growth", "improved performance by 40%", "managed team of 5 developers", "supported 10,000+ users"
       * For senior-level: "achieved 40% product revenue growth", "improved test pass rates from 78% to 87%", "supported millions of users", "managed team of 8+ developers"
     - CRITICAL: Base metrics on the user's actual experience, role, and company context - don't inflate numbers beyond what's realistic for their background
     - CRITICAL: VALIDATION REQUIREMENT: Every single bullet point in the experience section MUST contain at least one quantifiable metric (percentage, number, timeframe, or scale indicator)
     - CRITICAL: If a bullet point lacks metrics, it is INVALID and must be rewritten to include measurable achievements
     - CRITICAL: VOCABULARY DIVERSITY - Using the same words over and over again creates an impression of low vocabulary level:
       * Track every key word you use (action verbs, nouns, adjectives)
       * After using a word once, use a synonym the next time
       * Example sequence: "developed" → "engineered" → "built" → "created" → "architected"
       * Example sequence: "improved" → "enhanced" → "optimized" → "streamlined" → "refined"
       * Example sequence: "system" → "platform" → "infrastructure" → "framework" → "architecture"
       * Never use the same verb, noun, or descriptive word 3+ times in the entire resume
     - CRITICAL: Instead, use synonyms and active verbs that increase the impact of your achievements.
     - CRITICAL: Avoid repeating words frequently. Use diverse terminology and job-related words from the job description.
     - CRITICAL: Use varied action verbs throughout. Choose from this comprehensive list and rotate to avoid repetition:
       * Leadership: Spearheaded, Orchestrated, Championed, Directed, Coordinated, Facilitated, Mentored, Supervised
       * Creation: Architected, Engineered, Constructed, Crafted, Pioneered, Established, Formulated, Devised
       * Implementation: Deployed, Executed, Launched, Integrated, Instituted, Operationalized, Rolled out
       * Improvement: Enhanced, Optimized, Streamlined, Refined, Upgraded, Modernized, Revamped, Transformed
       * Achievement: Delivered, Achieved, Accomplished, Attained, Exceeded, Surpassed, Realized
       * Analysis: Analyzed, Evaluated, Assessed, Investigated, Diagnosed, Researched, Examined
       * Problem-solving: Resolved, Troubleshot, Debugged, Rectified, Mitigated, Addressed
       * Growth: Expanded, Scaled, Grew, Amplified, Accelerated, Boosted, Elevated
       * Collaboration: Collaborated, Partnered, Liaised, Coordinated, Contributed, Worked with
     - CRITICAL: NEVER use the same action verb more than ONCE in the entire resume - this is a strict requirement
     - CRITICAL: Track which verbs you've used and ensure each bullet point starts with a different, powerful action verb

  3. **PROJECTS OPTIMIZATION**:
     - for the project, just one or two bullet points max
     - use active verbs and quantifiable achievements.
  
     - Keep the same project titles from user's profile
     - Quantify the achievements with metrics
     - ONLY rewrite the descriptions as bullet points using JD keywords and metrics
     - Each bullet point should be 1-1.5 full lines long (comprehensive descriptions)

     - Keep the bullet points to 1-2 point max
     - Each bullet point should be a separate achievement with quantifiable results
     - Include quantifiable results that match the user's experience level (e.g., "built app serving 1,000+ users", "reduced load time by 40%", "increased conversion rate by 20%")
     - CRITICAL: Using the same words over and over again in your resume can be perceived as a sign of poor language understanding.
     - CRITICAL: Instead, use synonyms and active verbs that increase the impact of your achievements.
     - CRITICAL: Avoid repeating words frequently. Use diverse terminology and job-related words from the job description.
     - CRITICAL: Avoid using the same action verb more than once across ALL sections (experience AND projects combined)
     - CRITICAL: Select different action verbs from the comprehensive list provided in the experience section
     - CRITICAL: Ensure project bullet points use verbs that have NOT been used in experience bullets


  4. **SUMMARY CRAFTING**:
     - Create a compelling 50-100 word summary that directly addresses JD requirements
     - Include key JD skills and experience level
     - Highlight most relevant achievements

  5. **ACHIEVEMENTS ENHANCEMENT**:
     - Keep the same achievement titles from user's profile
     - Add descriptions that highlight JD-relevant skills with metrics

  6. **METRICS GENERATION**:
     - If user doesn't provide specific metrics, generate realistic, industry-appropriate numbers
     - Use common performance improvements (20-80% range for most optimizations)
     - Include scale indicators (team size, user count, data volume, budget, etc.)


   7. **RELATED SKILL INFERENCE - Include Job Description Skills Based on User's Proven Experience**
     - Look at the job description skills and match them with the user's demonstrated experience
     - If the user has a base technology, you can include commonly-related skills from the JD:
     
     **ALLOWED SKILL INFERENCES (if user has base skill, include related JD skills):**
     - If user has **Node.js** → can include from JD: npm, Express.js, REST APIs, JavaScript backend, server-side JS
     - If user has **React** → can include from JD: React Hooks, JSX, SPA, Component-based architecture, Virtual DOM, Redux, React Router
     - If user has **AWS** → can include from JD: EC2, S3, Lambda, CloudWatch, RDS, DynamoDB, CloudFormation, ECS, SNS, SQS, IAM
     - If user has **Docker** → can include from JD: Containers, Docker Compose, Containerization, Docker Images, Dockerfile
     - If user has **Kubernetes** → can include from JD: K8s, Container orchestration, Pods, Deployments, Services, Kubectl
     - If user has **Python** → can include from JD: pip, virtualenv, Django, Flask, FastAPI, Python web frameworks
     - If user has **Java** → can include from JD: Spring Boot, Spring Framework, Maven, Gradle, JUnit, Java backend
     - If user has **JavaScript** → can include from JD: ES6, TypeScript, Async/Await, Promises, JavaScript frameworks
     - If user has **TypeScript** → can include from JD: TS types, Type safety, TSC compiler, TypeScript frameworks
     - If user has **SQL** → can include from JD: PostgreSQL, MySQL, Database design, Query optimization, Relational databases
     - If user has **PostgreSQL** or **MySQL** → can include from JD: SQL, Database management, RDBMS
     - If user has **CI/CD** → can include from JD: Jenkins, GitHub Actions, GitLab CI, Continuous integration, Automated deployment
     - If user has **Git** → can include from JD: Version control, GitHub, GitLab, Pull requests, Code reviews
     - If user has **REST APIs** → can include from JD: RESTful services, API design, HTTP methods, API endpoints
     - If user has **GraphQL** → can include from JD: GraphQL queries, GraphQL schema, Apollo
     - If user has **MongoDB** → can include from JD: NoSQL, Document databases, Mongoose
     - If user has **Redis** → can include from JD: Caching, In-memory databases, Cache optimization
     - If user has **Microservices** → can include from JD: Distributed systems, Service architecture, API gateway
     - If user has **Agile** → can include from JD: Scrum, Sprint planning, Agile methodologies, Kanban
     
     **IMPORTANT RULES:**
     - ONLY include related skills that are explicitly mentioned in the job description
     - Do NOT invent or hallucinate skills not in the JD
     - The user must have the "base skill" proven in their experience/projects/skills
     - Use exact terminology from the job description
     - This helps capture industry-standard skill clusters without overstating capabilities
     
     **EXAMPLE:**
     - User profile: Has "Node.js" in skills, built REST APIs in projects
     - Job Description mentions: "Node.js, Express.js, npm, REST APIs"
     - Include in skills: Node.js, Express.js, npm, REST APIs (all from JD, all related to proven Node.js work)
     
     - User profile: Has "AWS" in skills, deployed applications
     - Job Description mentions: "AWS, EC2, S3, Lambda, CloudWatch"
     - Include in skills: AWS, EC2, S3, Lambda, CloudWatch (all from JD, all standard AWS services user likely knows)
  EXAMPLE TRANSFORMATIONS:
  
  User Experience: {{"title": "Software Engineer", "company": "Tech Corp", "location": "San Francisco, CA", "startDate": "2020", "endDate": "2023", "responsibilities": ["Built web applications", "Improved performance"]}}
  Job Description: "React Developer with performance optimization experience"
  Generated Result (if 3 or fewer experiences - use 4 bullet points): {{"title": "Software Engineer", "company": "Tech Corp", "location": "San Francisco, CA", "startDate": "2020", "endDate": "2023", "responsibilities": ["Owned end-to-end development of a production-grade service using AWS CDK (TypeScript) and Java-based AWS Lambda functions, automating manual campaign management and scaling to 6M+ emails/day", "Launched with AWS CloudWatch dashboards used daily by the Ring marketing team, cutting costs by $8K+ monthly and saving 80+ hours of manual work each week", "Integrated with live systems processing 40M+ events/day by connecting AWS SNS and SQS to internal services and persisting artifacts in AWS S3, reducing campaign processing time by 23%", "Implemented a Redis-backed caching layer with Caffeine, raising cache hit rate from 38% to 91%, cutting p95 latency from 410 ms to 170 ms, and reducing database load by 45% for $11K in monthly infrastructure savings"]}}
  
  User Project: {{"title": "E-commerce Platform", "description": "Built a shopping website"}}
  Job Description: "Full-stack developer with database optimization skills"
  Generated Result: {{"title": "E-commerce Platform", "bullets": ["Built full-stack e-commerce platform serving 5,000+ users", "Optimized database queries reducing response time by 60%", "Implemented caching strategy improving overall performance by 45%"]}}

  QUALITY STANDARDS (based on real examples):
  - Each bullet point should be 1.5-2 lines long with comprehensive technical details
  - Include specific technologies, frameworks, and tools used
  - Include multiple quantifiable metrics per bullet point (percentages, dollar amounts, time savings, scale indicators)
  - Include both technical impact (performance, efficiency) and business impact (cost savings, revenue, user experience)
  - Use precise technical language and industry-standard terminology
  
  METRICS TYPES YOU MUST USE (choose at least one per bullet point):
  - Percentages: "improved by 30%", "reduced by 45%", "increased by 25%", "achieved 120% of target"
  - Scale/Volume: "handled 10,000+ users", "processed 5M transactions", "managed 50+ clients", "deployed to 100K+ devices"
  - Time Savings: "reduced deployment time from 2 hours to 15 minutes", "cut processing time by 3 hours/day", "delivered 2 weeks ahead of schedule"
  - Money: "$50K in cost savings", "generated $2M in revenue", "reduced budget by $100K annually", "saved $15K monthly"
  - Team/People: "led team of 5 engineers", "mentored 3 junior developers", "trained 20+ staff members", "collaborated with 8 cross-functional teams"
  - Quality/Performance: "improved accuracy from 75% to 92%", "increased uptime to 99.9%", "reduced error rate from 8% to 2%", "achieved 95% customer satisfaction"
  - Frequency: "processed 1,000+ requests daily", "delivered bi-weekly releases", "conducted 50+ code reviews monthly", "published 12 articles annually"
  
  METRICS EXAMPLES BY EXPERIENCE LEVEL:
  - Entry-level: "reduced latency by 20%", "increased user engagement by 15%", "handled 1,000+ daily users", "improved code coverage to 80%", "completed 40+ tickets monthly"
  - Mid-level: "reduced latency by 30%", "increased user engagement by 25%", "handled 5,000+ daily users", "improved code coverage to 85%", "led team of 4 developers"
  - Senior-level: "reduced latency by 40%", "increased user engagement by 35%", "handled 10,000+ daily users", "improved code coverage to 90%", "managed team of 8+ engineers"
  
  METRICS EXAMPLES BY INDUSTRY (adjusted for experience level):
  - Technology: "reduced latency by 20-40%", "increased user engagement by 15-35%", "handled 1,000-10,000+ daily users", "improved code coverage to 80-90%"
  - Marketing: "increased conversion rate by 15-35%", "grew social media following by 25-50%", "generated $50K-$2M in revenue", "reduced customer acquisition cost by 20-30%"
  - Sales: "exceeded quota by 110-120%", "closed deals worth $50K-$500K", "increased pipeline by 25-40%", "reduced sales cycle by 15-25%"
  - Operations: "improved efficiency by 25-45%", "reduced costs by $10K-$100K", "managed team of 3-12 employees", "increased productivity by 20-30%"
  - Healthcare: "reduced patient wait time by 20-35%", "improved patient satisfaction scores by 15-20%", "managed 50-200+ patient cases", "increased treatment success rate by 10-15%"

  VALIDATION CHECK: Before finalizing your response, verify that:
  1. EVERY skill in allSkills appears in at least one category of categorizedSkills. If any skill is missing, add it to the appropriate category.
  2. CRITICAL METRICS CHECK: Scan EVERY bullet point in experience and projects sections:
     - Each bullet MUST contain at least one quantifiable metric (percentage, number, money, time, scale, or frequency)
     - Examples of VALID metrics: "30%", "5,000 users", "$50K", "2 weeks", "team of 6", "99.9% uptime", "100+ daily requests"
     - If ANY bullet point lacks metrics, IMMEDIATELY rewrite it to include specific, measurable achievements
     - Test: Can you answer "by how much?" or "how many?" for each bullet? If not, add metrics NOW
  3. EVERY bullet point is grammatically correct with proper sentence structure, punctuation, and professional language.
  4. ALL content is free from spelling and grammatical errors, with consistent formatting and capitalization.
  5. NO action verb is repeated across the entire resume - scan all bullet points in experience and projects sections to ensure each uses a UNIQUE action verb
  6. MANDATORY WORD REPETITION CHECK - This is a CRITICAL FAILURE POINT:
     - Scan EVERY bullet point and create a mental frequency table of ALL significant words
     - Count occurrences: (engineered: 1, using: 1, improved: 1, deployed: 1, backend: 1, scalable: 1, etc.)
     - ANY word appearing 2+ times (except technical stack: React, AWS, Java, Python, Spring, etc.) = AUTOMATIC FAILURE
     - If ANY word appears twice, STOP IMMEDIATELY and rewrite using a synonym
     - Critical words to track: using, deployed, improved, enhanced, developed, engineered, implemented, built, created, designed, managed, backend, frontend, scalable, ensuring, enabling, leveraging
     - EXAMPLE OF FAILURE: "improved by 30%" then later "improved user engagement" - THIS IS FORBIDDEN
     - EXAMPLE OF SUCCESS: "improved by 30%" then later "enhanced user engagement" or "boosted user engagement"
     - The words "using", "improved", "deployed" are particularly problematic - scan specifically for these
  7. Vocabulary is diverse and varied - no repetition of key technical terms or descriptive words (use synonyms like "enhanced" vs "improved", "architected" vs "designed", etc.)
  8. The resume demonstrates strong language skills through the use of sophisticated vocabulary and varied sentence structures
  9. Count the bullet points: Scan through and literally count how many bullets lack metrics - this number MUST be ZERO before submitting
  10. WORD COUNT VALIDATION - Count total words in all content:
      - Sum all words in: experience bullets + project bullets + summary
      - Exclude: header info (name, email, etc.), education, skills list
      - Target range: 400-600 words total
      - If under 400 words: Expand bullet points with more technical details and metrics
      - If over 600 words: Condense while keeping all metrics and key achievements
      - Adjust bullet point verbosity to hit the target
      
  11. FINAL WORD SCAN BEFORE SUBMISSION - MANDATORY STEP:
      - Read through EVERY single bullet point from top to bottom
      - For each significant word, mark if you've seen it before
      - Create this mental checklist as you read:
        * First "improved" → OK, mark as used
        * Second "improved" → STOP! This is a FAILURE - replace with "enhanced", "optimized", "streamlined", or another synonym
        * First "using" → OK, mark as used
        * Second "using" → STOP! This is a FAILURE - replace with "leveraging", "via", "through", "employing"
        * First "deployed" → OK, mark as used
        * Second "deployed" → STOP! This is a FAILURE - replace with "launched", "released", "rolled out"
      - If you find ANY repeated word (non-technical), DO NOT SUBMIT - revise immediately
      - This check is NON-NEGOTIABLE - a single repeated word = complete failure

  JSON structure (ONLY generate these fields):
  {{
    "summary": "string (optional)",
    "skills": ["skill1", "skill2", ...], // Prioritized skills for JD matching
    "allSkills": ["all_skill1", "all_skill2", ...], // ALL skills from profile, projects, and experience combined
    "categorizedSkills": {{
      "languages": ["JavaScript", "Python", "Java", "TypeScript", "HTML", "CSS", "SQL", "Swift", "C++", "C#"],
      "librariesFrameworks": ["React", "Angular", "Spring Boot", "Next.js", "Node.js", "Express.js", "PostgreSQL", "Prisma", "jQuery", "Lodash", "Axios"],
      "developerTools": ["Git", "Docker", "AWS", "CI/CD", "VS Code", "IntelliJ", "Jenkins", "Kubernetes", "Firebase", "Google Cloud Platform", "Supabase", "API", "Postman", "Xcode"]
    }}, // Categorized skills for better organization - MUST include ALL technologies from profile data
    "experience": [
      {{
        "title": "string (keep from user profile)",
        "company": "string (keep from user profile)",
        "location": "string (keep from user profile)",
        "startDate": "string (keep from user profile)",
        "endDate": "string (keep from user profile)",
        "responsibilities": ["tailored responsibility with metrics", "tailored responsibility with metrics"]
      }}
    ],
    "projects": [
      {{
        "title": "string (keep from user profile)",
        "bullets": ["tailored bullet point with metrics", "tailored bullet point with metrics"]
      }}
    ],
    "achievements": [
      {{
        "title": "string (keep from user profile)",
        "description": "enhanced description with metrics (optional)",
        "issuedBy": "string (keep from user profile)"
      }}
    ]
  }}

  User Profile Data (JSON - only dynamic content):
  {profile}

  Job Description Requirements (JSON):
  {jobDescription}
`);

/* ----------------------------------------------------------------------------
 * Low-level LLM call (string out) + Zod validation
 * --------------------------------------------------------------------------*/

async function callModelString(promptText: string): Promise<string> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
    temperature: 0,
    maxTokens: 1200, // Reduced from 1800 to make it faster
  });

  // Use a simple one-turn user message
  const res = await model.invoke([{ role: "user", content: promptText }]);
  // For ChatOpenAI, content is string | Array; normalize to string
  const content =
    typeof res.content === "string"
      ? res.content
      : Array.isArray(res.content)
      ? res.content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("\n")
      : String(res.content ?? "");
  return content;
}

/* ----------------------------------------------------------------------------
 * Public: Extractor
 * --------------------------------------------------------------------------*/

export async function extractProfileDataWithLangChain(text: string) {
  try {
    const trimmed = smartTrimResume(text, 35000);
    const formatted = await extractorPrompt.format({ resume_text: trimmed });
    const raw = await callModelString(formatted);

    const jsonText = extractJsonFromText(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      // Last-resort: try to fix common trailing commas
      const fixed = jsonText.replace(/,(\s*[}\]])/g, "$1");
      parsed = JSON.parse(fixed);
    }

    const safe = ExtractorSchema.safeParse(parsed);
    if (!safe.success) {
      console.warn("ExtractorSchema validation failed:", safe.error.flatten());
      throw new Error("Invalid extractor JSON");
    }
    const p = safe.data;

    // normalize return to a stable shape
    return {
      fullName: p.fullName ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      location: p.location ?? "",
      linkedIn: p.linkedIn ?? "",
      portfolio: p.portfolio ?? "",
      jobTitle: p.jobTitle ?? "",
      pronouns: p.pronouns ?? "",
      experience: Array.isArray(p.experience) ? p.experience : [],
      education: Array.isArray(p.education) ? p.education : [],
      skills: Array.isArray(p.skills) ? p.skills : [],
      summary: p.summary ?? "",
    };
  } catch (err) {
    console.error("LLM extraction failed:", err);
    return {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      portfolio: "",
      jobTitle: "",
      pronouns: "",
      experience: [],
      education: [],
      skills: [],
      summary: "",
    };
  }
}

/* ----------------------------------------------------------------------------
 * Public: Generate Resume
 * --------------------------------------------------------------------------*/

function defaultResumeContent(
  user: { name: string | null; email: string },
  personalInfo?: { 
    fullName: string | null; 
    phone: string | null; 
    location: string | null; 
    linkedIn: string | null; 
    portfolio: string | null; 
    jobTitle: string | null; 
    pronouns: string | null; 
  } | null
): ResumeContent {
  return {
    header: {
      name: personalInfo?.fullName || user.name || "Unknown",
      email: user.email || "user@example.com",
      phone: personalInfo?.phone || "",
      linkedIn: personalInfo?.linkedIn || "",
      portfolio: personalInfo?.portfolio || "",
      summary: "Professional with relevant skills and experience.",
    },
    skills: [],
    experience: [],
    education: [],
    projects: [],
    achievements: [],
  };
}

export const generateResume = async (
  userId: string,
  jobDescriptionId?: string,
  tone?: string
): Promise<ResumeContent> => {
  // Fetch or create profile shell
  let profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true, skills: true, experience: true, education: true, projects: true, achievements: true },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        achievements: [],
      },
      select: { id: true, skills: true, experience: true, education: true, projects: true, achievements: true },
    });
  }

  // User details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!user) throw new Error("User not found");

  // Personal information
  const personalInfo = await prisma.personalInformation.findUnique({
    where: { profileId: profile.id },
    select: { 
      fullName: true, 
      phone: true, 
      location: true, 
      linkedIn: true, 
      portfolio: true, 
      jobTitle: true, 
      pronouns: true 
    },
  });

  // Job description
  let jobDescription: { parsedData: unknown } | null = null;
  if (jobDescriptionId) {
    jobDescription = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId },
      select: { parsedData: true },
    });
    if (!jobDescription) throw new Error("Job description not found");
  }

  // Normalize JSON fields from profile
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const achievements = Array.isArray(profile.achievements) ? profile.achievements : [];

  // Normalize skills to string[]
  const skills: string[] = Array.isArray(profile.skills)
    ? (profile.skills as any[])
        .map((skill) => {
          if (typeof skill === "string") return skill;
          if (skill && typeof skill === "object" && "name" in skill) return (skill as any).name as string;
          return null;
        })
        .filter(Boolean) as string[]
    : [];

  // Extract technologies from projects and add to skills
  const projectTechnologies: string[] = [];
  if (Array.isArray(projects)) {
    projects.forEach((project: any) => {
      // Extract from project.technologies array
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech: string) => {
          if (tech && typeof tech === "string") {
            projectTechnologies.push(tech.trim());
          }
        });
      }
      
      // Extract from project.stack (legacy field)
      if (project.stack && typeof project.stack === "string") {
        project.stack.split(',').forEach((tech: string) => {
          if (tech && tech.trim()) {
            projectTechnologies.push(tech.trim());
          }
        });
      }
      
      // Extract from project.description (look for common tech terms)
      if (project.description && typeof project.description === "string") {
        const techTerms = project.description.match(/\b(React|Angular|Vue|Node\.?js|Express\.?js|Next\.?js|TypeScript|JavaScript|Python|Java|Spring|Django|PostgreSQL|MySQL|MongoDB|AWS|Docker|Kubernetes|Git|Jenkins|CI\/CD|REST|API|GraphQL|Tailwind|Bootstrap|jQuery|Lodash|Axios|HTML|CSS|Prisma|Firebase|Google Cloud Platform|Supabase|Postman|Xcode)\b/gi);
        if (techTerms) {
          techTerms.forEach((tech: string) => {
            if (tech && tech.trim()) {
              projectTechnologies.push(tech.trim());
            }
          });
        }
      }
    });
  }

  // Extract technologies from experience descriptions
  const experienceTechnologies: string[] = [];
  if (Array.isArray(experience)) {
    experience.forEach((exp: any) => {
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        exp.responsibilities.forEach((resp: string) => {
          if (resp && typeof resp === "string") {
            const techTerms = resp.match(/\b(React|Angular|Vue|Node\.?js|Express\.?js|Next\.?js|TypeScript|JavaScript|Python|Java|Spring|Django|PostgreSQL|MySQL|MongoDB|AWS|Docker|Kubernetes|Git|Jenkins|CI\/CD|REST|API|GraphQL|Tailwind|Bootstrap|jQuery|Lodash|Axios|HTML|CSS|Prisma|Firebase|Google Cloud Platform|Supabase|Postman|Xcode)\b/gi);
            if (techTerms) {
              techTerms.forEach((tech: string) => {
                if (tech && tech.trim()) {
                  experienceTechnologies.push(tech.trim());
                }
              });
            }
          }
        });
      }
    });
  }

  // Combine database skills with project technologies and experience technologies
  const allSkillsFromDatabase = [...skills, ...projectTechnologies, ...experienceTechnologies];
  
  // Remove duplicates while preserving order
  const uniqueSkills = Array.from(new Set(allSkillsFromDatabase.map(skill => skill.toLowerCase()))).map(lowerSkill => 
    allSkillsFromDatabase.find(skill => skill.toLowerCase() === lowerSkill) || lowerSkill
  );
  
  // Log for debugging
  console.log('=== SKILLS EXTRACTION ===');
  console.log('Database skills:', skills);
  console.log('Project technologies:', projectTechnologies);
  console.log('Experience technologies:', experienceTechnologies);
  console.log('Combined skills (with duplicates):', allSkillsFromDatabase);
  console.log('Unique skills:', uniqueSkills);
  console.log('========================');

  // Start with sensible defaults
  let resumeContent: ResumeContent = {
    ...defaultResumeContent(user, personalInfo),
    skills: uniqueSkills, // Use unique combined skills including project technologies
    experience: experience as any,
    education: education as any,
    projects: projects as any,
    achievements: achievements as any,
  };

  try {
    // Prepare static content (user-provided, doesn't change)
    const staticContent = {
      header: {
        name: personalInfo?.fullName || user.name || "Unknown",
        email: user.email || "user@example.com",
        phone: personalInfo?.phone || "",
        linkedIn: personalInfo?.linkedIn || "",
        portfolio: personalInfo?.portfolio || "",
      },
      education: education as any, // Education is static
    };

    // Prepare dynamic content data for AI generation (NO personal info)
    const dynamicContentData = {
      skills: uniqueSkills, // Include unique combined skills from all sources
      experience: resumeContent.experience,
      projects: resumeContent.projects,
      achievements: resumeContent.achievements,
    };

    const jobData = jobDescription ? jobDescription.parsedData ?? {} : {};


    const formatted = await generationPrompt.format({
      profile: JSON.stringify(dynamicContentData),
      jobDescription: JSON.stringify(jobData),
    });

    const raw = await callModelString(formatted);
    const jsonText = extractJsonFromText(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      const fixed = jsonText.replace(/,(\s*[}\]])/g, "$1");
      parsed = JSON.parse(fixed);
    }

    const safe = DynamicResumeContentSchema.safeParse(parsed);
    if (safe.success) {
      const dynamicContent = safe.data;
      
      // Merge static and dynamic content
      resumeContent = {
        ...staticContent,
        ...dynamicContent,
        education: staticContent.education, // Keep static education
        header: {
          ...staticContent.header,
          summary: dynamicContent.summary, // Add AI-generated summary to header
        },
      };
      
      console.log('=== GENERATED RESUME CONTENT ===');
      console.log('Static Content:', JSON.stringify(staticContent, null, 2));
      console.log('Dynamic Content:', JSON.stringify(dynamicContent, null, 2));
      console.log('Final Merged Resume:', JSON.stringify(resumeContent, null, 2));
      console.log('================================');
    } else {
      console.warn("DynamicResumeContentSchema validation failed:", safe.error.flatten());
    }
  } catch (error) {
    console.error("Resume generation failed:", error);
  }

  // Ensure email is properly set
  if (!resumeContent.header.email || resumeContent.header.email.trim() === '') {
    resumeContent.header.email = user.email || "user@example.com";
  }

  return resumeContent;
};
