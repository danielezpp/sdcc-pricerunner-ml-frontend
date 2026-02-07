import React, { useState, useRef } from "react";
import { IconUpload, IconFile, IconX } from "./icons"; 

export default function FileDropZone({ file, setFile, accept = ".csv, .txt", label = "Carica file" }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={`drop-zone ${isDragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current.click()}
    >
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        hidden
      />

      {file ? (
        <div className="file-info-container">
          <div className="file-icon-box">
            <IconFile />
          </div>
          <div className="file-details">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatSize(file.size)}</span>
          </div>
          <button type="button" className="btn-remove-file" onClick={clearFile} title="Rimuovi file">
            <IconX />
          </button>
        </div>
      ) : (
        <div className="drop-placeholder">
          <div className="upload-icon-circle">
            <IconUpload />
          </div>
          <div className="drop-text-main">{label}</div>
          <div className="drop-text-sub">Trascina qui o clicca per caricare ({accept})</div>
        </div>
      )}
    </div>
  );
}