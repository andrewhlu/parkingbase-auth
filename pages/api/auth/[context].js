import { getAuth } from "../../../utils/mongodb";
import { startAuth } from "../../../utils/oauth";

export default async function (req, res) {
    const { context, state } = req.query;

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
        console.log("Missing session ID");
        return res.status(400).json({ error: "Missing session ID" });
    }

    // State is valid, start auth
    startAuth(context, req, res, auth);
}
