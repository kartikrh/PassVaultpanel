// import React, { useRef } from 'react'

// const ImageField = ({ field, handleImageChange, src }) => {
//     const fileInputRef = useRef(null);

//     return (
//         <div className="col-12 col-md-6 ImageDropBox" >
//         {!src ? (
//           <div className="image-uploader-Event">
//             <input
//               className="file-input-EventImage-uploader"
//               style={field?.customStyle}
//               type="file"
//               id={"fileInput" + field.name}
//               accept="image/*"
//               ref={fileInputRef}
//                         onChange={(e) => { handleImageChange(field, e) }}
//             />
//                     <label for={"fileInput" + field.name} className="file-label-Event-Uploader">
//               <div className="upload-iconEventUploader">+</div>
//                         <p className="UploadImageText">
//                             Drop or click to upload Image
//                         </p>
//             </label>
//           </div>
//         ) : (
//               <div className="image-uploader-Event">
//                 <input
//                   className="file-input-EventImage-uploader"
//                   style={field?.customStyle}
//                   type="file"
//                   id={"fileInput" + field.name}
//                   accept="image/*"
//                   ref={fileInputRef}
//                         onChange={(e) => { handleImageChange(field, e) }}
//                 />
//                 <img
//                   src={src}
//                   alt={field.name}
//                   className="preview-image"
//                         onClick={() => { fileInputRef.current.click() }}
//                 />
//               </div>
//         )}
//       </div>
//     )
// }

// export default ImageField

import React, { useRef, useState, useEffect } from "react";

const ImageField = ({ field, handleImageChange, src }) => {
  const fileInputRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });

  const maxWidth = field.validateWidth || 500;
  const maxHeight = field.validateHeight || 500;
  const shouldValidate = field.isValidateImage;

  const isValidSize =
    !shouldValidate ||
    (dimensions.width <= maxWidth && dimensions.height <= maxHeight);

  const showWarning =
    shouldValidate &&
    src &&
    dimensions.width !== null &&
    dimensions.height !== null &&
    !isValidSize;

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = src;
    } else {
      setDimensions({ width: null, height: null });
    }
  }, [src]);

  return (
    <div className="col-12 col-md-6 ImageDropBox">
      {!src ? (
        <>
          <div className="image-uploader-Event">
            <input
              className="file-input-EventImage-uploader"
              style={field?.customStyle}
              type="file"
              id={"fileInput" + field.name}
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                handleImageChange(field, e);
              }}
            />
            <label
              for={"fileInput" + field.name}
              className="file-label-Event-Uploader"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "20px",
              }}
            >
              <div
                className="upload-iconEventUploader"
                style={{
                  fontSize: "48px",
                  lineHeight: "1",
                  marginBottom: "10px",
                }}
              >
                +
              </div>
              <p
                className="UploadImageText"
                style={{ margin: "0", textAlign: "center" }}
              >
                Drop or click to upload Image
              </p>
            </label>
          </div>
          {field.isValidateImage && (
            <div className="mt-2">
              <p className="text-muted small mb-0">
                Max Required size: {maxWidth}px × {maxHeight}px
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="d-flex align-items-center">
            {dimensions.height && (
              <div
                className="me-2 text-center"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                Height: {dimensions.height}px
              </div>
            )}
            <div className="image-uploader-Event">
              <input
                className="file-input-EventImage-uploader"
                style={field?.customStyle}
                type="file"
                id={"fileInput" + field.name}
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  handleImageChange(field, e);
                }}
              />
              <img
                src={src}
                alt={field.name}
                className="preview-image"
                onClick={() => {
                  fileInputRef.current.click();
                }}
              />
            </div>
          </div>

          {dimensions.width && (
            <p className="image-dimensions mt-2 text-center">
              Width: {dimensions.width}px
            </p>
          )}
          {/* Validation Warning */}
          {showWarning && (
            <div className="mt-2 text-center">
              <p className="text-danger mb-0 md">
                Note: Image size exceeds the limit. Maximum allowed size:
                {`${maxWidth}px × ${maxHeight}px`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageField;
