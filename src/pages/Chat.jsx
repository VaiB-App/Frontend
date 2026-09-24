
// // "use client"

// // import { Fragment, useCallback, useEffect, useRef, useState } from "react"
// // import AppLayout from "../components/layout/AppLayout"

// // import { IconButton, Skeleton, Stack } from "@mui/material"
// // import { grayColor } from "../constants/color"
// // import { AttachFile as AttachFileIcon, Send as SendIcon } from "@mui/icons-material"
// // import { InputBox } from "../components/styles/StyledComponents"
// // import FileMenu from "../components/dialogs/FileMenu"
// // import MessageComponent from "../components/shared/MessageComponent"
// // import InappropriateMessageDialog from "../components/dialogs/InappropriateMessageDialog"
// // import SpamMessageAlert from "../components/dialogs/SpamMessageAlert"
// // import BlockedMessageAlert from "../components/dialogs/BlockedMessageAlert"
// // import { getSocket } from "../socket"
// // import {
// //   ALERT,
// //   CHAT_JOINED,
// //   CHAT_LEAVED,
// //   NEW_MESSAGE,
// //   START_TYPING,
// //   STOP_TYPING,
// //   INAPPROPRIATE_MESSAGE,
// //   MESSAGE_BLOCKED,
// //   SPAM_DETECTED,
// //   BLOCK_USER,
// //   REPLY_MESSAGE,
// //   USER_BLOCKED,
// //   MESSAGE_FROM_BLOCKED_USER,
// // } from "../constants/events"
// // import UserActions from "../components/UserActions"
// // import BlockedUsersList from "../components/BlockedUsersList"
// // import ZegoCallModal from "../components/ZegoCallModal"
// // import ReplyPreview from "../components/ReplyPreview"
// // import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api"
// // import { useErrors, useSocketEvents } from "../hooks/hook"
// // import { useInfiniteScrollTop } from "6pp"
// // import { useDispatch } from "react-redux"
// // import { setIsFileMenu } from "../redux/reducers/misc"
// // import { removeNewMessagesAlert } from "../redux/reducers/chat"
// // import { TypingLoader } from "../components/layout/Loaders"
// // import { useNavigate } from "react-router-dom"
// // import background from "./Wallpaper.jpeg"
// // import "../components/shared/MessageComponent.css"
// // import { Block as BlockIcon } from "@mui/icons-material"

// // // ZEGOCLOUD configuration - replace with your actual credentials
// // const ZEGO_APP_ID = 1387720586 // Replace with your ZEGO AppID
// // const ZEGO_SERVER_SECRET = "21cbe217d360e26d76587ce864eae6e1" // Replace with your ZEGO ServerSecret

// // const Chat = ({ chatId, user }) => {
// //   const socket = getSocket()
// //   const dispatch = useDispatch()
// //   const navigate = useNavigate()

// //   const containerRef = useRef(null)
// //   const bottomRef = useRef(null)

// //   const [message, setMessage] = useState("")
// //   const [messages, setMessages] = useState([])
// //   const [page, setPage] = useState(1)
// //   const [fileMenuAnchor, setFileMenuAnchor] = useState(null)

// //   // Reply state
// //   const [replyTo, setReplyTo] = useState(null)

// //   const [IamTyping, setIamTyping] = useState(false)
// //   const [userTyping, setUserTyping] = useState(false)
// //   const typingTimeout = useRef(null)
// //   const [initialLoadComplete, setInitialLoadComplete] = useState(false)

// //   // Blocked users state
// //   const [blockedUsers, setBlockedUsers] = useState([])
// //   const [blockedUsersDialogOpen, setBlockedUsersDialogOpen] = useState(false)

// //   // Call related states with ZEGOCLOUD
// //   const [isCallActive, setIsCallActive] = useState(false)
// //   const [isVideoCall, setIsVideoCall] = useState(false)
// //   const [callRoomId, setCallRoomId] = useState("")

// //   // Inappropriate message dialog state
// //   const [inappropriateMessage, setInappropriateMessage] = useState(null)
// //   const [dialogOpen, setDialogOpen] = useState(false)

// //   // Spam message alert state
// //   const [spamMessage, setSpamMessage] = useState(null)
// //   const [spamAlertOpen, setSpamAlertOpen] = useState(false)

// //   // Blocked message alert state
// //   const [blockedMessageAlert, setBlockedMessageAlert] = useState(false)
// //   const [blockedMessage, setBlockedMessage] = useState("")

// //   const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId })

// //   const oldMessagesChunk = useGetMessagesQuery({ chatId, page })

// //   const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
// //     containerRef,
// //     oldMessagesChunk.data?.totalPages,
// //     page,
// //     setPage,
// //     oldMessagesChunk.data?.messages,
// //   )

// //   const errors = [
// //     { isError: chatDetails.isError, error: chatDetails.error },
// //     { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
// //   ]

// //   const members = chatDetails?.data?.chat?.members

// //   // Handle voice call with ZEGOCLOUD
// //   const handleVoiceCall = () => {
// //     if (!members) return

// //     // Generate a unique room ID for the call
// //     const roomId = `call_${chatId}_${Date.now()}`
// //     setCallRoomId(roomId)
// //     setIsVideoCall(false)
// //     setIsCallActive(true)

// //     // Find the recipient (the other user in the chat)
// //     const recipient = members.find((m) => m._id !== user._id)

// //     // Notify the recipient about the call
// //     socket.emit("zego-call-request", {
// //       to: recipient._id,
// //       from: user._id,
// //       fromName: user.name,
// //       roomId,
// //       isVideo: false,
// //       chatId,
// //     })
// //   }

// //   // Handle video call with ZEGOCLOUD
// //   const handleVideoCall = () => {
// //     if (!members) return

// //     // Generate a unique room ID for the call
// //     const roomId = `call_${chatId}_${Date.now()}`
// //     setCallRoomId(roomId)
// //     setIsVideoCall(true)
// //     setIsCallActive(true)

// //     // Find the recipient (the other user in the chat)
// //     const recipient = members.find((m) => m._id !== user._id)

// //     // Notify the recipient about the call
// //     socket.emit("zego-call-request", {
// //       to: recipient._id,
// //       from: user._id,
// //       fromName: user.name,
// //       roomId,
// //       isVideo: true,
// //       chatId,
// //     })
// //   }

// //   // Handle end call
// //   const handleEndCall = () => {
// //     // Notify the other user that the call has ended
// //     if (members && callRoomId) {
// //       const recipient = members.find((m) => m._id == user._id)
// //       if (recipient) {
// //         socket.emit("zego-call-ended", {
// //           to: recipient._id,
// //           roomId: callRoomId, // send BEFORE resetting it
// //         })
// //       }
// //     }
  
// //     // Reset state AFTER notifying
// //     setIsCallActive(false)
// //     setCallRoomId("")
// //   }
  
  
// //   // Open blocked users dialog
// //   const handleOpenBlockedUsers = () => {
// //     setBlockedUsersDialogOpen(true)
// //   }

// //   // Close blocked users dialog
// //   const handleCloseBlockedUsers = () => {
// //     setBlockedUsersDialogOpen(false)
// //   }

// //   const messageOnChange = (e) => {
// //     setMessage(e.target.value)

// //     if (!IamTyping) {
// //       socket.emit(START_TYPING, { members, chatId })
// //       setIamTyping(true)
// //     }

// //     if (typingTimeout.current) clearTimeout(typingTimeout.current)

// //     typingTimeout.current = setTimeout(() => {
// //       socket.emit(STOP_TYPING, { members, chatId })
// //       setIamTyping(false)
// //     }, [2000])
// //   }

// //   const handleFileOpen = (e) => {
// //     dispatch(setIsFileMenu(true))
// //     setFileMenuAnchor(e.currentTarget)
// //   }

// //   // Handle reply to message
// //   const handleReplyToMessage = (messageToReply) => {
// //     setReplyTo(messageToReply)
// //   }

// //   // Cancel reply
// //   const handleCancelReply = () => {
// //     setReplyTo(null)
// //   }

// //   const submitHandler = (e) => {
// //     e.preventDefault()

// //     if (!message.trim()) return

// //     // Check if this is a reply
// //     if (replyTo) {
// //       // Emit reply message event
// //       socket.emit(REPLY_MESSAGE, {
// //         chatId,
// //         members,
// //         message,
// //         replyToId: replyTo._id,
// //         replyToSender: replyTo.sender,
// //         replyToContent: replyTo.content,
// //       })

// //       // Clear reply state
// //       setReplyTo(null)
// //     } else {
// //       // Regular message
// //       socket.emit(NEW_MESSAGE, { chatId, members, message })
// //     }

// //     setMessage("")
// //   }

// //   const handleDialogClose = ({ blocked }) => {
// //     setDialogOpen(false)

// //     if (blocked && inappropriateMessage) {
// //       // Send block user request
// //       socket.emit(BLOCK_USER, { userId: inappropriateMessage.sender._id })
// //     }

// //     setInappropriateMessage(null)
// //   }
  

// //   // Handle spam alert close
// //   const handleSpamAlertClose = ({ blocked }) => {
// //     setSpamAlertOpen(false)

// //     if (blocked && spamMessage) {
// //       // Send block user request
// //       socket.emit(BLOCK_USER, { userId: spamMessage.sender._id })
// //     }

// //     setSpamMessage(null)
// //   }

// //   const handleBlockedAlertClose = () => {
// //     setBlockedMessageAlert(false)
// //   }

// //   // Add ZEGOCLOUD call-related socket event handlers
// //   useEffect(() => {
// //     // Incoming call request
// //     socket.on("zego-call-request", (data) => {
// //       // If already in a call, automatically reject
// //       if (isCallActive) {
// //         socket.emit("zego-call-rejected", {
// //           to: data.from,
// //           roomId: data.roomId,
// //         })
// //         return
// //       }

// //       // Show incoming call UI (you'll need to implement this)
// //       // For now, we'll auto-accept the call
// //       setCallRoomId(data.roomId)
// //       setIsVideoCall(data.isVideo)
// //       setIsCallActive(true)

// //       // Notify caller that call was accepted
// //       socket.emit("zego-call-accepted", {
// //         to: data.from,
// //         roomId: data.roomId,
// //       })
// //     })

// //     // Call accepted
// //     socket.on("zego-call-accepted", (data) => {
// //       // Call was accepted, continue with the call
// //       console.log("Call accepted", data)
// //       // The call UI should already be showing
// //     })

// //     // Call rejected
// //     socket.on("zego-call-rejected", (data) => {
// //       // Call was rejected, close the call UI
// //       setIsCallActive(false)
// //       setCallRoomId("")
// //       // Show rejection notification
// //       alert("Call was rejected")
// //     })

// //     // Call ended
// //     socket.on("zego-call-ended", (data) => {
// //       setIsCallActive(false)
// //       setCallRoomId("")
// //       // Show call ended notification if needed
// //     })

// //     // Add inappropriate message detection listener
// //     socket.on(INAPPROPRIATE_MESSAGE, (data) => {
// //       if (data.chatId !== chatId) return

// //       setInappropriateMessage({
// //         content: data.message.content,
// //         sender: data.message.sender,
// //       })
// //       setDialogOpen(true)
// //     })

// //     // Add blocked message listener
// //     socket.on(MESSAGE_BLOCKED, (data) => {
// //       setBlockedMessage(data.message)
// //       setBlockedMessageAlert(true)
// //     })

// //     // Add message from blocked user listener
// //     socket.on(MESSAGE_FROM_BLOCKED_USER, (data) => {
// //       // Optionally show notification that a blocked user tried to message
// //       console.log("Blocked user tried to send message:", data)
// //     })

// //     // Add user blocked listener
// //     socket.on(USER_BLOCKED, (data) => {
// //       // Update blocked users list
// //       setBlockedUsers((prev) => [...prev, data.blockedUser])

// //       // Show notification that user was blocked
// //       alert(`${data.blockedUser.name} has been blocked`)
// //     })


// //     // Add spam detection listener
// //     socket.on(SPAM_DETECTED, (data) => {
// //       if (data.chatId !== chatId) return

// //       setSpamMessage({
// //         content: data.message.content,
// //         sender: data.message.sender,
// //       })
// //       setSpamAlertOpen(true)
// //     })

// //     // Add blocked message listener
// //     socket.on(MESSAGE_BLOCKED, (data) => {
// //       setBlockedMessage(data.message)
// //       setBlockedMessageAlert(true)
// //     })

// //     // Add message from blocked user listener
// //     socket.on(MESSAGE_FROM_BLOCKED_USER, (data) => {
// //       // Optionally show notification that a blocked user tried to message
// //       console.log("Blocked user tried to send message:", data)
// //     })

// //     // Add user blocked listener
// //     socket.on(USER_BLOCKED, (data) => {
// //       // Update blocked users list
// //       setBlockedUsers((prev) => [...prev, data.blockedUser])

// //       // Show notification that user was blocked
// //       alert(`${data.blockedUser.name} has been blocked`)
// //     })

// //     return () => {
// //       socket.off("zego-call-request")
// //       socket.off("zego-call-accepted")
// //       socket.off("zego-call-rejected")
// //       socket.off("zego-call-ended")
// //       socket.off(INAPPROPRIATE_MESSAGE)
// //       socket.off(SPAM_DETECTED)
// //       socket.off(MESSAGE_BLOCKED)
// //       socket.off(MESSAGE_FROM_BLOCKED_USER)
// //       socket.off(USER_BLOCKED)
// //     }
// //   }, [chatId, socket, isCallActive])

// //   useEffect(() => {
// //     socket.emit(CHAT_JOINED, { userId: user._id, members })
// //     dispatch(removeNewMessagesAlert(chatId))

// //     // Add this: Scroll to the bottom when opening a new chat to show recent messages
// //     setTimeout(() => {
// //       if (bottomRef.current) {
// //         bottomRef.current.scrollIntoView({ behavior: "auto" })
// //       }
// //     }, 100)

// //     return () => {
// //       setMessages([])
// //       setMessage("")
// //       setOldMessages([])
// //       setPage(1)
// //       setReplyTo(null)
// //       socket.emit(CHAT_LEAVED, { userId: user._id, members })
// //     }
// //   }, [chatId])

// //   useEffect(() => {
// //     if (bottomRef.current) {
// //       bottomRef.current.scrollIntoView({ behavior: "smooth" })
// //     }
// //   }, [messages])

// //   useEffect(() => {
// //     if (chatDetails.isError) return navigate("/")
// //   }, [chatDetails.isError])

// //   const newMessagesListener = useCallback(
// //     (data) => {
// //       if (data.chatId !== chatId) return

// //       // Check if message already exists to prevent duplicates
// //       setMessages((prev) => {
// //         const messageExists = prev.some((msg) => msg._id === data.message._id)
// //         if (messageExists) return prev
// //         return [...prev, data.message]
// //       })

// //       // Auto-scroll to bottom when new message arrives
// //       setTimeout(() => {
// //         if (bottomRef.current) {
// //           bottomRef.current.scrollIntoView({ behavior: "smooth" })
// //         }
// //       }, 100)
// //     },
// //     [chatId],
// //   )

// //   // Add auto-refresh functionality to periodically check for new messages
// //   useEffect(() => {
// //     const refreshInterval = setInterval(() => {
// //       // Refresh messages from MongoDB
// //       if (chatId) {
// //         // Fetch latest messages
// //         socket.emit("get-latest-messages", { chatId })
// //       }
// //     }, 100) // Check every 5 seconds

// //     // Set up listener for latest messages response
// //     socket.on("latest-messages-response", (data) => {
// //       if (data.chatId !== chatId) return

// //       // Update messages if there are new ones
// //       if (data.messages && data.messages.length > 0) {
// //         // Merge new messages with existing ones, avoiding duplicates
// //         setMessages((prevMessages) => {
// //           const existingIds = new Set(prevMessages.map((msg) => msg._id))
// //           const newMessages = data.messages.filter((msg) => !existingIds.has(msg._id))

// //           if (newMessages.length > 0) {
// //             return [...prevMessages, ...newMessages]
// //           }
// //           return prevMessages
// //         })
// //       }
// //     })

// //     return () => {
// //       clearInterval(refreshInterval)
// //       socket.off("latest-messages-response")
// //     }
// //   }, [chatId, socket])

// //   // Reply message listener
// //   const replyMessageListener = useCallback(
// //     (data) => {
// //       if (data.chatId !== chatId) return

// //       // Check if message already exists to prevent duplicates
// //       setMessages((prev) => {
// //         const messageExists = prev.some((msg) => msg._id === data.message._id)
// //         if (messageExists) return prev
// //         return [...prev, data.message]
// //       })

// //       // Auto-scroll to bottom when new reply arrives
// //       setTimeout(() => {
// //         if (bottomRef.current) {
// //           bottomRef.current.scrollIntoView({ behavior: "smooth" })
// //         }
// //       }, 100)
// //     },
// //     [chatId],
// //   )

// //   useEffect(() => {
// //     if (oldMessagesChunk.data?.messages && !initialLoadComplete) {
// //       setInitialLoadComplete(true)

// //       // After initial messages are loaded, scroll to bottom to show most recent
// //       setTimeout(() => {
// //         if (bottomRef.current) {
// //           bottomRef.current.scrollIntoView({ behavior: "auto" })
// //         }
// //       }, 100)
// //     }
// //   }, [oldMessagesChunk.data?.messages])

// //   const startTypingListener = useCallback(
// //     (data) => {
// //       if (data.chatId !== chatId) return
// //       setUserTyping(true)
// //     },
// //     [chatId],
// //   )

// //   const stopTypingListener = useCallback(
// //     (data) => {
// //       if (data.chatId !== chatId) return
// //       setUserTyping(false)
// //     },
// //     [chatId],
// //   )

// //   const alertListener = useCallback(
// //     (data) => {
// //       if (data.chatId !== chatId) return
// //       const messageForAlert = {
// //         content: data.message,
// //         sender: {
// //           _id: "djasdhajksdhasdsadasdas",
// //           name: "Admin",
// //         },
// //         chat: chatId,
// //         createdAt: new Date().toISOString(),
// //       }

// //       setMessages((prev) => [...prev, messageForAlert])
// //     },
// //     [chatId],
// //   )

// //   const eventHandler = {
// //     [ALERT]: alertListener,
// //     [NEW_MESSAGE]: newMessagesListener,
// //     [REPLY_MESSAGE]: replyMessageListener,
// //     [START_TYPING]: startTypingListener,
// //     [STOP_TYPING]: stopTypingListener,
// //   }

// //   useSocketEvents(socket, eventHandler)

// //   useErrors(errors)

// //   const allMessages = [...oldMessages, ...messages]

// //   // Process messages to include reply references
// //   const processedMessages = allMessages.map((message) => {
// //     if (message.replyTo) {
// //       // Find the message being replied to
// //       const replyToMessage = allMessages.find((m) => m._id === message.replyTo)
// //       if (replyToMessage) {
// //         return {
// //           ...message,
// //           replyToMessage,
// //         }
// //       }
// //     }
// //     return message
// //   })

// //   return chatDetails.isLoading ? (
// //     <Skeleton />
// //   ) : (
// //     <Fragment>
// //       <Stack
// //         ref={containerRef}
// //         boxSizing={"border-box"}
// //         padding={"1rem"}
// //         spacing={"1rem"}
// //         bgcolor={grayColor}
// //         height={"92.3vh"}
// //         sx={{
// //           backgroundImage: `url(${background})`,
// //           backgroundSize: "cover",
// //           overflowX: "hidden",
// //           overflowY: "auto",
// //           position: "relative",
// //         }}
// //       >
// //         <div
// //           style={{
// //             display: "flex",
// //             justifyContent: "space-between",
// //             alignItems: "center",
// //             position: "sticky",
// //             top: 0,
// //             zIndex: 10,
// //             backgroundColor: "rgba(0,0,0,0.5)",
// //             borderRadius: "10px",
// //             padding: "8px 16px",
// //           }}
// //         >
// //           <div>{/* You can add chat title or other info here */}</div>
// //           <div style={{ display: "flex", gap: "8px" }}>
// //             <IconButton onClick={handleOpenBlockedUsers} sx={{ color: "white" }} title="Blocked Users">
// //               <BlockIcon />
// //             </IconButton>
// //             <UserActions
// //               chatId={chatId}
// //               members={members}
// //               user={user}
// //               onVoiceCall={handleVoiceCall}
// //               onVideoCall={handleVideoCall}
// //             />
// //           </div>
// //         </div>

// //         <Stack
// //           height="90%"
// //           sx={{
// //             overflowX: "hidden",
// //             overflowY: "auto",
// //           }}
// //         >
// //           {processedMessages.map((message) => (
// //             <div key={message._id} className="message-container">
// //               <MessageComponent message={message} user={user} onReply={handleReplyToMessage} />
// //             </div>
// //           ))}

// //           {userTyping && <TypingLoader color="white" />}

// //           <div ref={bottomRef} />
// //         </Stack>

// //         <form
// //           style={{
// //             height: "10%",
// //           }}
// //           onSubmit={submitHandler}
// //         >
// //           <Stack
// //             direction={"column"}
// //             sx={{
// //               backdropFilter: "blur(10px)",
// //               backgroundColor: "rgba(255, 255, 255, 0.3)",
// //               borderRadius: replyTo ? "10px" : "50px",
// //               padding: "0.5rem",
// //             }}
// //           >
// //             {/* Reply preview */}
// //             {replyTo && <ReplyPreview replyMessage={replyTo} onCancelReply={handleCancelReply} />}

// //             <Stack direction={"row"} height={"100%"} padding={"0.5rem"} alignItems={"center"} position={"relative"}>
// //               <IconButton
// //                 sx={{
// //                   position: "absolute",
// //                   left: "1rem",
// //                   rotate: "30deg",
// //                 }}
// //                 onClick={handleFileOpen}
// //               >
// //                 <AttachFileIcon />
// //               </IconButton>

// //               <InputBox
// //                 placeholder={replyTo ? `Reply to ${replyTo.sender.name}...` : "Type Message Here..."}
// //                 value={message}
// //                 onChange={messageOnChange}
// //                 sx={{
// //                   backgroundColor: "rgba(255, 255, 255, 0.5)",
// //                   height: "2.5rem",
// //                 }}
// //               />

// //               <IconButton
// //                 type="submit"
// //                 sx={{
// //                   color: "white",
// //                   marginLeft: "1rem",
// //                   padding: "0.5rem",
// //                 }}
// //               >
// //                 <SendIcon />
// //               </IconButton>
// //             </Stack>
// //           </Stack>
// //         </form>

// //         {/* ZEGOCLOUD Call Modal */}
// //         {isCallActive && (
// //           <ZegoCallModal
// //             open={isCallActive}
// //             onClose={handleEndCall}
// //             isVideo={isVideoCall}
// //             roomID={callRoomId}
// //             userID={user._id}
// //             userName={user.name}
// //             appID={ZEGO_APP_ID}
// //             serverSecret={ZEGO_SERVER_SECRET}
// //           />
// //         )}

// //         {/* Blocked Users List Dialog */}
// //         <BlockedUsersList open={blockedUsersDialogOpen} onClose={handleCloseBlockedUsers} />
// //       </Stack>
// //       <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />

// //       {/* Inappropriate Message Dialog */}
// //       {inappropriateMessage && (
// //         <InappropriateMessageDialog
// //           open={dialogOpen}
// //           onClose={handleDialogClose}
// //           message={inappropriateMessage.content}
// //           sender={inappropriateMessage.sender}
// //         />
// //       )}

// //       {/* Spam Message Alert */}
// //       {spamMessage && (
// //         <SpamMessageAlert
// //           open={spamAlertOpen}
// //           onClose={handleSpamAlertClose}
// //           message={spamMessage.content}
// //           sender={spamMessage.sender}
// //         />
// //       )}

// //       <BlockedMessageAlert open={blockedMessageAlert} message={blockedMessage} onClose={handleBlockedAlertClose} />
// //     </Fragment>
// //   )
// // }

// // export default AppLayout()(Chat)


// "use client"

// import { Fragment, useCallback, useEffect, useRef, useState } from "react"
// import { Stack, Skeleton, IconButton } from "@mui/material"
// import { Send as SendIcon, AttachFile as AttachFileIcon } from "@mui/icons-material"
// import { InputBox } from "@/components/styles/StyledComponents"
// import FileMenu from "@/components/dialogs/FileMenu"
// import MessageComponent from "@/components/shared/MessageComponent"
// import { getSocket } from "@/socket"
// import {
//   ALERT,
//   CHAT_JOINED,
//   CHAT_LEAVED,
//   NEW_MESSAGE,
//   START_TYPING,
//   STOP_TYPING,
//   INAPPROPRIATE_MESSAGE,
//   MESSAGE_BLOCKED,
//   SPAM_DETECTED,
//   BLOCK_USER,
//   REPLY_MESSAGE,
//   USER_BLOCKED,
//   MESSAGE_FROM_BLOCKED_USER,
// } from "@/constants/events"
// import BlockedUsersList from "@/components/BlockedUsersList"
// import { TypingLoader } from "@/components/layout/Loaders"
// import { useRouter, useParams } from "next/navigation"
// import { useDispatch } from "react-redux"
// import { setIsFileMenu } from "@/redux/reducers/misc"
// import { removeNewMessagesAlert } from "@/redux/reducers/chat"
// import { useInfiniteScrollTop } from "6pp"
// import { useChatDetailsQuery, useGetMessagesQuery } from "@/redux/api/api"
// import { useErrors, useSocketEvents } from "@/hooks/hook"
// import AppLayout from "@/components/layout/AppLayout"
// import InappropriateMessageDialog from "@/components/dialogs/InappropriateMessageDialog"
// import SpamMessageAlert from "@/components/dialogs/SpamMessageAlert"
// import BlockedMessageAlert from "@/components/dialogs/BlockedMessageAlert"
// import ReplyPreview from "@/components/ReplyPreview"

// // New imports
// import ChatHeader from "@/components/ChatHeader"
// import ZegoCallModal from "@/components/ZegoCallModal"
// import IncomingCallDialog from "@/components/IncomingCallDialog"

// // ZEGOCLOUD configuration - replace with your actual credentials
// const ZEGO_APP_ID = 1387720586 // Replace with your ZEGO AppID
// const ZEGO_SERVER_SECRET = "21cbe217d360e26d76587ce864eae6e1" // Replace with your ZEGO ServerSecret

// const Chat = () => {
//   const socket = getSocket()
//   const dispatch = useDispatch()
//   const router = useRouter()
//   const params = useParams()
//   const chatId = params.chatId

//   const containerRef = useRef(null)
//   const bottomRef = useRef(null)

//   const [message, setMessage] = useState("")
//   const [messages, setMessages] = useState([])
//   const [page, setPage] = useState(1)
//   const [fileMenuAnchor, setFileMenuAnchor] = useState(null)

//   // Reply state
//   const [replyTo, setReplyTo] = useState(null)

//   const [IamTyping, setIamTyping] = useState(false)
//   const [userTyping, setUserTyping] = useState(false)
//   const typingTimeout = useRef(null)
//   const [initialLoadComplete, setInitialLoadComplete] = useState(false)

//   // Blocked users state
//   const [blockedUsers, setBlockedUsers] = useState([])
//   const [blockedUsersDialogOpen, setBlockedUsersDialogOpen] = useState(false)

//   // Call related states with ZEGOCLOUD
//   const [isCallActive, setIsCallActive] = useState(false)
//   const [isVideoCall, setIsVideoCall] = useState(false)
//   const [callRoomId, setCallRoomId] = useState("")

//   // Incoming call states
//   const [incomingCall, setIncomingCall] = useState(false)
//   const [incomingCallData, setIncomingCallData] = useState(null)

//   // Inappropriate message dialog state
//   const [inappropriateMessage, setInappropriateMessage] = useState(null)
//   const [dialogOpen, setDialogOpen] = useState(false)

//   // Spam message alert state
//   const [spamMessage, setSpamMessage] = useState(null)
//   const [spamAlertOpen, setSpamAlertOpen] = useState(false)

//   // Blocked message alert state
//   const [blockedMessageAlert, setBlockedMessageAlert] = useState(false)
//   const [blockedMessage, setBlockedMessage] = useState("")

//   // Get current user from auth context or redux store
//   const user = { _id: "current_user_id", name: "Current User" } // Replace with actual user data

//   const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId })

//   const oldMessagesChunk = useGetMessagesQuery({ chatId, page })

//   const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
//     containerRef,
//     oldMessagesChunk.data?.totalPages,
//     page,
//     setPage,
//     oldMessagesChunk.data?.messages,
//   )

//   const errors = [
//     { isError: chatDetails.isError, error: chatDetails.error },
//     { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
//   ]

//   const members = chatDetails?.data?.chat?.members || []

//   // Find recipient (the other user in the chat)
//   const recipient = members.find((m) => m._id !== user._id) || { _id: "", name: "User" }

//   // Handle voice call with ZEGOCLOUD
//   const handleVoiceCall = () => {
//     if (!members.length) return

//     // Generate a unique room ID for the call
//     const roomId = `call_${chatId}_${Date.now()}`
//     setCallRoomId(roomId)
//     setIsVideoCall(false)
//     setIsCallActive(true)

//     // Notify the recipient about the call
//     socket.emit("zego-call-request", {
//       to: recipient._id,
//       from: user._id,
//       fromName: user.name,
//       roomId,
//       isVideo: false,
//       chatId,
//     })
//   }

//   // Handle video call with ZEGOCLOUD
//   const handleVideoCall = () => {
//     if (!members.length) return

//     // Generate a unique room ID for the call
//     const roomId = `call_${chatId}_${Date.now()}`
//     setCallRoomId(roomId)
//     setIsVideoCall(true)
//     setIsCallActive(true)

//     // Notify the recipient about the call
//     socket.emit("zego-call-request", {
//       to: recipient._id,
//       from: user._id,
//       fromName: user.name,
//       roomId,
//       isVideo: true,
//       chatId,
//     })
//   }

//   // Handle end call
//   const handleEndCall = () => {
//     // Notify the other user that the call has ended
//     if (members.length && callRoomId) {
//       socket.emit("zego-call-ended", {
//         to: recipient._id,
//         roomId: callRoomId,
//       })
//     }

//     // Reset state
//     setIsCallActive(false)
//     setCallRoomId("")
//   }

//   // Handle accepting incoming call
//   const handleAcceptCall = () => {
//     if (!incomingCallData) return

//     setCallRoomId(incomingCallData.roomId)
//     setIsVideoCall(incomingCallData.isVideo)
//     setIsCallActive(true)

//     // Notify caller that call was accepted
//     socket.emit("zego-call-accepted", {
//       to: incomingCallData.from,
//       roomId: incomingCallData.roomId,
//     })

//     // Reset incoming call state
//     setIncomingCall(false)
//     setIncomingCallData(null)
//   }

//   // Handle rejecting incoming call
//   const handleRejectCall = () => {
//     if (!incomingCallData) return

//     // Notify caller that call was rejected
//     socket.emit("zego-call-rejected", {
//       to: incomingCallData.from,
//       roomId: incomingCallData.roomId,
//     })

//     // Reset incoming call state
//     setIncomingCall(false)
//     setIncomingCallData(null)
//   }

//   // Handle block user
//   const handleBlockUser = () => {
//     if (!recipient._id) return

//     // Send block user request
//     socket.emit(BLOCK_USER, { userId: recipient._id })

//     // Update blocked users list
//     setBlockedUsers((prev) => [...prev, recipient])

//     // Show notification
//     alert(`${recipient.name} has been blocked`)
//   }

//   // Open blocked users dialog
//   const handleOpenBlockedUsers = () => {
//     setBlockedUsersDialogOpen(true)
//   }

//   // Close blocked users dialog
//   const handleCloseBlockedUsers = () => {
//     setBlockedUsersDialogOpen(false)
//   }

//   const messageOnChange = (e) => {
//     setMessage(e.target.value)

//     if (!IamTyping) {
//       socket.emit(START_TYPING, { members, chatId })
//       setIamTyping(true)
//     }

//     if (typingTimeout.current) clearTimeout(typingTimeout.current)

//     typingTimeout.current = setTimeout(() => {
//       socket.emit(STOP_TYPING, { members, chatId })
//       setIamTyping(false)
//     }, [2000])
//   }

//   const handleFileOpen = (e) => {
//     dispatch(setIsFileMenu(true))
//     setFileMenuAnchor(e.currentTarget)
//   }

//   // Handle reply to message
//   const handleReplyToMessage = (messageToReply) => {
//     setReplyTo(messageToReply)
//   }

//   // Cancel reply
//   const handleCancelReply = () => {
//     setReplyTo(null)
//   }

//   const submitHandler = (e) => {
//     e.preventDefault()

//     if (!message.trim()) return

//     // Check if this is a reply
//     if (replyTo) {
//       // Emit reply message event
//       socket.emit(REPLY_MESSAGE, {
//         chatId,
//         members,
//         message,
//         replyToId: replyTo._id,
//         replyToSender: replyTo.sender,
//         replyToContent: replyTo.content,
//       })

//       // Clear reply state
//       setReplyTo(null)
//     } else {
//       // Regular message
//       socket.emit(NEW_MESSAGE, { chatId, members, message })
//     }

//     setMessage("")
//   }

//   const handleDialogClose = ({ blocked }) => {
//     setDialogOpen(false)

//     if (blocked && inappropriateMessage) {
//       // Send block user request
//       socket.emit(BLOCK_USER, { userId: inappropriateMessage.sender._id })
//     }

//     setInappropriateMessage(null)
//   }

//   // Handle spam alert close
//   const handleSpamAlertClose = ({ blocked }) => {
//     setSpamAlertOpen(false)

//     if (blocked && spamMessage) {
//       // Send block user request
//       socket.emit(BLOCK_USER, { userId: spamMessage.sender._id })
//     }

//     setSpamMessage(null)
//   }

//   const handleBlockedAlertClose = () => {
//     setBlockedMessageAlert(false)
//   }

//   // Add ZEGOCLOUD call-related socket event handlers
//   useEffect(() => {
//     // Incoming call request
//     socket.on("zego-call-request", (data) => {
//       // If already in a call, automatically reject
//       if (isCallActive) {
//         socket.emit("zego-call-rejected", {
//           to: data.from,
//           roomId: data.roomId,
//         })
//         return
//       }

//       // Show incoming call dialog
//       setIncomingCallData({
//         from: data.from,
//         fromName: data.fromName,
//         roomId: data.roomId,
//         isVideo: data.isVideo,
//       })
//       setIncomingCall(true)
//     })

//     // Call accepted
//     socket.on("zego-call-accepted", (data) => {
//       // Call was accepted, continue with the call
//       console.log("Call accepted", data)
//       // The call UI should already be showing
//     })

//     // Call rejected
//     socket.on("zego-call-rejected", (data) => {
//       // Call was rejected, close the call UI
//       setIsCallActive(false)
//       setCallRoomId("")
//       // Show rejection notification
//       alert("Call was rejected")
//     })

//     // Call ended
//     socket.on("zego-call-ended", (data) => {
//       setIsCallActive(false)
//       setCallRoomId("")
//       // Show call ended notification if needed
//     })

//     // Add inappropriate message detection listener
//     socket.on(INAPPROPRIATE_MESSAGE, (data) => {
//       if (data.chatId !== chatId) return

//       setInappropriateMessage({
//         content: data.message.content,
//         sender: data.message.sender,
//       })
//       setDialogOpen(true)
//     })

//     // Add spam detection listener
//     socket.on(SPAM_DETECTED, (data) => {
//       if (data.chatId !== chatId) return

//       setSpamMessage({
//         content: data.message.content,
//         sender: data.message.sender,
//       })
//       setSpamAlertOpen(true)
//     })

//     // Add blocked message listener
//     socket.on(MESSAGE_BLOCKED, (data) => {
//       setBlockedMessage(data.message)
//       setBlockedMessageAlert(true)
//     })

//     // Add message from blocked user listener
//     socket.on(MESSAGE_FROM_BLOCKED_USER, (data) => {
//       // Optionally show notification that a blocked user tried to message
//       console.log("Blocked user tried to send message:", data)
//     })

//     // Add user blocked listener
//     socket.on(USER_BLOCKED, (data) => {
//       // Update blocked users list
//       setBlockedUsers((prev) => [...prev, data.blockedUser])

//       // Show notification that user was blocked
//       alert(`${data.blockedUser.name} has been blocked`)
//     })

//     return () => {
//       socket.off("zego-call-request")
//       socket.off("zego-call-accepted")
//       socket.off("zego-call-rejected")
//       socket.off("zego-call-ended")
//       socket.off(INAPPROPRIATE_MESSAGE)
//       socket.off(SPAM_DETECTED)
//       socket.off(MESSAGE_BLOCKED)
//       socket.off(MESSAGE_FROM_BLOCKED_USER)
//       socket.off(USER_BLOCKED)
//     }
//   }, [chatId, socket, isCallActive])

//   useEffect(() => {
//     socket.emit(CHAT_JOINED, { userId: user._id, members })
//     dispatch(removeNewMessagesAlert(chatId))

//     // Add this: Scroll to the bottom when opening a new chat to show recent messages
//     setTimeout(() => {
//       if (bottomRef.current) {
//         bottomRef.current.scrollIntoView({ behavior: "auto" })
//       }
//     }, 100)

//     return () => {
//       setMessages([])
//       setMessage("")
//       setOldMessages([])
//       setPage(1)
//       setReplyTo(null)
//       socket.emit(CHAT_LEAVED, { userId: user._id, members })
//     }
//   }, [chatId])

//   useEffect(() => {
//     if (bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [messages])

//   useEffect(() => {
//     if (chatDetails.isError) return router.push("/")
//   }, [chatDetails.isError])

//   const newMessagesListener = useCallback(
//     (data) => {
//       if (chatId !== data.chatId) return

//       // Check if message already exists to prevent duplicates
//       setMessages((prev) => {
//         const messageExists = prev.some((msg) => msg._id === data.message._id)
//         if (messageExists) return prev
//         return [...prev, data.message]
//       })

//       // Auto-scroll to bottom when new message arrives
//       setTimeout(() => {
//         if (bottomRef.current) {
//           bottomRef.current.scrollIntoView({ behavior: "smooth" })
//         }
//       }, 100)
//     },
//     [chatId],
//   )

//   // Add auto-refresh functionality to periodically check for new messages
//   useEffect(() => {
//     const refreshInterval = setInterval(() => {
//       // Refresh messages from MongoDB
//       if (chatId) {
//         // Fetch latest messages
//         socket.emit("get-latest-messages", { chatId })
//       }
//     }, 5000) // Check every 5 seconds

//     // Set up listener for latest messages response
//     socket.on("latest-messages-response", (data) => {
//       if (data.chatId !== chatId) return

//       // Update messages if there are new ones
//       if (data.messages && data.messages.length > 0) {
//         // Merge new messages with existing ones, avoiding duplicates
//         setMessages((prevMessages) => {
//           const existingIds = new Set(prevMessages.map((msg) => msg._id))
//           const newMessages = data.messages.filter((msg) => !existingIds.has(msg._id))

//           if (newMessages.length > 0) {
//             return [...prevMessages, ...newMessages]
//           }
//           return prevMessages
//         })
//       }
//     })

//     return () => {
//       clearInterval(refreshInterval)
//       socket.off("latest-messages-response")
//     }
//   }, [chatId, socket])

//   // Reply message listener
//   const replyMessageListener = useCallback(
//     (data) => {
//       if (chatId !== data.chatId) return

//       // Check if message already exists to prevent duplicates
//       setMessages((prev) => {
//         const messageExists = prev.some((msg) => msg._id === data.message._id)
//         if (messageExists) return prev
//         return [...prev, data.message]
//       })

//       // Auto-scroll to bottom when new reply arrives
//       setTimeout(() => {
//         if (bottomRef.current) {
//           bottomRef.current.scrollIntoView({ behavior: "smooth" })
//         }
//       }, 100)
//     },
//     [chatId],
//   )

//   useEffect(() => {
//     if (oldMessagesChunk.data?.messages && !initialLoadComplete) {
//       setInitialLoadComplete(true)

//       // After initial messages are loaded, scroll to bottom to show most recent
//       setTimeout(() => {
//         if (bottomRef.current) {
//           bottomRef.current.scrollIntoView({ behavior: "auto" })
//         }
//       }, 100)
//     }
//   }, [oldMessagesChunk.data?.messages])

//   const startTypingListener = useCallback(
//     (data) => {
//       if (data.chatId !== chatId) return
//       setUserTyping(true)
//     },
//     [chatId],
//   )
  
  

//   const stopTypingListener = useCallback(
//     (data) => {
//       if (data.chatId !== chatId) return
//       setUserTyping(false)
//     },
//     [chatId],
//   )

//   const alertListener = useCallback(
//     (data) => {
//       if (data.chatId !== chatId) return
//       const messageForAlert = {
//         content: data.message,
//         sender: {
//           _id: "djasdhajksdhasdsadasdas",
//           name: "Admin",
//         },
//         chat: chatId,
//         createdAt: new Date().toISOString(),
//       }

//       setMessages((prev) => [...prev, messageForAlert])
//     },
//     [chatId],
//   )

//   const eventHandler = {
//     [ALERT]: alertListener,
//     [NEW_MESSAGE]: newMessagesListener,
//     [REPLY_MESSAGE]: replyMessageListener,
//     [START_TYPING]: startTypingListener,
//     [STOP_TYPING]: stopTypingListener,
//   }

//   useSocketEvents(socket, eventHandler)

//   useErrors(errors)

//   const allMessages = [...oldMessages, ...messages]

//   // Process messages to include reply references
//   const processedMessages = allMessages.map((message) => {
//     if (message.replyTo) {
//       // Find the message being replied to
//       const replyToMessage = allMessages.find((m) => m._id === message.replyTo)
//       if (replyToMessage) {
//         return {
//           ...message,
//           replyToMessage,
//         }
//       }
//     }
//     return message
//   })

//   return chatDetails.isLoading ? (
//     <Skeleton />
//   ) : (
//     <Fragment>
//       <Stack
//         ref={containerRef}
//         boxSizing={"border-box"}
//         padding={"1rem"}
//         spacing={"1rem"}
//         height={"92.3vh"}
//         sx={{
//           backgroundImage: `url(/images/chat-background.jpg)`,
//           backgroundSize: "cover",
//           overflowX: "hidden",
//           overflowY: "auto",
//           position: "relative",
//         }}
//       >
//         {/* Chat Header with Call Icons */}
//         <ChatHeader
//           recipient={recipient}
//           onVoiceCall={handleVoiceCall}
//           onVideoCall={handleVideoCall}
//           onBlockUser={handleBlockUser}
//         />

//         <Stack
//           height="90%"
//           sx={{
//             overflowX: "hidden",
//             overflowY: "auto",
//           }}
//         >
//           {processedMessages.map((message) => (
//             <div key={message._id} className="message-container">
//               <MessageComponent message={message} user={user} onReply={handleReplyToMessage} />
//             </div>
//           ))}

//           {userTyping && <TypingLoader color="white" />}

//           <div ref={bottomRef} />
//         </Stack>

//         <form
//           style={{
//             height: "10%",
//           }}
//           onSubmit={submitHandler}
//         >
//           <Stack
//             direction={"column"}
//             sx={{
//               backdropFilter: "blur(10px)",
//               backgroundColor: "rgba(255, 255, 255, 0.3)",
//               borderRadius: replyTo ? "10px" : "50px",
//               padding: "0.5rem",
//             }}
//           >
//             {/* Reply preview */}
//             {replyTo && <ReplyPreview replyMessage={replyTo} onCancelReply={handleCancelReply} />}

//             <Stack direction={"row"} height={"100%"} padding={"0.5rem"} alignItems={"center"} position={"relative"}>
//               <IconButton
//                 sx={{
//                   position: "absolute",
//                   left: "1rem",
//                   rotate: "30deg",
//                 }}
//                 onClick={handleFileOpen}
//               >
//                 <AttachFileIcon />
//               </IconButton>

//               <InputBox
//                 placeholder={replyTo ? `Reply to ${replyTo.sender.name}...` : "Type Message Here..."}
//                 value={message}
//                 onChange={messageOnChange}
//                 sx={{
//                   backgroundColor: "rgba(255, 255, 255, 0.5)",
//                   height: "2.5rem",
//                 }}
//               />

//               <IconButton
//                 type="submit"
//                 sx={{
//                   color: "white",
//                   marginLeft: "1rem",
//                   padding: "0.5rem",
//                 }}
//               >
//                 <SendIcon />
//               </IconButton>
//             </Stack>
//           </Stack>
//         </form>

//         {/* ZEGOCLOUD Call Modal */}
//         {isCallActive && (
//           <ZegoCallModal
//             open={isCallActive}
//             onClose={handleEndCall}
//             isVideo={isVideoCall}
//             roomID={callRoomId}
//             userID={user._id}
//             userName={user.name}
//             appID={ZEGO_APP_ID}
//             serverSecret={ZEGO_SERVER_SECRET}
//           />
//         )}

//         {/* Incoming Call Dialog */}
//         {incomingCall && incomingCallData && (
//           <IncomingCallDialog
//             open={incomingCall}
//             caller={{
//               _id: incomingCallData.from,
//               name: incomingCallData.fromName,
//             }}
//             isVideo={incomingCallData.isVideo}
//             onAccept={handleAcceptCall}
//             onReject={handleRejectCall}
//           />
//         )}

//         {/* Blocked Users List Dialog */}
//         <BlockedUsersList open={blockedUsersDialogOpen} onClose={handleCloseBlockedUsers} />
//       </Stack>
//       <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />

//       {/* Inappropriate Message Dialog */}
//       {inappropriateMessage && (
//         <InappropriateMessageDialog
//           open={dialogOpen}
//           onClose={handleDialogClose}
//           message={inappropriateMessage.content}
//           sender={inappropriateMessage.sender}
//         />
//       )}

//       {/* Spam Message Alert */}
//       {spamMessage && (
//         <SpamMessageAlert
//           open={spamAlertOpen}
//           onClose={handleSpamAlertClose}
//           message={spamMessage.content}
//           sender={spamMessage.sender}
//         />
//       )}

//       <BlockedMessageAlert open={blockedMessageAlert} message={blockedMessage} onClose={handleBlockedAlertClose} />
//     </Fragment>
//   )
// }

// export default AppLayout()(Chat)


"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import AppLayout from "../components/layout/AppLayout"

import { IconButton, Skeleton, Stack } from "@mui/material"
import { grayColor } from "../constants/color"
import { AttachFile as AttachFileIcon, Send as SendIcon } from "@mui/icons-material"
import { InputBox } from "../components/styles/StyledComponents"
import FileMenu from "../components/dialogs/FileMenu"
import MessageComponent from "../components/shared/MessageComponent"
import InappropriateMessageDialog from "../components/dialogs/InappropriateMessageDialog"
import SpamMessageAlert from "../components/dialogs/SpamMessageAlert"
import BlockedMessageAlert from "../components/dialogs/BlockedMessageAlert"
import { getSocket } from "../socket"
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  INAPPROPRIATE_MESSAGE,
  MESSAGE_BLOCKED,
  SPAM_DETECTED,
  BLOCK_USER,
  REPLY_MESSAGE,
  USER_BLOCKED,
  MESSAGE_FROM_BLOCKED_USER,
} from "../constants/events"
import UserActions from "../components/UserActions"
import BlockedUsersList from "../components/BlockedUsersList"
import ZegoCallModal from "../components/ZegoCallModal"
import ReplyPreview from "../components/ReplyPreview"
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api"
import { useErrors, useSocketEvents } from "../hooks/hook"
import { useInfiniteScrollTop } from "6pp"
import { useDispatch } from "react-redux"
import { setIsFileMenu } from "../redux/reducers/misc"
import { removeNewMessagesAlert } from "../redux/reducers/chat"
import { TypingLoader } from "../components/layout/Loaders"
import { useNavigate } from "react-router-dom"
import background from "./Wallpaper.jpeg"
import "../components/shared/MessageComponent.css"
import { Block as BlockIcon } from "@mui/icons-material"
import IncomingCallDialog from "../components/IncomingCallDialog"

// ZEGOCLOUD configuration - replace with your actual credentials
const ZEGO_APP_ID = 1387720586 // Replace with your ZEGO AppID
const ZEGO_SERVER_SECRET = "21cbe217d360e26d76587ce864eae6e1" // Replace with your ZEGO ServerSecret

const Chat = ({ chatId, user }) => {
  const socket = getSocket()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const bottomRef = useRef(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null)

  // Reply state
  const [replyTo, setReplyTo] = useState(null)

  const [IamTyping, setIamTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const typingTimeout = useRef(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedUsersDialogOpen, setBlockedUsersDialogOpen] = useState(false)

  // Call related states with ZEGOCLOUD
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [callRoomId, setCallRoomId] = useState("")

  // Incoming call states
  const [incomingCall, setIncomingCall] = useState(false)
  const [incomingCallData, setIncomingCallData] = useState(null)

  // Inappropriate message dialog state
  const [inappropriateMessage, setInappropriateMessage] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Spam message alert state
  const [spamMessage, setSpamMessage] = useState(null)
  const [spamAlertOpen, setSpamAlertOpen] = useState(false)

  // Blocked message alert state
  const [blockedMessageAlert, setBlockedMessageAlert] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState("")

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId })

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page })

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages,
  )

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ]

  const members = chatDetails?.data?.chat?.members

  // Handle voice call with ZEGOCLOUD
  const handleVoiceCall = () => {
    if (!members) return

    // Generate a unique room ID for the call
    const roomId = `call_${chatId}_${Date.now()}`
    setCallRoomId(roomId)
    setIsVideoCall(false)
    setIsCallActive(true)

    // Find the recipient (the other user in the chat)
    const recipient = members.find((m) => m._id !== user._id)

    // Notify the recipient about the call
    socket.emit("zego-call-request", {
      to: recipient._id,
      from: user._id,
      fromName: user.name,
      roomId,
      isVideo: false,
      chatId,
    })
  }

  // Handle video call with ZEGOCLOUD
  const handleVideoCall = () => {
    if (!members) return

    // Generate a unique room ID for the call
    const roomId = `call_${chatId}_${Date.now()}`
    setCallRoomId(roomId)
    setIsVideoCall(true)
    setIsCallActive(true)

    // Find the recipient (the other user in the chat)
    const recipient = members.find((m) => m._id !== user._id)

    // Notify the recipient about the call
    socket.emit("zego-call-request", {
      to: recipient._id,
      from: user._id,
      fromName: user.name,
      roomId,
      isVideo: true,
      chatId,
    })
  }

  // Handle end call
  const handleEndCall = () => {
    // Notify the other user that the call has ended
    if (members && callRoomId) {
      const recipient = members.find((m) => m._id == user._id)
      if (recipient) {
        socket.emit("zego-call-ended", {
          to: recipient._id,
          roomId: callRoomId, // send BEFORE resetting it
        })
      }
    }

    // Reset state AFTER notifying
    setIsCallActive(false)
    setCallRoomId("")
  }

  // Handle accepting incoming call
  const handleAcceptCall = () => {
    if (!incomingCallData) return

    setCallRoomId(incomingCallData.roomId)
    setIsVideoCall(incomingCallData.isVideo)
    setIsCallActive(true)

    // Notify caller that call was accepted
    socket.emit("zego-call-accepted", {
      to: incomingCallData.from,
      roomId: incomingCallData.roomId,
    })

    // Reset incoming call state
    setIncomingCall(false)
    setIncomingCallData(null)
  }

  // Handle rejecting incoming call
  const handleRejectCall = () => {
    if (!incomingCallData) return

    // Notify caller that call was rejected
    socket.emit("zego-call-rejected", {
      to: incomingCallData.from,
      roomId: incomingCallData.roomId,
    })

    // Reset incoming call state
    setIncomingCall(false)
    setIncomingCallData(null)
  }

  // Handle block user
  const handleBlockUser = () => {
    if (!members) return

    // Find the recipient (the other user in the chat)
    const recipient = members.find((m) => m._id !== user._id)
    if (!recipient) return

    // Send block user request
    socket.emit(BLOCK_USER, { userId: recipient._id })

    // Update blocked users list
    setBlockedUsers((prev) => [...prev, recipient])

    // Show notification
    alert(`${recipient.name} has been blocked`)
  }

  // Open blocked users dialog
  const handleOpenBlockedUsers = () => {
    setBlockedUsersDialogOpen(true)
  }

  // Close blocked users dialog
  const handleCloseBlockedUsers = () => {
    setBlockedUsersDialogOpen(false)
  }

  const messageOnChange = (e) => {
    setMessage(e.target.value)

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId })
      setIamTyping(true)
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId })
      setIamTyping(false)
    }, [2000])
  }

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true))
    setFileMenuAnchor(e.currentTarget)
  }

  // Handle reply to message
  const handleReplyToMessage = (messageToReply) => {
    setReplyTo(messageToReply)
  }

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null)
  }

  const submitHandler = (e) => {
    e.preventDefault()

    if (!message.trim()) return

    // Check if this is a reply
    if (replyTo) {
      // Emit reply message event
      socket.emit(REPLY_MESSAGE, {
        chatId,
        members,
        message,
        replyToId: replyTo._id,
        replyToSender: replyTo.sender,
        replyToContent: replyTo.content,
      })

      // Clear reply state
      setReplyTo(null)
    } else {
      // Regular message
      socket.emit(NEW_MESSAGE, { chatId, members, message })
    }

    setMessage("")
  }

  const handleDialogClose = ({ blocked }) => {
    setDialogOpen(false)

    if (blocked && inappropriateMessage) {
      // Send block user request
      socket.emit(BLOCK_USER, { userId: inappropriateMessage.sender._id })
    }

    setInappropriateMessage(null)
  }

  // Handle spam alert close
  const handleSpamAlertClose = ({ blocked }) => {
    setSpamAlertOpen(false)

    if (blocked && spamMessage) {
      // Send block user request
      socket.emit(BLOCK_USER, { userId: spamMessage.sender._id })
    }

    setSpamMessage(null)
  }

  const handleBlockedAlertClose = () => {
    setBlockedMessageAlert(false)
  }

  // Add ZEGOCLOUD call-related socket event handlers
  useEffect(() => {
    // Incoming call request
    socket.on("zego-call-request", (data) => {
      // If already in a call, automatically reject
      if (isCallActive) {
        socket.emit("zego-call-rejected", {
          to: data.from,
          roomId: data.roomId,
        })
        return
      }

      // Show incoming call dialog
      setIncomingCallData({
        from: data.from,
        fromName: data.fromName,
        roomId: data.roomId,
        isVideo: data.isVideo,
      })
      setIncomingCall(true)
    })

    // Call accepted
    socket.on("zego-call-accepted", (data) => {
      // Call was accepted, continue with the call
      console.log("Call accepted", data)
      // The call UI should already be showing
    })

    // Call rejected
    socket.on("zego-call-rejected", (data) => {
      // Call was rejected, close the call UI
      setIsCallActive(false)
      setCallRoomId("")
      // Show rejection notification
      alert("Call was rejected")
    })

    // Call ended
    socket.on("zego-call-ended", (data) => {
      setIsCallActive(false)
      setCallRoomId("")
      // Show call ended notification if needed
    })

    // Add inappropriate message detection listener
    socket.on(INAPPROPRIATE_MESSAGE, (data) => {
      if (data.chatId !== chatId) return

      setInappropriateMessage({
        content: data.message.content,
        sender: data.message.sender,
      })
      setDialogOpen(true)
    })

    // Add blocked message listener
    socket.on(MESSAGE_BLOCKED, (data) => {
      setBlockedMessage(data.message)
      setBlockedMessageAlert(true)
    })

    // Add message from blocked user listener
    socket.on(MESSAGE_FROM_BLOCKED_USER, (data) => {
      // Optionally show notification that a blocked user tried to message
      console.log("Blocked user tried to send message:", data)
    })

    // Add user blocked listener
    socket.on(USER_BLOCKED, (data) => {
      // Update blocked users list
      setBlockedUsers((prev) => [...prev, data.blockedUser])

      // Show notification that user was blocked
      alert(`${data.blockedUser.name} has been blocked`)
    })

    // Add spam detection listener
    socket.on(SPAM_DETECTED, (data) => {
      if (data.chatId !== chatId) return

      setSpamMessage({
        content: data.message.content,
        sender: data.message.sender,
      })
      setSpamAlertOpen(true)
    })

    // Add blocked message listener
    socket.on(MESSAGE_BLOCKED, (data) => {
      setBlockedMessage(data.message)
      setBlockedMessageAlert(true)
    })

    // Add message from blocked user listener
    socket.on(MESSAGE_FROM_BLOCKED_USER, (data) => {
      // Optionally show notification that a blocked user tried to message
      console.log("Blocked user tried to send message:", data)
    })

    // Add user blocked listener
    socket.on(USER_BLOCKED, (data) => {
      // Update blocked users list
      setBlockedUsers((prev) => [...prev, data.blockedUser])

      // Show notification that user has been blocked
      alert(`${data.blockedUser.name} has been blocked`)
    })

    return () => {
      socket.off("zego-call-request")
      socket.off("zego-call-accepted")
      socket.off("zego-call-rejected")
      socket.off("zego-call-ended")
      socket.off(INAPPROPRIATE_MESSAGE)
      socket.off(SPAM_DETECTED)
      socket.off(MESSAGE_BLOCKED)
      socket.off(MESSAGE_FROM_BLOCKED_USER)
      socket.off(USER_BLOCKED)
    }
  }, [chatId, socket, isCallActive])

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members })
    dispatch(removeNewMessagesAlert(chatId))

    // Add this: Scroll to the bottom when opening a new chat to show recent messages
    setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "auto" })
      }
    }, 100)

    return () => {
      setMessages([])
      setMessage("")
      setOldMessages([])
      setPage(1)
      setReplyTo(null)
      socket.emit(CHAT_LEAVED, { userId: user._id, members })
    }
  }, [chatId])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (chatDetails.isError) return navigate("/")
  }, [chatDetails.isError])

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return

      // Check if message already exists to prevent duplicates
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === data.message._id)
        if (messageExists) return prev
        return [...prev, data.message]
      })

      // Auto-scroll to bottom when new message arrives
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    },
    [chatId],
  )

  // Reply message listener
  const replyMessageListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return

      // Check if message already exists to prevent duplicates
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg._id === data.message._id)
        if (messageExists) return prev
        return [...prev, data.message]
      })

      // Auto-scroll to bottom when new reply arrives
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    },
    [chatId],
  )

  useEffect(() => {
    if (oldMessagesChunk.data?.messages && !initialLoadComplete) {
      setInitialLoadComplete(true)

      // After initial messages are loaded, scroll to bottom to show most recent
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "auto" })
        }
      }, 100)
    }
  }, [oldMessagesChunk.data?.messages])

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return
      setUserTyping(true)
    },
    [chatId],
  )

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return
      setUserTyping(false)
    },
    [chatId],
  )

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "djasdhajksdhasdsadasdas",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, messageForAlert])
    },
    [chatId],
  )

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [REPLY_MESSAGE]: replyMessageListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  }

  useSocketEvents(socket, eventHandler)

  useErrors(errors)

  const allMessages = [...oldMessages, ...messages]

  // Process messages to include reply references
  const processedMessages = allMessages.map((message) => {
    if (message.replyTo) {
      // Find the message being replied to
      const replyToMessage = allMessages.find((m) => m._id === message.replyTo)
      if (replyToMessage) {
        return {
          ...message,
          replyToMessage,
        }
      }
    }
    return message
  })

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"92.3vh"}
        sx={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          overflowX: "hidden",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: "10px",
            padding: "8px 16px",
          }}
        >
          <div>{/* You can add chat title or other info here */}</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <IconButton onClick={handleOpenBlockedUsers} sx={{ color: "white" }} title="Blocked Users">
              <BlockIcon />
            </IconButton>
            <UserActions
              chatId={chatId}
              members={members}
              user={user}
              onVoiceCall={handleVoiceCall}
              onVideoCall={handleVideoCall}
              onBlockUser={handleBlockUser}
            />
          </div>
        </div>

        <Stack
          height="90%"
          sx={{
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          {processedMessages.map((message) => (
            <div key={message._id} className="message-container">
              <MessageComponent message={message} user={user} onReply={handleReplyToMessage} />
            </div>
          ))}

          {userTyping && <TypingLoader color="white" />}

          <div ref={bottomRef} />
        </Stack>

        <form
          style={{
            height: "10%",
          }}
          onSubmit={submitHandler}
        >
          <Stack
            direction={"column"}
            sx={{
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: replyTo ? "10px" : "50px",
              padding: "0.5rem",
            }}
          >
            {/* Reply preview */}
            {replyTo && <ReplyPreview replyMessage={replyTo} onCancelReply={handleCancelReply} />}

            <Stack direction={"row"} height={"100%"} padding={"0.5rem"} alignItems={"center"} position={"relative"}>
              <IconButton
                sx={{
                  position: "absolute",
                  left: "1rem",
                  rotate: "30deg",
                }}
                onClick={handleFileOpen}
              >
                <AttachFileIcon />
              </IconButton>

              <InputBox
                placeholder={replyTo ? `Reply to ${replyTo.sender.name}...` : "Type Message Here..."}
                value={message}
                onChange={messageOnChange}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  height: "2.5rem",
                }}
              />

              <IconButton
                type="submit"
                sx={{
                  color: "white",
                  marginLeft: "1rem",
                  padding: "0.5rem",
                }}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Stack>
        </form>

        {/* ZEGOCLOUD Call Modal */}
        {isCallActive && (
          <ZegoCallModal
            open={isCallActive}
            onClose={handleEndCall}
            isVideo={isVideoCall}
            roomID={callRoomId}
            userID={user._id}
            userName={user.name}
            appID={ZEGO_APP_ID}
            serverSecret={ZEGO_SERVER_SECRET}
          />
        )}

        {/* Incoming Call Dialog */}
        {incomingCall && incomingCallData && (
          <IncomingCallDialog
            open={incomingCall}
            caller={{
              _id: incomingCallData.from,
              name: incomingCallData.fromName,
            }}
            isVideo={incomingCallData.isVideo}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}

        {/* Blocked Users List Dialog */}
        <BlockedUsersList open={blockedUsersDialogOpen} onClose={handleCloseBlockedUsers} />
      </Stack>
      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />

      {/* Inappropriate Message Dialog */}
      {inappropriateMessage && (
        <InappropriateMessageDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          message={inappropriateMessage.content}
          sender={inappropriateMessage.sender}
        />
      )}

      {/* Spam Message Alert */}
      {spamMessage && (
        <SpamMessageAlert
          open={spamAlertOpen}
          onClose={handleSpamAlertClose}
          message={spamMessage.content}
          sender={spamMessage.sender}
        />
      )}

      <BlockedMessageAlert open={blockedMessageAlert} message={blockedMessage} onClose={handleBlockedAlertClose} />
    </Fragment>
  )
}

export default AppLayout()(Chat)
