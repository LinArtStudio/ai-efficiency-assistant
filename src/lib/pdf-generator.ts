import jsPDF from 'jspdf';

// 生成PDF
export function generatePDF(content: string, title: string): void {
  const doc = new jsPDF();
  
  // 设置字体（支持中文需要额外配置）
  doc.setFont('helvetica');
  
  // 添加标题
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  // 添加内容
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 40);
  
  // 保存PDF
  doc.save(`${title}.pdf`);
}

// 生成带格式的PDF
export function generateFormattedPDF(content: string, title: string, date: string): void {
  const doc = new jsPDF();
  
  // 设置字体
  doc.setFont('helvetica');
  
  // 添加标题
  doc.setFontSize(20);
  doc.setTextColor(26, 115, 232); // 蓝色
  doc.text(title, 20, 25);
  
  // 添加日期
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128); // 灰色
  doc.text(`生成时间: ${date}`, 20, 35);
  
  // 添加分割线
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 40, 190, 40);
  
  // 添加内容
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51); // 深灰色
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 50);
  
  // 添加页脚
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('由职场AI提效工具生成', 20, 280);
  doc.text(`第 ${doc.getNumberOfPages()} 页`, 180, 280);
  
  // 保存PDF
  doc.save(`${title}-${date}.pdf`);
}
