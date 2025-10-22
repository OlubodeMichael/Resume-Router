import { ryanTemplateSpec } from '@/Templates/html/ryan'

// Type for template data - matches TemplateData interface from TemplateEngine
interface TemplateData {
  [key: string]: string | number | boolean | TemplateData | TemplateData[];
}

/**
 * Download resume as PDF
 */
export const downloadResumeAsPDF = async (
  editorRef: React.RefObject<HTMLDivElement | null>,
  templateData: TemplateData,
  setIsDownloading: (loading: boolean) => void,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  if (!editorRef.current) return;
  
  setIsDownloading(true);
  
  try {
    // Get the current HTML content from the editor
    const currentHtml = editorRef.current.innerHTML;
    //console.log('📄 HTML content extracted, length:', currentHtml.length);
    
    // Import the template engine to generate proper standalone HTML
    const { buildStandaloneHTML } = await import('@/lib/TemplateEngine');
    //console.log('⚙️ Building standalone HTML...');
    
    // Generate standalone HTML with proper CSS and structure
    const standaloneHtml = buildStandaloneHTML(ryanTemplateSpec, templateData, currentHtml);
    //console.log('✅ Standalone HTML generated, length:', standaloneHtml.length);
    
    //console.log('🌐 Sending request to PDF API...');
    // Generate PDF using the export API
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        html: standaloneHtml,
        filename: 'resume.pdf' 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
    }
    
    //console.log('📥 PDF response received, processing...');
    const blob = await response.blob(); 
    //console.log('📄 PDF blob created, size:', blob.size, 'bytes');
    
    // Download the PDF file
    //console.log('💾 Downloading PDF...');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume.pdf';
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    //console.log('✅ PDF download completed successfully!');
    onSuccess?.();
  } catch (error) {
    console.error('❌ Download failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onError?.(errorMessage);
    alert(`Failed to download resume: ${errorMessage}`);
  } finally {
    setIsDownloading(false);
  }
}
