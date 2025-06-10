import React, { useRef, useState, useEffect } from 'react'

const ImageField = ({ field, handleImageChange, src }) => {
    const fileInputRef = useRef(null);

    const [dimensions, setDimensions] = useState({
        width: null,
        height: null,
    });

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
            >
              <div className="upload-iconEventUploader">+</div>
              <p className="UploadImageText">Drop or click to upload Image</p>
            </label>
          </div>
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
          </>
        )}
      </div>
    );
}

export default ImageField