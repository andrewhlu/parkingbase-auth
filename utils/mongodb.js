import { MongoClient } from "mongodb";
import config from "./config";

const client = new MongoClient(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let connected = false;

export async function initDatabase() {
    if (!connected) {
        await client.connect();
        connected = true;
    }
    return client.db("db");
}

export function serializeDocument(doc) {
    return JSON.parse(JSON.stringify(doc));
}

export async function getAuth(state) {
    const client = await initDatabase();
    const auth = client.collection("auth");

    return await auth.findOne({
        state: state
    });
}

export async function deleteAuth(state) {
    const client = await initDatabase();
    const auth = client.collection("auth");

    return await auth.deleteOne({
        state: state
    });
}

export async function getSession(token) {
    const client = await initDatabase();
    const sessions = client.collection("sessions");

    return await sessions.findOne({
        token: token
    });
}

export async function addUserToSession(token, uid) {
    const client = await initDatabase();
    const sessions = client.collection("sessions");

    const update = {
        $set: {
            uid: uid
        }
    }

    return await sessions.updateOne({ 
        token: token
    }, update);
}

export async function getUserFromGoogleId(id) {
    const client = await initDatabase();
    const users = client.collection("users");

    return await users.findOne({
        google: id
    });
}

export async function createGoogleUser(user) {
    const client = await initDatabase();
    const users = client.collection("users");

    return await users.insertOne(user);
}

export async function updateGoogleUser(id, apiResult) {
    const client = await initDatabase();
    const users = client.collection("users");

    const update = {
        $set: {
            fname: apiResult.given_name,
            lname: apiResult.family_name,
            email: apiResult.email,
            picture: apiResult.picture
        }
    };

    return await users.updateOne({ 
        google: id
    }, update);
}
