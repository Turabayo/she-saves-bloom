import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { formatCurrencyCompact } from '@/utils/dateFormatter';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

export const MonthlySummaryCard = () => {
  const [monthOffset, setMonthOffset] = useState(0);
  const { summary, loading } = useMonthlySummary(monthOffset);
  const { toast } = useToast();

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('ISave Monthly Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(summary.month, pageWidth / 2, 30, { align: 'center' });

    // Summary Stats
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPos = 50;

    doc.text('Financial Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Total Saved: ${formatCurrencyCompact(summary.totalSaved)} RWF`, 25, yPos);
    yPos += 7;
    doc.text(`Total Withdrawn: ${formatCurrencyCompact(summary.totalWithdrawn)} RWF`, 25, yPos);
    yPos += 7;
    doc.text(`Net Savings: ${formatCurrencyCompact(summary.netSavings)} RWF`, 25, yPos);
    yPos += 7;
    doc.text(`Savings vs Spending Ratio: ${summary.savingsVsSpendingRatio}%`, 25, yPos);
    yPos += 15;

    // Auto Savings
    doc.setFontSize(12);
    doc.text('Auto Savings', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Executions: ${summary.autoSavingsExecuted}`, 25, yPos);
    yPos += 7;
    doc.text(`Amount: ${formatCurrencyCompact(summary.autoSavingsAmount)} RWF`, 25, yPos);
    yPos += 15;

    // Goals Progress
    if (summary.goalsProgress.length > 0) {
      doc.setFontSize(12);
      doc.text('Goals Progress', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      
      summary.goalsProgress.forEach(goal => {
        doc.text(`${goal.name}: ${goal.progress}% (${formatCurrencyCompact(goal.saved)} RWF)`, 25, yPos);
        yPos += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 280, { align: 'center' });

    doc.save(`isave-report-${summary.month.replace(' ', '-')}.pdf`);

    toast({
      title: 'Report Downloaded',
      description: `Your ${summary.month} report has been saved.`
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const isPositive = summary.netSavings >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Monthly Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset(prev => prev + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {summary.month}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))}
              disabled={monthOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrencyCompact(summary.totalSaved)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Net Savings</p>
            <p className={`text-xl font-bold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrencyCompact(summary.netSavings)}
            </p>
          </div>
        </div>

        {/* Savings vs Spending Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Savings Ratio</span>
            <span className="font-medium">{summary.savingsVsSpendingRatio}%</span>
          </div>
          <Progress value={summary.savingsVsSpendingRatio} className="h-2" />
        </div>

        {/* Auto Savings */}
        <div className="flex items-center justify-between py-2 border-t border-border">
          <div>
            <p className="text-sm font-medium">Auto Savings</p>
            <p className="text-xs text-muted-foreground">
              {summary.autoSavingsExecuted} executions • {formatCurrencyCompact(summary.autoSavingsAmount)}
            </p>
          </div>
          <div className="text-2xl">🔄</div>
        </div>

        {/* Goals Overview */}
        {summary.goalsProgress.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-sm font-medium">Goals Progress</p>
            {summary.goalsProgress.slice(0, 3).map((goal, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[150px]">{goal.name}</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Download Button */}
        <Button
          onClick={downloadPDF}
          variant="outline"
          className="w-full mt-4"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </CardContent>
    </Card>
  );
};
