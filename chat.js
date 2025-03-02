import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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
const messagesRef = ref(database, 'messages');

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
        push(messagesRef, {
            text: message,
            timestamp: new Date().toLocaleString()
        });
        messageInput.value = ""; // ล้างช่อง input
    }
}

// รับข้อความ
onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    const messageElement = document.createElement('li');
    messageElement.textContent = message.text;
    document.getElementById('messages').appendChild(messageElement);
    window.scrollTo(0, document.body.scrollHeight);
});