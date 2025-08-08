// Global variables
        let currentUser = '';
        let transactions = [];

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            // Check if user is already logged in
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = savedUser;
                showTrackerPage();
            } else {
                showLoginPage();
            }

            // Set today's date as default
            const dateInput = document.getElementById('dateInput');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        });

        // Login functionality
        document.getElementById('clickHereButton').addEventListener('click', function() {
            document.getElementById('nameInput').focus();
        });

        document.getElementById('nameInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });

        document.getElementById('loginButton').addEventListener('click', login);

        function login() {
            const nameInput = document.getElementById('nameInput');
            const userName = nameInput.value.trim();
            
            if (!userName) {
                alert('Please enter your name!');
                return;
            }
            
            currentUser = userName;
            sessionStorage.setItem('currentUser', userName);
            loadUserTransactions();
            showTrackerPage();
        }

        // Show/Hide pages
        function showLoginPage() {
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('trackerPage').style.display = 'none';
        }

        function showTrackerPage() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('trackerPage').style.display = 'block';
            
            // Update welcome message
            document.getElementById('welcomeMessage').innerHTML = 
                `Welcome ${currentUser}!<br>Expense Tracker<i class="fa-solid fa-suitcase"></i>`;
            
            loadUserTransactions();
            updateSummary();
            updateTransactionTable();
        }

        // Load user transactions from localStorage
        function loadUserTransactions() {
            const savedTransactions = localStorage.getItem(`transactions_${currentUser}`);
            transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        }

        // Save transactions to localStorage
        function saveTransactions() {
            localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));
        }

        // Add transaction
        document.getElementById('add-button').addEventListener('click', addTransaction);
        document.getElementById('amountInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTransaction();
            }
        });

        function addTransaction() {
            const amount = parseFloat(document.getElementById('amountInput').value);
            const type = document.getElementById('transactionType').value;
            const date = document.getElementById('dateInput').value;
            
            // Validation
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount!');
                return;
            }
            
            if (type === 'Transaction Type') {
                alert('Please select a transaction type!');
                return;
            }
            
            if (!date) {
                alert('Please select a date!');
                return;
            }
            
            // Create transaction
            const transaction = {
                id: Date.now(),
                amount: amount,
                type: type,
                date: date,
                formattedDate: formatDate(date)
            };
            
            transactions.push(transaction);
            saveTransactions();
            
            // Clear form
            document.getElementById('amountInput').value = '';
            document.getElementById('transactionType').selectedIndex = 0;
            document.getElementById('dateInput').valueAsDate = new Date();
            
            // Update display
            updateSummary();
            updateTransactionTable();
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        }

        // Update summary cards
        function updateSummary() {
            let totalIncome = 0;
            let totalExpense = 0;
            
            transactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else if (transaction.type === 'expense') {
                    totalExpense += transaction.amount;
                }
            });
            
            const balance = totalIncome - totalExpense;
            
            document.getElementById('totalIncome').textContent = totalIncome.toLocaleString('en-IN');
            document.getElementById('totalExpense').textContent = totalExpense.toLocaleString('en-IN');
            document.getElementById('balance').textContent = balance.toLocaleString('en-IN');
            
            // Color code balance
            const balanceElement = document.getElementById('balance');
            if (balance >= 0) {
                balanceElement.style.color = '#28a745';
            } else {
                balanceElement.style.color = '#dc3545';
            }
        }

        // Update transaction table
        function updateTransactionTable() {
            const table = document.getElementById('transactionTable');
            
            // Remove all rows except header
            const rows = table.querySelectorAll('tr:not(#header-row)');
            rows.forEach(row => row.remove());
            
            if (transactions.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="4" style="text-align: center; padding: 30px; color: #666; font-style: italic;">
                        No transactions yet. Add your first transaction above!
                    </td>
                `;
                table.appendChild(row);
                return;
            }
            
            // Add transactions (newest first)
            const sortedTransactions = [...transactions].reverse();
            
            sortedTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>₹${transaction.amount.toLocaleString('en-IN')}</td>
                    <td style="color: ${transaction.type === 'income' ? '#28a745' : '#dc3545'}; font-weight: 600;">
                        ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </td>
                    <td>${transaction.formattedDate}</td>
                    <td>
                        <button class="delete-button" onclick="deleteTransaction(${transaction.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                table.appendChild(row);
            });
        }

        // Delete transaction
        function deleteTransaction(id) {
            if (confirm('Are you sure you want to delete this transaction?')) {
                transactions = transactions.filter(transaction => transaction.id !== id);
                saveTransactions();
                updateSummary();
                updateTransactionTable();
            }
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                currentUser = '';
                transactions = [];
                sessionStorage.removeItem('currentUser');
                document.getElementById('nameInput').value = '';
                showLoginPage();
            }
        });

        // Export to CSV
        document.getElementById('exportBtn').addEventListener('click', function() {
            if (transactions.length === 0) {
                alert('No transactions to export!');
                return;
            }
            
            const csvHeader = 'Date,Type,Amount\\n';
            const csvRows = transactions.map(t => 
                `${t.formattedDate},${t.type},${t.amount}`
            ).join('\\n');
            
            const csvContent = csvHeader + csvRows;
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentUser}_expense_tracker.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });

        // Clear all data
        document.getElementById('clearBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete all transactions? This action cannot be undone!')) {
                transactions = [];
                localStorage.removeItem(`transactions_${currentUser}`);
                updateSummary();
                updateTransactionTable();
            }
        });