import { formatDate } from "../../utils/formateDate";
import type { ExtractedProfile } from "./resume.service";

type ExperienceEntry = {
  title: string;
  company?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  responsibilities?: string[];
  description?: string[];
  achievements?: string[];
  technologies?: string[];
};

type EducationEntry = {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string | null;
  honors?: string | null;
};

type ProjectEntry = {
  name: string;
  description?: string[] | string | null;
  technologies?: string[];
  startDate?: string | null;
  endDate?: string | null;
  url?: string | null;
  github?: string | null;
  achievements?: string[];
  responsibilities?: string[];
  highlights?: string[];
};

type CertificationEntry = {
  name: string;
  issuer?: string | null;
  date?: string | null;
  expirationDate?: string | null;
  credentialId?: string | null;
};

type AwardEntry = {
  title: string;
  issuer?: string | null;
  date?: string | null;
  description?: string | null;
};

type VolunteerEntry = {
  organization: string;
  role?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | string[] | null;
  achievements?: string[];
};

type PublicationEntry = {
  title: string;
  publisher?: string | null;
  date?: string | null;
  url?: string | null;
  authors?: string[];
};

export type ProfileSectionUpdate = {
  experience?: Array<{
    title: string;
    company?: string;
    location?: string;
    responsibilities: string[];
    startDate: string;
    endDate?: string | null;
    technologies?: string[];
  }>;
  education?: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string | null;
    gpa?: string;
    honors?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    startDate?: string;
    endDate?: string | null;
    url?: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    expirationDate?: string;
    credentialId?: string;
  }>;
  awardsHonors?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  volunteer?: Array<{
    org: string;
    role?: string;
    startDate?: string;
    endDate?: string | null;
    impact?: string[];
    url?: string;
  }>;
  leadership?: Array<{
    org: string;
    position?: string;
    startDate?: string;
    endDate?: string | null;
    achievements?: string[];
  }>;
  publications?: Array<{
    title: string;
    venue?: string;
    date?: string;
    url?: string;
    summary?: string;
  }>;
  references?: Array<{
    name: string;
    contact?: string;
  }>;
  summary?: string | null;
  objective?: string | null;
};

export type ProfileMappingResult = {
  update: ProfileSectionUpdate;
  updatedSections: string[];
  warnings: string[];
};

function safeFormatDate(date?: string | null): string | undefined {
  if (!date || typeof date !== "string") return undefined;
  const trimmed = date.trim();
  if (!trimmed) return undefined;

  try {
    return formatDate(trimmed);
  } catch {
    return trimmed;
  }
}

function cleanString(value?: string | null): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function cleanStringArray(values?: string[] | null): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0),
    ),
  );
}

function mapExperience(experiences: ExperienceEntry[], warnings: string[]) {
  const mapped: NonNullable<ProfileSectionUpdate["experience"]> = [];

  experiences.forEach((item, index) => {
    const title = cleanString(item.title);
    const company = cleanString(item.company);
    const startDate = safeFormatDate(item.startDate) ?? undefined;
    const endDate = safeFormatDate(item.endDate) ?? null;

    if (!title || !company || !startDate) {
      warnings.push(`Skipped experience entry #${index + 1}: missing title, company, or start date.`);
      return;
    }

    const responsibilities = cleanStringArray(
      item.responsibilities?.length ? item.responsibilities : item.achievements?.length ? item.achievements : item.description,
    );

    mapped.push({
      title,
      company,
      location: cleanString(item.location),
      responsibilities,
      startDate,
      endDate,
      technologies: cleanStringArray(item.technologies),
    });
  });

  return mapped;
}

function mapEducation(education: EducationEntry[], warnings: string[]) {
  const mapped: NonNullable<ProfileSectionUpdate["education"]> = [];

  education.forEach((item, index) => {
    const school = cleanString(item.institution);
    if (!school) {
      warnings.push(`Skipped education entry #${index + 1}: missing institution name.`);
      return;
    }

    mapped.push({
      school,
      degree: cleanString(item.degree),
      fieldOfStudy: cleanString(item.fieldOfStudy),
      startDate: safeFormatDate(item.startDate),
      endDate: safeFormatDate(item.endDate) ?? null,
      gpa: cleanString(item.gpa),
      honors: cleanString(item.honors),
    });
  });

  return mapped;
}

function splitIntoLines(value: string) {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•●]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function mapProjects(projects: ProjectEntry[], warnings: string[]) {
  const mapped: NonNullable<ProfileSectionUpdate["projects"]> = [];

  projects.forEach((item, index) => {
    const name = cleanString(item.name);
    if (!name) {
      warnings.push(`Skipped project entry #${index + 1}: missing project name.`);
      return;
    }

    const descriptionParts: string[] = [];

    const addLines = (lines: string[]) => {
      lines.forEach((line) => {
        splitIntoLines(line).forEach((subLine) => descriptionParts.push(subLine));
      });
    };

    if (Array.isArray(item.description)) {
      addLines(cleanStringArray(item.description));
    } else {
      const directDescription = cleanString(typeof item.description === "string" ? item.description : undefined);
      if (directDescription) {
        splitIntoLines(directDescription).forEach((line) => descriptionParts.push(line));
      }
    }

    addLines(cleanStringArray(item.achievements));
    addLines(cleanStringArray(item.responsibilities));
    addLines(cleanStringArray(item.highlights));

    const uniqueParts = Array.from(
      new Set(descriptionParts.filter(Boolean)),
    );
    const description = uniqueParts.length
      ? uniqueParts.join(" ")
      : undefined;

    mapped.push({
      name,
      description: description || undefined,
      technologies: cleanStringArray(item.technologies),
      startDate: safeFormatDate(item.startDate),
      endDate: safeFormatDate(item.endDate) ?? null,
      url: cleanString(item.url) ?? cleanString(item.github),
    });
  });

  return mapped;
}

function mapCertifications(certifications: CertificationEntry[], warnings: string[]) {
  const mapped: NonNullable<ProfileSectionUpdate["certifications"]> = [];

  certifications.forEach((item, index) => {
    const name = cleanString(item.name);
    if (!name) {
      warnings.push(`Skipped certification entry #${index + 1}: missing certification name.`);
      return;
    }

    mapped.push({
      name,
      issuer: cleanString(item.issuer),
      date: safeFormatDate(item.date),
      expirationDate: safeFormatDate(item.expirationDate),
      credentialId: cleanString(item.credentialId),
    });
  });

  return mapped;
}

function mapAwards(awards: AwardEntry[]) {
  return awards
    .map((item) => {
      const title = cleanString(item.title);
      if (!title) return null;

      return {
        title,
        issuer: cleanString(item.issuer),
        date: safeFormatDate(item.date),
        description: cleanString(item.description),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function mapVolunteer(volunteer: VolunteerEntry[]) {
  return volunteer
    .map((item) => {
      const org = cleanString(item.organization);
      if (!org) return null;

      const impact = cleanStringArray(item.achievements);
      const descriptionSource = Array.isArray(item.description)
        ? cleanStringArray(item.description).join(" ")
        : cleanString(item.description);
      const description = descriptionSource;
      if (description) {
        if (description.includes("\n")) {
          description
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => impact.push(line));
        } else {
          impact.push(description);
        }
      }

      return {
        org,
        role: cleanString(item.role),
        startDate: safeFormatDate(item.startDate),
        endDate: safeFormatDate(item.endDate) ?? null,
        impact: impact.length ? Array.from(new Set(impact)) : undefined,
        url: undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function mapPublications(publications: PublicationEntry[], warnings: string[]) {
  const mapped: NonNullable<ProfileSectionUpdate["publications"]> = [];

  publications.forEach((item, index) => {
    const title = cleanString(item.title);
    if (!title) {
      warnings.push(`Skipped publication entry #${index + 1}: missing publication title.`);
      return;
    }

    const authors = cleanStringArray(item.authors);
    const summary = authors.length ? `Authors: ${authors.join(", ")}` : undefined;

    mapped.push({
      title,
      venue: cleanString(item.publisher),
      date: safeFormatDate(item.date),
      url: cleanString(item.url),
      summary,
    });
  });

  return mapped;
}

export function mapExtractedProfileToProfile(extracted: ExtractedProfile): ProfileMappingResult {
  const warnings: string[] = [];
  const update: ProfileSectionUpdate = {};
  const updatedSections: string[] = [];

  const experience = mapExperience(extracted.experience ?? [], warnings);
  if (experience.length) {
    update.experience = experience;
    updatedSections.push("experience");
  }

  const education = mapEducation(extracted.education ?? [], warnings);
  if (education.length) {
    update.education = education;
    updatedSections.push("education");
  }

  const projects = mapProjects(extracted.projects ?? [], warnings);
  if (projects.length) {
    update.projects = projects;
    updatedSections.push("projects");
  }

  const skillsSet = new Set<string>();
  cleanStringArray(extracted.skills ?? []).forEach((skill) => skillsSet.add(skill));
  if (Array.isArray(extracted.languages)) {
    extracted.languages.forEach((language) => {
      const trimmedLanguage = cleanString(language.language);
      if (!trimmedLanguage) return;
      const proficiency = cleanString(language.proficiency);
      skillsSet.add(proficiency ? `${trimmedLanguage} (${proficiency})` : trimmedLanguage);
    });
  }
  if (skillsSet.size) {
    update.skills = Array.from(skillsSet);
    updatedSections.push("skills");
  }

  const certifications = mapCertifications(extracted.certifications ?? [], warnings);
  if (certifications.length) {
    update.certifications = certifications;
    updatedSections.push("certifications");
  }

  const awardsHonors = mapAwards(extracted.awards ?? []);
  if (awardsHonors.length) {
    update.awardsHonors = awardsHonors;
    updatedSections.push("awardsHonors");
  }

  const volunteer = mapVolunteer(extracted.volunteer ?? []);
  if (volunteer.length) {
    update.volunteer = volunteer;
    updatedSections.push("volunteer");
  }

  const publications = mapPublications(extracted.publications ?? [], warnings);
  if (publications.length) {
    update.publications = publications;
    updatedSections.push("publications");
  }

  const summary = cleanString(extracted.summary ?? extracted.additionalInfo ?? null);
  if (summary) {
    update.summary = summary;
    updatedSections.push("summary");
  }

  // Objective isn't always parsed; we leave it undefined unless you decide to map another field.

  return { update, updatedSections, warnings };
}

