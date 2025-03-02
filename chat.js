import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";



const unreadMessages = {}; // เก็บสถานะข้อความที่ยังไม่ได้อ่าน



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

// ข้อมูลผู้ใช้ปัจจุบัน
let currentUser = {
    id: generateUserId(),
    name: `User${Math.floor(Math.random() * 1000)}`,
    avatar: `https://i.pravatar.cc/150?u=${generateUserId()}`
};

// ประกาศตัวแปร currentRoom และ privateMessagesRef ในสโคป global
let currentRoom = 'public'; // กำหนดค่าเริ่มต้นเป็นห้องแชทสาธารณะ
let privateMessagesRef = null; // ประกาศตัวแปร privateMessagesRef

// อ้างอิงถึงตำแหน่งใน Realtime Database
const publicMessagesRef = ref(database, 'public-messages');
const usersRef = ref(database, 'users');
const privateChatsRef = ref(database, 'private-chats');

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

        messageElement.addEventListener('click', () => showUserModal(message.user));

        messagesList.appendChild(messageElement);
        messagesList.scrollTop = messagesList.scrollHeight;
    });
}

// แสดง Modal สำหรับการจัดการผู้ใช้
function showUserModal(user) {
    const modal = document.getElementById('user-modal');
    const modalUsername = document.getElementById('modal-username');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const blockUserBtn = document.getElementById('block-user-btn');
    const startPrivateChatBtn = document.getElementById('start-private-chat-btn');
    const removeFriendBtn = document.getElementById('remove-friend-btn'); // เพิ่มปุ่มลบเพื่อน

    modal.style.display = 'flex';
    modalUsername.textContent = user.name;

    // เพิ่มเพื่อน
    addFriendBtn.onclick = () => {
        alert(`Added ${user.name} as a friend!`);
        modal.style.display = 'none';
    };

    // บล็อกผู้ใช้
    blockUserBtn.onclick = () => {
        alert(`Blocked ${user.name}!`);
        modal.style.display = 'none';
    };

    // เริ่มแชทส่วนตัว
    startPrivateChatBtn.onclick = () => {
        startPrivateChat(user);
        modal.style.display = 'none';
    };

    // ลบเพื่อน
    removeFriendBtn.onclick = () => {
        alert(`Removed ${user.name} from friends!`);
        modal.style.display = 'none';
    };
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

let isSending = false; // ตัวแปรตรวจสอบว่าข้อความกำลังถูกส่งหรือไม่

function sendMessage() {
    if (isSending) return; // หากข้อความกำลังถูกส่งอยู่ ให้ข้ามการส่งซ้ำ

    const message = messageInput.value.trim();
    if (message !== "") {
        isSending = true; // ตั้งค่าการส่งข้อความเป็น true

        const messagesRef = currentRoom === 'public' ? publicMessagesRef : privateMessagesRef;
        push(messagesRef, {
            text: message,
            user: currentUser,
            timestamp: new Date().toLocaleString()
        }).then(() => {
            messageInput.value = ""; // ล้างช่อง input
            isSending = false; // ตั้งค่าการส่งข้อความเป็น false
        }).catch((error) => {
            console.error("Error sending message: ", error);
            isSending = false; // ตั้งค่าการส่งข้อความเป็น false หากเกิดข้อผิดพลาด
        });
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

// เริ่มแชทส่วนตัว
function startPrivateChat(user) {
    const chatId = [currentUser.id, user.id].sort().join('_');
    currentRoom = `private-${chatId}`;
    roomName.textContent = `Private Chat with ${user.name}`;
    
    privateMessagesRef = ref(database, `private-chats/${chatId}`);
    loadMessages(privateMessagesRef);
}

// เก็บรายการห้องแชทส่วนตัวที่สร้างไว้แล้ว
const createdPrivateChats = {};

function addPrivateChatRoom(user, chatId) {
    // ตรวจสอบว่าห้องแชทส่วนตัวมีอยู่แล้วหรือไม่
    if (createdPrivateChats[chatId]) {
        return; // ไม่สร้างปุ่มซ้ำ
    }


    const chatRoomsList = document.getElementById('chat-rooms-list');
    const chatRoomButton = document.createElement('button'); // สร้างปุ่มแทน <li>
    chatRoomButton.textContent = `Private Chat with ${user.name}`;
    chatRoomButton.classList.add('chat-room-btn'); // เพิ่มคลาส CSS

    chatRoomButton.addEventListener('click', () => {
        currentRoom = `private-${chatId}`;
        roomName.textContent = `Private Chat with ${user.name}`;
        privateMessagesRef = ref(database, `private-chats/${chatId}`);
        loadMessages(privateMessagesRef);
    });

    chatRoomsList.appendChild(chatRoomButton);
    createdPrivateChats[chatId] = true;
}

// โหลดห้องแชทส่วนตัวสำหรับผู้ใช้ปัจจุบัน
function loadPrivateChatRooms() {
    const chatRoomsList = document.getElementById('chat-rooms-list');
    chatRoomsList.innerHTML = ''; // ล้างห้องแชทเก่า

    onValue(privateChatsRef, (snapshot) => {
        const privateChats = snapshot.val();
        for (const chatId in privateChats) {
            const usersInChat = chatId.split('_');
            if (usersInChat.includes(currentUser.id)) {
                const otherUserId = usersInChat.find(id => id !== currentUser.id);
                const otherUserRef = ref(database, `users/${otherUserId}`);
                onValue(otherUserRef, (userSnapshot) => {
                    const otherUser = userSnapshot.val();
                    addPrivateChatRoom(otherUser, chatId);
                });
            }
        }
    });
}

// โหลดข้อความเริ่มต้น
loadMessages(publicMessagesRef);

// เพิ่มผู้ใช้ปัจจุบันลงในฐานข้อมูล
set(ref(database, `users/${currentUser.id}`), currentUser);

// ลบผู้ใช้เมื่อปิดเบราว์เซอร์
onDisconnect(ref(database, `users/${currentUser.id}`)).remove();

// โหลดห้องแชทส่วนตัวเมื่อเริ่มต้น
loadPrivateChatRooms();
