/**
 * Format degree to show "Degree in Major" format
 * e.g., "Bachelor of Science (B.S.)" + "Computer Science" = "Bachelor of Science in Computer Science"
 */

export function formatDegree(degree: string, fieldOfStudy?: string): string {
    if (!degree) return '';
    
    // Remove parentheses and their contents (e.g., "(B.S.)" -> "")
    const cleanDegree = degree.replace(/\s*\([^)]*\)\s*/g, '').trim();
    
    // If we have a field of study, check if it's already included in the degree
    if (fieldOfStudy && fieldOfStudy.trim()) {
      const cleanFieldOfStudy = fieldOfStudy.trim();
      
      // Check if the field of study is already mentioned in the degree (case insensitive)
      const degreeLower = cleanDegree.toLowerCase();
      const fieldLower = cleanFieldOfStudy.toLowerCase();
      
      // If the field of study is already in the degree, just return the clean degree
      if (degreeLower.includes(fieldLower)) {
        return cleanDegree;
      }
      
      // Otherwise, combine them
      return `${cleanDegree} in ${cleanFieldOfStudy}`;
    }
    
    return cleanDegree;
  }