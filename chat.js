import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChdEz7B1VcQQI1pkSzprxK7O1BnQkxSvg",
    authDomain: "chat-974ae.firebaseapp.com",
    projectId: "chat-974ae",
    storageBucket: "chat-974ae.firebasestorage.app",
    messagingSenderId: "286722828266",
    appId: "1:286722828266:web:912bb1ad782758811a3493",
    measurementId: "G-KWX8V3BXY0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// อ้างอิงถึงตำแหน่งใน Realtime Database
const publicMessagesRef = ref(database, 'public-messages');
const usersRef = ref(database, 'users');
const privateChatsRef = ref(database, 'private-chats');

// ข้อมูลผู้ใช้ปัจจุบัน
let currentUser = {
    id: generateUserId(),
    name: `User${Math.floor(Math.random() * 1000)}`,
    avatar: `https://i.pravatar.cc/150?u=${generateUserId()}`
};
let currentRoom = 'public'; // กำหนดค่าเริ่มต้นเป็นห้องแชทสาธารณะ
let privateMessagesRef = null; // ประกาศตัวแปรในสโคป global

// สร้าง ID ผู้ใช้
function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
}

// เปลี่ยนห้องแชท
const publicChatBtn = document.getElementById('public-chat-btn');
const roomName = document.getElementById('room-name');

publicChatBtn.addEventListener('click', () => {
    currentRoom = 'public';
    roomName.textContent = 'Public Chat';
    loadMessages(publicMessagesRef);
});

// โหลดข้อความ
function loadMessages(messagesRef) {
    const messagesList = document.getElementById('messages');
    messagesList.innerHTML = ''; // ล้างข้อความเก่า

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        const messageElement = document.createElement('li');
        messageElement.innerHTML = `
            <img src="${message.user.avatar}" alt="${message.user.name}" />
            <span>${message.user.name}: ${message.text}</span>
        `;
        messagesList.appendChild(messageElement);
        window.scrollTo(0, document.body.scrollHeight);
    });
}

// ส่งข้อความ
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    sendMessage();
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้า
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
        const messagesRef = currentRoom === 'public' ? publicMessagesRef : privateMessagesRef;
        push(messagesRef, {
            text: message,
            user: currentUser,
            timestamp: new Date().toLocaleString()
        });
        messageInput.value = ""; // ล้างช่อง input
    }
}

// แสดงผู้ใช้งานออนไลน์
const onlineUsersList = document.getElementById('online-users');
onValue(usersRef, (snapshot) => {
    const users = snapshot.val();
    onlineUsersList.innerHTML = '';
    for (const userId in users) {
        const user = users[userId];
        const userElement = document.createElement('li');
        userElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" />
            <span>${user.name}</span>
        `;
        userElement.addEventListener('click', () => showUserModal(user));
        onlineUsersList.appendChild(userElement);
    }
});

// แสดง Modal สำหรับการจัดการผู้ใช้
const modal = document.getElementById('user-modal');
const modalUsername = document.getElementById('modal-username');
const addFriendBtn = document.getElementById('add-friend-btn');
const blockUserBtn = document.getElementById('block-user-btn');
const startPrivateChatBtn = document.getElementById('start-private-chat-btn');

function showUserModal(user) {
    modal.style.display = 'flex';
    modalUsername.textContent = user.name;

    addFriendBtn.onclick = () => {
        alert(`Added ${user.name} as a friend!`);
        modal.style.display = 'none';
    };

    blockUserBtn.onclick = () => {
        alert(`Blocked ${user.name}!`);
        modal.style.display = 'none';
    };

    startPrivateChatBtn.onclick = () => {
        startPrivateChat(user);
        modal.style.display = 'none';
    };
}

// เริ่มแชทส่วนตัว
function startPrivateChat(user) {
    const chatId = [currentUser.id, user.id].sort().join('_');
    currentRoom = `private-${chatId}`;
    roomName.textContent = `Private Chat with ${user.name}`;
    privateMessagesRef = ref(database, `private-chats/${chatId}`); // กำหนดค่า privateMessagesRef
    loadMessages(privateMessagesRef);
}

// ปิด Modal
const closeModal = document.querySelector('.close');
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// โหลดข้อความเริ่มต้น
loadMessages(publicMessagesRef);

// เพิ่มผู้ใช้ปัจจุบันลงในฐานข้อมูล
set(ref(database, `users/${currentUser.id}`), currentUser);

// ลบผู้ใช้เมื่อปิดเบราว์เซอร์
onDisconnect(ref(database, `users/${currentUser.id}`)).remove();
