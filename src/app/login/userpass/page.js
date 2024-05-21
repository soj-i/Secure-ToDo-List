"use client";

import styles from "./page.module.css"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UserPass() {
  // If login failed, store the message from the server to display later
  const [failedLoggedInMessage, setFailedLoggedInMessage] = useState(false);

  const router = useRouter();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Attempt to login with the supplied username and password from the form
  const login = async(event) => {
    event.preventDefault();

    const username = event.target[0].value;
    const password = event.target[1].value;

    const body = {
        method: "userpass",
        username: username,
        password: password
    };   
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
    fetch("/api/login", requestOptions)
      .then(async (res) => {
        const response = await res.json();
        if (!res.ok) setFailedLoggedInMessage(response);
        else setFailedLoggedInMessage(() => {
            window.localStorage.setItem("jwt", response);
            router.replace("/home");
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
        <form className={styles["input-section"]} onSubmit={login}>
          <input type="text" ref={usernameRef} placeholder='Username' required/>
          <input type="password" ref={passwordRef} placeholder='Password' required/>
          {failedLoggedInMessage &&
                <div><font color="red">{failedLoggedInMessage}</font></div>
          }
          <input type="submit" value="Login" className={styles["input-block-submit"]} />
        </form>
      </div>
      <div>
        <form>
          Login another way
          <a href="/login">Login another way</a>
        </form>
      </div>
    </main>
  )
}