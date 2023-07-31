import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

const socket = io.connect("http://localhost:3000");

function TextEditor() {
  const { id: documentId } = useParams();
  const [value, setValue] = useState("");
  const quillRef = useRef(null);

  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];

  useEffect(() => {
    socket.emit("join_room", documentId);
    socket.on("receive_message", (data) => {
      if (data.value !== value) {
        setValue(data.value);
      }
    });
  }, [documentId]);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.getEditor().on("text-change", handleTextChange);
    }
    return () => {
      if (quillRef.current) {
        quillRef.current.getEditor().off("text-change", handleTextChange);
      }
    };
  }, []);

  // Debounce mechanism
  const debounce = (func, delay) => {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, arguments), delay);
    };
  };

  const handleTextChange = debounce((delta, oldDelta, source) => {
    if (source === "user") {
      setValue(quillRef.current.getEditor().root.innerHTML);
      socket.emit("send_message", {
        value: quillRef.current.getEditor().root.innerHTML,
        documentId,
      });
    }
  }, 1000); // Adjust the delay as needed (in milliseconds)

  const modules = {
    toolbar: toolbarOptions,
  };

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100vw",
            height: "100vh",
          }}
        >
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={setValue}
            modules={modules}
            style={{ width: "90vw", height: "90vh" }}
            preserveWhitespace={true}
          />
        </div>
      </div>
    </>
  );
}

export default TextEditor;
