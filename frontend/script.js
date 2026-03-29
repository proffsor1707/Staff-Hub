// 🎯 COMPLETE EMPLOYEE MANAGEMENT SYSTEM - FULL FEATURES
const today = new Date().toISOString().split('T')[0];

let employees = JSON.parse(localStorage.getItem('employees')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    {
        id: 1,
        email: 'admin@company.com', 
        password: 'password123', 
        role: 'admin', 
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        department: 'Admin'
    },
    {
        id: 2,
        email: 'john@company.com', 
        password: 'password123', 
        role: 'employee', 
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        department: 'IT',
        position: 'Developer'
    }
];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let leaves = JSON.parse(localStorage.getItem('leaves')) || [];

// Initialize demo employees
if (employees.length === 0) {
    employees = [
        {id: 1, name: 'John Doe', email: 'john@company.com', department: 'IT', position: 'Developer'},
        {id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'HR', position: 'Manager'},
        {id: 3, name: 'Mike Wilson', email: 'mike@company.com', department: 'Sales', position: 'Sales Rep'}
    ];
}

function saveAllData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('leaves', JSON.stringify(leaves));
}

function showMessage(msg, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `✅ ${msg}`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 15px 25px; border-radius: 10px;
        font-weight: bold; box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        font-size: 16px; min-width: 300px; text-align: center;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function safeNavigate(page) {
    window.location.href = page;
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // 🔐 LOGIN FORM - 100% WORKING FOR ALL USERS
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            
            const user = users.find(u => 
                u.email.toLowerCase() === email && u.password === password
            );
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                showMessage(`Welcome ${user.name}!`);
                setTimeout(() => {
                    safeNavigate(user.role === 'admin' ? 'admin.html' : 'employee.html');
                }, 800);
            } else {
                showMessage('❌ Invalid Email or Password!', 'error');
            }
        });
    }

    // 📝 SIGNUP FORM - AUTO LOGIN AFTER REGISTRATION
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const password = document.getElementById('signupPassword').value;
            const role = document.getElementById('role').value;
            const department = document.getElementById('department').value.trim() || 'General';
            
            // Check duplicate email
            if (users.find(u => u.email.toLowerCase() === email)) {
                showMessage('❌ Email already registered!', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 3,
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                name: `${firstName} ${lastName}`,
                role: role,
                department: department,
                position: role === 'admin' ? 'Administrator' : 'Staff'
            };
            
            users.push(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            saveAllData();
            showMessage(`✅ Welcome ${newUser.name}! Auto logging in...`);
            
            setTimeout(() => {
                safeNavigate(role === 'admin' ? 'admin.html' : 'employee.html');
            }, 1500);
        });
    }

    // 👤 EMPLOYEE DASHBOARD - FULL FEATURES
    if (document.getElementById('empCurrentUser')) {
        if (!currentUser || currentUser.role !== 'employee') {
            safeNavigate('login.html');
            return;
        }

        // Set profile data
        document.getElementById('empCurrentUser').textContent = currentUser.name;
        document.getElementById('empName').textContent = currentUser.name;
        document.getElementById('empId').textContent = currentUser.id;
        document.getElementById('empEmail').textContent = currentUser.email;
        document.getElementById('empDepartment').textContent = currentUser.department;

        // Logout
        document.getElementById('empLogoutBtn').onclick = () => {
            localStorage.removeItem('currentUser');
            safeNavigate('index.html');
        };

        // 🕐 MARK ATTENDANCE
        setupAttendance(currentUser);
        
        // 📅 LEAVE REQUEST
        document.getElementById('leaveForm').onsubmit = function(e) {
            e.preventDefault();
            const leaveData = {
                id: Date.now(),
                userId: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                type: document.getElementById('leaveType').value,
                from: document.getElementById('leaveFrom').value,
                to: document.getElementById('leaveTo').value,
                reason: document.getElementById('leaveReason').value,
                status: 'pending',
                date: new Date().toLocaleDateString()
            };
            
            leaves.push(leaveData);
            saveAllData();
            showMessage('✅ Leave request submitted to Admin!');
            this.reset();
            loadEmployeeLeaves();
        };

        // Load records
        loadEmployeeAttendance();
        loadEmployeeLeaves();
    }

    // 👨‍💼 ADMIN DASHBOARD - FULL CONTROL
    if (document.getElementById('currentUser') && currentUser?.role === 'admin') {
        document.getElementById('currentUser').textContent = currentUser.name;
        document.getElementById('logoutBtn').onclick = () => {
            localStorage.removeItem('currentUser');
            safeNavigate('index.html');
        };

        // Add Employee
        document.getElementById('addEmployeeForm').onsubmit = function(e) {
            e.preventDefault();
            const newEmp = {
                id: employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1,
                name: document.getElementById('empName').value,
                email: document.getElementById('empEmail').value,
                department: document.getElementById('empDept').value,
                position: document.getElementById('empPos').value
            };
            employees.push(newEmp);
            saveAllData();
            showMessage('✅ New employee added!');
            e.target.reset();
            updateAdminStats();
            loadAdminEmployees();
        };

        // Initial load
        updateAdminStats();
        loadAdminEmployees();
        loadTodayAttendance();
        loadAdminLeaves();
    }
});

// ===== EMPLOYEE FUNCTIONS =====
function setupAttendance(currentUser) {
    const todayAttendance = attendance.find(a => a.date === today && a.userId === currentUser.id);
    const markBtn = document.getElementById('markAttendanceBtn');
    const statusEl = document.getElementById('todayStatus');
    
    if (todayAttendance) {
        statusEl.textContent = 'Present ✅';
        statusEl.style.color = '#10b981';
        markBtn.textContent = 'Already Marked Today';
        markBtn.disabled = true;
        markBtn.style.opacity = '0.6';
        document.getElementById('lastAttendance').textContent = `Time: ${todayAttendance.time}`;
    } else {
        markBtn.onclick = function() {
            const attRecord = {
                userId: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                date: today,
                status: 'Present',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            attendance.push(attRecord);
            saveAllData();
            showMessage('✅ Attendance marked successfully!');
            setTimeout(() => location.reload(), 1000);
        };
    }
}

function loadEmployeeAttendance() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.querySelector('#myAttendanceTable tbody');
    tbody.innerHTML = '';
    
    const myAttendance = attendance
        .filter(a => a.userId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    if (myAttendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#666;">No attendance records</td></tr>';
        return;
    }
    
    myAttendance.forEach(att => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${att.date}</td>
            <td><span style="color:${att.status === 'Present' ? '#10b981' : '#ef4444'}">${att.status}</span></td>
            <td>${att.time}</td>
        `;
    });
}

function loadEmployeeLeaves() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.querySelector('#myLeavesTable tbody');
    tbody.innerHTML = '';
    
    const myLeaves = leaves.filter(l => l.userId === currentUser.id).sort((a,b) => new Date(b.date) - new Date(a.date));
    
    if (myLeaves.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;">No leave requests</td></tr>';
        return;
    }
    
    myLeaves.forEach(leave => {
        const statusClass = leave.status === 'approved' ? 'status-approved' : 
                           leave.status === 'rejected' ? 'status-rejected' : 'status-pending';
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${leave.date}</td>
            <td>${leave.type}</td>
            <td>${leave.from} → ${leave.to}</td>
            <td><span class="${statusClass}">${leave.status.toUpperCase()}</span></td>
        `;
    });
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ===== ADMIN FUNCTIONS =====
function updateAdminStats() {
    document.getElementById('totalEmployees').textContent = employees.length;
    
    const todayAttRecords = attendance.filter(a => a.date === today);
    document.getElementById('presentToday').textContent = todayAttRecords.length;
    
    const pendingLeavesCount = leaves.filter(l => l.status === 'pending').length;
    document.getElementById('pendingLeaves').textContent = pendingLeavesCount;
}

function loadAdminEmployees() {
    const tbody = document.querySelector('#employeesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    employees.forEach(emp => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.department}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteEmployee(${emp.id})">Delete</button>
            </td>
        `;
    });
}

function loadTodayAttendance() {
    const tbody = document.querySelector('#attendanceTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    employees.forEach(emp => {
        const todayAtt = attendance.find(a => a.date === today && a.email === emp.email);
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td style="color:${todayAtt ? '#10b981' : '#ef4444'}">
                ${todayAtt ? 'Present' : 'Absent'}
            </td>
            <td>${todayAtt ? todayAtt.time : '-'}</td>
        `;
    });
}

function loadAdminLeaves() {
    const tbody = document.querySelector('#adminLeavesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const pendingLeaves = leaves.filter(l => l.status === 'pending');
    
    pendingLeaves.forEach(leave => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${leave.name}</td>
            <td>${leave.type}</td>
            <td>${leave.from} → ${leave.to}</td>
            <td>${leave.reason}</td>
            <td><span class="status-pending">Pending</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="approveLeave(${leave.id})">Approve</button>
                <button class="btn btn-small btn-danger" onclick="rejectLeave(${leave.id})">Reject</button>
            </td>
        `;
    });
    
    if (pendingLeaves.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">No pending leave requests</td></tr>';
    }
}

function showAdminTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    
    if (tabId === 'todayAttendance') loadTodayAttendance();
    if (tabId === 'leaves') loadAdminLeaves();
}

// ===== ADMIN ACTIONS =====
function deleteEmployee(empId) {
    if (confirm('Delete this employee?')) {
        employees = employees.filter(e => e.id !== empId);
        saveAllData();
        showMessage('Employee deleted!');
        updateAdminStats();
        loadAdminEmployees();
    }
}

function approveLeave(leaveId) {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
        leave.status = 'approved';
        saveAllData();
        showMessage('Leave approved!');
        loadAdminLeaves();
    }
}

function rejectLeave(leaveId) {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
        leave.status = 'rejected';
        saveAllData();
        showMessage('Leave rejected!');
        loadAdminLeaves();
    }
}

// Save data on page unload
window.onbeforeunload = saveAllData;