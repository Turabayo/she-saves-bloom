import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

export const exportSavingsHistory = async (): Promise<void> => {
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

    // Generate HTML report
    const html = generateHTMLReport(transactions || [], goals || [], user);
    
    // Create and download the file
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SheSaves_Report_${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

const generateHTMLReport = (
  transactions: TransactionData[], 
  goals: GoalData[], 
  user: any
): string => {
  const totalSavings = transactions
    .filter(t => t.status === 'success' && t.type === 'incoming')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalGoals = goals.reduce((sum, goal) => sum + Number(goal.goal_amount), 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SheSaves - Savings History Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header .subtitle { opacity: 0.9; font-size: 1.1rem; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { color: #666; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .summary-card .amount { font-size: 2rem; font-weight: bold; color: #4f46e5; }
        .section { background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section h2 { color: #1f2937; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
        .status-completed { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; }
        .status-pending { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; }
        .amount-positive { color: #059669; font-weight: 600; }
        .amount-negative { color: #dc2626; font-weight: 600; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; color: #6b7280; font-size: 0.9rem; }
        .no-data { text-align: center; color: #6b7280; padding: 40px; }
        @media print { body { background: white; } .header { background: #4f46e5 !important; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SheSaves</h1>
            <p class="subtitle">Savings History Report</p>
            <p>Generated on ${format(new Date(), 'MMMM do, yyyy')} for ${user.email}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Savings</h3>
                <div class="amount">${totalSavings.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h3>Total Goals Value</h3>
                <div class="amount">${totalGoals.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h3>Total Transactions</h3>
                <div class="amount">${transactions.length}</div>
            </div>
            <div class="summary-card">
                <h3>Active Goals</h3>
                <div class="amount">${goals.length}</div>
            </div>
        </div>

        <div class="section">
            <h2>Recent Transactions</h2>
            ${transactions.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.slice(0, 50).map(transaction => `
                            <tr>
                                <td>${transaction.created_at ? format(new Date(transaction.created_at), 'MMM dd, yyyy') : 'N/A'}</td>
                                <td>Transaction</td>
                                <td style="text-transform: capitalize;">${transaction.type}</td>
                                <td class="${transaction.type === 'incoming' ? 'amount-positive' : 'amount-negative'}">
                                    ${transaction.type === 'incoming' ? '+' : ''}${Number(transaction.amount).toLocaleString()} RWF
                                </td>
                                <td>
                                    <span class="status-${transaction.status || 'pending'}">${(transaction.status || 'pending').toUpperCase()}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<div class="no-data">No transactions found</div>'}
        </div>

        <div class="section">
            <h2>Savings Goals</h2>
            ${goals.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Goal Name</th>
                            <th>Category</th>
                            <th>Target Amount</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${goals.map(goal => {
                          return `
                            <tr>
                                <td style="font-weight: 600;">${goal.name}</td>
                                <td>${goal.category || 'General'}</td>
                                <td class="amount-positive">${Number(goal.goal_amount).toLocaleString()} RWF</td>
                                <td>${goal.created_at ? format(new Date(goal.created_at), 'MMM dd, yyyy') : 'N/A'}</td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                </table>
            ` : '<div class="no-data">No goals found</div>'}
        </div>

        <div class="footer">
            <p>This report was generated by SheSaves - Your Smart Savings Companion</p>
            <p>For support, contact us at support@shesaves.app</p>
        </div>
    </div>
</body>
</html>`;
};