import React, { useRef } from 'react'

const ImageField = ({ field, handleImageChange, src }) => {
    const fileInputRef = useRef(null);


    return (
        <div className="col-12 col-md-6 ImageDropBox" >
            {!src ? (
                <div className="image-uploader-Event">
                    <input
                        className="file-input-EventImage-uploader"
                        style={field?.customStyle}
                        type="file"
                        id={"fileInput" + field.name}
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => { handleImageChange(field, e) }}
                    />
                    <label for={"fileInput" + field.name} className="file-label-Event-Uploader">
                        <div className="upload-iconEventUploader">+</div>
                        <p className="UploadImageText">
                            Drop or click to upload Image
                        </p>
                    </label>
                </div>
            ) : (
                <div className="image-uploader-Event">
                    <input
                        className="file-input-EventImage-uploader"
                        style={field?.customStyle}
                        type="file"
                        id={"fileInput" + field.name}
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => { handleImageChange(field, e) }}
                    />
                    <img
                        src={src}
                        alt={field.name}
                        className="preview-image"
                        onClick={() => { fileInputRef.current.click() }}
                    />
                </div>
            )}
        </div>
    )
}

export default ImageField