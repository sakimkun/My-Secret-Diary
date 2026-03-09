// Firebase Configuration (আপনার Firebase Project থেকে এই তথ্যগুলো পাবেন)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const notesList = document.getElementById('notesList');

// Google Sign In
loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            showUserProfile(user);
            loadNotes(user.uid);
        })
        .catch((error) => {
            console.error("Login Error:", error);
            alert("Login failed. Please try again.");
        });
});

// Show User Profile
function showUserProfile(user) {
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    userAvatar.src = user.photoURL;
    userName.textContent = user.displayName;
}

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        loginBtn.style.display = 'flex';
        userProfile.style.display = 'none';
        notesList.innerHTML = '';
        noteInput.value = '';
    });
});

// Save Note
saveBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    
    if (!noteText) {
        alert("Please write something first! ✨");
        return;
    }
    
    const user = auth.currentUser;
    if (!user) {
        alert("Please login first to save notes! 🔐");
        return;
    }
    
    const noteData = {
        text: noteText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        uid: user.uid
    };
    
    db.collection('notes').add(noteData)
        .then(() => {
            noteInput.value = '';
            loadNotes(user.uid);
            showNotification("Note saved! 💾");
        })
        .catch((error) => {
            console.error("Save Error:", error);
            alert("Failed to save note.");
        });
});

// Clear Note
clearBtn.addEventListener('click', () => {
    noteInput.value = '';
    showNotification("Cleared! 🗑️");
});

// Load Notes
function loadNotes(uid) {
    db.collection('notes')
        .where('uid', '==', uid)
        .orderBy('timestamp', 'desc')
        .get()
        .then((snapshot) => {
            notesList.innerHTML = '';
            
            if (snapshot.empty) {
                notesList.innerHTML = '<p style="text-align:center;color:#888;">No notes yet. Write your first one! 📝</p>';
                return;
            }
            
            snapshot.forEach((doc) => {
                const note = doc.data();
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';
                
                const date = note.timestamp ? new Date(note.timestamp.toDate()).toLocaleDateString() : 'Unknown';
                
                noteCard.innerHTML = `
                    <p>${note.text}</p>
                    <div class="timestamp">📅 ${date}</div>
                    <button class="delete-btn" onclick="deleteNote('${doc.id}')">🗑️ Delete</button>
                `;
                
                notesList.appendChild(noteCard);
            });
        })
        .catch((error) => {
            console.error("Load Error:", error);
        });
}