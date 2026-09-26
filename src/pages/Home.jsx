
// import React from 'react';
// import AppLayout from '../components/layout/AppLayout';
// import { Box, Typography } from '@mui/material';

// const Home = () => {
//   return (
//     <Box
//       sx={{
//         height: "100%",
//         width: "100%",
//         backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/og_logo%20(1)-2qrsAG55OmC0ljOdpLZakecPYLDW5f.png')",
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         position: 'relative',
//         '&::before': {
//           content: '""',
//           position: 'absolute',
//           top: 0,
//           right: 0,
//           bottom: 0,
//           left: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           backdropFilter: 'blur(5px)',
//         },
//       }}
//     >
//       <Box
//         sx={{
//           position: 'relative',
//           zIndex: 1,
//           height: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <Typography 
//           variant='h4' 
//           textAlign="center"
//           sx={{
//             color: 'white',
//             fontWeight: 'bold',
//             background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
//             backgroundClip: 'text',
//             textFillColor: 'transparent',
//             padding: '2rem',
//             borderRadius: '16px',
//              backgroundColor: 'rgba(255, 255, 255, 0.1)',
//             //  backdropFilter: 'blur(5px)',
//           }}
//         >
//           Select a Friend to Chat
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default AppLayout()(Home);

import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

const Home = () => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: 6,
        color: '#fffaf0',
        background: `
          radial-gradient(circle at 12% 18%, rgba(137, 92, 255, 0.28), transparent 30%),
          radial-gradient(circle at 86% 78%, rgba(224, 173, 72, 0.15), transparent 28%),
          linear-gradient(135deg, #090d2a 0%, #15113b 48%, #24134b 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          border: '1px solid rgba(239, 201, 112, 0.22)',
          borderRadius: '50%',
          top: { xs: -220, md: -150 },
          right: { xs: -220, md: -100 },
          boxShadow: '0 0 0 34px rgba(239, 201, 112, 0.04), 0 0 0 68px rgba(239, 201, 112, 0.025)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 280,
          height: 280,
          border: '1px solid rgba(166, 126, 255, 0.2)',
          borderRadius: '50%',
          bottom: -150,
          left: -110,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 'min(100%, 760px)',
          border: '1px solid rgba(255, 255, 255, 0.13)',
          borderRadius: 6,
          p: { xs: 3, sm: 6 },
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.13), rgba(255,255,255,0.045))',
          backdropFilter: 'blur(22px)',
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.32)',
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <Box
              sx={{
                position: 'absolute',
                inset: -14,
                borderRadius: '50%',
                border: '1px solid rgba(239, 201, 112, 0.45)',
                transform: 'rotate(-18deg) scaleX(1.35)',
              }}
            />
            <Avatar
              sx={{
                width: 88,
                height: 88,
                fontSize: 36,
                fontWeight: 800,
                color: '#17102f',
                background: 'linear-gradient(135deg, #f8dda0, #c9953c)',
                boxShadow: '0 10px 35px rgba(218, 165, 69, 0.32)',
              }}
            >
              C
            </Avatar>
          </Box>

          <Chip
            label="YOUR PRIVATE SPACE"
            size="small"
            sx={{
              color: '#f5d890',
              fontWeight: 800,
              letterSpacing: '0.16em',
              fontSize: 10,
              border: '1px solid rgba(245, 216, 144, 0.28)',
              backgroundColor: 'rgba(245, 216, 144, 0.08)',
            }}
          />

          <Typography
            component="h1"
            sx={{
              maxWidth: 560,
              fontSize: { xs: '2.2rem', sm: '3.5rem' },
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.045em',
              background: 'linear-gradient(110deg, #fff9e9 20%, #f1c96f 75%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Conversations begin with a familiar face.
          </Typography>

          <Typography
            sx={{
              maxWidth: 470,
              color: 'rgba(255, 250, 240, 0.68)',
              fontSize: { xs: '0.98rem', sm: '1.08rem' },
              lineHeight: 1.7,
            }}
          >
            Choose someone from your circle and make your next message count.
            Your chat history will appear here once you start.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 1,
              px: 4,
              py: 1.5,
              borderRadius: 999,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#17102f',
              background: 'linear-gradient(135deg, #f7d991, #c8943a)',
              boxShadow: '0 12px 28px rgba(201, 148, 58, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffe8aa, #d9a94b)',
                boxShadow: '0 16px 34px rgba(201, 148, 58, 0.35)',
              },
            }}
          >
            Browse friends
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default AppLayout()(Home);