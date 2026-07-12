import jsPDF from 'jspdf';

export const generateFinancialReport = (data) => {
  const {
    totalIncome,
    totalExpense,
    currentMonthBalance,
    balanceChange,
    chartData,
    categoryData,
    transactions,
    period,
    incomeChange,
    expenseChange,
  } = data;

  // Format currency helper
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Header with purple gradient background
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo and title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KEUANGAN REPORT', 15, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${period}`, 15, 25);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Executive Summary section
  let yPos = 45;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 15, yPos);
  
  yPos += 10;
  
  // Summary cards
  const cardWidth = 55;
  const cardHeight = 25;
  const cardSpacing = 10;
  
  // Total Pemasukan
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Pemasukan', 20, yPos + 6);
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(totalIncome), 20, yPos + 13);
  doc.setFontSize(8);
  doc.setTextColor(34, 197, 94);
  const incomeChangeText = incomeChange == 0 
    ? 'Bulan Pertama' 
    : `${incomeChange > 0 ? '+' : ''}${incomeChange}% dari bulan lalu`;
  doc.text(incomeChangeText, 20, yPos + 19);
  
  // Total Pengeluaran
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15 + cardWidth + cardSpacing, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Pengeluaran', 20 + cardWidth + cardSpacing, yPos + 6);
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(totalExpense), 20 + cardWidth + cardSpacing, yPos + 13);
  doc.setFontSize(8);
  doc.setTextColor(239, 68, 68);
  const expenseChangeText = expenseChange == 0 
    ? 'Bulan Pertama' 
    : `${expenseChange > 0 ? '+' : ''}${expenseChange}% dari bulan lalu`;
  doc.text(expenseChangeText, 20 + cardWidth + cardSpacing, yPos + 19);
  
  // Saldo Akhir
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(15 + (cardWidth + cardSpacing) * 2, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Saldo Akhir', 20 + (cardWidth + cardSpacing) * 2, yPos + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(currentMonthBalance), 20 + (cardWidth + cardSpacing) * 2, yPos + 13);
  doc.setFontSize(8);
  const balanceText = balanceChange == 0 || !balanceChange || isNaN(balanceChange)
    ? 'Bulan Pertama'
    : `Tersedia: ${Math.abs(balanceChange)}%`;
  doc.text(balanceText, 20 + (cardWidth + cardSpacing) * 2, yPos + 19);
  
  yPos += cardHeight + 15;
  
  // Trend Arus Kas section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TREND ARUS KAS (HARIAN)', 15, yPos);
  
  yPos += 5;
  
  // Simple line chart representation
  const chartStartX = 15;
  const chartEndX = 100;
  const chartStartY = yPos + 5;
  const chartHeight = 30;
  
  // Draw axes
  doc.setDrawColor(200, 200, 200);
  doc.line(chartStartX, chartStartY + chartHeight, chartEndX, chartStartY + chartHeight);
  doc.line(chartStartX, chartStartY, chartStartX, chartStartY + chartHeight);
  
  // Draw income line (green)
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.8);
  
  if (chartData && chartData.length > 0) {
    const xStep = (chartEndX - chartStartX) / (chartData.length - 1);
    const maxValue = Math.max(...chartData.map(d => Math.max(d.Pemasukan, d.Pengeluaran)));
    
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = chartStartX + (i * xStep);
      const x2 = chartStartX + ((i + 1) * xStep);
      const y1 = chartStartY + chartHeight - ((chartData[i].Pemasukan / maxValue) * chartHeight * 0.8);
      const y2 = chartStartY + chartHeight - ((chartData[i + 1].Pemasukan / maxValue) * chartHeight * 0.8);
      doc.line(x1, y1, x2, y2);
    }
    
    // Draw expense line (red dashed)
    doc.setDrawColor(239, 68, 68);
    doc.setLineDash([2, 2]);
    doc.setLineWidth(0.8);
    
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = chartStartX + (i * xStep);
      const x2 = chartStartX + ((i + 1) * xStep);
      const y1 = chartStartY + chartHeight - ((chartData[i].Pengeluaran / maxValue) * chartHeight * 0.8);
      const y2 = chartStartY + chartHeight - ((chartData[i + 1].Pengeluaran / maxValue) * chartHeight * 0.8);
      doc.line(x1, y1, x2, y2);
    }
    
    // Reset line dash
    doc.setLineDash([]);
  }
  
  // X-axis labels
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  if (chartData && chartData.length > 0) {
    const labelStep = (chartEndX - chartStartX) / (chartData.length - 1);
    chartData.forEach((data, index) => {
      if (index % 2 === 0) {
        doc.text(data.date, chartStartX + (index * labelStep) - 5, chartStartY + chartHeight + 5);
      }
    });
  }
  
  yPos += chartHeight + 15;
  
  // Komposisi Pengeluaran section
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('KOMPOSISI PENGELUARAN', 110, yPos - chartHeight - 10);
  
  // Category breakdown with percentages
  let categoryY = yPos - chartHeight;
  const totalCategoryExpense = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  
  categoryData.slice(0, 4).forEach((category, index) => {
    const percentage = totalCategoryExpense > 0 
      ? Math.round((category.value / totalCategoryExpense) * 100)
      : 0;
    
    // Color dot
    const colors = [
      [99, 102, 241],
      [236, 72, 153],
      [16, 185, 129],
      [245, 158, 11],
    ];
    const color = colors[index % colors.length];
    doc.setFillColor(...color);
    doc.circle(115, categoryY + 2, 2, 'F');
    
    // Category name
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(category.name, 120, categoryY + 4);
    
    // Percentage
    doc.setFont('helvetica', 'bold');
    doc.text(`${percentage}%`, 175, categoryY + 4);
    
    categoryY += 7;
  });
  
  yPos += 10;
  
  // Kategori Terboros section
  doc.setFillColor(255, 245, 245);
  doc.roundedRect(15, yPos, 85, 20, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.text('Kategori Terboros', 20, yPos + 7);
  
  if (categoryData.length > 0) {
    const topCategory = categoryData[0];
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${topCategory.name}: ${formatRupiah(topCategory.value)} (+79%)`, 20, yPos + 14);
  }
  
  // Transaksi Terbesar section
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(110, yPos, 85, 20, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaksi Terbesar', 115, yPos + 7);
  
  if (transactions.length > 0) {
    const biggestTransaction = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => Number(b.amount) - Number(a.amount))[0];
    
    if (biggestTransaction) {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Gaji Bulanan Utama', 115, yPos + 14);
      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupiah(biggestTransaction.amount), 160, yPos + 14);
    }
  }
  
  yPos += 30;
  
  // Catatan Penting section
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(15, yPos, 180, 25, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'bold');
  doc.text('Catatan Penting AI', 20, yPos + 7);
  
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const noteText = `Belanjamu di kategori ${formatRupiah(totalExpense)} (+45%). Pertimbangkan untuk mengurangi pengeluaran pada kategori Makan & Minuman di week ini untuk tetap seimbang pada target budget kamu!`;
  const splitNote = doc.splitTextToSize(noteText, 170);
  doc.text(splitNote, 20, yPos + 13);
  
  yPos += 35;
  
  // Riwayat Transaksi Sebulan section
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Riwayat Transaksi Sebulan', 15, yPos);
  
  yPos += 8;
  
  // Table header
  doc.setFillColor(245, 247, 250);
  doc.rect(15, yPos, 180, 8, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('TANGGAL', 18, yPos + 5);
  doc.text('TRANSAKSI', 40, yPos + 5);
  doc.text('KATEGORI', 85, yPos + 5);
  doc.text('METODE', 115, yPos + 5);
  doc.text('NOMINAL', 165, yPos + 5);
  
  yPos += 10;
  
  // Transaction rows
  doc.setFont('helvetica', 'normal');
  const displayTransactions = transactions.slice(0, 15); // Show max 15 transactions
  
  displayTransactions.forEach((transaction, index) => {
    const date = new Date(transaction.date);
    const dateStr = `${date.getDate().toString().padStart(2, '0')} Jan\n${date.getFullYear()}`;
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos - 3, 180, 10, 'F');
    }
    
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text(dateStr, 18, yPos + 2);
    
    doc.setTextColor(0, 0, 0);
    doc.text(transaction.note || transaction.category.name, 40, yPos + 2);
    
    // Category badge
    const categoryBadgeColors = {
      'Makan': [236, 72, 153],
      'Bensin': [99, 102, 241],
      'Gaji': [16, 185, 129],
    };
    const badgeColor = categoryBadgeColors[transaction.category.name] || [150, 150, 150];
    doc.setFillColor(...badgeColor);
    doc.roundedRect(85, yPos - 1, 20, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text(transaction.category.name.toUpperCase(), 87, yPos + 2);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7);
    doc.text(transaction.wallet.name, 115, yPos + 2);
    
    // Amount
    const isExpense = transaction.type === 'expense';
    doc.setTextColor(isExpense ? 239 : 34, isExpense ? 68 : 197, isExpense ? 68 : 94);
    doc.setFont('helvetica', 'bold');
    const amountText = `${isExpense ? '-' : '+'}${formatRupiah(transaction.amount)}`;
    doc.text(amountText, 165, yPos + 2);
    
    yPos += 10;
    
    // Check if we need a new page
    if (yPos > pageHeight - 30 && index < displayTransactions.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Pocket App - Financial Management', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Save PDF
  const fileName = `Laporan-Keuangan-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
