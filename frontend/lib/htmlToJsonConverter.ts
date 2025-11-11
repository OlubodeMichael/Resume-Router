/**
 * Utility to convert HTML edits back to JSON structure
 * Extracts content from HTML elements and updates JSON based on template structure
 */

import { setAtPath } from "./path";
import { sanitizeHtml } from "./sanitize";
import { isPlainTextPath } from "./fieldConfig";

type ResumeJsonShape = Record<string, unknown> & {
  education?: Array<{
    school?: string;
    degree?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }>;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string[];
  }>;
  projects?: Array<{
    title?: string;
    bullets?: string[];
  }>;
  skills?: string[];
  categorizedSkills?: {
    languages: string[];
    librariesFrameworks: string[];
    developerTools: string[];
  };
  certifications?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  awardsHonors?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  volunteer?: Array<{
    organization: string;
    role?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }>;
  leadership?: Array<{
    organization: string;
    role?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }>;
  publications?: Array<{
    title: string;
    venue?: string;
    date?: string;
    link?: string;
    bullets?: string[];
  }>;
  references?: Array<{
    name: string;
    contact?: string;
    relationship?: string;
    notes?: string;
  }>;
};

/**
 * Extract HTML content from an element (preserving styling)
 */
function extractElementHtml(element: Element): string {
  const html = element.innerHTML.trim();
  
  // If it's just plain text, return as is
  if (!html.includes('<')) {
    return html;
  }
  
  // Clean up the HTML but preserve styling
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove data-path attributes from nested elements (they're metadata, not content)
  tempDiv.querySelectorAll('[data-path]').forEach(el => {
    el.removeAttribute('data-path');
  });
  
  return tempDiv.innerHTML.trim();
}

/**
 * Parse HTML and update JSON based on template structure (Ryan template)
 * Since templates don't have data-path attributes, we infer paths from HTML structure
 */
export function updateJsonFromHtml(
  html: string, 
  currentJson: Record<string, unknown>
): Record<string, unknown> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let updatedJson = JSON.parse(JSON.stringify(currentJson)); // Deep clone
  const mutableJson = updatedJson as ResumeJsonShape;
  
  // First, try to find elements with data-path attributes (if template has them)
  const elementsWithPath = doc.querySelectorAll('[data-path]');
  
  if (elementsWithPath.length > 0) {
    // Use data-path attributes if available
    elementsWithPath.forEach((element) => {
      const path = element.getAttribute('data-path');
      if (!path) return;
      
      const htmlContent = extractElementHtml(element);
      const value = isPlainTextPath(path)
        ? element.textContent?.trim() || ""
        : sanitizeHtml(htmlContent);
      
      updatedJson = setAtPath(updatedJson, path, value);
    });
  } else {
    // Fallback: Parse HTML structure and infer JSON paths (Ryan template structure)
    // This is template-specific and works for the Ryan template
    
    // Extract header name (h1) - captures any text changes including newly added text
    const h1 = doc.querySelector('h1');
    if (h1) {
      const htmlContent = extractElementHtml(h1);
      const sanitized = sanitizeHtml(htmlContent);
      // Always update name field (even if empty, to capture deletions)
      updatedJson = setAtPath(updatedJson, 'header.name', sanitized);
    }
    
    // Extract header contact info
    const headerInfo = doc.querySelector('.headerInfo');
    if (headerInfo) {
      const links = headerInfo.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = sanitizeHtml(extractElementHtml(link));
        
        if (href.startsWith('mailto:')) {
          updatedJson = setAtPath(updatedJson, 'header.email', text);
        } else if (href.includes('linkedin.com')) {
          updatedJson = setAtPath(updatedJson, 'header.linkedIn', href);
        } else if (href && !href.includes('linkedin.com') && !href.startsWith('mailto:')) {
          updatedJson = setAtPath(updatedJson, 'header.portfolio', href);
        }
      });
      
      const listItems = headerInfo.querySelectorAll('li');
      listItems.forEach(li => {
        const text = li.textContent?.trim() || '';
        const link = li.querySelector('a');
        // If it's not a link and looks like a phone number (or is any text without @)
        if (!link) {
          // Check if it's a phone number pattern
          if (/[\d\s\-\(\)]+/.test(text) && text.length >= 10 && !text.includes('@')) {
            const htmlContent = extractElementHtml(li);
            updatedJson = setAtPath(updatedJson, 'header.phone', sanitizeHtml(htmlContent));
          }
          // If it's just text without special characters, might be a phone number
          else if (text && !text.includes('@') && !text.includes('http')) {
            const htmlContent = extractElementHtml(li);
            updatedJson = setAtPath(updatedJson, 'header.phone', sanitizeHtml(htmlContent));
          }
        }
      });
    }
    
    // Extract education entries - capture ALL entries found in HTML (including newly added ones)
    const educationSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('education');
    });
    
    if (educationSection) {
      const educationItems: Array<{
        school: string;
        degree: string;
        location?: string;
        startDate?: string;
        endDate?: string;
      }> = [];
      const educationGroups = educationSection.querySelectorAll('h3');
      
      educationGroups.forEach((group) => {
        const spans = group.querySelectorAll('span');
        const school = spans[0]?.textContent?.trim() || '';
        const dateSpan = group.querySelector('.normal')?.textContent?.trim() || '';
        const dates = dateSpan.split('–').map(d => d.trim()).filter(Boolean);
        
        const h4 = group.nextElementSibling;
        if (h4 && h4.tagName === 'H4') {
          const h4Spans = h4.querySelectorAll('span');
          const degree = h4Spans[0]?.textContent?.trim() || '';
          const location = h4Spans[1]?.textContent?.trim() || '';
          
          // Capture education entry if it has at least a school or degree (handles partial/new entries)
          if (school || degree) {
            const eduItem = {
              school: school ? sanitizeHtml(extractElementHtml(spans[0] || group)) : '',
              degree: degree ? sanitizeHtml(extractElementHtml(h4Spans[0] || h4)) : '',
              location: location || undefined,
              startDate: dates[0] || undefined,
              endDate: dates[1] || undefined,
            };
            educationItems.push(eduItem);
          }
        } else if (school) {
          // Handle case where there's a school but no h4 (partial/new entry)
          educationItems.push({
            school: sanitizeHtml(extractElementHtml(spans[0] || group)),
            degree: '',
            location: undefined,
            startDate: dates[0] || undefined,
            endDate: dates[1] || undefined,
          });
        }
      });
      
      // Replace entire education array with what's found in HTML (includes new entries)
      if (educationItems.length > 0) {
        mutableJson.education = educationItems;
      }
    }
    
    // Extract experience entries - capture ALL entries found in HTML (including newly added ones)
    const experienceSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('experience');
    });
    
    if (experienceSection) {
      const experienceItems: Array<{
        title: string;
        company: string;
        location?: string;
        startDate: string;
        endDate?: string;
        responsibilities?: string[];
      }> = [];
      const experienceGroups = experienceSection.querySelectorAll('h3');
      
      experienceGroups.forEach((group) => {
        const spans = group.querySelectorAll('span');
        const role = spans[0]?.textContent?.trim() || '';
        const dateSpan = group.querySelector('.normal')?.textContent?.trim() || '';
        const dates = dateSpan.split('–').map(d => d.trim()).filter(Boolean);
        
        const h4 = group.nextElementSibling;
        if (h4 && h4.tagName === 'H4') {
          const h4Spans = h4.querySelectorAll('span');
          const company = h4Spans[0]?.textContent?.trim() || '';
          const location = h4Spans[1]?.textContent?.trim() || '';
          
          const ul = h4.nextElementSibling;
          const responsibilities: string[] = [];
          if (ul && ul.tagName === 'UL') {
            ul.querySelectorAll('li').forEach((li) => {
              const htmlContent = extractElementHtml(li);
              const sanitized = sanitizeHtml(htmlContent);
              // Only add non-empty bullets (including newly added ones)
              if (sanitized.trim()) {
                responsibilities.push(sanitized);
              }
            });
          }
          
          // Capture experience entry if it has at least a role or company (handles partial/new entries)
          if (role || company) {
            const expItem = {
              title: role ? sanitizeHtml(extractElementHtml(spans[0] || group)) : '',
              company: company ? sanitizeHtml(extractElementHtml(h4Spans[0] || h4)) : '',
              location: location || undefined,
              startDate: dates[0] || '',
              endDate: dates[1] || undefined,
              responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
            };
            experienceItems.push(expItem);
          }
        } else if (role) {
          // Handle case where there's a role but no h4 (partial/new entry)
          experienceItems.push({
            title: sanitizeHtml(extractElementHtml(spans[0] || group)),
            company: '',
            location: undefined,
            startDate: dates[0] || '',
            endDate: dates[1] || undefined,
            responsibilities: undefined,
          });
        }
      });
      
      // Replace entire experience array with what's found in HTML (includes new entries)
      if (experienceItems.length > 0) {
        mutableJson.experience = experienceItems;
      }
    }
    
    // Extract projects - capture ALL entries found in HTML (including newly added ones)
    const projectsSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('project');
    });
    
    if (projectsSection) {
      const projectItems: Array<{
        title: string;
        bullets?: string[];
      }> = [];
      const projectGroups = projectsSection.querySelectorAll('h3');
      
      projectGroups.forEach((group) => {
        const nameLink = group.querySelector('a') || group.querySelector('span');
        const title = nameLink?.textContent?.trim() || '';
        
        const ul = group.nextElementSibling;
        const bullets: string[] = [];
        if (ul && ul.tagName === 'UL') {
          ul.querySelectorAll('li').forEach(li => {
            const htmlContent = extractElementHtml(li);
            const sanitized = sanitizeHtml(htmlContent);
            // Only add non-empty bullets (including newly added ones)
            if (sanitized.trim()) {
              bullets.push(sanitized);
            }
          });
        }
        
        // Capture project entry if it has a title (handles new entries)
        if (title) {
          projectItems.push({
            title: sanitizeHtml(extractElementHtml(nameLink || group)),
            bullets: bullets.length > 0 ? bullets : undefined,
          });
        }
      });
      
      // Replace entire projects array with what's found in HTML (includes new entries)
      if (projectItems.length > 0) {
        mutableJson.projects = projectItems;
      }
    }
    
    // Extract skills - parse from HTML structure (preserves styling)
    const skillsSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('skill');
    });
    
    if (skillsSection) {
      // Initialize categorizedSkills structure
      const categorizedSkills: {
        languages: string[];
        librariesFrameworks: string[];
        developerTools: string[];
      } = {
        languages: [],
        librariesFrameworks: [],
        developerTools: [],
      };
      
      // Find all paragraphs in the skills section
      const skillParagraphs = skillsSection.querySelectorAll('p');
      
      skillParagraphs.forEach(p => {
        const text = p.textContent || '';
        const htmlContent = extractElementHtml(p);
        
        // Helper function to extract skills from HTML paragraph
        const extractSkillsFromParagraph = (html: string, label: string): string[] => {
          // Try multiple patterns to extract skills after the label
          // Pattern 1: <strong>Label:</strong> skills, skills, skills
          const pattern1 = new RegExp(`<strong>${label}[:\s]*<\\/strong>\\s*(.+?)(?=<strong>|$)`, 'i');
          // Pattern 2: Label: skills, skills, skills (no strong tag)
          const pattern2 = new RegExp(`${label}[:\s]+(.+?)(?=<strong>|$)`, 'i');
          // Pattern 3: Just extract everything after the label text
          const pattern3 = new RegExp(`${label}[:\s]+(.+)`, 'i');
          
          let skillsStr = '';
          const match1 = html.match(pattern1);
          const match2 = html.match(pattern2);
          const match3 = html.match(pattern3);
          
          if (match1) {
            skillsStr = match1[1].trim();
          } else if (match2) {
            skillsStr = match2[1].trim();
          } else if (match3) {
            skillsStr = match3[1].trim();
          } else {
            // Last resort: remove the label and use the rest
            skillsStr = html.replace(new RegExp(`<strong>${label}[:\s]*<\\/strong>`, 'gi'), '').trim();
          }
          
          // Remove any leading colon and space (in case it was included)
          skillsStr = skillsStr.replace(/^:\s*/, '').trim();
          
          if (skillsStr) {
            // Split by comma and preserve HTML styling
            return skillsStr.split(',').map(s => {
              const trimmed = s.trim();
              // Remove any leading colon from individual skills (shouldn't happen, but just in case)
              const cleaned = trimmed.replace(/^:\s*/, '').trim();
              // Preserve HTML if present, otherwise return plain text
              return sanitizeHtml(cleaned);
            }).filter(Boolean);
          }
          
          return [];
        };
        
        // Check which category this paragraph belongs to
        if (text.toLowerCase().includes('languages')) {
          const skills = extractSkillsFromParagraph(htmlContent, 'Languages');
          if (skills.length > 0) {
            categorizedSkills.languages = skills;
          }
        } else if (text.toLowerCase().includes('developer tools')) {
          const skills = extractSkillsFromParagraph(htmlContent, 'Developer Tools');
          if (skills.length > 0) {
            categorizedSkills.developerTools = skills;
          }
        } else if (text.toLowerCase().includes('libraries') || text.toLowerCase().includes('frameworks')) {
          // Try "Libraries/Frameworks" first, then individual terms
          let skills: string[] = [];
          if (text.toLowerCase().includes('libraries/frameworks')) {
            skills = extractSkillsFromParagraph(htmlContent, 'Libraries/Frameworks');
          } else if (text.toLowerCase().includes('libraries')) {
            skills = extractSkillsFromParagraph(htmlContent, 'Libraries');
          } else if (text.toLowerCase().includes('frameworks')) {
            skills = extractSkillsFromParagraph(htmlContent, 'Frameworks');
          }
          
          if (skills.length > 0) {
            categorizedSkills.librariesFrameworks = skills;
          }
        }
      });
      
      // Always update categorizedSkills (even if empty arrays, to preserve structure)
      mutableJson.categorizedSkills = categorizedSkills;
      
      // Also update flat skills array for backward compatibility
      const allSkills = [
        ...categorizedSkills.languages,
        ...categorizedSkills.librariesFrameworks,
        ...categorizedSkills.developerTools,
      ];
      
      if (allSkills.length > 0) {
        mutableJson.skills = allSkills;
      } else if (!mutableJson.skills) {
        // Preserve existing skills if no new skills found
        mutableJson.skills = [];
      }
    }

    const certificationsSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('certification');
    });

    if (certificationsSection) {
      const certificationItems: Array<{
        title: string;
        issuer?: string;
        date?: string;
        description?: string;
      }> = [];

      const certificationEntries = certificationsSection.querySelectorAll('h3');

      certificationEntries.forEach(entry => {
        const spans = entry.querySelectorAll('span');
        const titleSpan = spans[0];
        const dateSpan = entry.querySelector('.normal');
        const title = titleSpan ? titleSpan.textContent?.trim() : '';
        const date = dateSpan ? dateSpan.textContent?.trim() : '';
        const issuerParagraph = entry.nextElementSibling;
        let issuer: string | undefined;
        let description: string | undefined;

        if (issuerParagraph && issuerParagraph.tagName === 'P') {
          const issuerText = issuerParagraph.textContent?.trim() || '';
          const issuerHtml = sanitizeHtml(extractElementHtml(issuerParagraph));
          issuer = issuerText ? issuerHtml : undefined;

          const maybeDescription = issuerParagraph.nextElementSibling;
          if (maybeDescription && maybeDescription.tagName === 'P') {
            const descHtml = sanitizeHtml(extractElementHtml(maybeDescription));
            description = descHtml || undefined;
          }
        }

        if (title || issuer || date || description) {
          certificationItems.push({
            title: title ? sanitizeHtml(extractElementHtml(titleSpan || entry)) : '',
            issuer,
            date: date || undefined,
            description,
          });
        }
      });

      if (certificationItems.length > 0) {
        mutableJson.certifications = certificationItems;
      }
    }

    const awardsSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('award');
    });

    if (awardsSection) {
      const awardsItems: Array<{
        title: string;
        issuer?: string;
        date?: string;
        description?: string;
      }> = [];

      const awardsEntries = awardsSection.querySelectorAll('h3');

      awardsEntries.forEach(entry => {
        const spans = entry.querySelectorAll('span');
        const titleSpan = spans[0];
        const dateSpan = entry.querySelector('.normal');
        const title = titleSpan ? titleSpan.textContent?.trim() : '';
        const date = dateSpan ? dateSpan.textContent?.trim() : '';

        let issuer: string | undefined;
        let description: string | undefined;

        const issuerParagraph = entry.nextElementSibling;
        if (issuerParagraph && issuerParagraph.tagName === 'P') {
          const issuerText = issuerParagraph.textContent?.trim() || '';
          const issuerHtml = sanitizeHtml(extractElementHtml(issuerParagraph));
          issuer = issuerText ? issuerHtml : undefined;

          const maybeDescription = issuerParagraph.nextElementSibling;
          if (maybeDescription && maybeDescription.tagName === 'P') {
            const descHtml = sanitizeHtml(extractElementHtml(maybeDescription));
            description = descHtml || undefined;
          }
        }

        if (title || issuer || date || description) {
          awardsItems.push({
            title: title ? sanitizeHtml(extractElementHtml(titleSpan || entry)) : '',
            issuer,
            date: date || undefined,
            description,
          });
        }
      });

      if (awardsItems.length > 0) {
        mutableJson.awardsHonors = awardsItems;
      }
    }

    const volunteerSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('volunteer');
    });

    if (volunteerSection) {
      const volunteerItems: Array<{
        organization: string;
        role?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        bullets?: string[];
      }> = [];

      const volunteerEntries = volunteerSection.querySelectorAll('h3');

      volunteerEntries.forEach(entry => {
        const spans = entry.querySelectorAll('span');
        const roleSpan = spans[0];
        const dateSpan = entry.querySelector('.normal');
        const role = roleSpan ? roleSpan.textContent?.trim() : '';
        const dateRange = dateSpan ? dateSpan.textContent?.trim() : '';
        const dates = dateRange.split('–').map(d => d.trim()).filter(Boolean);

        const h4 = entry.nextElementSibling;
        let organization = '';
        let location: string | undefined;

        if (h4 && h4.tagName === 'H4') {
          const h4Spans = h4.querySelectorAll('span');
          organization = h4Spans[0]?.textContent?.trim() || '';
          location = h4Spans[1]?.textContent?.trim() || undefined;
        }

        const bullets: string[] = [];
        const pointer = h4 ? h4.nextElementSibling : entry.nextElementSibling;
        if (pointer && pointer.tagName === 'UL') {
          pointer.querySelectorAll('li').forEach(li => {
            const htmlContent = sanitizeHtml(extractElementHtml(li));
            if (htmlContent.trim()) bullets.push(htmlContent);
          });
        }

        if (organization || role || bullets.length > 0) {
          volunteerItems.push({
            organization: organization ? sanitizeHtml(extractElementHtml((h4?.querySelectorAll('span') || [])[0] || h4 || entry)) : '',
            role: role ? sanitizeHtml(extractElementHtml(roleSpan || entry)) : undefined,
            location,
            startDate: dates[0] || undefined,
            endDate: dates[1] || undefined,
            bullets: bullets.length > 0 ? bullets : undefined,
          });
        }
      });

      if (volunteerItems.length > 0) {
        mutableJson.volunteer = volunteerItems;
      }
    }

    const leadershipSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('leadership');
    });

    if (leadershipSection) {
      const leadershipItems: Array<{
        organization: string;
        role?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        bullets?: string[];
      }> = [];

      const leadershipEntries = leadershipSection.querySelectorAll('h3');

      leadershipEntries.forEach(entry => {
        const spans = entry.querySelectorAll('span');
        const roleSpan = spans[0];
        const dateSpan = entry.querySelector('.normal');
        const role = roleSpan ? roleSpan.textContent?.trim() : '';
        const dateRange = dateSpan ? dateSpan.textContent?.trim() : '';
        const dates = dateRange.split('–').map(d => d.trim()).filter(Boolean);

        const h4 = entry.nextElementSibling;
        let organization = '';
        let location: string | undefined;

        if (h4 && h4.tagName === 'H4') {
          const h4Spans = h4.querySelectorAll('span');
          organization = h4Spans[0]?.textContent?.trim() || '';
          location = h4Spans[1]?.textContent?.trim() || undefined;
        }

        const bullets: string[] = [];
        const pointer = h4 ? h4.nextElementSibling : entry.nextElementSibling;
        if (pointer && pointer.tagName === 'UL') {
          pointer.querySelectorAll('li').forEach(li => {
            const htmlContent = sanitizeHtml(extractElementHtml(li));
            if (htmlContent.trim()) bullets.push(htmlContent);
          });
        }

        if (organization || role || bullets.length > 0) {
          leadershipItems.push({
            organization: organization ? sanitizeHtml(extractElementHtml((h4?.querySelectorAll('span') || [])[0] || h4 || entry)) : '',
            role: role ? sanitizeHtml(extractElementHtml(roleSpan || entry)) : undefined,
            location,
            startDate: dates[0] || undefined,
            endDate: dates[1] || undefined,
            bullets: bullets.length > 0 ? bullets : undefined,
          });
        }
      });

      if (leadershipItems.length > 0) {
        mutableJson.leadership = leadershipItems;
      }
    }

    const publicationsSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('publication');
    });

    if (publicationsSection) {
      const publicationItems: Array<{
        title: string;
        venue?: string;
        date?: string;
        link?: string;
        bullets?: string[];
      }> = [];

      const publicationEntries = publicationsSection.querySelectorAll('h3');

      publicationEntries.forEach(entry => {
        const span = entry.querySelector('span');
        let title = '';
        let link: string | undefined;
        let anchorElement: HTMLAnchorElement | null = null;

        if (span) {
          const anchorCandidate = span.querySelector('a');
          if (anchorCandidate) {
            anchorElement = anchorCandidate;
            title = anchorCandidate.textContent?.trim() || '';
            link = anchorCandidate.getAttribute('href') || undefined;
          } else {
            title = span.textContent?.trim() || '';
          }
        }

        const dateSpan = entry.querySelector('.normal');
        const date = dateSpan ? dateSpan.textContent?.trim() : '';

        const venueParagraph = entry.nextElementSibling;
        let venue: string | undefined;

        if (venueParagraph && venueParagraph.tagName === 'P') {
          const venueText = venueParagraph.textContent?.trim() || '';
          const venueHtml = sanitizeHtml(extractElementHtml(venueParagraph));
          venue = venueText ? venueHtml : undefined;
        }

        const bullets: string[] = [];
        const pointer = venueParagraph ? venueParagraph.nextElementSibling : entry.nextElementSibling;
        if (pointer && pointer.tagName === 'UL') {
          pointer.querySelectorAll('li').forEach(li => {
            const htmlContent = sanitizeHtml(extractElementHtml(li));
            if (htmlContent.trim()) bullets.push(htmlContent);
          });
        }

        if (title || venue || date || bullets.length > 0) {
          publicationItems.push({
            title: title ? sanitizeHtml(extractElementHtml(anchorElement || span || entry)) : '',
            venue,
            date: date || undefined,
            link,
            bullets: bullets.length > 0 ? bullets : undefined,
          });
        }
      });

      if (publicationItems.length > 0) {
        mutableJson.publications = publicationItems;
      }
    }

    const referencesSection = Array.from(doc.querySelectorAll('section')).find(section => {
      const h2 = section.querySelector('h2');
      return h2?.textContent?.toLowerCase().includes('reference');
    });

    if (referencesSection) {
      const referencesItems: Array<{
        name: string;
        contact?: string;
        relationship?: string;
        notes?: string;
      }> = [];

      const listItems = referencesSection.querySelectorAll('li');

      listItems.forEach(li => {
        const strong = li.querySelector('strong');
        const name = strong ? strong.textContent?.trim() : '';

        const contactParts: string[] = [];
        const rest = li.innerHTML.replace(/<strong>.*?<\/strong>/, '').trim();

        if (rest) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = rest;
          const text = tempDiv.textContent || '';

          const segments = text.split(/[\n\r]/).map(s => s.trim()).filter(Boolean);
          contactParts.push(...segments);
        }

        const notesSpan = li.querySelector('.reference-notes');
        const notes = notesSpan ? sanitizeHtml(extractElementHtml(notesSpan)) : undefined;

        if (name || contactParts.length > 0 || notes) {
          referencesItems.push({
            name: name ? sanitizeHtml(extractElementHtml(strong || li)) : '',
            contact: contactParts.length > 0 ? contactParts.join(' ') : undefined,
            relationship: undefined,
            notes,
          });
        }
      });

      if (referencesItems.length > 0) {
        mutableJson.references = referencesItems;
      }
    }
  }
  
  return updatedJson;
}

