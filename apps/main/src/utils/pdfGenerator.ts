import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  title?: string;
  workspaceName?: string;
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
}

export class PDFGenerator {
  private doc: jsPDF;
  private options: PDFGenerationOptions;

  constructor(options: PDFGenerationOptions = {}) {
    this.options = {
      title: 'Workspace Rules',
      workspaceName: 'Workspace',
      fontSize: 12,
      lineHeight: 1.5,
      margin: 20,
      ...options
    };
    
    this.doc = new jsPDF();
    this.setupDocument();
  }

  private setupDocument() {
    const { title, workspaceName, margin } = this.options;
    
    // Add title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title || 'Workspace Rules', margin, margin + 10);
    
    // Add workspace name
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(workspaceName || 'Workspace', margin, margin + 25);
    
    // Add date
    this.doc.setFontSize(10);
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 35);
    
    // Add separator line
    this.doc.line(margin, margin + 40, this.doc.internal.pageSize.width - margin, margin + 40);
  }

  public addContent(content: string): void {
    const { fontSize, lineHeight, margin } = this.options;
    
    // Set font for content
    this.doc.setFontSize(fontSize || 12);
    this.doc.setFont('helvetica', 'normal');
    
    // Split content into lines and process
    const lines = this.processContent(content);
    let yPosition = margin + 50; // Start below the header
    
    for (const line of lines) {
      // Check if we need a new page
      if (yPosition > this.doc.internal.pageSize.height - margin - 20) {
        this.doc.addPage();
        yPosition = margin + 20;
      }
      
      // Add the line
      this.doc.text(line.text, margin, yPosition);
      yPosition += (lineHeight || 1.5) * (fontSize || 12) * 0.35; // Convert to mm
    }
  }

  private processContent(content: string): Array<{ text: string; isBold?: boolean; isItalic?: boolean }> {
    const lines = content.split('\n');
    const processedLines: Array<{ text: string; isBold?: boolean; isItalic?: boolean }> = [];
    
    for (const line of lines) {
      if (line.trim() === '') {
        processedLines.push({ text: '' });
        continue;
      }
      
      // Handle markdown-like formatting
      let processedLine = line;
      let isBold = false;
      let isItalic = false;
      
      // Remove markdown formatting for now (jsPDF doesn't support rich text easily)
      processedLine = processedLine
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
        .replace(/`(.*?)`/g, '$1') // Remove code markers
        .replace(/^#+\s*/, '') // Remove heading markers
        .replace(/^-\s*/, '• ') // Convert list items
        .replace(/^\*\s*/, '• '); // Convert list items
      
      processedLines.push({ text: processedLine, isBold, isItalic });
    }
    
    return processedLines;
  }

  public addPageBreak(): void {
    this.doc.addPage();
  }

  public save(filename?: string): void {
    const defaultFilename = `workspace-rules-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename || defaultFilename);
  }

  public getBlob(): Blob {
    return this.doc.output('blob');
  }

  public getDataURL(): string {
    return this.doc.output('dataurlstring');
  }
}

// Utility function to generate PDF from rules content
export function generateRulesPDF(
  content: string, 
  workspaceName: string = 'Workspace',
  options: PDFGenerationOptions = {}
): Blob {
  const generator = new PDFGenerator({
    title: 'Workspace Rules',
    workspaceName,
    ...options
  });
  
  generator.addContent(content);
  return generator.getBlob();
}

// Utility function to create a File object from PDF blob
export function createPDFFile(
  content: string,
  workspaceName: string = 'Workspace',
  filename?: string
): File {
  const blob = generateRulesPDF(content, workspaceName);
  const defaultFilename = `workspace-rules-${workspaceName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  return new File([blob], filename || defaultFilename, {
    type: 'application/pdf'
  });
}
