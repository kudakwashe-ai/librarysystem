// Online Library System - Client Script
// Pixel-accurate UI Matching the Reference Design (Sidebar + Hero + 4 Stat Cards + Book Mockups)

const STATE = {
  token: localStorage.getItem('library_token') || null,
  user: JSON.parse(localStorage.getItem('library_user') || 'null'),
  currentTab: 'catalog',
  authMode: 'login',
  books: [],
  borrows: [],
  activeCategory: 'All',
  searchQuery: ''
};

const DEMO_ACCOUNTS = {
  admin: { email: 'admin@library.edu', password: 'Admin@123' }
};

document.addEventListener('DOMContentLoaded', () => {
  setupAddBookForm();
  checkAuthGate();
});

// Check if user is authenticated or should see auth gate
function checkAuthGate() {
  // Purge any stale fake user sessions from localStorage
  if (STATE.user && STATE.user.email !== 'admin@library.edu') {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
    STATE.token = null;
    STATE.user = null;
  }

  if (STATE.token && STATE.user) {
    showAuthenticatedPortal();
    loadBooks();
    loadBorrows();
  } else {
    showAuthGate();
  }
}

function showAuthGate() {
  const gate = document.getElementById('auth-gate-screen');
  const portal = document.getElementById('main-portal-view');
  if (gate) gate.classList.remove('hidden');
  if (portal) portal.classList.add('hidden');
  clearAuthAlert();
}

function showAuthenticatedPortal() {
  const gate = document.getElementById('auth-gate-screen');
  const portal = document.getElementById('main-portal-view');
  if (gate) gate.classList.add('hidden');
  if (portal) portal.classList.remove('hidden');

  const avatar = document.getElementById('user-avatar-badge');
  const nameEl = document.getElementById('user-name-display');
  const roleEl = document.getElementById('user-role-display');
  const menuEmailEl = document.getElementById('menu-user-email');
  const menuBadgeEl = document.getElementById('menu-user-badge');
  const snavInventory = document.getElementById('snav-inventory');

  if (STATE.user) {
    const initials = (STATE.user.name || 'Kudakwashe Nyapadzauru').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    if (avatar) avatar.textContent = initials || 'KD';
    if (nameEl) nameEl.textContent = STATE.user.name;
    if (roleEl) {
      roleEl.textContent = 'Lead Architect (Administrator)';
    }
    if (menuEmailEl) menuEmailEl.textContent = STATE.user.email;
    if (menuBadgeEl) menuBadgeEl.textContent = 'System Administrator';

    // Administrator has permanent access to Inventory Management
    if (snavInventory) {
      snavInventory.classList.remove('hidden');
    }
  }
}

// Switch between Login and Register tabs on Auth Gate
function switchAuthMode(mode) {
  STATE.authMode = mode;
  const loginTab = document.getElementById('auth-tab-login');
  const regTab = document.getElementById('auth-tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  clearAuthAlert();

  if (mode === 'login') {
    loginTab.className = 'py-2.5 rounded-lg bg-white text-[#0F172A] shadow-sm transition-all flex items-center justify-center gap-1.5 font-bold';
    regTab.className = 'py-2.5 rounded-lg text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 font-bold';
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  } else {
    regTab.className = 'py-2.5 rounded-lg bg-white text-[#0F172A] shadow-sm transition-all flex items-center justify-center gap-1.5 font-bold';
    loginTab.className = 'py-2.5 rounded-lg text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 font-bold';
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }
}

function clearAuthAlert() {
  const alert = document.getElementById('auth-alert-box');
  if (alert) alert.classList.add('hidden');
}

function showAuthAlert(msg) {
  const alert = document.getElementById('auth-alert-box');
  const msgEl = document.getElementById('auth-alert-message');
  if (alert && msgEl) {
    msgEl.textContent = msg;
    alert.classList.remove('hidden');
  }
}

function fillDemoCredentials(role) {
  const creds = DEMO_ACCOUNTS[role];
  if (creds) {
    document.getElementById('input-login-email').value = creds.email;
    document.getElementById('input-login-password').value = creds.password;
    submitLogin(creds.email, creds.password);
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('input-login-email').value;
  const password = document.getElementById('input-login-password').value;
  submitLogin(email, password);
}

async function submitLogin(email, password) {
  clearAuthAlert();
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthAlert(data.message || 'Invalid institutional credentials.');
      return;
    }

    STATE.token = data.token;
    STATE.user = data.user;
    localStorage.setItem('library_token', data.token);
    localStorage.setItem('library_user', JSON.stringify(data.user));

    showAuthenticatedPortal();
    loadBooks();
    loadBorrows();
    showToast(`Signed in as ${data.user.name}`);
  } catch (err) {
    showAuthAlert('Network or server error during authentication.');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  clearAuthAlert();

  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const department = document.getElementById('reg-dept').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, department, password, role })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthAlert(data.message || 'Registration failed. Email may already exist.');
      return;
    }

    STATE.token = data.token;
    STATE.user = data.user;
    localStorage.setItem('library_token', data.token);
    localStorage.setItem('library_user', JSON.stringify(data.user));

    showAuthenticatedPortal();
    loadBooks();
    loadBorrows();
    showToast(`Account created! Welcome, ${data.user.name}!`);
  } catch (err) {
    showAuthAlert('Network error during account registration.');
  }
}

function handleLogout() {
  STATE.token = null;
  STATE.user = null;
  localStorage.removeItem('library_token');
  localStorage.removeItem('library_user');
  showAuthGate();
  showToast('Signed out of library session.');
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================

function switchNavTab(tabId) {
  // Enforce access control: Student cannot access Inventory Management
  if (tabId === 'manage-inventory' && STATE.user && STATE.user.role === 'Student') {
    showToast('Access restricted: Inventory Management is only available for Librarians & Administrators.', 'error');
    tabId = 'catalog';
  }

  STATE.currentTab = tabId;

  // View containers
  const vCatalog = document.getElementById('view-catalog');
  const vLoans = document.getElementById('view-my-loans');
  const vInv = document.getElementById('view-manage-inventory');

  if (vCatalog) vCatalog.classList.add('hidden');
  if (vLoans) vLoans.classList.add('hidden');
  if (vInv) vInv.classList.add('hidden');

  if (tabId === 'catalog' || tabId === 'books') {
    if (vCatalog) vCatalog.classList.remove('hidden');
  } else if (tabId === 'my-loans') {
    if (vLoans) vLoans.classList.remove('hidden');
    loadBorrows();
  } else if (tabId === 'manage-inventory') {
    if (vInv) vInv.classList.remove('hidden');
  }

  // Sidebar button highlights
  const navIds = ['snav-catalog', 'snav-books', 'snav-my-loans', 'snav-inventory'];
  navIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'nav-sidebar-btn nav-item-inactive w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all text-left';
  });

  if (tabId === 'catalog') {
    const active = document.getElementById('snav-catalog');
    if (active) active.className = 'nav-sidebar-btn nav-item-active w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all text-left';
  } else if (tabId === 'books') {
    const active = document.getElementById('snav-books');
    if (active) active.className = 'nav-sidebar-btn nav-item-active w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all text-left';
  } else if (tabId === 'my-loans') {
    const active = document.getElementById('snav-my-loans');
    if (active) active.className = 'nav-sidebar-btn nav-item-active w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all text-left';
  } else if (tabId === 'manage-inventory') {
    const active = document.getElementById('snav-inventory');
    if (active) active.className = 'nav-sidebar-btn nav-item-active w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all text-left';
  }
}

// ============================================
// BOOKS CATALOG & RENDERING
// ============================================

async function loadBooks() {
  try {
    const q = STATE.searchQuery;
    const cat = STATE.activeCategory;
    let url = `/api/books?category=${encodeURIComponent(cat)}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      STATE.books = data.books;
      renderBookCatalog();
      updateCatalogStats();
    }
  } catch (e) {
    console.error('Failed to load books:', e);
  }
}

function updateCatalogStats() {
  const totalTitlesEl = document.getElementById('stat-total-titles');
  const totalCopiesEl = document.getElementById('stat-total-copies');

  if (totalTitlesEl) totalTitlesEl.textContent = STATE.books.length;
  if (totalCopiesEl) {
    const copies = STATE.books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    totalCopiesEl.textContent = copies || '24';
  }
}

// Custom book cover styling to match picture
function getBookCoverHTML(book) {
  const t = book.title.toLowerCase();

  if (t.includes('clean architecture')) {
    return `
      <div class="book-cover-mock bg-gradient-to-b from-[#16274E] via-[#0E1A38] to-[#0A1227] text-white">
        <div class="text-[10px] font-black tracking-tight leading-tight">Clean<br>Architecture</div>
        <div class="my-auto opacity-70">
          <svg class="w-10 h-10 mx-auto text-blue-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div class="text-[8px] opacity-60 text-center font-mono">Robert Martin</div>
      </div>
    `;
  }

  if (t.includes('data-intensive')) {
    return `
      <div class="book-cover-mock bg-gradient-to-b from-[#1C1917] via-[#141210] to-[#0A0908] text-white">
        <div class="text-[9px] font-black tracking-tight leading-tight">Designing<br>Data-Intensive<br>Applications</div>
        <div class="my-auto">
          <svg class="w-10 h-10 mx-auto text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
          </svg>
        </div>
        <div class="text-[8px] opacity-60 text-center font-mono">Martin K.</div>
      </div>
    `;
  }

  if (t.includes('continuous delivery')) {
    return `
      <div class="book-cover-mock bg-gradient-to-b from-[#0F1E38] via-[#09152B] to-[#040B17] text-white">
        <div class="text-[9px] font-black tracking-tight leading-tight">Continuous<br>Delivery</div>
        <div class="my-auto">
          <svg class="w-10 h-10 mx-auto text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12c-2.5 0-4-1.5-4-3.5S5.5 5 8 5c2.5 0 4 3.5 4 7s1.5 7 4 7c2.5 0 4-1.5 4-3.5S18.5 12 16 12" />
          </svg>
        </div>
        <div class="text-[8px] opacity-60 text-center font-mono">Jez Humble</div>
      </div>
    `;
  }

  // Fallback cover
  return `
    <div class="book-cover-mock bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div class="text-[9px] font-black tracking-tight leading-tight">${book.title.substring(0, 24)}...</div>
      <div class="my-auto opacity-70">
        <svg class="w-8 h-8 mx-auto text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div class="text-[8px] opacity-60 text-center font-mono">${book.author}</div>
    </div>
  `;
}

function renderBookCatalog(customList = null) {
  const container = document.getElementById('books-grid');
  if (!container) return;

  const list = customList || STATE.books;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 card-ui p-8">
        <p class="text-sm text-slate-500 font-bold">No textbooks found matching search criteria.</p>
        <button onclick="clearSearch()" class="mt-3 btn-primary-blue text-xs px-4 py-2">Reset Filters</button>
      </div>`;
    return;
  }

  container.innerHTML = list.map(book => {
    const isAvailable = book.availableCopies > 0;
    const coverHTML = getBookCoverHTML(book);

    return `
      <div class="card-ui p-5 flex flex-col justify-between bg-white">
        <div>
          <!-- Top Row Badges -->
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#DBEAFE] text-[#2563EB] flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>${book.category}</span>
            </span>

            <span class="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}"></span>
              <span>${isAvailable ? `${book.availableCopies} Copies Available` : '0 Copies Available'}</span>
            </span>
          </div>

          <!-- Middle Content: Mockup Book Cover + Details -->
          <div class="flex items-start gap-4 mt-4">
            ${coverHTML}
            <div class="flex-grow min-w-0">
              <h3 class="text-sm font-extrabold text-[#0F172A] leading-snug line-clamp-2">
                ${book.title}
              </h3>
              <p class="text-xs text-slate-500 mt-1 font-medium">
                by <strong class="text-[#0F172A] font-bold">${book.author}</strong> (${book.publicationYear})
              </p>
              <p class="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                ${book.description}
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Action Row (View Details link + Royal Blue Borrow button) -->
        <div class="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
          <button onclick="handleViewDetails('${book.id}')" class="link-details text-xs font-bold">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>View Details</span>
            <span>→</span>
          </button>

          <button 
            onclick="handleBorrowBook('${book.id}')"
            ${!isAvailable ? 'disabled' : ''}
            class="${isAvailable ? 'btn-primary-blue' : 'bg-slate-200 text-slate-500 cursor-not-allowed'} text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Borrow</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function handleViewDetails(bookId) {
  const book = STATE.books.find(b => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById('book-details-modal');
  if (!modal) return;

  const titleEl = document.getElementById('modal-book-title');
  const authorEl = document.getElementById('modal-book-author');
  const catEl = document.getElementById('modal-book-category');
  const descEl = document.getElementById('modal-book-desc');
  const isbnEl = document.getElementById('modal-book-isbn');
  const shelfEl = document.getElementById('modal-book-shelf');
  const availEl = document.getElementById('modal-book-availability');
  const coverEl = document.getElementById('modal-book-cover');
  const borrowBtn = document.getElementById('modal-borrow-btn');

  if (titleEl) titleEl.textContent = book.title;
  if (authorEl) authorEl.textContent = `by ${book.author} (${book.publicationYear || 2023})`;
  if (catEl) catEl.textContent = book.category;
  if (descEl) descEl.textContent = book.description;
  if (isbnEl) isbnEl.textContent = book.isbn;
  if (shelfEl) shelfEl.textContent = book.shelfLocation;

  const isAvailable = (book.availableCopies || 0) > 0;
  if (availEl) {
    if (isAvailable) {
      availEl.className = 'mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5';
      availEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>${book.availableCopies} Physical Copies Available on Shelf</span>`;
    } else {
      availEl.className = 'mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5';
      availEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span><span>Currently Checked Out (0 Copies Available)</span>`;
    }
  }

  if (coverEl) {
    coverEl.innerHTML = getBookCoverHTML(book);
  }

  if (borrowBtn) {
    if (isAvailable) {
      borrowBtn.disabled = false;
      borrowBtn.className = 'btn-primary-blue px-5 py-2 text-xs font-bold flex items-center gap-1.5';
      borrowBtn.innerHTML = `
        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>Borrow This Book</span>
      `;
      borrowBtn.onclick = () => {
        closeBookDetailsModal();
        handleBorrowBook(book.id);
      };
    } else {
      borrowBtn.disabled = true;
      borrowBtn.className = 'bg-slate-200 text-slate-500 cursor-not-allowed px-5 py-2 text-xs font-bold flex items-center gap-1.5';
      borrowBtn.innerHTML = `<span>Currently Out of Stock</span>`;
      borrowBtn.onclick = null;
    }
  }

  modal.classList.remove('hidden');
}

function closeBookDetailsModal() {
  const modal = document.getElementById('book-details-modal');
  if (modal) modal.classList.add('hidden');
}

function openLoanPolicyModal() {
  const modal = document.getElementById('loan-policy-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeLoanPolicyModal() {
  const modal = document.getElementById('loan-policy-modal');
  if (modal) modal.classList.add('hidden');
}

function toggleNotificationPopover() {
  const pop = document.getElementById('notif-popover');
  if (pop) pop.classList.toggle('hidden');
}

function dismissNotifications() {
  const badge = document.getElementById('notif-badge');
  if (badge) badge.classList.add('hidden');
  const pop = document.getElementById('notif-popover');
  if (pop) pop.classList.add('hidden');
  showToast('All notifications marked as read', 'info');
}

function toggleUserDropdown() {
  const pop = document.getElementById('user-menu-popover');
  if (pop) pop.classList.toggle('hidden');
}

function filterOnlyAvailable() {
  switchNavTab('catalog');
  const availableBooks = STATE.books.filter(b => (b.availableCopies || 0) > 0);
  renderBookCatalog(availableBooks);
  showToast(`Showing ${availableBooks.length} textbooks currently in stock`, 'info');
}

async function handleBorrowBook(bookId) {
  if (!STATE.token) {
    showToast('Please sign in first.', 'warning');
    showAuthGate();
    return;
  }

  try {
    const res = await fetch('/api/borrows/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STATE.token}`
      },
      body: JSON.stringify({ bookId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadBooks();
      loadBorrows();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Failed to process loan request.', 'error');
  }
}

// ============================================
// MY BORROWED BOOKS (LOANS)
// ============================================

async function loadBorrows() {
  if (!STATE.token) return;

  try {
    const res = await fetch('/api/borrows', {
      headers: { Authorization: `Bearer ${STATE.token}` }
    });
    const data = await res.json();
    if (data.success) {
      STATE.borrows = data.borrows;
      renderBorrowsUI();
    }
  } catch (err) {
    console.error('Failed to load borrows:', err);
  }
}

function renderBorrowsUI() {
  const container = document.getElementById('my-borrows-list');
  const statLoanEl = document.getElementById('stat-my-loans');
  if (!container) return;

  const activeLoans = STATE.borrows.filter(b => b.status === 'Active');
  if (statLoanEl) statLoanEl.textContent = activeLoans.length;

  if (STATE.borrows.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 card-ui p-6">
        <p class="text-sm text-slate-500 font-bold">No textbook loans currently on record.</p>
        <button onclick="switchNavTab('catalog')" class="btn-primary-blue text-xs mt-3 px-4 py-2">Browse Book Catalog</button>
      </div>`;
    return;
  }

  container.innerHTML = STATE.borrows.map(item => {
    const isActive = item.status === 'Active';
    const borrowDate = new Date(item.borrowedAt).toLocaleDateString();
    const dueDate = new Date(item.dueDate).toLocaleDateString();

    return `
      <div class="card-ui p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-[#0F172A]">${item.bookTitle}</h4>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${
                isActive ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
              }">
                ${item.status}
              </span>
            </div>
            <div class="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span>Borrowed: <strong class="text-slate-800">${borrowDate}</strong></span>
              <span>Due Date: <strong class="text-blue-700 font-bold">${dueDate}</strong></span>
              ${item.borrowerName ? `<span class="hidden md:inline font-medium">Borrower: ${item.borrowerName}</span>` : ''}
            </div>
          </div>
        </div>

        <div>
          ${isActive ? `
            <button onclick="handleReturnBook('${item.id}')" class="btn-primary-blue text-xs font-bold py-1.5 px-3 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Return Textbook</span>
            </button>
          ` : `
            <span class="text-xs font-mono font-bold text-emerald-600">Returned</span>
          `}
        </div>
      </div>
    `;
  }).join('');
}

async function handleReturnBook(borrowId) {
  try {
    const res = await fetch('/api/borrows/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STATE.token}`
      },
      body: JSON.stringify({ borrowId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadBorrows();
      loadBooks();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Failed to return textbook.', 'error');
  }
}

// ============================================
// INVENTORY MANAGEMENT FORM
// ============================================

function setupAddBookForm() {
  const form = document.getElementById('add-book-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!STATE.token) {
      showToast('Login required', 'warning');
      return;
    }

    const payload = {
      title: document.getElementById('new-book-title').value,
      author: document.getElementById('new-book-author').value,
      isbn: document.getElementById('new-book-isbn').value,
      category: document.getElementById('new-book-category').value,
      totalCopies: document.getElementById('new-book-copies').value,
      shelfLocation: document.getElementById('new-book-shelf').value,
      description: document.getElementById('new-book-desc').value
    };

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STATE.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${payload.title}" added to library collection!`, 'success');
        form.reset();
        loadBooks();
        switchNavTab('catalog');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Failed to add book', 'error');
    }
  });
}

function setFilterCategory(cat) {
  STATE.activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    if (btn.dataset.category === cat) {
      btn.className = 'cat-pill filter-pill-active px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0';
    } else {
      btn.className = 'cat-pill filter-pill-inactive px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0';
    }
  });
  loadBooks();
}

function handleSearchInput(val) {
  STATE.searchQuery = val;
  // Sync both search boxes
  const topSearch = document.getElementById('top-search-input');
  const filterSearch = document.getElementById('filter-search-input');
  if (topSearch && topSearch.value !== val) topSearch.value = val;
  if (filterSearch && filterSearch.value !== val) filterSearch.value = val;
  loadBooks();
}

function clearSearch() {
  STATE.searchQuery = '';
  STATE.activeCategory = 'All';
  const topSearch = document.getElementById('top-search-input');
  const filterSearch = document.getElementById('filter-search-input');
  if (topSearch) topSearch.value = '';
  if (filterSearch) filterSearch.value = '';
  setFilterCategory('All');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const iconColor = type === 'error' ? 'text-red-500' : 'text-blue-600';
  
  toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-white text-slate-800 text-xs font-bold shadow-xl border border-slate-200 flex items-center gap-2.5 transform transition-all duration-300';
  toast.innerHTML = `
    <svg class="w-4 h-4 ${iconColor} shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Click outside popovers to close them cleanly
document.addEventListener('click', (e) => {
  const notifBtn = e.target.closest('[onclick="toggleNotificationPopover()"]');
  const notifPop = document.getElementById('notif-popover');
  if (!notifBtn && notifPop && !notifPop.contains(e.target)) {
    notifPop.classList.add('hidden');
  }

  const userBtn = e.target.closest('[onclick="toggleUserDropdown()"]');
  const userPop = document.getElementById('user-menu-popover');
  if (!userBtn && userPop && !userPop.contains(e.target)) {
    userPop.classList.add('hidden');
  }
});
