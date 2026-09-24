"use client"

import { useState } from "react"
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from "@mui/material"
import { Phone, Video, BlocksIcon as Block, DoorClosedIcon as Close } from "lucide-react"

const ChatHeader = ({ recipient, onVoiceCall, onVideoCall, onBlockUser }) => {
  const [callConfirmOpen, setCallConfirmOpen] = useState(false)
  const [callType, setCallType] = useState(null) // "voice" or "video"

  const handleVoiceCallClick = () => {
    setCallType("voice")
    setCallConfirmOpen(true)
  }

  const handleVideoCallClick = () => {
    setCallType("video")
    setCallConfirmOpen(true)
  }

  const handleConfirmCall = () => {
    if (callType === "voice") {
      onVoiceCall()
    } else if (callType === "video") {
      onVideoCall()
    }
    setCallConfirmOpen(false)
  }

  const handleCancelCall = () => {
    setCallConfirmOpen(false)
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between w-full p-3 backdrop-blur-md bg-black/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Avatar src={recipient.avatar} alt={recipient.name}>
          {recipient.name.charAt(0)}
        </Avatar>
        <span className="text-white font-medium">{recipient.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <Tooltip title="Voice Call">
          <IconButton onClick={handleVoiceCallClick} className="text-white hover:bg-white/10">
            <Phone className="h-5 w-5" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Video Call">
          <IconButton onClick={handleVideoCallClick} className="text-white hover:bg-white/10">
            <Video className="h-5 w-5" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Block User">
          <IconButton onClick={onBlockUser} className="text-white hover:bg-white/10">
            <Block className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Call Confirmation Dialog */}
      <Dialog open={callConfirmOpen} onClose={handleCancelCall}>
        <DialogTitle className="text-center">
          {callType === "voice" ? "Start Voice Call" : "Start Video Call"}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar src={recipient.avatar} alt={recipient.name} className="h-16 w-16">
              {recipient.name.charAt(0)}
            </Avatar>
            <p>
              Do you want to {callType === "voice" ? "call" : "video call"} <strong>{recipient.name}</strong>?
            </p>
          </div>
        </DialogContent>
        <DialogActions className="flex justify-between px-4 pb-4">
          <Button onClick={handleCancelCall} variant="outlined" startIcon={<Close className="h-4 w-4" />}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCall}
            variant="contained"
            color="primary"
            startIcon={callType === "voice" ? <Phone className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          >
            {callType === "voice" ? "Call" : "Video Call"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ChatHeader
