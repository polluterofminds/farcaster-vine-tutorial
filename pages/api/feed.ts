import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    //  No post requests here...
  } else if (req.method === "GET") {
    try {
      const metadata = {
        keyvalues: {
          farcaster_video: {
            value: "true", 
            op: "eq"
          }
        }        
      }
      const filters = {
        pageOffset:req.query.offset || 0, 
        status: "pinned",
        metadata
      }
      const feed = await pinata.pinList(filters);
      res.json(feed);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  } else {
    res.status(200);
  }
}