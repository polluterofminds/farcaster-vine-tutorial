import React, { useState, useEffect } from 'react'
import { fetchProfile, generateAuthToken, getAuthTokenFromFC } from '../utils/farcaster';
import { useSignMessage, useAccount } from 'wagmi';
import { utils } from "ethers";
import { getMediaRecorder } from '../utils/mediaRecorder';
import AuthModal from './AuthModal';
import axios, { AxiosResponse } from 'axios';

const mimeType = 'video/webm'

type props = {
  loadPosts: () => void;
}

const Header = (props:props) => {
  const { loadPosts } = props;
  const [recording, setRecording] = useState<boolean>(false);
  const [recordView, setRecordView] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [strm, setStream] = useState<any>(null);
  const [amount, setAmountOfCameras] = useState<number>(0);
  const [mediaRecorder, setMediaRecorder] = useState<any>(null)
  const [time, setTime] = useState(6)
  const [blobData, setBlob] = useState<any>(null)
  const [posting, setPosting] = useState(false)

  const { address, connector, isConnected } = useAccount();
  const { data, error, isLoading, signMessage } = useSignMessage({
    async onSuccess(data, variables: any) {
      const sig = Buffer.from(utils.arrayify(data)).toString("base64");
      const auth = await getAuthTokenFromFC(`Bearer eip191:${sig}`, variables.message)
      localStorage.setItem("fc-token", JSON.stringify(auth));
      getUser()
    },
  });

  useEffect(() => {
    if (time && recording) {
      setTimeout(() => {
        setTime(time - 1)
      }, 1000)
    }
  }, [time, recording])

  useEffect(() => {
    if (recordView) {
      getMediaRecorder(previewUrl, setAmountOfCameras, strm, setStream);
    }
  }, [recordView]);

  const recordVideo = async () => {
    //  Check if user is signed in and has a Farcaster account
    //  If so, allow recording. If not, post alert
    const user = await checkAuth();
    const profile = await fetchProfile();
    if (!user || !profile) {
      isConnected && address ? getNewAuthToken() : setShowAuthModal(true);
    } else {
      setUser(profile);
      setRecordView(true);
    }
  }

  const checkAuth = async () => {
    let user = JSON.parse(localStorage.getItem("fc-profile") || "");
    return user;
  };

  const getNewAuthToken = async () => {
    const payload = generateAuthToken();
    signMessage({ message: payload })
  }

  const getUser = async () => {
    try {
      const user = await fetchProfile();
      if (user) {
        localStorage.setItem("fc-profile", JSON.stringify(user));
        setUser(user);
        setRecordView(true);
      } else {
        alert("User not found");
        return null;
      }
    } catch (error) {
      console.log(error);
      alert("User not found");
      return null;
    }
  }

  const handleRecord = async () => {
    if (recording === true) {
      setRecording(false)
      mediaRecorder.stop()
      setTime(7)
    } else {
      setRecording(true)
      const media = new MediaRecorder(strm, { mimeType: mimeType })
      setMediaRecorder(media)
      let blobs_recorded: any = []

      media.addEventListener('dataavailable', function (e) {
        blobs_recorded.push(e.data)
      })

      media.addEventListener('stop', async function () {
        const blob = new Blob(blobs_recorded, { type: 'video/mp4' })

        setBlob(blob)
        let video_local = URL.createObjectURL(blob)
        const previewVideo: any = document.getElementById('preview')
        previewVideo.src = video_local
        setPreviewUrl(video_local)
        setRecording(false)
        setTime(7)
        strm.getTracks().forEach((track: any) => {
          track.stop()
          track.enabled = false
        })
        const audioContext = new AudioContext()
        audioContext.close
        const microphone = audioContext.createMediaStreamSource(strm)
        microphone.disconnect
      })

      media.start()

      setTimeout(() => {
        if (media.state === 'recording') {
          media.stop()
        }
      }, 7000)
    }
  }

  const cancel = () => {
    setStream(null);
    setRecordView(false);
    setRecording(false);
    setPreviewUrl("");
  }

  const handleUpload = async () => {
    if (!previewUrl) {
      alert('Must have a video')
      return
    }
    setPosting(true)

    const FID = user.fid
    const form:any = new FormData()
    form.append(
      'video',
      blobData,
      `${FID}-${Date.now()}.${mimeType.split('/')[1]}`
    )

    try {
      const res:AxiosResponse = await axios.post('/api/upload', form, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
          Authorization: JSON.parse(localStorage.getItem('fc-token') || "").token
            .secret,
        },
      })
      console.log('upload: ', res.data)
      setPosting(false)
      cancel()
      setRecordView(false)
      loadPosts()
    } catch (error:any) {
      console.log(error)
      setPosting(false)
      alert(error.message)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between row between w-full">
        <p>Pinnie's Video Feed</p>
        <button onClick={recordVideo}>Record New Video</button>
      </div>
      {
        recordView &&
        <div className="fixed top-20 w-full m-auto bg-white text-center">
          <video
            className={!previewUrl ? 'hidden' : 'h-96 m-auto w-3/4'}
            id="preview"
            autoPlay
            loop
            controls
            playsInline
            src=""
            muted={true}
          />{' '}
          <video
            className={previewUrl ? 'hidden' : 'h-96 m-auto w-3/4'}
            autoPlay
            playsInline
            id="video"
            src=""
            muted={true}
          />
          {
            previewUrl ?
              <div>
                {
                  posting ? 
                  <div>
                    Uploading...
                  </div> :
                  <div>
                    <button className="mr-2" onClick={handleUpload}>Post Video</button><button className="ml-2" onClick={cancel}>Cancel</button>
                  </div>
                }
              </div> :
              <div>
                {recording ? <span>{time.toString()}</span> : <button onClick={handleRecord}>Record</button>}
              </div>
          }
        </div>
      }
      {
        showAuthModal &&
        <AuthModal setShowAuthModal={setShowAuthModal} />
      }
    </div>
  )
}

export default Header;