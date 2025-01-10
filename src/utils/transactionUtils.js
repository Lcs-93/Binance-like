export const addTransaction = (transaction) => {
  const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  
  const newTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: 'completed'
  };
  
  const updatedTransactions = [newTransaction, ...existingTransactions];
  
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  
  window.dispatchEvent(new Event('transactionUpdated'));
  
  return newTransaction;
};

export const getTransactions = () => {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
};

export const deleteTransaction = (transactionId) => {
  const transactions = getTransactions();
  const updatedTransactions = transactions.filter(t => t.id !== transactionId);
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  
  window.dispatchEvent(new Event('transactionUpdated'));
};

export const updateTransactionStatus = (transactionId, newStatus) => {
  const transactions = getTransactions();
  const updatedTransactions = transactions.map(t => 
    t.id === transactionId ? { ...t, status: newStatus } : t
  );
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  
  window.dispatchEvent(new Event('transactionUpdated'));
};
