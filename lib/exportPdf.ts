// lib/exportPdf.ts

export const exportDashboardToPDF = async (
  elementId: string,
  filename: string = "vendor-report.pdf",
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const [{ toPng }, { default: jsPDF }] = await Promise.all([
      import("html-to-image"),
      import("jspdf"),
    ]);

    // 1. Add class to force safe rendering dimensions
    element.classList.add("pdf-export-mode");

    // 2. Wait for Recharts animations to complete
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Calculate actual full dimensions of the content
    const fullWidth = element.scrollWidth;
    const fullHeight = element.scrollHeight;

    // 3. Generate Image - Explicitly pass scrollHeight to capture everything
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      skipFonts: true,
      width: fullWidth,
      height: fullHeight, // Forces capture of the hidden bottom area
      style: {
        transform: "none", // Prevents zooming/clipping issues
      },
      filter: (node) => !node.classList?.contains("recharts-tooltip-wrapper"),
    });

    if (!dataUrl || dataUrl === "data:,") {
      throw new Error("Canvas rendering failed.");
    }

    // 4. Build PDF with DYNAMIC page size based on the dashboard's height
    // Using 'px' units and the exact dimensions of the dashboard
    const pdf = new jsPDF({
      orientation: fullWidth > fullHeight ? "l" : "p",
      unit: "px",
      format: [fullWidth, fullHeight], // Expands PDF to fit everything!
    });

    // 5. Add image to the perfectly sized PDF
    pdf.addImage(dataUrl, "PNG", 0, 0, fullWidth, fullHeight);
    pdf.save(filename);
  } catch (error) {
    alert("Failed to generate the PDF report. Please check the console.");
  } finally {
    element.classList.remove("pdf-export-mode");
  }
};
