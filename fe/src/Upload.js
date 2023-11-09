import React, { useState } from 'react';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    // Step 1: Initiate Multipart Upload
    const initiateResponse = await fetch('http://localhost:4242/initiateMultipartUpload', {
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
      const partPresignedUrlResponse = await fetch(`http://localhost:4242/getPresignedUrl/${partNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: selectedFile.name, uploadId }),
      });


      const partPresignedUrlData = await partPresignedUrlResponse.json();
      console.log(partPresignedUrlResponse);

      const partPresignedUrl = partPresignedUrlData.presignedUrl;


      // Upload part to Presigned URL
      const uploadPartResult = await fetch(partPresignedUrl, {
        method: 'PUT',
        body: filePart,
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
    const completeResponse = await fetch(`http://localhost:4242/completeMultipartUpload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName: selectedFile.name, uploadId, parts }),
    });

    if (completeResponse.ok) {
      const fileUpload = await fetch(`http://localhost:4242/file/${selectedFile.name}`, {
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
    </>
  );
}

export default Upload;
