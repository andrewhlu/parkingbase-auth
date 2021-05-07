import { addUserToSession, createGoogleUser, deleteAuth, getAuth, getSession, getUserFromGoogleId, updateGoogleUser } from "../../../../utils/mongodb";
import { completeAuth } from "../../../../utils/oauth";
import { fetch } from "../../../../utils/fetch";

export default async function (req, res) {
    const { state, code } = req.query;

    // Check if state ID is present
    if (!state) {
        console.log("No state ID present");
        return res.status(400).json({ error: "No state ID present" });
    }

    // Get auth object for state ID
    const auth = await getAuth(state);

    if (!auth) {
        console.log("Invalid state ID");
        return res.status(400).json({ error: "Invalid state ID" });
    } else if (!auth?.redirectOrigin) {
        console.log("Missing redirect origin");
        return res.status(400).json({ error: "Missing redirect origin" });
    } else if (!auth?.session) {
        console.log("Missing session token");
        return res.status(400).json({ error: "Missing session token" });
    }

    // Get session object for auth object
    const session = await getSession(auth.session);

    if (!session) {
        console.log("Invalid session token");
        return res.status(400).json({ error: "Invalid session token" });
    }

    // State is valid, complete auth
    const oauthResult = await completeAuth("google", req, code);

    // Get user info from Google
    const headers = {
        "Authorization": "Bearer " + oauthResult.access_token,
        "Accept": "application/json",
        "Content-Type": "application/json",
    };

    const options = {
        method: "GET",
        headers: headers,
    };

    const googleApiResult = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", options);

    if (googleApiResult?.error) {
        // Request to get user failed, redirect with the error message
        console.log("Google login failed:", googleApiResult.error);
        return res.status(400).json(googleApiResult);
    }

    // Check to see if user exists
    let googleUser = await getUserFromGoogleId(googleApiResult.id);

    if (googleUser) {
        // User already exists in the database, update values 
        await updateGoogleUser(googleApiResult.id, googleApiResult);
    } else {
        // User is a new user, create it
        const newUser = {
            google: googleApiResult.id,
            fname: googleApiResult.given_name,
            lname: googleApiResult.family_name,
            email: googleApiResult.email,
            picture: googleApiResult.picture
        };

        googleUser = await createGoogleUser(newUser);
        googleUser._id = googleUser.insertedId;
    }

    // Attach user to session
    await addUserToSession(auth.session, googleUser._id);

    // Delete auth object
    await deleteAuth(auth.state);

    // Redirect back to the app
    res.setHeader('Location', auth.redirectOrigin);
    res.status(302).end();
}
