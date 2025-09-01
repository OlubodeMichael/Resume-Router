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