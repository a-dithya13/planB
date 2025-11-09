//inputs obtaining and getting info
const signupBtn = document.getElementById('signupBtn');
const nameInput = document.getElementById('signupName');
const emailInput = document.getElementById('signupEmail');
const passwordInput = document.getElementById('signupPassword');
const confirmInput = document.getElementById('signupConfirm');
//signup
signupBtn.addEventListener('click',function(){
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()
    const name = nameInput.value.trim()
    const confirm = confirmInput.value.trim()
    //alerts
    if(name === '' ){
        alert('Please enter your name.');
        return
    }
    if(email === '' ){
        alert('Please enter your email.')
        return;
    }
    if(password.length < 8  ){
        alert('Password must be at least 8+ characters.');
        return;
    }
    if(password !== confirm){
        alert('Passwords do not match.');
        return;     
    
    }
    //existing users checking
    const usersJSON=localStorage.getItem('users');//get string
    const users = usersJSON ? JSON.parse(usersJSON) : [];//converts to arrray

    const exists = users.find(u=>u.email === email);
    if(exists){
        alert('Email already registered.');//checking for registered email
        return;
    }
    const newUser = {
        id:Date.now(),//unique id for each user
        name:name,
        email:email,
        password:password
    }
    users.push(newUser);//adding new user to array
    localStorage.setItem('users',JSON.stringify(users));
     //save to local storage
     alert('Account Created');
     window.location.href = 'index.html';//redirect to login page
})