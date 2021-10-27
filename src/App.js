import { useState, useRef, useEffect } from 'react'
import AgoraRTC from "agora-rtc-sdk-ng"
import { GlobalProvider, useClient, useStart, useUsers, useAppID, useChannel, useToken } from './GlobalContext';

export default function App() {
  return (
    <GlobalProvider>
      <Content />
    </GlobalProvider>
  );
}

const Content = () => {
  const setUsers = useUsers()[1]
  const [start, setStart] = useStart()
  const rtc = useClient()
  const options = {
    // Pass your app ID here.
    appId: "cd305ea814d54bdf87aa48ffe4af8363",
    // Set the channel name.
    channel: "TYTO",
    // Pass a token of App Certificate.
    token:  "006cd305ea814d54bdf87aa48ffe4af8363IABNp+ndP59n73J14dg8cISNJFHE4aETJ6Ffct7T0NJSOIeW8j4AAAAAEACHtvL/bet3YQEAAQBr63dh",
  };

  let init = async (name, appId, token) => {
    rtc.current.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    initClientEvents()
    const uid = await rtc.current.client.join(appId, name, token, null);
    // Create an audio track from the audio sampled by a microphone.
    rtc.current.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Create a video track from the video captured by a camera.
    rtc.current.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    //Adding a User to the Users State
    setUsers((prevUsers) => {
      return [...prevUsers, { uid: uid, audio: true, video: true, client: true, videoTrack: rtc.current.localVideoTrack }]
    })
    //Publishing your Streams
    await rtc.current.client.publish([rtc.current.localAudioTrack, rtc.current.localVideoTrack]);
    setStart(true)
  }




  const initClientEvents = () => {
    rtc.current.client.on("user-published", async (user, mediaType) => {
      // New User Enters
      await rtc.current.client.subscribe(user, mediaType);

      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        setUsers((prevUsers) => {
          return [...prevUsers, { uid: user.uid, audio: user.hasAudio, video: user.hasVideo, client: false, videoTrack: remoteVideoTrack }]

        })
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
        setUsers((prevUsers) => {
          return (prevUsers.map((User) => {
            if (User.uid === user.uid) {
              return { ...User, audio: user.hasAudio }
            }
            return User
          }))

        })
      }
    });

    rtc.current.client.on("user-unpublished", (user, type) => {
      //User Leaves
      if (type === 'audio') {
        setUsers(prevUsers => {
          return (prevUsers.map((User) => {
            if (User.uid === user.uid) {
              return { ...User, audio: !User.audio }
            }
            return User
          }))
        })
      }
      if (type === 'video') {
        setUsers((prevUsers) => {
          return prevUsers.filter(User => User.uid !== user.uid)
        })
      }
    });
  }

  return (
    <div className="App">
      {start && <Videos />}
      {!start && <ChannelForm initFunc={init} />}
    </div>
  )
}


const Videos = () => {

  const users = useUsers()[0]

  return (
    <div id='videos'>
      {users.length && users.map((user) => <Video key={user.uid} user={user} />)}
    </div>
  )

}

export const Video = ({ user }) => {

  const vidDiv = useRef(null)

  const playVideo = () => {
    user.videoTrack.play(vidDiv.current)
  }

  const stopVideo = () => {
    user.videoTrack.stop()
  }

  useEffect(() => {
    playVideo()
    return () => {
      stopVideo()
    }
  // eslint-disable-next-line
  }, [])

  return (
    <div className='vid' ref={vidDiv} >
      <Controls user={user} />
    </div>
  )
}


export const Controls = ({ user }) => {

  const setStart = useStart()[1]
  const setUsers = useUsers()[1]
  const rtc = useClient()

  const leaveChannel = async () => {
    // Destroy the local audio and video tracks.
    await rtc.current.localAudioTrack.close();
    await rtc.current.localVideoTrack.close();
    await rtc.current.client.leave();
    setUsers([])
    setStart(false)
  }

  const mute = (type, id) => {
    if (type === 'audio') {
      setUsers(prevUsers => {
        return (prevUsers.map((user) => {
          if (user.uid === id) {
            user.client && rtc.current.localAudioTrack.setEnabled(!user.audio)
            return { ...user, audio: !user.audio }
          }
          return user
        }))
      })
    }
    else if (type === 'video') {
      setUsers(prevUsers => {
        return prevUsers.map((user) => {
          if (user.uid === id) {
            user.client && rtc.current.localVideoTrack.setEnabled(!user.video)
            return { ...user, video: !user.video }
          }
          return user
        })
      })
    }
  }

  return (
    <div className='controls'>
      {<p className={user.audio ? 'on' : ''} onClick={() => user.client && mute('audio', user.uid)}>Mic</p>}
      {<p className={user.video ? 'on' : ''} onClick={() => user.client && mute('video', user.uid)}>Video</p>}
      {user.client && <p onClick={() => leaveChannel()}>Quit</p>}
    </div>
  )
}


const ChannelForm = ({ initFunc }) => {

  const [appId, setAppId] = useAppID();
  const [token, setToken] = useToken();
  const [channelName, setChannelName] = useChannel();
  const options = {
    // Pass your app ID here.
    appId: "cd305ea814d54bdf87aa48ffe4af8363",
    // Set the channel name.
    channel: "TYTO",

    token:  "006cd305ea814d54bdf87aa48ffe4af8363IABPLBvX1t12kXfflA0x4FflH9iSiiWben0dm7a/fdS7oYeW8j4AAAAAEACHtvL/wPl5YQEAAQC/+Xlh"
  };
  return (
    <form className='join'>
      <button onClick={(e) => { e.preventDefault(); initFunc(options.channel, options.appId, options.token);}}>Join Call</button>
    </form>
  );

}



