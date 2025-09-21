import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptions {
  filename?: string;
  quality?: number;
  allowUserToChooseLocation?: boolean;
}

// File System Access API types
interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showSaveFilePicker?: (options: {
      suggestedName: string;
      types: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

export const exportToPDF = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = 'resume.pdf',
    quality = 0.7, // JPEG quality for compression
    allowUserToChooseLocation = false
  } = options;

  try {
    // Capture with optimized settings for smaller file size
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      background: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Additional compression: resize canvas if it's too large
    let finalCanvas = canvas;
    const maxCanvasSize = 2000; // Max width/height for reasonable file size
    
    if (canvas.width > maxCanvasSize || canvas.height > maxCanvasSize) {
      const resizeRatio = Math.min(maxCanvasSize / canvas.width, maxCanvasSize / canvas.height);
      const resizedWidth = Math.floor(canvas.width * resizeRatio);
      const resizedHeight = Math.floor(canvas.height * resizeRatio);
      
      finalCanvas = document.createElement('canvas');
      finalCanvas.width = resizedWidth;
      finalCanvas.height = resizedHeight;
      
      const ctx = finalCanvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, resizedWidth, resizedHeight);
    }

    // Convert to JPEG with compression for smaller file size
    const imgData = finalCanvas.toDataURL('image/jpeg', quality);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // Use points for better precision
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = finalCanvas.width;
    const imgHeight = finalCanvas.height;
    
    // Calculate scaling to fit the page while maintaining aspect ratio
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    
    // Center the image on the page
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    // Use JPEG format with FAST compression
    pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight, undefined, 'FAST');
    
    const pdfBlob = pdf.output('blob');
    await saveFile(pdfBlob, filename, allowUserToChooseLocation);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
};

// Helper function to save files
const saveFile = async (
  blob: Blob, 
  filename: string, 
  allowUserToChooseLocation: boolean = false
): Promise<void> => {
  if (allowUserToChooseLocation && 'showSaveFilePicker' in window) {
    try {
      // Use File System Access API if available and user wants to choose location
      const fileHandle = await window.showSaveFilePicker!({
        suggestedName: filename,
        types: [{
          description: 'PDF files',
          accept: { 'application/pdf': ['.pdf'] }
        }]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch {
      // Fall back to regular download if user cancels or API fails
      console.log('File picker cancelled or failed, using regular download');
    }
  }
  
  // Regular download approach
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate filename with timestamp
export const generateFilename = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_${timestamp}.${extension}`;
};

// Export with maximum compression for smallest file size
export const exportToPDFCompressed = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  return exportToPDF(element, {
    ...options,
    quality: 0.5, // More aggressive compression
  });
};



// Server-side PDF export using Puppeteer - generates tiny, crisp, vector PDFs
export const exportVectorPDF = async (
  html: string,
  filename: string = 'resume.pdf',
  allowUserToChooseLocation: boolean = false
): Promise<void> => {
  try {
    console.log('Starting vector PDF export...');
    
   
    
    
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, filename })
    });

  

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.error || 'PDF export failed');
    }

    const blob = await response.blob();
    console.log('PDF blob size:', blob.size, 'bytes');

    // Save via File System Access API if available and requested
    if (allowUserToChooseLocation && 'showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker!({
          suggestedName: filename,
          types: [{ 
            description: 'PDF files', 
            accept: { 'application/pdf': ['.pdf'] } 
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch {
        // User canceled or API failed, fall back to download
        console.log('File picker cancelled or failed, using regular download');
      }
    }

    // Fallback: regular download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Vector PDF export failed:', error);
    throw new Error('Failed to export vector PDF. Please try again.');
  }
};

