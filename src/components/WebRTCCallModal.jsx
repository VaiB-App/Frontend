import { useEffect, useRef, useState } from "react"
import { Dialog, IconButton } from "@mui/material"
import { Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from "lucide-react"

const CALL_READY = "call:ready"
const CALL_OFFER = "call:offer"
const CALL_ANSWER = "call:answer"
const CALL_ICE = "call:ice-candidate"
const CALL_ENDED = "call:end"

const getIceServers = () => {
  try {
    const configured = import.meta.env.VITE_WEBRTC_ICE_SERVERS
    if (configured) return JSON.parse(configured)
  } catch (error) {
    console.error("Invalid VITE_WEBRTC_ICE_SERVERS JSON", error)
  }

  return [{ urls: "stun:stun.l.google.com:19302" }]
}

const WebRTCCallModal = ({
  socket,
  callId,
  peerId,
  peerName,
  userId,
  isVideo,
  isCaller,
  accepted,
  onClose,
}) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const displayTrackRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const pendingIceRef = useRef([])
  const offerStartedRef = useRef(false)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [status, setStatus] = useState("Waiting for answer…")
  const [error, setError] = useState("")
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [sharingScreen, setSharingScreen] = useState(false)
  onCloseRef.current = onClose

  useEffect(() => {
    console.log("[Call Media] WebRTCCallModal mounted", { callId, accepted, isCaller, isVideo, peerId })
  }, [accepted, callId, isCaller, isVideo, peerId])

  useEffect(() => {
    if (!accepted) {
      console.log("[Call Media] Waiting for call acceptance", { callId, isCaller })
      return undefined
    }

    let disposed = false
    let pc

    const send = (event, payload = {}) => {
      socket.emit(event, { callId, to: peerId, ...payload })
    }

    const flushPendingIce = async () => {
      const queued = pendingIceRef.current.splice(0)
      for (const candidate of queued) {
        try {
          await pc.addIceCandidate(candidate)
        } catch (iceError) {
          console.error("Could not add queued WebRTC ICE candidate", iceError)
        }
      }
    }

    const handleOffer = async (data) => {
      if (data.callId !== callId || isCaller || disposed) return
      try {
        await pc.setRemoteDescription(data.description)
        await flushPendingIce()
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        send(CALL_ANSWER, { description: pc.localDescription })
        setStatus("Connecting…")
      } catch (offerError) {
        console.error("Could not answer WebRTC offer", offerError)
        setError("Could not establish the call. Check your network and try again.")
      }
    }

    const handleAnswer = async (data) => {
      if (data.callId !== callId || !isCaller || disposed) return
      try {
        await pc.setRemoteDescription(data.description)
        await flushPendingIce()
        setStatus("Connecting…")
      } catch (answerError) {
        console.error("Could not set WebRTC answer", answerError)
        setError("Could not establish the call. Check your network and try again.")
      }
    }

    const handleIceCandidate = async (data) => {
      if (data.callId !== callId || !data.candidate || disposed) return
      if (!pc.remoteDescription) {
        pendingIceRef.current.push(data.candidate)
        return
      }
      try {
        await pc.addIceCandidate(data.candidate)
      } catch (iceError) {
        console.error("Could not add WebRTC ICE candidate", iceError)
      }
    }

    const handlePeerReady = async (data) => {
      if (data.callId !== callId || data.userId !== peerId || !isCaller || offerStartedRef.current || disposed) return
      offerStartedRef.current = true
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        send(CALL_OFFER, { description: pc.localDescription })
        setStatus("Ringing…")
      } catch (offerError) {
        console.error("Could not create WebRTC offer", offerError)
        setError("Could not start the call. Check your camera and microphone permissions.")
      }
    }

    const handleCallEnded = (data) => {
      if (data.callId === callId) onCloseRef.current(false)
    }

    const start = async () => {
      console.log("[Call Media] Starting media setup", { callId, isVideo, mediaDevicesAvailable: Boolean(navigator.mediaDevices), getUserMediaAvailable: Boolean(navigator.mediaDevices?.getUserMedia), secureContext: window.isSecureContext })
      try {
        // Attach signaling listeners before asking for media. Either browser
        // may grant permissions first, so the other peer's first signal must
        // not arrive before these listeners exist.
        pc = new RTCPeerConnection({ iceServers: getIceServers() })
        peerRef.current = pc
        pc.ontrack = (event) => {
          const streamFromPeer = event.streams[0] || new MediaStream([event.track])
          setRemoteStream(streamFromPeer)
        }
        pc.onicecandidate = (event) => {
          if (event.candidate) send(CALL_ICE, { candidate: event.candidate })
        }
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setStatus("Connected")
          if (pc.connectionState === "failed") setError("The peer connection failed. A TURN server may be required on this network.")
          if (pc.connectionState === "disconnected") setStatus("Reconnecting…")
        }
        socket.on(CALL_OFFER, handleOffer)
        socket.on(CALL_ANSWER, handleAnswer)
        socket.on(CALL_ICE, handleIceCandidate)
        socket.on(CALL_READY, handlePeerReady)
        socket.on(CALL_ENDED, handleCallEnded)

        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo,
          })
        } catch (mediaError) {
          // A camera can be busy or unavailable even when the microphone works.
          // Keep the video call alive with audio so the user can still talk.
          if (!isVideo || !["NotReadableError", "AbortError", "OverconstrainedError"].includes(mediaError.name)) {
            throw mediaError
          }
          setError("Your camera could not start. Joining with microphone only.")
          console.log("[Call Media] Requesting microphone and camera", { audio: true, video: isVideo })
          console.log("[Call Media] Permission states", await Promise.all(["microphone", "camera"].map(async (name) => { try { return { name, state: (await navigator.permissions?.query({ name }))?.state ?? "unavailable" } } catch (error) { return { name, error: error.message } } })))
          console.log("[Call Media] Camera request failed; retrying with microphone only", { name: mediaError.name, message: mediaError.message, constraint: mediaError.constraint })
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        }
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        console.log("[Call Media] Media access succeeded", { audioTracks: stream.getAudioTracks().map((track) => ({ label: track.label, enabled: track.enabled, readyState: track.readyState })), videoTracks: stream.getVideoTracks().map((track) => ({ label: track.label, enabled: track.enabled, readyState: track.readyState })) })
        localStreamRef.current = stream
        setLocalStream(stream)
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
        if (!stream.getVideoTracks().length) pc.addTransceiver("video", { direction: "sendrecv" })
        send(CALL_READY, { userId })
        setStatus(isCaller ? "Waiting for the other person…" : "Connecting…")
      } catch (mediaError) {
        console.error("Could not access call media", mediaError)
        console.log("[Call Media] Media access failure details", { name: mediaError.name, message: mediaError.message, constraint: mediaError.constraint, isSecureContext: window.isSecureContext, mediaDevicesAvailable: Boolean(navigator.mediaDevices) })
        setError(mediaError.name === "NotAllowedError"
          ? "Allow microphone access in your browser to join the call."
          : mediaError.name === "NotFoundError"
            ? "No microphone was found. Connect a microphone and try again."
            : "Could not access your microphone. Check that it is connected and not in use by another app.")
        send(CALL_ENDED, { reason: "media-error" })
      }
    }

    start()

    return () => {
      disposed = true
      socket.off(CALL_OFFER, handleOffer)
      socket.off(CALL_ANSWER, handleAnswer)
      socket.off(CALL_ICE, handleIceCandidate)
      socket.off(CALL_READY, handlePeerReady)
      socket.off(CALL_ENDED, handleCallEnded)
      peerRef.current?.close()
      peerRef.current = null
      displayTrackRef.current?.stop()
      displayTrackRef.current = null
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      pendingIceRef.current = []
      offerStartedRef.current = false
    }
  }, [accepted, callId, isCaller, isVideo, peerId, socket, userId])

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream])

  const toggleMute = () => {
    const nextMuted = !muted
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted })
    setMuted(nextMuted)
  }

  const toggleCamera = () => {
    const nextCameraOff = !cameraOff
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = !nextCameraOff })
    setCameraOff(nextCameraOff)
  }

  const toggleScreenShare = async () => {
    const pc = peerRef.current
    if (!pc || !navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen sharing is not available in this browser.")
      return
    }
    try {
      const sender = pc.getSenders().find((item) => item.track?.kind === "video")
        || pc.getTransceivers().find((item) => item.receiver.track.kind === "video")?.sender
      if (!sender) {
        setError("This connection does not support screen sharing.")
        return
      }

      if (sharingScreen) {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null
        await sender.replaceTrack(cameraTrack)
        const displayTrack = displayTrackRef.current
        displayTrackRef.current = null
        displayTrack?.stop()
        setSharingScreen(false)
        return
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const displayTrack = displayStream.getVideoTracks()[0]
      displayTrackRef.current = displayTrack
      await sender.replaceTrack(displayTrack)
      setSharingScreen(true)
      displayTrack.onended = async () => {
        if (displayTrackRef.current !== displayTrack) return
        displayTrackRef.current = null
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null
        await sender.replaceTrack(cameraTrack).catch(() => {})
        setSharingScreen(false)
      }
    } catch (shareError) {
      if (!sharingScreen && displayTrackRef.current) {
        displayTrackRef.current.stop()
        displayTrackRef.current = null
      }
      if (shareError.name !== "NotAllowedError") setError("Could not share your screen.")
    }
  }

  return (
    <Dialog
      open
      onClose={() => onClose(true)}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { backgroundColor: "#111827", color: "white", borderRadius: 3, minHeight: isVideo ? "70vh" : "360px" } }}
    >
      <div className="flex h-full min-h-[360px] flex-col">
        <div className="flex items-center justify-between bg-black/30 p-4">
          <div className="font-medium">{isVideo ? "Video call" : "Voice call"} with {peerName}</div>
          <div className="text-sm text-gray-300">{status}</div>
        </div>
        <div className="relative flex flex-1 items-center justify-center gap-3 overflow-hidden bg-gray-900 p-3">
          {error ? <p role="alert" className="max-w-lg text-center text-red-300">{error}</p> : null}
          <video ref={remoteVideoRef} autoPlay muted={!isVideo} playsInline className="h-full max-h-[55vh] w-full object-contain" />
          {isVideo && (
            <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 max-h-36 w-1/4 rounded-lg bg-black object-cover" />
          )}
          {!isVideo && <audio ref={(node) => { if (node && remoteStream) node.srcObject = remoteStream }} autoPlay />}
          {!localStream && !error && <p>Requesting microphone{isVideo ? " and camera" : ""}…</p>}
        </div>
        <div className="flex items-center justify-center gap-4 bg-black/30 p-4">
          <IconButton aria-label={muted ? "Unmute microphone" : "Mute microphone"} onClick={toggleMute} sx={{ color: "white", bgcolor: muted ? "#b91c1c" : "#374151" }}>
            {muted ? <MicOff /> : <Mic />}
          </IconButton>
          {isVideo && (
            <IconButton aria-label={cameraOff ? "Turn camera on" : "Turn camera off"} onClick={toggleCamera} sx={{ color: "white", bgcolor: cameraOff ? "#b91c1c" : "#374151" }}>
              {cameraOff ? <VideoOff /> : <Video />}
            </IconButton>
          )}
          <IconButton aria-label={sharingScreen ? "Stop screen sharing" : "Share screen"} onClick={toggleScreenShare} sx={{ color: "white", bgcolor: sharingScreen ? "#047857" : "#374151" }}>
            <MonitorUp />
          </IconButton>
          <IconButton aria-label="End call" onClick={() => onClose(true)} sx={{ color: "white", bgcolor: "#b91c1c" }}>
            <PhoneOff />
          </IconButton>
        </div>
      </div>
    </Dialog>
  )
}

export default WebRTCCallModal
