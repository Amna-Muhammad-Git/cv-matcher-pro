import jsPDF from "jspdf";

export function downloadCvPdf(text: string, filename = "cv.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(text, usableWidth);
  let y = margin;
  const lineHeight = 15;

  for (const line of lines) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(filename);
}
