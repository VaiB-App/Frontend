// import React from "react";
// import { transformImage } from "../../lib/features";
// import { FileOpen as FileOpenIcon } from "@mui/icons-material";

// const RenderAttachment = (file, url) => {
//   switch (file) {
//     case "video":
//       return <video src={url} preload="none" width={"200px"} controls />;

//     case "image":
//       return (
//         <img
//           src={transformImage(url, 200)}
//           alt="Attachement"
//           width={"100%"}
//           height={"100%"}
//           style={{
//             objectFit: 'fill',
//           }}
//         />
//       );

//     case "audio":
//       return <audio src={url} preload="none" controls />;

//     default:
//       return <FileOpenIcon />;
//   }
// };

// export default RenderAttachment;



import React from "react";
import { transformImage } from "../../lib/features";
import { FileOpen as FileOpenIcon } from "@mui/icons-material";

const RenderAttachment = (fileType, url) => {
  switch (fileType) {
    case "video":
      return (
        <video
          src={url}
          alt="Attachment"
          preload="none"
          width="100%"
          height="auto"
          controls
          style={{ borderRadius: "8px", maxWidth: "100%" }}
        />
      );

    case "image":
      return (
        <img
          src={transformImage(url, 200)}
          alt="Attachment"
          width="100%"
          height="100%"
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
      );

    case "audio":
      return (
        <audio
          src={url}
          preload="none"
          controls
          style={{ width: "100%" }}
        />
      );

    case "pdf":
      return (
        <iframe
          src={url}
          title="PDF Viewer"
          width="100%"
          height="400px"
          style={{ border: "none", borderRadius: "8px" }}
        />
      );

    default:
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <FileOpenIcon style={{ fontSize: "3rem" }} />
        </a>
      );
  }
};

export default RenderAttachment;
