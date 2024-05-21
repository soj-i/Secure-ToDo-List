//Next JS/React version of the guestbook

"use client";

import styles from "./page.module.css"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Signup() {
  // If account creation failed, keep state so a special message can be displayed
  const [failedCreationMessage, setFailedCreationMessage] = useState(null);

  const router = useRouter();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const clearRefs = () => {
    nameRef.current.value = "";
    emailRef.current.value = "";
    phoneRef.current.value = "";
    usernameRef.current.value = "";
    passwordRef.current.value = "";
  }

  // Attempts to create an account with the information provided
  const createAccount = async(event) => {
    event.preventDefault();

    const name = event.target[0].value;
    const email = event.target[1].value;
    const username = event.target[2].value;
    const password = event.target[3].value;

    const body = {
        name: name,
        email: email,
        username: username,
        password: password
    };   
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
    fetch("/api/signup", requestOptions)
      .then(async (res) => {
        const response = await res.json();
        console.log(response);
        if (!res.ok) setFailedCreationMessage(response);
        else setFailedCreationMessage(() => {
            router.replace("/login");
            return null;
        });
      });
  }

  // This hook executes when the page is loaded. When the page loads,
  // it redirects the user to the homepage if the user is already logged in
  useEffect(() => {
    if (window.localStorage.getItem("jwt"))
        router.replace("/home");
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles["input-block"]}>
        <form className={styles["input-section"]} onSubmit={createAccount}>
            <table>
                <tbody>
                    <tr>
                        <td>Enter your name: </td>
                        <td><input type="text" ref={nameRef} placeholder='Name' required/></td>
                    </tr>
                    <tr>
                        <td>Enter your email address: </td>
                        <td><input type="email" ref={emailRef} placeholder='Email address' required/></td>
                    </tr>
                    <tr>
                        <td>Create a username: </td>
                        <td><input type="text" ref={usernameRef} placeholder='Username' required/></td>
                    </tr>
                    <tr>
                        <td>Create a password: </td>
                        <td><input type="password" ref={passwordRef} placeholder='Password' required/></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td ><small><p className={styles["input-block"]}>Must contain at least 12 characters, a mix of lower-case and upper-case letters and numbers, and at least 2 of these symbols: %^&#$*</p></small></td>
                    </tr>
                    {failedCreationMessage &&
                        <tr>
                            <div><font color="red">{failedCreationMessage}</font></div>
                        </tr>
                    }
                    <tr>
                        <td>
                        <input type="submit" value="Create user" className={styles["input-block-submit"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
      </div>
      
      <div className={styles["login-block"]}>
          Already have an account?
          &nbsp;<a href="/login">Login</a>
      </div>
    </main>
  )
}