// lib/renderPdf.ts
// Shared PDF rendering utility — used by both invoice and warranty download hooks.
// Renders an HTML string inside a hidden, isolated iframe, captures it with
// html2canvas, then converts the canvas to a multi-page jsPDF document and
// triggers a browser download.

/**
 * Renders `html` inside an off-screen iframe, captures it via html2canvas,
 * then saves it as a PDF file named `filename`.
 *
 * The iframe is appended and removed within this call — no layout side-effects.
 */
export function renderPdfInIframe(html: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 1. Create a completely invisible iframe — no layout impact on the page
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 794px;
      height: 1123px;
      opacity: 0;
      pointer-events: none;
      z-index: -9999;
      border: none;
    `;
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      reject(new Error('Could not access iframe document'));
      return;
    }

    // 2. Write the full HTML into the iframe (safe — completely isolated)
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // 3. Wait for images/fonts to load, then use html2canvas + jsPDF
    iframe.onload = async () => {
      try {
        // Dynamically import both libraries only when needed (code-splitting)
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
          import('html2canvas'),
          import('jspdf'),
        ]);

        // Extra wait for fonts / cross-origin images inside iframe to settle
        await new Promise(r => setTimeout(r, 300));

        const iframeBody = iframeDoc.querySelector('.page') as HTMLElement;
        if (!iframeBody) throw new Error('PDF template .page element not found in iframe');

        // 4. Capture the rendered HTML as a canvas (2× for crisp text)
        const canvas = await html2canvas(iframeBody, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,
          windowHeight: iframeBody.scrollHeight,
        });

        // 5. Build the PDF from the canvas image
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth  = pdf.internal.pageSize.getWidth();   // 210 mm
        const pageHeight = pdf.internal.pageSize.getHeight();  // 297 mm
        const imgWidth   = pageWidth;
        const imgHeight  = (canvas.height * pageWidth) / canvas.width;

        // Handle multi-page documents automatically
        let heightLeft = imgHeight;
        let position   = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // 6. Trigger browser download
        pdf.save(filename);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        // 7. Always clean up the iframe — this is critical to avoid page breakage
        document.body.removeChild(iframe);
      }
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject(new Error('iframe failed to load'));
    };
  });
}
