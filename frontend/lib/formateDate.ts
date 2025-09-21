const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Present";
    
    // Check if it's already in "Month Year" format (e.g., "Jan 2023")
    if (dateString.match(/^[A-Za-z]{3} \d{4}$/)) {
      return dateString;
    }
    
    // Handle yyyy-MM format directly to avoid timezone issues
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      const [year, month] = dateString.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthIndex = parseInt(month) - 1; // Convert 1-indexed to 0-indexed
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
    }
    
    // Handle ISO date format or other date formats (with timezone safety)
    const date = new Date(dateString + 'T12:00:00'); // Add noon time to avoid timezone issues
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

export default formatDate;

export const convertDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  
  // If already in yyyy-MM format, return as is
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Convert from "MMM yyyy" format to "yyyy-MM" - direct conversion without Date objects
  const months: { [key: string]: string } = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const match = dateString.match(/^(\w{3})\s+(\d{4})$/);
  if (match) {
    const month = months[match[1]];
    const year = match[2];
    if (month) {
      return `${year}-${month}`;
    }
  }
  
  // Handle ISO date strings (e.g., "2021-07-15T00:00:00.000Z")
  if (dateString.includes('-') && dateString.includes('T')) {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    } catch (error) {
      console.error("Date conversion error:", error);
    }
  }
  
  return "";
};