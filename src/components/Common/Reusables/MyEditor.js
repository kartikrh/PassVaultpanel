import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';
import MyUploadAdapter from './MyUploadAdapter';

const MyEditor = ({ field, formData, handleChange, fieldErrors }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(formData || '');

  useEffect(() => {
    if (formData !== undefined) {
      setContent(formData);
    }
  }, [formData]);

  const handleEditorChange = (newContent, editor) => {
    setContent(newContent);
    handleChange(field, newContent);
  };

  const imageUploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
    const loader = {
      file: Promise.resolve(blobInfo.blob())
    };
    const adapter = new MyUploadAdapter(loader);
    adapter.upload()
      .then(result => {
        resolve(result.default);
      })
      .catch(error => {
        reject(error);
      });
  });

  return (
    <div className="editor-container">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={content}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image media | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          readonly: false,
          skin_url: '/tinymce/skins/ui/oxide',
          content_css: '/tinymce/skins/content/default/content.css',
          images_upload_handler: imageUploadHandler,
          file_picker_types: 'file image media',
          image_title: true,
          automatic_uploads: true,
          file_picker_callback: (cb, value, meta) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');

            input.onchange = function () {
              const file = this.files[0];

              const reader = new FileReader();
              reader.onload = function () {
                const id = 'blobid' + (new Date()).getTime();
                const blobCache = editorRef.current.editorUpload.blobCache;
                const base64 = reader.result.split(',')[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                cb(blobInfo.blobUri(), { title: file.name });
              };
              reader.readAsDataURL(file);
            };

            input.click();
          },
          media_live_embeds: true,
        }}
        onEditorChange={handleEditorChange}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
      />
      {fieldErrors && typeof fieldErrors === 'string' && <div className="error">{fieldErrors}</div>}
    </div>
  );
};

MyEditor.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  formData: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  fieldErrors: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default MyEditor;