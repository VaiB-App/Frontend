"use client"

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from "@mui/material"
import { Phone, Video, PhoneOff } from "lucide-react"

const IncomingCallDialog = ({ open, caller, isVideo, onAccept, onReject }) => {
  return (
    <Dialog
      open={open}
      onClose={onReject}
      PaperProps={{
        style: {
          borderRadius: "12px",
          overflow: "hidden",
          maxWidth: "350px",
          width: "100%",
        },
      }}
    >
      <DialogTitle className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4">
        {isVideo ? "Incoming Video Call" : "Incoming Call"}
      </DialogTitle>

      <DialogContent className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <Avatar src={caller.avatar} alt={caller.name} className="h-20 w-20 animate-pulse">
            {caller.name.charAt(0)}
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-green-500 p-1 rounded-full">
            {isVideo ? <Video className="h-5 w-5 text-white" /> : <Phone className="h-5 w-5 text-white" />}
          </div>
        </div>

        <div className="text-center mt-2">
          <h3 className="text-lg font-semibold">{caller.name}</h3>
          <p className="text-gray-500">{isVideo ? "is video calling you..." : "is calling you..."}</p>
        </div>
      </DialogContent>

      <DialogActions className="flex justify-between p-4 bg-gray-50">
        <Button
          onClick={onReject}
          variant="contained"
          color="error"
          startIcon={<PhoneOff className="h-4 w-4" />}
          className="bg-red-500 hover:bg-red-600"
        >
          Decline
        </Button>

        <Button
          onClick={onAccept}
          variant="contained"
          color="success"
          startIcon={isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          className="bg-green-500 hover:bg-green-600"
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default IncomingCallDialog
