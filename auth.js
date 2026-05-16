// auth.js — shared authentication logic
// Must be loaded AFTER supabase.js on every page

/**
 * Check if there is an active session.
 * If not, redirect to login.html.
 * Returns the { session, role, username } if logged in.
 */
async function requireAuth() {
  // Wait for Supabase to restore the session from storage
  const { data: { session } } = await _db.auth.getSession();

  if (!session) {
    // Give it one more chance — sometimes the session loads slightly late
    await new Promise(resolve => setTimeout(resolve, 300));
    const { data: { session: retrySession } } = await _db.auth.getSession();
    if (!retrySession) {
      window.location.href = 'login.html';
      return null;
    }
  }

  const activeSession = (await _db.auth.getSession()).data.session;

  // Fetch role from profiles table
  const { data: profile, error } = await _db
    .from('profiles')
    .select('role, username')
    .eq('id', activeSession.user.id)
    .single();

  if (error || !profile) {
    console.error('Could not load profile:', error?.message);
    await _db.auth.signOut();
    window.location.href = 'login.html';
    return null;
  }

  return { session: activeSession, role: profile.role, username: profile.username };
}

/**
 * Sign out and redirect to login.
 */
async function signOut() {
  await _db.auth.signOut();
  window.location.href = 'login.html';
}

/**
 * Apply read-only mode for non-admin users.
 * Disables all inputs, selects, textareas and hides admin-only buttons.
 */
function applyReadOnlyMode() {
  // Disable all form controls EXCEPT the report search and year filter
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.id === 'reportSearch' || el.id === 'yearFilter') return;
    el.disabled = true;
    el.style.opacity = '0.6';
    el.style.cursor = 'not-allowed';
  });

  // Hide admin-only buttons
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = 'none';
  });

    // Hide the Data Entry nav link for users
    document.querySelectorAll('nav a').forEach(link => {
      if (link.textContent.includes('Data Entry') || link.textContent.includes('Forecast')) {
        link.style.display = 'none';
      }
    });

  // Show a read-only banner
  const banner = document.createElement('div');
  banner.style.cssText = 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:12px;padding:10px 16px;font-size:13px;font-weight:700;margin-bottom:12px;';
  banner.textContent = 'You are in view-only mode. Contact an admin to make changes.';
  const shell = document.querySelector('.shell');
  const nav = document.querySelector('nav');
  if (shell && nav) shell.insertBefore(banner, nav.nextSibling);
}

/**
 * Inject the user info bar (username + logout button) into the header.
 */
function escapeHtmlAuth(value) {
  return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function injectUserBar(username, role) {
  const header = document.querySelector('header');
  if (!header) return;

  // Add Admin link to nav if admin
  if (role === 'admin') {
    const nav = document.querySelector('nav');
    if (nav && !nav.querySelector('a[href="admin.html"]')) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.textContent = 'Admin';
      adminLink.style.background = '#003a8f';
      adminLink.style.color = 'white';
      adminLink.style.borderColor = '#003a8f';
      nav.appendChild(adminLink);
    }
  }

  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2);font-size:13px;';
  bar.innerHTML = `
    <span style="opacity:0.85;">Logged in as <strong>${escapeHtmlAuth(username)}</strong> 
      <span style="background:rgba(255,255,255,0.2);border-radius:999px;padding:2px 8px;margin-left:6px;font-size:11px;">${role.toUpperCase()}</span>
    </span>
    <button onclick="signOut()" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">
      Log out
    </button>
  `;
  header.appendChild(bar);
}

/**
 * Main init — call this at the top of each page's script.
 * Usage:
 *   initPage().then(({ role }) => {
 *     if (role === 'user') applyReadOnlyMode();
 *     // ... rest of page init
 *   });
 */
async function initPage() {
  const auth = await requireAuth();
  if (!auth) return null; // redirecting to login

  injectUserBar(auth.username, auth.role);
  return auth;
}
