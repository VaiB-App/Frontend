import { useState, useEffect } from "react"
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Typography, Box } from "@mui/material"
import { Block as BlockIcon, PersonOff as PersonOffIcon } from "@mui/icons-material"
import { getSocket } from "../socket"
import { GET_BLOCKED_USERS, UNBLOCK_USER } from "../constants/events"
import toast from "react-hot-toast"

const BlockedUsersList = ({ open, onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const socket = getSocket()

  useEffect(() => {
    if (open) {
      // Request blocked users when dialog opens
      socket.emit(GET_BLOCKED_USERS)
      setLoading(true)

      // Listen for response
      const handleBlockedUsersResponse = (data) => {
        setBlockedUsers(data.blockedUsers || [])
        setLoading(false)
      }

      socket.on("blocked-users-response", handleBlockedUsersResponse)

      return () => {
        socket.off("blocked-users-response", handleBlockedUsersResponse)
      }
    }
  }, [open, socket])

  const handleUnblock = (userId) => {
    socket.emit(UNBLOCK_USER, { userId })
    toast.success("User unblocked successfully")
    // Remove from local state
    setBlockedUsers(blockedUsers.filter(user => user._id !== userId))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BlockIcon />
        Blocked Users
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Loading blocked users...</Typography>
        ) : blockedUsers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <PersonOffIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="body1">You haven't blocked any users yet.</Typography>
          </Box>
        ) : (
          <List>
            {blockedUsers.map((user) => (
              <ListItem key={user._id} secondaryAction={
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleUnblock(user._id)}
                >
                  Unblock
                </Button>
              }>
                <ListItemAvatar>
                  <Avatar>{user.name?.[0] || "U"}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.name} 
                  secondary={user.email || "No email available"} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BlockedUsersList