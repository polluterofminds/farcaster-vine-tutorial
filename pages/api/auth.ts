import axios from "axios";
import { MerkleAPIClient } from "@standard-crypto/farcaster-js";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const data = req.body.payload;

    var config = {
      method: 'put',
      url: 'https://api.farcaster.xyz/v2/auth',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Authorization': req.body.bearer,
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios(config);
    res.json(response.data.result);
  } else if (req.method === "GET") {
    try {
      const apiClient = new MerkleAPIClient({
        secret: req.headers.authorization || ""
      });
      const user = await apiClient.fetchCurrentUser();

      return res.json(user);
    } catch (error: any) {
      console.log(error);
      if (MerkleAPIClient.isApiErrorResponse(error)) {
        const apiErrors = error.response.data.errors;
        for (const apiError of apiErrors) {
          console.log(`API Error: ${apiError.message}`);
        }
        console.log(`Status code: ${error.response.status}`);
        res.status(error.response.status).json(apiErrors)
      } else {
        res.status(500).send(error.message);
      }
    }
  } else {
    res.status(200);
  }
}