export class User {
    constructor(name, email, username, password) {
        this.name = this.validateName(name);
        this.email = this.validateEmail(email);
        this.username = this.validateUsername(username);
        this.password = this.validatePassword(password);
    }

    validateName(name) {
        const namePattern = /^[A-Za-z0-9\s-.]+$/;
        if (namePattern.test(name)) return name;
        else throw new Error("Name has invalid characters");
    }

    validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailPattern.test(email)) return email;
        else throw new Error("Email is invalid");
    }

    validateUsername(username) {
        const usernamePattern = /^[a-zA-Z0-9]+$/;
        if (usernamePattern.test(username)) return username;
        else throw new Error("Username is invalid (letters and numbers only)");
    }

    validatePassword(password) {
        if (password.length < 12) throw new Error("Password too short");

        const passwordPattern = /^[A-Za-z0-9%^&#$*]+$/;
        if (!passwordPattern.test(password)) throw new Error("Password contains illegal characters");
        
        // checks if there are lowercase and uppercase letters
        const uppercasePattern = /[A-Z]+/;
        if (password.match(uppercasePattern) === null) throw new Error("Password is missing an uppercase character");
       
        const lowercasePattern = /[a-z]+/;
        if (password.match(lowercasePattern) === null) throw new Error("Password is missing a lowercase character");

        // checks if there are digits
        const digitPattern = /[0-9]+/;
        if (password.match(digitPattern) === null) throw new Error("Password is missing a digit");

        // checks if there are special characters
        const specialPattern = /[%^&#$*]/g;
        const numMatches = password.match(specialPattern) || []; 
        if (numMatches.length < 2) throw new Error("Password is missing two special characters");

        return password;
    }

    getName() {
        return this.name;
    }

    getEmail() {
        return this.email;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }
}