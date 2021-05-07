import config from "./config";
import { fetch } from "./fetch";
import absoluteUrl from 'next-absolute-url';

const contexts = {
    google: {
        authUri: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUri: "https://oauth2.googleapis.com/token",
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        scopes: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        jsonEncodedBody: true,
        tokenAuthInBody: true,
        additionalParams: {
            include_granted_scopes: true,
        },
    }
};

export async function startAuth(context, req, res, auth) {
    // Check for valid context
    if (!context) {
        return res.status(400).json({ error: "No OAuth context was provided" });
    } else if(!contexts[context]) {
        return res.status(400).json({ error: "An invalid OAuth context was provided" });
    }

    const { origin } = absoluteUrl(req, 'localhost:3001');

    const urlParams = {
        response_type: "code",
        client_id: contexts[context].clientId,
        scope: contexts[context].scopes,
        redirect_uri: contexts[context].tokenUri ? `${origin}/api/auth/redirect/${context}` : "",
        state: auth.state,
    };

    Object.assign(urlParams, contexts[context].additionalParams);

    res.setHeader('Location', contexts[context].authUri + "?" + new URLSearchParams(urlParams).toString());
    res.status(302).end();
}

export async function completeAuth(context, req, code) {
    // Check for valid context
    if (!context) {
        return res.status(400).json({ error: "No OAuth context was provided" });
    } else if(!contexts[context]) {
        return res.status(400).json({ error: "An invalid OAuth context was provided" });
    }

    const { origin } = absoluteUrl(req, 'localhost:3000');

    const body = {
        grant_type: "authorization_code",
        code: code,
        client_id: contexts[context].tokenAuthInBody ? contexts[context].clientId : null,
        client_secret: contexts[context].tokenAuthInBody ? contexts[context].clientSecret : null,
        redirect_uri: `${origin}/api/auth/redirect/${context}`,
    };

    const headers = {
        "Authorization": contexts[context].tokenAuthInBody ? null :  "Basic " + Buffer.from(contexts[context].clientId + ":" + contexts[context].clientSecret).toString('base64'),
        "Content-Type": contexts[context].jsonEncodedBody ? "application/json" : "application/x-www-form-urlencoded",
    };

    const options = {
        method: "POST",
        body: contexts[context].jsonEncodedBody ? JSON.stringify(body) : new URLSearchParams(body).toString(),
        headers: headers,
    };

    const response = await fetch(contexts[context].tokenUri, options);

    return response;
}
