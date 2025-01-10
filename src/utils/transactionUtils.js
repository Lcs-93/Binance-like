const syncUserData = (email, updates) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      cryptos: updates.cryptos || users[userIndex].cryptos || {}
    };
  } else {
    users.push({
      email,
      ...updates,
      cryptos: updates.cryptos || {}
    });
  }
  
  localStorage.setItem('users', JSON.stringify(users));

  const existingUser = JSON.parse(localStorage.getItem(`user-${email}`)) || {};
  const updatedUser = {
    ...existingUser,
    ...updates,
    email,
    cryptos: updates.cryptos || existingUser.cryptos || {}
  };
  localStorage.setItem(`user-${email}`, JSON.stringify(updatedUser));
};

export const addTransaction = (transaction) => {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) return null;

  const userTransactions = JSON.parse(localStorage.getItem(`transactions-${activeUser.email}`) || '[]');
  
  const newTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: 'completed',
    userEmail: activeUser.email
  };
  
  const updatedTransactions = [newTransaction, ...userTransactions];
  localStorage.setItem(`transactions-${activeUser.email}`, JSON.stringify(updatedTransactions));

  const userData = {
    email: activeUser.email,
    cash: activeUser.cash || 0,
    cryptos: activeUser.cryptos || {},
    lastUpdate: Date.now()
  };

  syncUserData(activeUser.email, userData);
  
  window.dispatchEvent(new Event('transactionUpdated'));
  window.dispatchEvent(new Event('assetsUpdated'));
  
  return newTransaction;
};

export const getTransactions = () => {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) return [];
  return JSON.parse(localStorage.getItem(`transactions-${activeUser.email}`) || '[]');
};

export const addTransactionForUser = (transaction, userEmail) => {
  const userTransactions = JSON.parse(localStorage.getItem(`transactions-${userEmail}`) || '[]');
  
  const newTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: 'completed',
    userEmail: userEmail
  };
  
  const updatedTransactions = [newTransaction, ...userTransactions];
  localStorage.setItem(`transactions-${userEmail}`, JSON.stringify(updatedTransactions));
  
  const user = JSON.parse(localStorage.getItem(`user-${userEmail}`));
  if (user) {
    syncUserData(userEmail, {
      cash: user.cash || 0,
      cryptos: user.cryptos || {},
      lastUpdate: Date.now()
    });
  }
  
  window.dispatchEvent(new Event('transactionUpdated'));
  window.dispatchEvent(new Event('assetsUpdated'));
  
  return newTransaction;
};

export const deleteTransaction = (transactionId) => {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) return;

  const transactions = getTransactions();
  const updatedTransactions = transactions.filter(t => t.id !== transactionId);
  localStorage.setItem(`transactions-${activeUser.email}`, JSON.stringify(updatedTransactions));
  
  window.dispatchEvent(new Event('transactionUpdated'));
};

export const updateTransactionStatus = (transactionId, newStatus) => {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) return;

  const transactions = getTransactions();
  const updatedTransactions = transactions.map(t => 
    t.id === transactionId ? { ...t, status: newStatus } : t
  );
  localStorage.setItem(`transactions-${activeUser.email}`, JSON.stringify(updatedTransactions));
  
  window.dispatchEvent(new Event('transactionUpdated'));
};
