import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "ckeditor5-build-classic-mathtype";
import ReactHtmlParser from "react-html-parser";

export default function App() {
  const [ckData, setCkData] = useState("");
  return (
    <React.Fragment>
      <CKEditor
        editor={ClassicEditor}
        config={{
          toolbar: {
            shouldNotGroupWhenFull: true,
            items: [
              // 'heading', '|',
              // 'fontfamily', 'fontsize', '|',
              // 'alignment', '|',
              // 'fontColor', 'fontBackgroundColor', '|',
              // 'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
              // 'link', '|',
              // 'outdent', 'indent', '|',
              // 'bulletedList', 'numberedList', 'todoList', '|',
              // 'code', 'codeBlock', '|',
              // 'insertTable', '|',
              // 'uploadImage', 'blockQuote', '|',
              "heading",
              "fontsize",
              "alignment",
              "fontColor",
              "fontBackgroundColor",
              "outdent",
              "indent",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "imageUpload",
              "mediaEmbed",
              "insertTable",
              "blockQuote",
              "undo",
              "redo",
              "|",
              "MathType",
              "ChemType"
            ]
          }
        }}
        data={ckData}
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
          // console.log( 'Editor is ready to use!', editor );
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          // console.log({ event, editor, data });
          setCkData(data);
        }}
      />
      <div>{ReactHtmlParser(ckData)}</div>
      <div>{ckData}</div>
    </React.Fragment>
  );
}
