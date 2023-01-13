export const getMediaRecorder = async (previewUrl: string, setAmountOfCameras: (device: number) => void, strm: any, setStream: (stream: any) => void) => {
  if (!previewUrl) {
    if (
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: true,
        })
        .then(function (stream) {
          stream.getTracks().forEach(function (track) {
            track.stop()
          })

          getDeviceCount().then(function (deviceCount: any) {


            // setAmountOfCameras(deviceCount);

            // init the UI and the camera stream
            setAmountOfCameras(deviceCount)
            initCameraStream("user", strm, setStream)
          })
        })
        .catch(function (error) {
          if (error === 'PermissionDeniedError') {
            alert('Permission denied. Please refresh and give permission.')
          }

          console.error('getUserMedia() error: ', error)
        })
    } else {
      alert(
        'Mobile camera is not supported by browser, or there is no camera detected/connected'
      )
    }
  }
}

export const getDeviceCount = () => {
  return new Promise(function (resolve) {
    var videoInCount = 0

    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices: any) {
        devices.forEach(function (device: any) {
          if (device.kind === 'video') {
            device.kind = 'videoinput'
          }

          if (device.kind === 'videoinput') {
            videoInCount++
            console.log('videocam: ' + device.label)
          }
        })

        resolve(videoInCount)
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message)
        resolve(0)
      })
  })
}

const initCameraStream = (mode: string, stream: any, setStream: (strm: any) => void) => {
  if (stream) {
    stream.getTracks().forEach(function (track: any) {
      console.log(track)
      track.stop()
    })
  }

  let constraints;

  // const constraints = {
  //   audio: true,
  //   video: {
  //     width: 375 ,
  //     height: 667,
  //     facingMode: mode,
  //     aspectRatio: { exact: 1.7777777778 }
  //   },
  // }

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    constraints = {
      audio: true,
      video: {
        width: 1080,
        height: 1920,
        facingMode: mode,
        aspectRatio: { exact: 1.7777777778 }
      },
    }
  } else {
    constraints = {
      audio: true,
      video: {
        width: 375,
        height: 667,
        facingMode: mode
      },
    }
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      const video: any = document.getElementById('video')
      if (video) {
        video.srcObject = stream
      }

      setStream(stream)

      const track = stream.getVideoTracks()[0]
      const settings = track.getSettings()
      const str = JSON.stringify(settings, null, 4)
      console.log('settings ' + str)
    })
    .catch(handleError)
}

function handleError(error:any) {
  console.error('getUserMedia() error: ', error)
  alert("Error getting media")
}