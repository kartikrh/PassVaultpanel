import React, { useRef } from 'react';

const VideoField = ({ field, handleVideoChange, src }) => {
    const fileInputRef = useRef(null);

    return (
        <div className="col-12 col-md-6 VideoDropBox">
            {!src ? (
                <div className="video-uploader">
                    <input
                        className="file-input-video-uploader"
                        style={field?.customStyle}
                        type="file"
                        id={"fileInput" + field.name}
                        accept="video/*"
                        ref={fileInputRef}
                        onChange={(e) => handleVideoChange(field, e)}
                    />
                    <label htmlFor={"fileInput" + field.name} className="file-label-video-uploader">
                        <div className="upload-icon-video-uploader">+</div>
                        <p className="UploadVideoText">
                            Drop or click to upload Video
                        </p>
                    </label>
                </div>
            ) : (
                <div className="video-uploader">
                    <input
                        className="file-input-video-uploader"
                        style={field?.customStyle}
                        type="file"
                        id={"fileInput" + field.name}
                        accept="video/*"
                        ref={fileInputRef}
                        onChange={(e) => handleVideoChange(field, e)}
                    />
                    <video
                        src={src}
                        controls
                        className="preview-video"
                        onClick={() => fileInputRef.current.click()}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}
        </div>
    );
};

export default VideoField;
