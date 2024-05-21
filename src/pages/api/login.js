import { sendMagicLink, verifyMagicLink } from "@/lib/authProviders/magiclink";
import { verifyUserPass } from "@/lib/authProviders/password";
import { closeDBInstance, getDatabase } from "@/lib/db";
import { generateJWT } from "@/lib/jwt";

export default async function handler(req, res) {
    const db = getDatabase();
    try {
        const username = await verifyWithAuthProvider(req, db);
        const jwt = generateJWT({
            username: username,
        }, "10d");
        closeDBInstance(db);
        res.status(200).json(jwt);
    } catch (error) {
        console.log(error);
        closeDBInstance(db);
        res.status(401).json(error.message);
    }
};

const verifyWithAuthProvider = async (req, db) => {
    const params = req.body;
    if (params.method === "userpass") {
        const username = await verifyUserPass(db, params.username, params.password);
        return username;
    } else if (params.method === "magiclink") {
        if (params.email) { // Requesting a magic link
            await sendMagicLink(req.headers["origin"], db, params.email)
        } else if (params.magic_token) { // Verifying a magic link for login
            const username = await verifyMagicLink(db, params.magic_token);
            return username;
        }
    }
};