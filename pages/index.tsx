import Feed from '../components/Feed'
import Header from '../components/Header'
import axios from "axios";
import { useState, useEffect } from 'react';
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_API_KEY });

export default function Home(props: any) {  
  const [posts, setPosts] = useState<any>(props.data);
 
  const loadPosts = async () => {
    try {
      const res = await axios.get("/api/feed");
      const data = res.data;
      setPosts(data.rows); 
    } catch (error) {
      alert("Trouble loading posts");
    }
  }
  return (
    <div className="w-full">
      <Header loadPosts={loadPosts} />
      <Feed posts={posts} />
    </div>
  )
}

export async function getStaticProps() {
  const metadata = {
    keyvalues: {
      farcaster_video: {
        value: "true", 
        op: "eq"
      }
    }        
  }
  const filters = {
    pageOffset: 0,
    status: "pinned",
    metadata
  }
  const feed = await pinata.pinList(filters);  

  return {
    props: {
      data: feed.rows
    },
    revalidate: 10,
  }
}

