// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Dialog, DialogContent, IconButton, Typography, Box, CircularProgress } from "@mui/material"
// import { Close as CloseIcon } from "@mui/icons-material"
// import zegoCloudService from "../../../server/services/zegocloud"

// const ZegoCallModal = ({ open, onClose, isVideo, roomID, userID, userName, appID, serverSecret }) => {
//   const containerRef = useRef(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [zegoInstance, setZegoInstance] = useState(null)

//   useEffect(() => {
//     let instance = null

//     const initCall = async () => {
//       if (!open || !containerRef.current) return

//       setLoading(true)
//       setError(null)

//       try {
//         // Initialize ZegoCloud service
//         const initialized = zegoCloudService.init(appID, serverSecret)
//         if (!initialized) {
//           throw new Error("Failed to initialize ZegoCloud")
//         }

//         // Generate token
//         const token = zegoCloudService.generateToken(userID, userName, roomID)
//         if (!token) {
//           throw new Error("Failed to generate token")
//         }

//         // Create call instance
//         if (isVideo) {
//           instance = await zegoCloudService.createVideoCall(containerRef.current, token, roomID, onClose)
//         } else {
//           instance = await zegoCloudService.createVoiceCall(containerRef.current, token, roomID, onClose)
//         }

//         setZegoInstance(instance)
//       } catch (err) {
//         console.error("ZegoCloud call error:", err)
//         setError(err.message || "Failed to start call")
//       } finally {
//         setLoading(false)
//       }
//     }

//     initCall()

//     return () => {
//       if (instance) {
//         zegoCloudService.destroyCall(instance)
//       }
//     }
//   }, [open, isVideo, roomID, userID, userName, appID, serverSecret, onClose])

//   const handleClose = () => {
//     if (zegoInstance) {
//       zegoCloudService.destroyCall(zegoInstance)
//       setZegoInstance(null)
//     }
//     onClose()
//   }

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 2,
//           backgroundColor: "#1a1a1a",
//           height: isVideo ? "80vh" : "400px",
//         },
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "flex-end",
//           p: 1,
//           position: "absolute",
//           right: 0,
//           zIndex: 10,
//         }}
//       >
//         <IconButton onClick={handleClose} sx={{ color: "white" }}>
//           <CloseIcon />
//         </IconButton>
//       </Box>

//       <DialogContent sx={{ p: 0, position: "relative", height: "100%" }}>
//         {loading && (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               height: "100%",
//               color: "white",
//             }}
//           >
//             <CircularProgress color="inherit" />
//             <Typography variant="body1" sx={{ mt: 2 }}>
//               {isVideo ? "Starting video call..." : "Starting voice call..."}
//             </Typography>
//           </Box>
//         )}

//         {error && (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               height: "100%",
//               color: "white",
//             }}
//           >
//             <Typography variant="h6" color="error">
//               Call Error
//             </Typography>
//             <Typography variant="body1" sx={{ mt: 1 }}>
//               {error}
//             </Typography>
//           </Box>
//         )}

//         <div
//           ref={containerRef}
//           style={{
//             width: "100%",
//             height: "100%",
//             display: loading || error ? "none" : "block",
//           }}
//         />
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default ZegoCallModal


"use client"

import { useEffect, useState } from "react"
import { Dialog, IconButton } from "@mui/material"
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"

const ZegoCallModal = ({ open, onClose, isVideo, roomID, userID, userName, appID, serverSecret }) => {
  const [callInstance, setCallInstance] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(!isVideo)
  const [callDuration, setCallDuration] = useState(0)
  const [callTimer, setCallTimer] = useState(null)

  useEffect(() => {
    if (open && roomID) {
      // Initialize ZEGOCLOUD call
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName)

      const zp = ZegoUIKitPrebuilt.create(kitToken)

      // Join the call
      zp.joinRoom({
        container: document.getElementById("zego-call-container"),
        sharedLinks: [],
        scenario: {
          mode: isVideo ? ZegoUIKitPrebuilt.VideoConference : ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: false,
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: isVideo,
        showMyCameraToggleButton: isVideo,
        showAudioVideoSettingsButton: false,
        showTextChat: false,
        showUserList: false,
        maxUsers: 2,
        layout: isVideo ? "Grid" : "Auto",
        showLayoutButton: false,
      })

      setCallInstance(zp)

      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      setCallTimer(timer)

      return () => {
        if (timer) clearInterval(timer)
        if (zp) {
          zp.leaveRoom()
        }
      }
    }
  }, [open, roomID, userID, userName, appID, serverSecret, isVideo])

  const handleEndCall = () => {
    if (callTimer) clearInterval(callTimer)
    if (callInstance) {
      callInstance.leaveRoom()
    }
    onClose()
  }

  const toggleMute = () => {
    if (callInstance) {
      callInstance.turnMicrophoneOn(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (callInstance && isVideo) {
      callInstance.turnCameraOn(!isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!open) return null

  return (
    <Dialog
      open={open}
      onClose={handleEndCall}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          backgroundColor: "#1a1a1a",
          borderRadius: "12px",
          overflow: "hidden",
          height: isVideo ? "80vh" : "400px",
        },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center bg-black/30">
          <div className="flex items-center gap-2">
            {isVideo ? <Video className="h-5 w-5 text-white" /> : <Phone className="h-5 w-5 text-white" />}
            <span className="text-white font-medium">{isVideo ? "Video Call" : "Voice Call"}</span>
          </div>
          <div className="text-white">{formatDuration(callDuration)}</div>
        </div>

        <div
          id="zego-call-container"
          className="flex-grow relative"
          style={{
            minHeight: isVideo ? "400px" : "200px",
            backgroundColor: "#2a2a2a",
          }}
        />

        <div className="p-4 flex justify-center items-center gap-6 bg-black/30">
          <IconButton
            onClick={toggleMute}
            className={`p-3 ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
          </IconButton>

          {isVideo && (
            <IconButton
              onClick={toggleVideo}
              className={`p-3 ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
            </IconButton>
          )}

          <IconButton onClick={handleEndCall} className="p-3 bg-red-600 hover:bg-red-700">
            <PhoneOff className="h-6 w-6 text-white" />
          </IconButton>
        </div>
      </div>
    </Dialog>
  )
}

export default ZegoCallModal
