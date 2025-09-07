
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import jsPDF from 'jspdf';

interface TransactionData {
  id: string;
  amount: number;
  type: string;
  status: string | null;
  created_at: string | null;
  method: string | null;
  goal_id: string | null;
  user_id: string;
}

interface GoalData {
  id: string;
  name: string;
  goal_amount: number;
  category: string | null;
  created_at: string | null;
}

export const exportSavingsHistoryPdf = async (): Promise<void> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (transactionsError) throw transactionsError;

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (goalsError) throw goalsError;

    // Generate PDF
    await generatePDFReport(transactions || [], goals || [], user);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

const generatePDFReport = async (
  transactions: TransactionData[], 
  goals: GoalData[], 
  user: any
): Promise<void> => {
  const pdf = new jsPDF();
  
  // Calculate totals
  const totalSavings = transactions
    .filter(t => t.status === 'success' && t.type === 'incoming')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalGoals = goals.reduce((sum, goal) => sum + Number(goal.goal_amount), 0);
  
  // PDF styling
  const primaryColor: [number, number, number] = [79, 70, 229]; // RGB for primary color
  const textColor: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [156, 163, 175];
  
  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ISave', 20, 25);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Savings History Report', 20, 32);
  
  // User info and date
  pdf.setTextColor(...textColor);
  pdf.setFontSize(10);
  pdf.text(`Generated for: ${user.email}`, 20, 50);
  pdf.text(`Date: ${format(new Date(), 'MMMM do, yyyy')}`, 20, 57);
  
  // Summary section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary', 20, 75);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Total Savings:', `${totalSavings.toLocaleString()} RWF`],
    ['Total Goals Value:', `${totalGoals.toLocaleString()} RWF`],
    ['Total Transactions:', `${transactions.length}`],
    ['Active Goals:', `${goals.length}`]
  ];
  
  let yPos = 85;
  summaryData.forEach(([label, value]) => {
    pdf.text(label, 20, yPos);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, 100, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 8;
  });
  
  // Recent Transactions section
  yPos += 10;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recent Transactions', 20, yPos);
  
  yPos += 10;
  if (transactions.length > 0) {
    // Table headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date', 20, yPos);
    pdf.text('Type', 60, yPos);
    pdf.text('Amount', 100, yPos);
    pdf.text('Status', 150, yPos);
    
    // Draw header line
    pdf.setDrawColor(...lightGray);
    pdf.line(20, yPos + 2, 180, yPos + 2);
    
    yPos += 8;
    pdf.setFont('helvetica', 'normal');
    
    // Transaction rows (limit to 20 for space)
    const displayTransactions = transactions.slice(0, 20);
    displayTransactions.forEach(transaction => {
      if (yPos > 270) { // Start new page if needed
        pdf.addPage();
        yPos = 20;
      }
      
      const date = transaction.created_at ? format(new Date(transaction.created_at), 'MMM dd, yyyy') : 'N/A';
      const amount = `${transaction.type === 'incoming' ? '+' : ''}${Number(transaction.amount).toLocaleString()} RWF`;
      
      pdf.text(date, 20, yPos);
      pdf.text(transaction.type, 60, yPos);
      pdf.text(amount, 100, yPos);
      pdf.text((transaction.status || 'pending').toUpperCase(), 150, yPos);
      
      yPos += 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(...lightGray);
    pdf.text('No transactions found', 20, yPos);
    pdf.setTextColor(...textColor);
  }
  
  // Goals section
  yPos += 15;
  if (yPos > 250) {
    pdf.addPage();
    yPos = 20;
  }
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Savings Goals', 20, yPos);
  
  yPos += 10;
  if (goals.length > 0) {
    // Table headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Goal Name', 20, yPos);
    pdf.text('Category', 80, yPos);
    pdf.text('Target Amount', 130, yPos);
    
    // Draw header line
    pdf.line(20, yPos + 2, 180, yPos + 2);
    
    yPos += 8;
    pdf.setFont('helvetica', 'normal');
    
    goals.forEach(goal => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.text(goal.name, 20, yPos);
      pdf.text(goal.category || 'General', 80, yPos);
      pdf.text(`${Number(goal.goal_amount).toLocaleString()} RWF`, 130, yPos);
      
      yPos += 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(...lightGray);
    pdf.text('No goals found', 20, yPos);
  }
  
  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.text('Generated by ISave - Your Personal Wallet', 20, 285);
    pdf.text(`Page ${i} of ${totalPages}`, 170, 285);
  }
  
  // Save the PDF
  pdf.save(`ISave_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
