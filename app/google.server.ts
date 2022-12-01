import { redirect, Request } from "@remix-run/node";
import { parse, serialize } from "cookie";
import { readFile } from "fs/promises";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

interface IAPIparams {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  client_secret: string;
  redirect_uris: string[];
}

async function getApiParams(): Promise<IAPIparams> {
  const content = await readFile("./google.json");
  return JSON.parse(content.toString()).web;
}

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getCookieValue(request: Request, key: string): string | undefined {
  const cookies = request.headers.get("Cookie");
  if (!cookies) return;
  const cookieObj = parse(cookies);
  return cookieObj[key];
}

function tryGetUserToken(request: Request): unknown | undefined {
  const token = getCookieValue(request, "token");
  return token && JSON.parse(token);
}

function return_auth_redirect(oauth2Client: OAuth2Client) {
  const auth_url = oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: SCOPES,
  });
  return redirect(auth_url);
}

interface IAction {
  type: "action";
  result: ReturnType<typeof redirect>;
}

interface IData {
  type: "data";
  result: OAuth2Client;
}

export async function authorize(request: Request): Promise<IAction | IData> {
  const apiParams = await getApiParams();
  const oauth2Client = new google.auth.OAuth2(
    apiParams.client_id,
    apiParams.client_secret,
    apiParams.redirect_uris[0]
  );

  const requestURL = new URL(request.url);
  if (requestURL.searchParams.get("code")) {
    // we are doing auth
    const code = requestURL.searchParams.get("code");
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      console.log(tokens, serialize("token", JSON.stringify(tokens)));
      return {
        type: "action",
        result: redirect("/", {
          headers: {
            "Set-Cookie": serialize("token", JSON.stringify(tokens)),
          },
        }),
      };
    } catch {
      return { type: "action", result: redirect("/") };
    }
  }

  const user_token = tryGetUserToken(request);

  if (!user_token) {
    return { type: "action", result: return_auth_redirect(oauth2Client) };
  }
  oauth2Client.setCredentials(user_token);
  return { type: "data", result: oauth2Client };
}
