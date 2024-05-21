"use client";

import styles from "./page.module.css"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter();

  // This hook executes when the page is loaded. When the page loads,
  // it redirects the user to the homepage if the user is already logged in
  useEffect(() => {
    if (window.localStorage.getItem("jwt"))
        router.replace("/home");
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.loginStyles}>
        <form>
          <table>
            <tbody>
              <tr>
                <td>
                  <button type="submit" className={styles["input-block-submit"]} formAction="/login/userpass">
                    Login with username and password
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button type="submit" className={styles["input-block-submit"]} formAction="/login/magiclink">
                    Login with a magic link
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
      <div className={styles.signUpBlock}>
        Don't have an account?&nbsp;<a href="/signup">Sign up</a>
      </div>
    </main>
  )
}