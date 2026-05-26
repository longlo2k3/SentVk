/* Main app script separated from index.html
   Loads messages.json, initializes UI and event handlers
   Falls back to embedded data if fetch fails (for file:// protocol) */

// Supabase Configuration
const SUPABASE_URL = 'https://dtcfifgyibnpbrjkwzqg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cR7PyaxfSItDQzHVI701kA_ZfhOFABj';
let supabaseClient = null;

// Khởi tạo Supabase
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
}

let messageDB = [
    { date: "2026-05-20", message: "Hôm nay anh nhớ nụ cười của em lúc sáng. Làm anh vui cả ngày dài ☀️", icon: "🌻" },
    { date: "2026-05-21", message: "Bầu trời xanh như tình anh dành cho em, trong veo và không có điểm dừng 💙", icon: "💙" },
    { date: "2026-05-22", message: "Anh thích nhất khoảnh khắc được ôm em thật lâu. Hôm nay gửi em cái ôm qua mây nè 🤗", icon: "🤗" },
    { date: "2026-05-23", message: "Cảm ơn em đã đến bên anh. Thế giới bỗng nhiên có ý nghĩa biết bao! 🌍❤️", icon: "🌍" },
    { date: "2026-05-24", message: "Chúc em một ngày dịu dàng như những áng mây trôi. Anh luôn nghĩ về em ☁️", icon: "🍃" },
    { date: "2026-05-25", message: "Hôm nay trời đẹp, anh lại thầm mong được đi chơi cùng em. Yêu em nhiều 💕", icon: "🎡" },
    { date: "2026-05-26", message: "Em có biết không, chỉ cần nhìn thấy em cười là mọi mệt mỏi tan biến. Em là liều thuốc của anh 🍬", icon: "🍬" },
    { date: "2026-05-27", message: "Hãy nhắm mắt lại và cảm nhận: có một người đang nhớ em thật nhiều. Là anh đó ✨", icon: "🤍" },
    { date: "2026-05-28", message: "Mỗi ngày trôi qua, anh lại thêm lý do để yêu em. Mãi bên nhau nhé bé yêu! 💍", icon: "👫" },
    { date: "2026-05-29", message: "Hôm nay thèm được nấu ăn cho em. Hứa sẽ chiều em hết mực 🍝", icon: "🍝" },
    { date: "2026-05-30", message: "Em là điều tuyệt vời nhất mà anh có. Cảm ơn cuộc đời đã cho anh gặp em 🥺", icon: "🌟" },
    { date: "2026-05-31", message: "Cuối tháng rồi, yêu thương chẳng bao giờ vơi cạn. Hãy luôn mỉm cười nhé công chúa 👸", icon: "👑" }
];

const defaultMessage = messageDB.length > 0 ? messageDB[0].message : "Vẫn luôn ở đây để yêu thương em mỗi ngày💖";
const defaultIcon = messageDB.length > 0 ? messageDB[0].icon : "🌙💫";

// DOM elements (declared here so functions can use them)
const openCloudBtn = document.getElementById('openCloudBtn');
const heartRainBtn = document.getElementById('heartRainBtn');
const messageTextDiv = document.getElementById('messageText');
const iconMsgSpan = document.getElementById('iconMsg');
const dateDisplaySpan = document.getElementById('dateDisplay');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const bgMusic = document.getElementById('bgMusic');
const historyToggleBtn = document.getElementById('historyToggleBtn');
const historyPanel = document.getElementById('historyPanel');
const adminPanel = document.getElementById('adminPanel');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const submitAdminBtn = document.getElementById('submitAdminBtn');
const adminDate = document.getElementById('adminDate');
const adminMessage = document.getElementById('adminMessage');
const adminIcon = document.getElementById('adminIcon');
const adminNote = document.getElementById('adminNote');
const adminStatus = document.getElementById('adminStatus');
const messagesList = document.getElementById('messagesList');
const fallingContainer = document.getElementById('fallingContainer');

let currentMessageObj = null;
let typingInterval = null;
let musicPlaying = false;
let musicInitialized = false;

function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}


function updateDateBadge() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplaySpan.innerText = today.toLocaleDateString('vi-VN', options);
}

function getMessageByDate(dateStr) {
    return messageDB.find(item => item.date === dateStr) || null;
}

function stopTyping() {
    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }
}

function typeMessageEffect(fullText, iconHtml, callback) {
    stopTyping();
    messageTextDiv.innerHTML = '';
    iconMsgSpan.innerHTML = iconHtml || '💌';
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    messageTextDiv.appendChild(cursorSpan);
    let index = 0;
    typingInterval = setInterval(() => {
        if (index < fullText.length) {
            const newSpan = document.createElement('span');
            newSpan.innerText = fullText[index];
            messageTextDiv.insertBefore(newSpan, cursorSpan);
            index++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            if (cursorSpan && cursorSpan.parentNode) cursorSpan.remove();
            if (callback) callback();
        }
    }, 35);
}

function loadTodayMessage(withTypingEffect = true) {
    stopTyping();
    const today = getTodayString();
    const found = getMessageByDate(today);
    let msgText = '';
    let icon = '';
    if (found) {
        msgText = found.message;
        icon = found.icon;
        currentMessageObj = found;
    } else {
        msgText = messageDB.length > 0 ? messageDB[0].message : "Vẫn luôn ở đây để yêu thương em mỗi ngày💖";
        icon = messageDB.length > 0 ? messageDB[0].icon : "🌙💫";
        currentMessageObj = { date: today, message: msgText, icon: icon };
    }
    if (withTypingEffect) {
        typeMessageEffect(msgText, icon, () => {});
    } else {
        messageTextDiv.innerText = msgText;
        iconMsgSpan.innerHTML = icon;
    }
}

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = ['❤️', '💖', '💗', '💓', '💕', '💞', '💘'][Math.floor(Math.random() * 7)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 1.5 + 1.2) + 'rem';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
}

function startHeartRain(count = 25) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => createHeart(), i * 70);
    }
}

// === FALLING TEXT FUNCTIONS ===
function createFallingTextElement(text) {
    if (!fallingContainer) return null;
    const el = document.createElement('div');
    el.className = 'falling-text';
    el.innerText = text;
    const left = Math.random() * 100;
    el.style.left = left + '%';
    const size = (Math.random() * 1.2 + 0.9).toFixed(2);
    el.style.fontSize = size + 'rem';
    const duration = (Math.random() * 3 + 2).toFixed(2); // 2 - 5s to fall
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 1.5).toFixed(2) + 's';
    
    // Hiệu ứng tản ra khi hover
    el.addEventListener('mouseenter', function() {
        const computedStyle = window.getComputedStyle(this);
        const matrix = computedStyle.transform;
        this.style.animation = 'none'; // Dừng hiệu ứng rơi
        this.style.transform = matrix; // Cố định vị trí hiện tại

        // Ép trình duyệt reflow
        void this.offsetWidth;

        // Hiệu ứng chuyển động mượt mà và nảy
        this.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        // Giới hạn tản ngang và bắt buộc nảy lên trên (âm Y) để không lọt khỏi màn hình
        const scatterX = (Math.random() - 0.5) * 150; 
        const scatterY = -(Math.random() * 150 + 50); 
        const rot = (Math.random() - 0.5) * 60;

        this.style.transform = `${matrix} translate(${scatterX}px, ${scatterY}px) rotate(${rot}deg) scale(1.2)`;

        // Vô hiệu hóa bắt sự kiện chuột để không bị kẹt dồn matrix khi lướt qua lại
        this.style.pointerEvents = 'none';
        this.style.zIndex = '30';

        // Sau khi nảy lên tản ra, rơi tiếp xuống dưới
        setTimeout(() => {
            this.style.transition = 'transform 2.5s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 2.5s ease-in';
            // Cho rơi thẳng xuống dưới màn hình (cộng thêm 1000px Y)
            this.style.transform = `${matrix} translate(${scatterX}px, 1000px) rotate(${rot + (Math.random() - 0.5) * 90}deg) scale(1)`;
            this.style.opacity = '0'; // Mờ dần khi rơi
            
            // Xóa element sau khi rơi xong
            setTimeout(() => {
                if (this.parentNode) this.parentNode.removeChild(this);
            }, 2500);
        }, 800); // Đợi 800ms cho hiệu ứng tản hoàn tất
    }, { once: true });

    fallingContainer.appendChild(el);
    
    // Simulate the text having actually fallen and staying there
    setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 60000); // Remove after a long time so it looks like it piled up
    
    return el;
}

function startFallingText(count = 20, sourceText = null) {
    const pieces = [];
    // If no sourceText provided, default to the currently displayed message
    if (!sourceText) {
        sourceText = (messageTextDiv && messageTextDiv.innerText && messageTextDiv.innerText.trim()) || (currentMessageObj && currentMessageObj.message) || defaultMessage;
    }
    // split into words, filter short ones to improve visuals
    sourceText.split(/\s+/).forEach(w => { if (w.trim()) pieces.push(w); });
    const pool = pieces.length > 0 ? pieces : ['💖','✨','☁️','Yêu','Em','Anh',' nhớ','ngày','🌙','💕'];

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const text = pool[Math.floor(Math.random() * pool.length)];
            createFallingTextElement(text);
        }, i * 150); // giãn thời gian rơi ra xíu
    }
}

function renderHistory() {
    historyPanel.innerHTML = '';
    messageDB.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `📅 ${item.date} : ${item.message.substring(0, 45)}${item.message.length > 45 ? '…' : ''} ${item.icon}`;
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            stopTyping();
            typeMessageEffect(item.message, item.icon, () => {
                // After typing finished, start falling text for this message
                startFallingText(20, item.message);
            });
            currentMessageObj = item;
            dateDisplaySpan.innerText = `Kỷ niệm ngày ${item.date} 💭`;
        });
        historyPanel.appendChild(div);
    });
    if (messageDB.length === 0) {
        historyPanel.innerHTML = '<div class="history-item">Chưa có lời nhắn cũ, hãy thêm vào database nhé!</div>';
    }
}

function tryAutoPlayMusic() {
    if (!musicInitialized && !musicPlaying) {
        bgMusic.play().then(() => {
            musicPlaying = true;
            musicInitialized = true;musicToggleBtn
            musicToggleBtn.innerHTML = '🔇 Tắt nhạc';
            console.log('✅ Nhạc đã tự động phát');
        }).catch(err => {
            console.log('ℹ️ Không thể tự động phát nhạc (trình duyệt yêu cầu tương tác):', err.message);
        });
    }
}

// Event listeners
historyToggleBtn.addEventListener('click', () => {
    if (historyPanel.classList.contains('show')) {
        historyPanel.classList.remove('show');
    } else {
        renderHistory();
        historyPanel.classList.add('show');
    }
});

openCloudBtn.addEventListener('click', () => {
    loadTodayMessage(true);
    const iconCloud = document.getElementById('cloudIcon');
    iconCloud.style.transform = 'scale(1.2)';
    setTimeout(() => iconCloud.style.transform = '', 300);
    startHeartRain(10);
    // start falling text using all words from the database
    startFallingText(30, messageTextDiv ? messageTextDiv.innerText : null);
    tryAutoPlayMusic();
});

heartRainBtn.addEventListener('click', () => {
    startHeartRain(50);
    // fun: also spawn falling text/emojis
    startFallingText(40, messageTextDiv ? messageTextDiv.innerText : null);
    tryAutoPlayMusic();
});

musicToggleBtn.addEventListener('click', () => {
    if (musicPlaying) {
        bgMusic.pause();
        musicToggleBtn.innerHTML = '🎵 Bật nhạc nền';
        musicPlaying = false;
    } else {
        bgMusic.play().catch(e => console.log("❌ Không thể phát nhạc:", e.message));
        musicToggleBtn.innerHTML = '🔇 Tắt nhạc';
        musicPlaying = true;
    }
});

// Admin Panel Event Listeners
closeAdminBtn.addEventListener('click', () => {
    hideAdminPanel();
});

adminPanel.addEventListener('click', (e) => {
    if (e.target === adminPanel) {
        hideAdminPanel();
    }
});

submitAdminBtn.addEventListener('click', () => {
    saveMessageToSupabase();
});

adminMessage.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        saveMessageToSupabase();
    }
});

function initAutoMusic() {
    const startMusic = () => {
        bgMusic.play()
            .then(() => {
                musicPlaying = true;
                musicInitialized = true;
                musicToggleBtn.innerHTML = '🔇 Tắt nhạc';
            })
            .catch(err => {
                console.log('Không thể autoplay:', err.message);
            });

        document.removeEventListener('click', startMusic);
        document.removeEventListener('touchstart', startMusic);
    };

    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);
}

// ========== ADMIN PANEL FUNCTIONS ==========
function showAdminPanel() {
    adminPanel.classList.add('show');
    adminDate.valueAsDate = new Date();
    loadMessagesFromSupabase();
}

function hideAdminPanel() {
    adminPanel.classList.remove('show');
}

async function saveMessageToSupabase() {
    const date = adminDate.value;
    const message = adminMessage.value.trim();
    const icon = adminIcon.value.trim() || '💌';
    const note = adminNote.value.trim();
    
    if (!date || !message) {
        showAdminStatus('❌ Vui lòng điền đầy đủ ngày và lời nhắn', 'error');
        return;
    }
    
    adminStatus.innerHTML = '⏳ Đang lưu...';
    
    try {
        if (!supabaseClient) {
            showAdminStatus('❌ Lỗi: Supabase chưa kết nối', 'error');
            return;
        }
        
        // Thêm vào database
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([
                {
                    date: date,
                    message: message,
                    icon: icon,
                    note: note,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) {
            console.error('Supabase Error:', error);
            showAdminStatus('❌ Lỗi: ' + error.message, 'error');
            return;
        }
        
        // Thêm vào local database
        messageDB.push({
            date: date,
            message: message,
            icon: icon
        });
        
        // Nếu lưu cho ngày hôm nay, cập nhật ngay UI chính
        if (date === getTodayString()) {
            loadTodayMessage(true);
            updateDateBadge();
        }

        showAdminStatus('✅ Lưu thành công!', 'success');
        adminMessage.value = '';
        adminIcon.value = '';
        adminNote.value = '';
        // refresh both admin list and public index
        await fetchAndSyncMessages();
    } catch (err) {
        console.error('Error:', err);
        showAdminStatus('❌ Lỗi: ' + err.message, 'error');
    }
}

async function loadMessagesFromSupabase() {
    try {
        if (!supabaseClient) return;
        
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('date', { ascending: false })
            .limit(20);
        
        if (error) {
            console.error('Load Error:', error);
            return;
        }
        
        messagesList.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(msg => {
                const item = document.createElement('div');
                item.className = 'message-item';
                item.innerHTML = `
                    <div class="msg-date">${msg.date}</div>
                    <div class="msg-content">
                        <span class="msg-icon">${msg.icon}</span>
                        <span class="msg-text">${msg.message}</span>
                    </div>
                    ${msg.note ? `<div class="msg-note">📌 ${msg.note}</div>` : ''}
                `;
                messagesList.appendChild(item);
            });
        } else {
            messagesList.innerHTML = '<p class="no-messages">Chưa có lời nhắn nào</p>';
        }
    } catch (err) {
        console.error('Error loading messages:', err);
    }
}

// Fetch messages for public index and sync local DB
async function fetchAndSyncMessages() {
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*')
                .order('date', { ascending: false });
            if (!error && data) {
                // normalize dates to YYYY-MM-DD strings
                messageDB = data.map(d => ({ date: d.date instanceof Date ? d.date.toISOString().slice(0,10) : String(d.date), message: d.message, icon: d.icon || '💌', note: d.note }));
            }
        }
    } catch (err) {
        console.error('Error syncing messages:', err);
    }
    // Render UI parts that depend on messageDB
    renderHistory();
    // Ensure the main display shows today's message if any
    loadTodayMessage(true);
}

function showAdminStatus(message, type) {
    adminStatus.innerHTML = message;
    adminStatus.className = 'admin-status ' + type;
    setTimeout(() => {
        if (type === 'success') {
            adminStatus.innerHTML = '';
        }
    }, 3000);
}

function checkAdminAccess() {
    const pathHasAdmin = window.location.hash === '#/admin' || window.location.pathname.includes('/admin') || window.location.href.endsWith('/admin');
    if (pathHasAdmin) {
        // Normalize URL to avoid server routing issues: keep panel state in hash
        if (!window.location.hash.includes('#/admin')) {
            const newPath = window.location.pathname.replace(/\/admin\/?$/, '/') + window.location.search + '#/admin';
            history.replaceState(null, '', newPath);
        }
        showAdminPanel();
    }
    
    // Keyboard shortcut: Ctrl+Shift+A
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            if (adminPanel.classList.contains('show')) {
                hideAdminPanel();
            } else {
                showAdminPanel();
            }
        }
    });
}

document.getElementById('cloudIcon').addEventListener('click', () => {
    startHeartRain(12);
    loadTodayMessage(true);
    tryAutoPlayMusic();
});

async function init() {
    updateDateBadge();
    initAutoMusic();
    checkAdminAccess();
    // Sync messages from Supabase (if available) and render UI
    await fetchAndSyncMessages();

    setTimeout(() => startHeartRain(8), 200);
    setTimeout(() => startFallingText(30, messageTextDiv ? messageTextDiv.innerText : null), 400); // Tự động chạy chữ rơi khi vào trang

    console.log('✅ App initialized');
}
// Try to load messages.json (for production use), but fallback to embedded data
fetch('messages.json')
    .then(res => res.json())
    .then(data => {
        messageDB = data;
        console.log('✅ Messages loaded from JSON:', messageDB.length, 'messages');
        init();
    })
    .catch(err => {
        console.log('ℹ️ Using embedded message data (JSON fetch failed):', err.message);
        init();
    });
