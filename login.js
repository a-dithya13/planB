//input and buttons
const loginBtn = document.getElementById('loginBtn');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
loginBtn.addEventListener('click',function(){
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    //alerts
    if(email === '' ){
        alert('Please enter your email.');
        return;
    }   
    if(password.length =='' ){
        alert('Please enter your password.');
        return;
    }   
    //obtaining user info from local storage
    const usersJSON=localStorage.getItem('users');//gets in string
    const users = usersJSON ? JSON.parse(usersJSON) : [];//converts to arrray
    const user= users.find(u=>u.email === email && u.password === password);
    if(!user){
       alert('Invalid email or password');
    return;
  }
  
  // If found, save current user to sessionStorage
  sessionStorage.setItem('currentUser', JSON.stringify(user));
  
  // Redirect to scheduler page
  alert('Login successful!');
  window.location.href = 'event.html';
});