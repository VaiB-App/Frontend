import { useEffect, useRef, useState } from "react"
import { Dialog, IconButton } from "@mui/material"
import { Maximize2, Mic, MicOff, Minimize2, MonitorUp, PhoneOff, UserRound, Video, VideoOff, Wifi } from "lucide-react"
import "./WebRTCCallModal.css"

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

const ParticipantVideo = ({ name, videoRef, visible, local = false, status }) => {
  const initials = name?.trim()?.slice(0, 1)?.toUpperCase() || "U"

  return (
    <section className="call-participant">
      {visible ? (
        <video
          ref={videoRef}
          autoPlay
          muted={local}
          playsInline
          className={`call-participant__video ${local ? "call-participant__video--local" : ""}`}
        />
      ) : (
        <div className="call-participant__placeholder">
          <div className="call-participant__initials">
            {initials}
          </div>
          <span className="call-muted">{status}</span>
        </div>
      )}

      <div className="call-participant__caption">
        <div className="call-participant__details">
          <div className="call-participant__name">{name || "Participant"}</div>
          <div className="call-participant__status">
            <span className={`call-dot ${status === "Connected" ? "call-dot--connected" : "call-dot--waiting"}`} />
            {status}
          </div>
        </div>
        {local && <span className="call-you-tag">You</span>}
      </div>
    </section>
  )
}

const formatDuration = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

const WebRTCCallModal = ({
  socket,
  callId,
  peerId,
  peerName,
  peerAvatar,
  userId,
  isVideo,
  isCaller,
  accepted,
  onReady,
  onClose,
}) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const displayTrackRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const onReadyRef = useRef(onReady)
  const readySentRef = useRef(false)
  const pendingIceRef = useRef([])
  const offerStartedRef = useRef(false)
  const workspaceRef = useRef(null)
  const callStartedAtRef = useRef(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [status, setStatus] = useState("Waiting for answer…")
  const [error, setError] = useState("")
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [sharingScreen, setSharingScreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  onCloseRef.current = onClose
  onReadyRef.current = onReady

  useEffect(() => {
    setAvatarLoadFailed(false)
    console.info("[Call Avatar] Modal received peer profile", {
      callId,
      peerId,
      peerName,
      avatarPresent: Boolean(peerAvatar),
      avatarType: typeof peerAvatar,
      peerAvatar,
    })
  }, [callId, peerAvatar, peerId, peerName])

  useEffect(() => {
    if (status !== "Connected") return undefined
    callStartedAtRef.current ||= Date.now()
    const updateDuration = () => setCallDuration(Math.floor((Date.now() - callStartedAtRef.current) / 1000))
    updateDuration()
    const timer = window.setInterval(updateDuration, 1000)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === workspaceRef.current)
    document.addEventListener("fullscreenchange", syncFullscreenState)
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else if (workspaceRef.current?.requestFullscreen) {
        await workspaceRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (fullscreenError) {
      console.error("Could not toggle call fullscreen", fullscreenError)
    }
  }

  useEffect(() => {
    console.log("[Call Media] WebRTCCallModal mounted", { callId, accepted, isCaller, isVideo, peerId })
  }, [accepted, callId, isCaller, isVideo, peerId])

  useEffect(() => {
    // Outgoing calls acquire media as soon as the call is placed, so browser
    // permission prompts happen before the other person answers. Incoming
    // calls still wait until the user accepts before opening their devices.
    if (!accepted && !isCaller) {
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
        if (isCaller && !readySentRef.current) {
          readySentRef.current = true
          onReadyRef.current?.()
        }
        setStatus(isCaller ? "Waiting for the other person…" : "Connecting…")
      } catch (mediaError) {
        console.error("Could not access call media", mediaError)
        console.log("[Call Media] Media access failure details", { name: mediaError.name, message: mediaError.message, constraint: mediaError.constraint, isSecureContext: window.isSecureContext, mediaDevicesAvailable: Boolean(navigator.mediaDevices) })
        setError(mediaError.name === "NotAllowedError"
          ? `Allow ${isVideo ? "microphone and camera" : "microphone"} access in your browser to place the call.`
          : mediaError.name === "NotFoundError"
            ? "No microphone was found. Connect a microphone and try again."
            : "Could not access your microphone. Check that it is connected and not in use by another app.")
        send(CALL_ENDED, { reason: "media-error" })
        if (isCaller) onCloseRef.current(false)
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
      readySentRef.current = false
    }
  }, [accepted, callId, isCaller, isVideo, onReady, peerId, socket, userId])

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
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: "calc(100vw - 40px)" },
          maxWidth: "1600px",
          height: { xs: "100dvh", sm: "min(92dvh, 960px)" },
          maxHeight: { xs: "100dvh", sm: "92dvh" },
          m: { xs: 0, sm: 2 },
          overflow: "hidden",
          color: "white",
          bgcolor: "#0b1117",
          border: { xs: 0, sm: "1px solid rgba(255,255,255,0.1)" },
          borderRadius: { xs: 0, sm: "20px" },
          boxShadow: "0 32px 100px rgba(0,0,0,0.62), 0 0 70px rgba(63,111,130,0.08)",
        },
      }}
      sx={{ "& .MuiDialog-container": { p: { xs: 0, sm: 1 } } }}
    >
      <div ref={workspaceRef} className={`call-workspace${isVideo ? " call-workspace--video" : " call-workspace--voice"}`}>
        <header className="call-header">
          <div className="call-header__identity">
            <div className="call-header__icon">
              {isVideo ? <Video size={19} /> : <Mic size={19} />}
            </div>
            <div className="call-header__titles">
              <h2>{isVideo ? "Video call" : "Voice call"}</h2>
              <div className="call-header__meta">
                <span>You and {peerName || "Participant"}</span><span aria-hidden="true">·</span><span>2 participants</span>
                {status === "Connected" && <><span aria-hidden="true">·</span><span className="call-duration">{formatDuration(callDuration)}</span></>}
              </div>
            </div>
          </div>
          <div className="call-header__actions">
            <div className="call-network-status">
              <Wifi size={14} className={status === "Connected" ? "call-icon-connected" : "call-icon-waiting"} />
              {status}
            </div>
            <IconButton aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen} sx={{ width: 40, height: 40, color: "#c3d0d8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.12)" } }}>
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </IconButton>
          </div>
        </header>

        {isVideo ? (
          <main className="call-video-grid">
            <ParticipantVideo name="You" videoRef={localVideoRef} visible={Boolean(localStream?.getVideoTracks().some((track) => track.enabled) && !cameraOff)} local status={status === "Connected" ? "Connected" : status} />
            <ParticipantVideo name={peerName} videoRef={remoteVideoRef} visible={Boolean(remoteStream?.getVideoTracks().some((track) => track.readyState === "live"))} status={remoteStream ? status : "Waiting for video…"} />
          </main>
        ) : (
          <main className="call-voice-stage">
            <div className="call-orbit call-orbit--outer" />
            <div className="call-orbit call-orbit--inner" />
            <div className={`call-avatar${peerAvatar && !avatarLoadFailed ? " call-avatar--photo" : ""}`}>
              {peerAvatar && !avatarLoadFailed ? (
                <img
                  className="call-avatar__image"
                  src={peerAvatar}
                  alt={`${peerName || "User"} profile`}
                  onLoad={(event) => console.info("[Call Avatar] Profile image loaded", {
                    callId,
                    peerId,
                    currentSrc: event.currentTarget.currentSrc,
                    naturalWidth: event.currentTarget.naturalWidth,
                    naturalHeight: event.currentTarget.naturalHeight,
                  })}
                  onError={(event) => {
                    console.error("[Call Avatar] Profile image failed to load", {
                      callId,
                      peerId,
                      src: event.currentTarget.src,
                    })
                    setAvatarLoadFailed(true)
                  }}
                />
              ) : <UserRound className="call-avatar__icon" strokeWidth={1.35} />}
              <span className="call-avatar__ring" />
            </div>
            <h3 className="call-peer-name">{peerName || "Participant"}</h3>
            <p className="call-peer-status">
              <span className={`call-dot ${status === "Connected" ? "call-dot--connected" : "call-dot--waiting"}`} />
              {status === "Connected" ? `Connected · ${formatDuration(callDuration)}` : isCaller ? "Ringing…" : "Connecting…"}
            </p>
            <div className="call-waveform" aria-hidden="true">
              {[8, 13, 19, 11, 25, 15, 32, 18, 10, 23, 14, 8].map((height, index) => (
                <span key={index} style={{ height, animationDelay: `${index * 75}ms` }} />
              ))}
            </div>
            {status !== "Connected" && <p className="call-waiting-copy">Waiting for {peerName || "them"} to answer</p>}
            <div className="call-local-status">
              <span className="call-local-status__you">You</span><span aria-hidden="true">·</span>{muted ? "Microphone muted" : "Microphone on"}
            </div>
          </main>
        )}

        {error && <div role="alert" className="call-error">{error}</div>}
        {!localStream && !error && <div className="call-requesting">Requesting microphone{isVideo ? " and camera" : ""}…</div>}
        {!isVideo && <audio ref={(node) => { if (node && remoteStream) node.srcObject = remoteStream }} autoPlay />}

        <footer className="call-footer">
          <div className="call-controls">
            <div className="call-control-item">
              <IconButton aria-label={muted ? "Unmute microphone" : "Mute microphone"} title={muted ? "Unmute microphone" : "Mute microphone"} onClick={toggleMute} sx={{ width: 54, height: 54, color: muted ? "#fda4af" : "#e1e9ef", bgcolor: muted ? "rgba(190,45,63,0.25)" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", "&:hover": { bgcolor: muted ? "rgba(190,45,63,0.36)" : "rgba(255,255,255,0.14)" } }}>
                {muted ? <MicOff size={19} /> : <Mic size={19} />}
              </IconButton>
              <span>{muted ? "Unmute" : "Mute"}</span>
            </div>
            {isVideo && <div className="call-control-item"><IconButton aria-label={cameraOff ? "Turn camera on" : "Turn camera off"} title={cameraOff ? "Turn camera on" : "Turn camera off"} onClick={toggleCamera} sx={{ width: 54, height: 54, color: cameraOff ? "#fda4af" : "#e1e9ef", bgcolor: cameraOff ? "rgba(190,45,63,0.25)" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(255,255,255,0.14)" } }}>
              {cameraOff ? <VideoOff size={19} /> : <Video size={19} />}
            </IconButton><span>{cameraOff ? "Start video" : "Camera"}</span></div>}
            <div className="call-control-item">
              <IconButton aria-label={sharingScreen ? "Stop screen sharing" : "Share screen"} title={sharingScreen ? "Stop screen sharing" : "Share screen"} onClick={toggleScreenShare} sx={{ width: 54, height: 54, color: sharingScreen ? "#7dd3c7" : "#e1e9ef", bgcolor: sharingScreen ? "rgba(25,125,110,0.2)" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(255,255,255,0.14)" } }}>
                <MonitorUp size={19} />
              </IconButton><span>{sharingScreen ? "Stop share" : "Share"}</span>
            </div>
            <span className="call-control-divider" />
            <div className="call-control-item"><IconButton aria-label="End call" title="End call" onClick={() => onClose(true)} sx={{ width: 62, height: 54, color: "white", bgcolor: "#e5394d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px", "&:hover": { bgcolor: "#f04b5d", boxShadow: "0 6px 22px rgba(216,67,80,0.26)" } }}>
              <PhoneOff size={20} />
            </IconButton><span>End call</span></div>
          </div>
        </footer>
      </div>
    </Dialog>
  )
}

export default WebRTCCallModal
