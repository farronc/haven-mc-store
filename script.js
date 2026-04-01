// Copy server IP
function copyIP() {
    navigator.clipboard.writeText('havensurvival.net').then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }).catch(() => {
        const el = document.createElement('textarea');
        el.value = 'havensurvival.net';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}

// Category filtering
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const category = item.dataset.category;
        document.querySelectorAll('.category-section').forEach(section => {
            if (section.dataset.category === category) {
                section.style.display = 'block';
                section.style.animation = 'fadeIn 0.3s ease';
            } else {
                section.style.display = 'none';
            }
        });
    });
});

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

// Login modal
const loginModal = document.getElementById('loginModal');

document.getElementById('loginBtn').addEventListener('click', () => {
    loginModal.classList.add('active');
});

document.getElementById('loginClose').addEventListener('click', () => {
    loginModal.classList.remove('active');
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('active');
});

// Edition toggle
document.querySelectorAll('.edition-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.edition-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Login submit
document.getElementById('loginSubmit').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    const edition = document.querySelector('.edition-btn.active').dataset.edition;
    if (username) {
        loginModal.classList.remove('active');
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = username;
        loginBtn.style.color = 'var(--text-primary)';
    }
});
