import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import canonicalize from "canonicalize";

export type TokenPayload = {
  secret: string;
}

export type FC_Auth = {
  token: TokenPayload;
}

export const getAuthTokenFromFC = async (bearer: string, payload: string) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json"
    }
  }
  const res:AxiosResponse = await axios.post("/api/auth", {payload, bearer}, config)
  return res.data;
}

export const generateAuthToken = () => {
  const now = Date.now();

  const params = {
    method: "generateToken",
    params: {
        timestamp: now,
        expiresAt: now + 600000,
    },
  }

  const payload = canonicalize(params);
  if (payload === undefined)
      throw new Error("failed to canonicalize auth params");
  return payload;  
}

export const fetchProfile = async () => { 
  try {
    const auth: FC_Auth = JSON.parse(localStorage.getItem("fc-token") || "") 
    if(!auth) {
      throw "Not authenticated";
    }
  
    const res = await axios.get("/api/auth", {
      headers: {
        Authorization: auth.token.secret
      }
    });
  
    return res.data;
  } catch (error: any) {
    console.log(error);
    console.log(error.message);
    return null;
  } 
}

export const fetchFeed = async () => {
 try {
  const res = await axios.get("/api/feed")  
  return res.data
 } catch (error) {
  console.log(error);
  alert("Error fetching feed");
 }
}