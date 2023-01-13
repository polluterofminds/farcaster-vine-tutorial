import React from 'react'

type props = {
  posts: any[]
}

const Feed = (props:props) => {
  const { posts } = props;
  console.log(posts);
  return (
    <div className="mt-20">
      {
        posts.map(p => {
          return (
            <div key={p.ipfs_pin_hash}>
              <video          
                src={`https://gateway.pinata.cloud/ipfs/${p.ipfs_pin_hash}`}
                playsInline
                autoPlay
                muted
                controls
                loop
                id={p.cid}
              ></video>
            </div>
          )
        })
      }
    </div>
  )
}

export default Feed