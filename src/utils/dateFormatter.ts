export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export const formatCurrency = (amount: number, currency: string = 'RWF'): string => {
  return `${amount.toLocaleString()} ${currency}`;
};