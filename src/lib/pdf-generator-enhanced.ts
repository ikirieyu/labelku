import jsPDF from 'jspdf';

export interface ReceiptData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  packageContents: string;
  weight: string;
  notes: string;
  courier: string;
  service: string;
  paperSize: string;
  orientation: string;
  shippingCost: number;
  trackingNumber: string;
}

export const generateTrackingNumber = (courier: string): string => {
  const prefix = courier.toUpperCase().slice(0, 3);
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const getPaperDimensions = (paperSize: string, orientation: string) => {
  const dimensions: { [key: string]: [number, number] } = {
    '30x55mm': [30, 55],
    '40x30mm': [40, 30],
    '40x50mm': [40, 50],
    '50x33mm': [50, 33],
    '50x40mm': [50, 40],
    '50x50mm': [50, 50],
    '50x100mm': [50, 100],
    '60x20mm': [60, 20],
    '76x130mm': [76, 130],
    '80x100mm': [80, 100],
    '100x100mm': [100, 100],
    '100x150mm': [100, 150],
    '100x180mm': [100, 180],
  };

  let [width, height] = dimensions[paperSize] || [100, 150];
  
  if (orientation === 'landscape') {
    [width, height] = [height, width];
  }

  return { width, height };
};

export const generateReceiptPDF = async (data: ReceiptData): Promise<Blob> => {
  const { width, height } = getPaperDimensions(data.paperSize, data.orientation);
  
  // Convert mm to points (1mm = 2.83465 points)
  const widthPt = width * 2.83465;
  const heightPt = height * 2.83465;
  
  const pdf = new jsPDF({
    unit: 'pt',
    format: [widthPt, heightPt],
    orientation: data.orientation === 'landscape' ? 'landscape' : 'portrait'
  });

  // Set font
  pdf.setFont('helvetica');
  
  const margin = 15;
  const maxWidth = widthPt - (margin * 2);
  let yPos = margin + 10;

  // Calculate responsive font sizes based on paper width
  const titleFontSize = Math.max(10, Math.min(16, widthPt / 20));
  const headerFontSize = Math.max(8, Math.min(12, widthPt / 25));
  const bodyFontSize = Math.max(7, Math.min(10, widthPt / 30));
  const lineHeight = bodyFontSize + 2;

  // Helper function to add centered text
  const addCenteredText = (text: string, fontSize: number, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const textWidth = pdf.getTextWidth(text);
    const x = (widthPt - textWidth) / 2;
    pdf.text(text, x, yPos);
    yPos += fontSize + 3;
  };

  // Helper function to add left-aligned text
  const addText = (text: string, fontSize: number = bodyFontSize, isBold: boolean = false, indent: number = 0) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, maxWidth - indent);
    for (const line of lines) {
      if (yPos > heightPt - 30) break; // Prevent overflow
      pdf.text(line, margin + indent, yPos);
      yPos += lineHeight;
    }
  };

  // Helper function to add two-column text
  const addTwoColumnText = (leftText: string, rightText: string, fontSize: number = bodyFontSize) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const columnWidth = maxWidth / 2 - 10;
    const leftLines = pdf.splitTextToSize(leftText, columnWidth);
    const rightLines = pdf.splitTextToSize(rightText, columnWidth);
    
    const maxLines = Math.max(leftLines.length, rightLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      if (yPos > heightPt - 30) break;
      
      if (leftLines[i]) {
        pdf.text(leftLines[i], margin, yPos);
      }
      if (rightLines[i]) {
        pdf.text(rightLines[i], margin + maxWidth / 2, yPos);
      }
      yPos += lineHeight;
    }
  };

  // Helper function to draw horizontal line
  const drawLine = (y: number) => {
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, widthPt - margin, y);
  };

  // Title
  addCenteredText('RESI PENGIRIMAN', titleFontSize, true);
  
  // Top horizontal line
  drawLine(yPos);
  yPos += 10;

  // Header row with Ekspedisi and Pembayaran
  const courierLabel = data.courier.toUpperCase().replace('JNT', 'J&T Express')
    .replace('JNE', 'JNE').replace('LION', 'Lion Parcel')
    .replace('POS', 'Pos Indonesia').replace('TIKI', 'TIKI')
    .replace('WAHANA', 'Wahana');
  
  addTwoColumnText(
    `Ekspedisi: ${courierLabel}`,
    `Pembayaran: ${data.service.toUpperCase()}`,
    headerFontSize
  );
  
  yPos += 8;

  // Pengirim Section
  addText('Pengirim', headerFontSize, true);
  addText(`Nama: ${data.senderName}`, bodyFontSize, false);
  addText(`Nomor: ${data.senderPhone}`, bodyFontSize, false);
  if (data.senderAddress) {
    const addressLines = data.senderAddress.split('\n');
    addressLines.forEach(line => {
      if (line.trim()) {
        addText(`Alamat: ${line.trim()}`, bodyFontSize, false);
      }
    });
  }
  
  yPos += 8;

  // Penerima Section
  addText('Penerima', headerFontSize, true);
  addText(`Nama: ${data.recipientName}`, bodyFontSize, false);
  addText(`Nomor: ${data.recipientPhone}`, bodyFontSize, false);
  if (data.recipientAddress) {
    const addressLines = data.recipientAddress.split('\n');
    addressLines.forEach(line => {
      if (line.trim()) {
        addText(`Alamat: ${line.trim()}`, bodyFontSize, false);
      }
    });
  }

  yPos += 8;

  // Package Information
  if (data.packageContents || data.weight) {
    addText('Informasi Paket', headerFontSize, true);
    if (data.packageContents) {
      addText(`Isi: ${data.packageContents}`, bodyFontSize, false);
    }
    if (data.weight) {
      addText(`Berat: ${data.weight} gram`, bodyFontSize, false);
    }
    if (data.notes && data.notes.trim()) {
      addText(`Catatan: ${data.notes}`, bodyFontSize, false);
    }
    yPos += 8;
  }

  // Bottom line
  const bottomLineY = heightPt - 40;
  drawLine(bottomLineY);
  
  // Footer with generation date and tracking number
  yPos = bottomLineY + 8;
  pdf.setFontSize(Math.max(6, bodyFontSize - 1));
  pdf.setFont('helvetica', 'normal');
  
  const dateStr = `Generated: ${new Date().toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
  
  // Center the generation date
  const dateWidth = pdf.getTextWidth(dateStr);
  pdf.text(dateStr, (widthPt - dateWidth) / 2, yPos);
  
  // Add tracking number at bottom if space allows
  if (yPos + 12 < heightPt - 10) {
    yPos += 12;
    const trackingStr = `No. Resi: ${data.trackingNumber}`;
    const trackingWidth = pdf.getTextWidth(trackingStr);
    pdf.text(trackingStr, (widthPt - trackingWidth) / 2, yPos);
  }

  return pdf.output('blob');
};

export const formatReceiptText = (data: ReceiptData): string => {
  return `
📦 RESI PENGIRIMAN
No. Resi: ${data.trackingNumber}
Ekspedisi: ${data.courier.toUpperCase()} - ${data.service}

👤 PENGIRIM:
${data.senderName}
${data.senderPhone}
${data.senderAddress}

📍 PENERIMA:
${data.recipientName}
${data.recipientPhone}
${data.recipientAddress}

📦 INFORMASI PAKET:
Isi: ${data.packageContents}
Berat: ${data.weight} gram
${data.notes ? `Catatan: ${data.notes}` : ''}

📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}
`.trim();
};

export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  }
};

export const shareViaWhatsApp = (text: string, pdfBlob?: Blob) => {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
};

export const shareViaTelegram = (text: string) => {
  const encodedText = encodeURIComponent(text);
  const telegramUrl = `https://t.me/share/url?text=${encodedText}`;
  window.open(telegramUrl, '_blank');
};

export const shareViaEmail = (text: string, pdfBlob?: Blob) => {
  const subject = encodeURIComponent('Resi Pengiriman');
  const body = encodeURIComponent(text);
  const emailUrl = `mailto:?subject=${subject}&body=${body}`;
  window.open(emailUrl);
};