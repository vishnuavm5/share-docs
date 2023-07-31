import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

const socket = io.connect("http://localhost:3000");

function TextEditor() {
  const { id: documentId } = useParams();
  const [value, setValue] = useState("");
  const [timeoutId, setTimeoutId] = useState(null);

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

    ["clean"],
  ];

  useEffect(() => {
    socket.emit("join_room", documentId);
    socket.on("load_document", (data) => {
      setValue(data.data);
    });
  }, [documentId]);
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.value !== value) {
        setValue(data.value);
      }
    });
  }, [value, socket]);

  const handleChange = (newValue) => {
    setValue(newValue);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      socket.emit("send_message", { value: newValue, documentId });
    }, 1000); // Adjust the delay as needed (in milliseconds)
    setTimeoutId(newTimeoutId);
  };

  const modules = {
    toolbar: toolbarOptions,
  };

  return (
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
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          style={{ width: "90vw", height: "90vh" }}
          preserveWhitespace={true}
        />
      </div>
    </div>
  );
}

export default TextEditor;
