const apiUrl = 'https://emoji-api.com/emojis?access_key=a1cc018b8171c9d6043c0b3195e9f181b49c5e56';

fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const picker = document.getElementById("sticker-picker");
        let count = 0;
        data.forEach(emoji => {
            if (emoji.group === "smileys-emotion" && count < 10) {
                const span = document.createElement("span");
                span.textContent = emoji.character; // ใช้ character จาก API
                picker.appendChild(span);
                count++;
            }
        });
    })
    .catch(error => console.error("Error fetching emoji data:", error));

// แสดง/ซ่อนสติ๊กเกอร์ picker
document.getElementById('sticker-btn').addEventListener('click', () => {
    const picker = document.getElementById('sticker-picker');
    picker.style.display = picker.style.display === 'block' ? 'none' : 'block';
});

// เพิ่มอิโมจิลงในช่องข้อความเมื่อคลิก
document.getElementById('sticker-picker').addEventListener('click', (e) => {
    const userInput = document.getElementById('user-input');
    if (e.target.tagName === 'SPAN') {
        userInput.value += e.target.textContent;
    }
});

// ส่งข้อความเมื่อกดปุ่ม "ส่ง"
document.getElementById('send-btn').addEventListener('click', sendMessage);

// ส่งข้อความเมื่อกด Enter
document.getElementById('user-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// ฟังก์ชันส่งข้อความพร้อมแสดงรูปโปรไฟล์
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message) {
        const chatBox = document.getElementById('chat-box');
        
        // สร้าง container ของข้อความ
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user');

        // เพิ่มรูปโปรไฟล์
        const profilePic = document.createElement('img');
        profilePic.src = 'https://via.placeholder.com/40'; // เปลี่ยนเป็นรูปโปรไฟล์ของผู้ใช้จริง
        profilePic.alt = 'User Profile';
        profilePic.classList.add('profile-pic');

        // สร้างกล่องข้อความ
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content', 'user');
        messageContent.textContent = message;

        // ใส่องค์ประกอบเข้าด้วยกัน
        messageElement.appendChild(profilePic);
        messageElement.appendChild(messageContent);
        chatBox.appendChild(messageElement);
        
        // ทำให้ข้อความล่าสุดแสดง
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // ล้างช่อง input
        userInput.value = '';
    }
}
