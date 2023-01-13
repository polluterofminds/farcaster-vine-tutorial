// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MerkleAPIClient } from "@standard-crypto/farcaster-js";
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_API_KEY });

export const config = {
  api: {
    bodyParser: false,
  }
};

const saveFile = async (file: any) => {
  try {
    console.log(file);
    const stream = fs.createReadStream(file.filepath);   
    const options = {
      pinataMetadata: {
          name: file.originalFilename,
          keyvalues: {
              farcaster_video: 'true'          
          }
      }     
    };
    const response = await pinata.pinFileToIPFS(stream, options);    
    fs.unlinkSync(file.filepath);

    return response;
  } catch (error) {
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<String>
) {
  if (req.method === "POST") {
    try {
      //  Check for logged in user
      const apiClient = new MerkleAPIClient({
        secret: req.headers.authorization || ""
      });
      const user = await apiClient.fetchCurrentUser();
      if(!user) {
        return res.status(401).send("Unauthorized");
      }
      const form = new formidable.IncomingForm();
      form.parse(req, async function (err, fields, files) {
        if (err) {
          console.log({ err })
          throw err;
        }
        const response = await saveFile(files.video);
  
        const { IpfsHash } = response;
        //  ADD IT TO FC
        const text = `New video from @${user.username}\n View it https://gateway.pinata.cloud/ipfs/${response.hash}`

        await apiClient.publishCast(text)
        return res.status(200).send("success")
      }); 
    } catch (error) {
      console.log(error);
      res.send("Server Error");
    }    
  } else if(req.method === "OPTIONS") {
    return res.status(200).send("ok");
  }
}
