"use client";

import styles from "./page.module.css"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function MagicLink() {
  // The page has multiple possible states:
  // - the first time the user lands here before entering their email
  // - after they entered their email address and are waiting for the email
  // - the magic link was clicked to reach this page again (with a token in the link) and the token is being verified
  const [beforeSendingLink, setBeforeSendingLink] = useState(false);
  const [afterSendingLink, setAfterSendingLink] = useState(false);
  const [verifyingMagicLink, setVerifyingMagicLink] = useState(false);

  // If login failed, store the message from the server to display later
  const [failedLoggedInMessage, setFailedLoggedInMessage] = useState(null);
  const [email, setEmail] = useState(null);

  const router = useRouter();

  // Extract search term from the URL params; default is empty string
  const searchParams = useSearchParams();

  const emailRef = useRef(null);

  // Attempt to send a magic link to the entered email address
  // Can only be triggered in the page's first state above
  const sendLink = async(event) => {
    event.preventDefault();

    const email = event.target[0].value;

    const body = {
        method: "magiclink",
        email: email
    };   
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };

    fetch("/api/login", requestOptions)
      .then(async (res) => {
        // 
        setBeforeSendingLink(false);
        setAfterSendingLink(true);
        setEmail(email);
      });
  }

  // If the page receives a magic token in the URL search parameter,
  // verify the magic link with the server
  // Can only be triggered in the page's third state above
  const verifyMagicLink = (magicToken) => {
    setVerifyingMagicLink(true);
    const body = {
        method: "magiclink",
        magic_token: magicToken 
    };   
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };

    fetch("/api/login", requestOptions)
      .then(async (res) => {
        const response = await res.json();
        setVerifyingMagicLink(false)
        if (!res.ok) setFailedLoggedInMessage(response);
        else setFailedLoggedInMessage(() => {
            window.localStorage.setItem("jwt", response);
            router.replace("/home");
            return null;
        });

      })
  };

  // This hook executes when the page is loaded. When the page loads, it checks if it's in the
  // third state above and sets the approriate state.
  // Otherwise, the page is in the first state and is appropriately set.
  useEffect(() => {
    if (window.localStorage.getItem("jwt"))
        router.replace("/home");
    if (searchParams.get("magic_token")) {
        verifyMagicLink(searchParams.get("magic_token"));
    } else
        setBeforeSendingLink(true);
  }, []);

  return (
    <main className={styles.main}>
      {beforeSendingLink &&
        <div className={styles["input-block"]}>
          <p>Tired of typing and remembering passwords?</p> 
          
          <p className={styles["link-info"]}>
            <small>We'll send you a magic link 
            to your registered email address that you can use to log in instead!</small>
          </p>
          <form className={styles["input-section"]} onSubmit={sendLink}>
            <input type="email" ref={emailRef} placeholder='Email address' required/>
            <input type="submit" value="Send link!" className={styles["input-block-submit"]} />
          </form>
        </div>
      }

      {afterSendingLink &&
        <div className={styles["input-block"]}>
          <p>
          We've sent an email with a link to {email} if it is registered to your account.
          Just click on the link to log in!
          </p>

          <p className={styles["link-info"]}>
            <small>If you did not receive a link, check your spam folder. Otherwise, it indicates the email address
            you provided is not registered to an account or an email address that does not exist.</small>
          </p>
        </div>
      }

      {verifyingMagicLink && 
        <div className={styles["input-block"]}>
          <p>Verifying your magic link and logging you in...</p>
          {failedLoggedInMessage &&
                <div><font color="orange">{failedLoggedInMessage}</font></div>
          }
        </div>
      }

      <div>
        <form>
          <a href="/login">Login another way</a>
        </form>
      </div>
    </main>
  )
}