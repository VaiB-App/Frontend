// "use client"

// import { useState } from "react"
// import { IconButton, Menu, MenuItem } from "@mui/material"
// import {
//   MoreVert as MoreVertIcon,
//   Block as BlockIcon,
//   Call as CallIcon,
//   Videocam as VideocamIcon,
// } from "@mui/icons-material"
// import { getSocket } from "../socket"
// import { BLOCK_USER } from "../constants/events"

// const UserActions = ({ chatId, members, user, onVoiceCall, onVideoCall }) => {
//   const [anchorEl, setAnchorEl] = useState(null)
//   const socket = getSocket()

//   // Find the other user in the chat (not the current user)
//   const otherUser = members?.find((member) => member._id !== user._id)

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget)
//   }

//   const handleMenuClose = () => {
//     setAnchorEl(null)
//   }

//   const handleBlockUser = () => {
//     if (otherUser) {
//       socket.emit(BLOCK_USER, { userId: otherUser._id })
//       // You might want to show a confirmation toast or message here
//     }
//     handleMenuClose()
//   }

//   const handleVoiceCall = () => {
//     onVoiceCall()
//     handleMenuClose()
//   }

//   const handleVideoCall = () => {
//     onVideoCall()
//     handleMenuClose()
//   }

//   return (
//     <div className="user-actions">
//       <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
//         <MoreVertIcon />
//       </IconButton>

//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         anchorOrigin={{
//           vertical: "bottom",
//           horizontal: "right",
//         }}
//         transformOrigin={{
//           vertical: "top",
//           horizontal: "right",
//         }}
//       >
//         <MenuItem onClick={handleVoiceCall}>
//           <CallIcon fontSize="small" sx={{ mr: 1 }} />
//           Voice Call
//         </MenuItem>
//         <MenuItem onClick={handleVideoCall}>
//           <VideocamIcon fontSize="small" sx={{ mr: 1 }} />
//           Video Call
//         </MenuItem>
//         {otherUser && (
//           <MenuItem onClick={handleBlockUser} sx={{ color: "error.main" }}>
//             <BlockIcon fontSize="small" sx={{ mr: 1 }} />
//             Block User
//           </MenuItem>
//         )}
//       </Menu>
//     </div>
//   )
// }

// export default UserActions


"use client"

import { useState } from "react"
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material"
import { MoreVertical, Phone, Video, UserX, Flag, Trash } from "lucide-react"
import { getSocket } from "../socket" // Import getSocket

const UserActions = ({ chatId, members, user, onVoiceCall, onVideoCall }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleVoiceCall = () => {
    handleClose()
    onVoiceCall()
  }

  const handleVideoCall = () => {
    handleClose()
    onVideoCall()
  }

  const handleBlockUser = () => {
    handleClose()
    // Find the other user in the chat
    const otherUser = members.find((m) => m._id !== user._id)
    if (!otherUser) return

    // Confirm before blocking
    if (window.confirm(`Are you sure you want to block ${otherUser.name}?`)) {
      const socket = getSocket()
      socket.emit("block-user", { userId: otherUser._id })
    }
  }

  const handleReportUser = () => {
    handleClose()
    // Find the other user in the chat
    const otherUser = members.find((m) => m._id !== user._id)
    if (!otherUser) return

    // Simple implementation - could be replaced with a modal
    const reason = prompt(`Why are you reporting ${otherUser.name}?`)
    if (reason) {
      const socket = getSocket()
      socket.emit("report-user", {
        userId: otherUser._id,
        reason,
        chatId,
      })
      alert("User reported. Our team will review your report.")
    }
  }

  const handleDeleteChat = () => {
    handleClose()

    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      const socket = getSocket()
      socket.emit("delete-chat", { chatId })
      // Redirect to chats list
      window.location.href = "/chats"
    }
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{ color: "white" }}
      >
        <MoreVertical className="h-5 w-5" />
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "user-actions-button",
        }}
      >
        <MenuItem onClick={handleVoiceCall}>
          <ListItemIcon>
            <Phone className="h-5 w-5" />
          </ListItemIcon>
          <ListItemText>Voice Call</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleVideoCall}>
          <ListItemIcon>
            <Video className="h-5 w-5" />
          </ListItemIcon>
          <ListItemText>Video Call</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleBlockUser}>
          <ListItemIcon>
            <UserX className="h-5 w-5" />
          </ListItemIcon>
          <ListItemText>Block User</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleReportUser}>
          <ListItemIcon>
            <Flag className="h-5 w-5" />
          </ListItemIcon>
          <ListItemText>Report User</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDeleteChat} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Trash className="h-5 w-5 text-red-500" />
          </ListItemIcon>
          <ListItemText>Delete Chat</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserActions
