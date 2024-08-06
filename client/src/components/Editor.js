import React, { useEffect, useRef, useCallback } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  const handleCodeChange = useCallback((code) => {
    onCodeChange(code);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code,
      });
    }
  }, [onCodeChange, roomId, socketRef]);

  useEffect(() => {
    const editor = CodeMirror.fromTextArea(
      document.getElementById("realtimeEditor"),
      {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );
    // for sync the code
    editorRef.current = editor;
    editor.setSize(null, "100%");

    const handleChange = (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      handleCodeChange(code);
      if (origin !== "setValue") {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    };

    editor.on("change", handleChange);

    return () => {
      editor.off("change", handleChange);
      // Create a local variable for socketRef.current
      const localSocketRef = socketRef.current;
      if (localSocketRef) {
        localSocketRef.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [handleCodeChange, socketRef, roomId]);

  useEffect(() => {
    const handleCodeChangeFromServer = ({ code }) => {
      if (code !== null) {
        editorRef.current.setValue(code);
      }
    };

    const localSocketRef = socketRef.current;
    if (localSocketRef) {
      localSocketRef.on(ACTIONS.CODE_CHANGE, handleCodeChangeFromServer);
    }

    return () => {
      if (localSocketRef) {
        localSocketRef.off(ACTIONS.CODE_CHANGE, handleCodeChangeFromServer);
      }
    };
  }, [socketRef]);

  return (
    <div style={{ height: "600px" }}>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;
