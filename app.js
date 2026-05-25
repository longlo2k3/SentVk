/* Main app script separated from index.html
   Loads messages.json, initializes UI and event handlers
   Falls back to embedded data if fetch fails (for file:// protocol) */

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

const defaultMessage = "Vẫn luôn ở đây để yêu thương em mỗi ngàyngày💖";
const defaultIcon = "🌙💫";

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
        msgText = defaultMessage;
        icon = defaultIcon;
        currentMessageObj = { date: today, message: defaultMessage, icon: defaultIcon };
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

function renderHistory() {
    historyPanel.innerHTML = '';
    messageDB.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `📅 ${item.date} : ${item.message.substring(0, 45)}${item.message.length > 45 ? '…' : ''} ${item.icon}`;
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            stopTyping();
            typeMessageEffect(item.message, item.icon, null);
            currentMessageObj = item;
            dateDisplaySpan.innerText = `Kỷ niệm ngày ${item.date} 💭`;
            setTimeout(() => updateDateBadge(), 3000);
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
    tryAutoPlayMusic();
});

heartRainBtn.addEventListener('click', () => {
    startHeartRain(50);
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

document.getElementById('cloudIcon').addEventListener('click', () => {
    startHeartRain(12);
    loadTodayMessage(true);
    tryAutoPlayMusic();
});

function init() {
    updateDateBadge();
    loadTodayMessage(true);
    initAutoMusic();

    setTimeout(() => startHeartRain(8), 200);

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
