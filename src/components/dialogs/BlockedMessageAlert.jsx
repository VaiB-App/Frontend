


"use client"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material"
import { CheckCircle } from "@mui/icons-material"

const BlockedMessageAlert = ({ open, message, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: "#4caf50", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircle />
        Action Completed
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1">{message || "User has been blocked successfully."}</Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            You will no longer receive messages from this user.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BlockedMessageAlert

