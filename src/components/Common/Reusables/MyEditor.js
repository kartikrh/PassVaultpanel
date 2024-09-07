import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';

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

  return (
    <div className="editor-container">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={content}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          readonly: false,
          // Add these lines to use the self-hosted version
          skin_url: '/tinymce/skins/ui/oxide',
          content_css: '/tinymce/skins/content/default/content.css',
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