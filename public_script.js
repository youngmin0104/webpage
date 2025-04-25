let currentUser = null;

function showRegister() {
  document.getElementById('content').innerHTML = `
    <h2>회원가입</h2>
    <form id="register-form">
      <input type="text" id="username" placeholder="아이디" required>
      <input type="password" id="password" placeholder="비밀번호" required>
      <input type="email" id="email" placeholder="이메일" required>
      <button type="button" onclick="register()">회원가입</button>
    </form>
  `;
}

function showLogin() {
  document.getElementById('content').innerHTML = `
    <h2>로그인</h2>
    <form id="login-form">
      <input type="text" id="login-username" placeholder="아이디" required>
      <input type="password" id="login-password" placeholder="비밀번호" required>
      <button type="button" onclick="login()">로그인</button>
    </form>
  `;
}

function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  })
    .then((res) => res.json())
    .then((data) => alert(data.message))
    .catch((err) => console.error(err));
}

function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      currentUser = data.user;
      showProfile();
    })
    .catch((err) => console.error(err));
}

function showProfile() {
  fetch(`/profile/${currentUser.id}`)
    .then((res) => res.json())
    .then((user) => {
      document.getElementById('content').innerHTML = `
        <h2>마이페이지</h2>
        <p>아이디: ${user.username}</p>
        <p>이메일: ${user.email}</p>
        <textarea id="introduction" placeholder="소개글">${user.introduction}</textarea>
        <input type="password" id="new-password" placeholder="새 비밀번호">
        <button onclick="updateProfile(${user.id})">업데이트</button>
      `;
    });
}

function updateProfile(userId) {
  const introduction = document.getElementById('introduction').value;
  const newPassword = document.getElementById('new-password').value;

  fetch(`/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction, password: newPassword }),
  })
    .then((res) => res.json())
    .then((data) => alert(data.message))
    .catch((err) => console.error(err));
}
