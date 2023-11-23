/* eslint-disable no-loop-func */
import React, { useState } from 'react';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    // Step 1: Initiate Multipart Upload
    const initiateResponse = await fetch('http://localhost:4242/upload/init-multiple-part', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName: selectedFile.name }),
    });

    const initiateData = await initiateResponse.json();
    const uploadId = initiateData.uploadId;

    // Step 2: Upload each part
    const chunkSize = 10 * 1024 * 1024; // 1MB chunks (adjust as needed)
    const totalParts = Math.ceil(selectedFile.size / chunkSize);
    const parts = [];

    for (let i = 0; i < totalParts; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, selectedFile.size);

      const filePart = selectedFile.slice(start, end);
      const partNumber = i + 1;

      // Get Presigned URL for each part
      const partPresignedUrlResponse = await fetch(`http://localhost:4242/upload/get-presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: selectedFile.name, uploadId, partNumber, type: 'uploadPart' }),
      });


      const partPresignedUrlData = await partPresignedUrlResponse.json();
      console.log(partPresignedUrlResponse);

      const partPresignedUrl = partPresignedUrlData.presignedUrl;

      const uploadPartResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('PUT', partPresignedUrl, true);

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const totalUpload = i * chunkSize + event.loaded;
            const cumulativeProgress = (totalUpload / selectedFile.size) * 100;
            console.log(cumulativeProgress);
            setUploadProgress(cumulativeProgress);
          }

        });

        xhr.onload = () => {
          const headers = new Headers();
          xhr.getAllResponseHeaders().split('\r\n').forEach((header) => {
            const [name, value] = header.split(': ');
            if (name && value) {
              headers.append(name, value);
            }
          });

          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            headers,
          });
        };

        xhr.onerror = () => {
          reject(new Error('Network request failed'));
        };

        xhr.send(filePart);
      });

      if (!uploadPartResult.ok) {
        alert(`Failed to upload part ${partNumber}`);
        return;
      }

      const partETag = uploadPartResult.headers.get('ETag');
      parts.push({ ETag: partETag, PartNumber: partNumber });

    }

    console.log('File uploaded successfully');

    // Step 3: Complete Multipart Upload
    const completeResponse = await fetch(`http://localhost:4242/upload/complete-multiple-part`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName: selectedFile.name, uploadId, parts }),
    });

    if (completeResponse.ok) {
      const fileUpload = await fetch(`http://localhost:4242/upload/${selectedFile.name}?response-content-disposition=inline`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const urlUploaded = await fileUpload.json();
      setFileUrl(urlUploaded.fileUrl)
    } else {
      alert('Failed to complete Multipart Upload');
    }
  };

  return (
    <>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {fileUrl && <a href={fileUrl} target='_blank' rel="noreferrer"> url </a>}
      {uploadProgress > -1 && <div>Upload Progress: {uploadProgress.toFixed(2)}%</div>}

      {fileUrl && (
        <div>
          <video width="1020" height="820" controls>
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

    </>
  );
}

export default Upload;
