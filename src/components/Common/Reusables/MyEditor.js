import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import {
  // ContentState,
  EditorState,
  // convertFromHTML,
  convertToRaw,
} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import axiosInstance from "../../../Features/axios";

const MyEditor = ({ field, formData, handleChange, fieldErrors }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // console.log("formData",formData);
  // useEffect(() => {
  //   if (formData) {
  //     const parsedData = formData;
  //     const blocksFromHtml = convertFromHTML(parsedData);
  //     const state = ContentState.createFromBlockArray(
  //       blocksFromHtml.contentBlocks,
  //       blocksFromHtml.entityMap
  //     );
  //     setEditorState(EditorState.createWithContent(state));
  //   }
  // }, [formData]);

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    const rawContentState = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    handleChange(field, rawContentState);
  };

  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }

  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          let imageData = reader.result;
          const blob = dataURLtoBlob(imageData);
          const formData = new FormData();
          formData.append("image", blob, file.name);
          formData.append("module", field.name);
          axiosInstance
            .post("/imgUpload", formData)
            .then((response) => {
              const imageUrl = response?.result?.path;
              console.log("imageUrl", imageUrl);
              resolve({
                data: {
                  link: imageUrl,
                },
              });
            })
            .catch((error) => {
              reject(error);
            });
        }, 2000);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={onEditorStateChange}
          toolbar={{
            image: {
              uploadCallback: uploadImageCallBack,
              alt: { present: true, mandatory: false },
              defaultSize: {
                height: "auto",
                width: "200px",
              },
              previewImage: true,
              inputAccept: "image/*",
            },
          }}
        />
      </div>
    </>
  );
};

export default MyEditor;
