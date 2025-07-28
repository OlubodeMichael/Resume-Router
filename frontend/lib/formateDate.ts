const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Present";
    
    // Check if it's already in "Month Year" format (e.g., "Jan 2023")
    if (dateString.match(/^[A-Za-z]{3} \d{4}$/)) {
      return dateString;
    }
    
    // Handle ISO date format or other date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

export default formatDate;