import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { html, filename = 'resume.pdf' } = await request.json();

    console.log('PDF API called with HTML length:', html?.length);
    console.log('Filename:', filename);

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      headless: true
    });

    const page = await browser.newPage();

    // Load the HTML content
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Add minimal, optimized CSS for PDF generation (no external fonts)
    await page.addStyleTag({
      content: `
        @page { 
          size: A4; 
          margin: 0.5in;
        }
        * { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
          box-sizing: border-box;
        }
        body { 
          font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif; 
          color: #000;
          margin: 0;
          padding: 0;
          background: white;
        }
        
        /* Minimal utility classes */
        .mx-auto { margin-left: auto; margin-right: auto; }
        .w-\\[816px\\] { width: 816px; }
        .max-w-full { max-width: 100%; }
        .bg-white { background-color: white; }
        .p-8 { padding: 2rem; }
        .text-center { text-align: center; }
        .text-sm { font-size: 0.875rem; }
        .text-black { color: #000; }
        .font-normal { font-weight: 400; }
        .font-bold { font-weight: 700; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .border-b { border-bottom: 1px solid #000; }
        .pb-2 { padding-bottom: 0.5rem; }
        .list-disc { list-style-type: disc; }
        .list-inside { list-style-position: inside; }
        .ml-4 { margin-left: 1rem; }
        .indent { margin-left: 0.15in; }
        
        /* Resume-specific styles - minimal and clean */
        h1 { 
          font-size: 24px; 
          margin: 0 0 16px 0; 
          font-weight: 700;
          text-align: center;
          color: #000;
        }
        h2 { 
          font-size: 16px; 
          margin: 16px 0 8px 0; 
          font-weight: 600;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          color: #000;
        }
        h3 { 
          font-size: 14px; 
          margin: 8px 0 4px 0; 
          font-weight: 600;
          color: #000;
        }
        h4 { 
          font-size: 12px; 
          margin: 4px 0; 
          font-weight: 400;
          font-style: italic;
          color: #000;
        }
        p { margin: 4px 0; color: #000; }
        ul { margin: 8px 0; padding-left: 20px; }
        li { margin: 2px 0; color: #000; }
        a { color: #000; text-decoration: underline; }
        
        .headerInfo ul {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .headerInfo li:not(:last-child)::after {
          content: "|";
          margin-left: 8px;
        }
        .tech-stack { font-style: italic; }
        .resume-template { font-family: serif; }
      `
    });

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      preferCSSPageSize: true
    });

    console.log('Generated PDF size:', pdfBuffer.length, 'bytes');

    await browser.close();

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error: unknown) {
    console.error('PDF export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'PDF export failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
