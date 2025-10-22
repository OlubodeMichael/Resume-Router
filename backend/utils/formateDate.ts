export const formatDate = (dateString: string) => {
  // Handle yyyy-MM format directly to avoid timezone issues
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    const [year, month] = dateString.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }
  
  // Handle other date formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if parsing fails
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Format timestamp to human-readable format with date and time
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format timestamp to ISO string (for consistent API responses)
export const formatTimestampISO = (date: Date): string => {
  return date.toISOString();
};