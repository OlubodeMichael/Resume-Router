import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { html, filename = 'resume.pdf' } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Use Chromium binary for serverless (production) or regular Puppeteer for local
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    
    let puppeteer;
    if (isProduction) {
      // Use puppeteer-core with @sparticuz/chromium for production (serverless)
      puppeteer = (await import('puppeteer-core')).default;
      const chromium = await import('@sparticuz/chromium');
      
      browser = await puppeteer.launch({
        args: chromium.default.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } else {
      // Use regular puppeteer for development (includes bundled Chrome)
      puppeteer = (await import('puppeteer')).default;
      
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        headless: true,
      });
    }

    const page = await browser.newPage();

    // Load the HTML content
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Add PDF-specific CSS that preserves template styling
    await page.addStyleTag({
      content: `
        @page { 
          size: letter; 
          margin: 0.25in 0.75in 0.1in 0.75in;
        }
        
        /* Ensure print compatibility */
        * { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          box-sizing: border-box;
        }
        
        /* Override any conflicting styles for PDF */
        body { 
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          color: black !important;
        }
        
        /* Ensure all text is black in PDF */
        h1, h2, h3, h4, p, a, li, span, div {
          color: black !important;
          background: transparent !important;
        }
        
        /* Hide any pseudo-elements that might cause issues */
        ::before,
        ::after {
          display: none !important;
        }
        
        /* Ensure proper PDF rendering */
        .print-container {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `
    });

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0.1in',
        right: '0.75in',
        bottom: '0.1in',
        left: '0.75in'
      },
      preferCSSPageSize: false
    });

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
    
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'PDF export failed';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
