import express from "express"
import { User } from "../models/user.js"
import { sendEmail } from "../utils/email.js"
import crypto from "crypto"

const router = express.Router()

// Existing routes...

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      })
    }

    // Generate OTP (6 digit number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10)

    // Hash the OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex")

    // Save OTP to user document
    user.resetPasswordOtp = hashedOtp
    user.resetPasswordOtpExpiry = otpExpiry
    await user.save()

    // Send email with OTP
    const emailSubject = "Password Reset OTP"
    const emailBody = `
      <h1>Password Reset Request</h1>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `

    await sendEmail(email, emailSubject, emailBody)

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      })
    }

    // Find user by email
    const user = await User.findOne({
      email,
      resetPasswordOtpExpiry: { $gt: new Date() }, // Check if OTP hasn't expired
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      })
    }

    // Hash the received OTP to compare with stored hash
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex")

    // Verify OTP
    if (user.resetPasswordOtp !== hashedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    // Update password
    user.password = newPassword

    // Clear reset fields
    user.resetPasswordOtp = undefined
    user.resetPasswordOtpExpiry = undefined

    await user.save()

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

export default router
