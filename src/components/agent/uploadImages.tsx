import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface FileDnDProps {
  onChange: any
}

const humanFileSize = (size: number): string => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
};

const loadFile = (file: File): string => {
  const blobUrl = URL.createObjectURL(file);
  return blobUrl;
};

const FileDnD: any = ({ onChange, initialImages = [] }: any) => {
  const [files, setFiles] = useState<File[]>(initialImages);
  useEffect(() => {
    onChange(files)
  }, [files])

  const remove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  return (
    <div className="relative flex flex-col p-4 text-gray-400 border-gray-300 group hover:border-gray-400 duration-200 bg-gray-100 col-span-12 rounded-xl border-2">
      <div
      >
        <input
          accept=".jpg,.jpeg,.png"
          type="file"
          multiple
          className="absolute inset-0 z-50 w-full h-full p-0 m-0 outline-none opacity-0 cursor-pointer"
          onChange={addFiles}
        />
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <svg className="w-6 h-6 mr-1 text-current-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="m-0">Drag your files here or click in this area.</p>
        </div>
      </div>
      {files.length > 0 && <hr className='border-gray-300 mt-4 border group-hover:border-gray-400 duration-200' />}

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-6">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center overflow-hidden text-center bg-gray-100 border rounded select-none"
              style={{ paddingTop: '100%' }}
            >
              <button
                className="absolute top-0 right-0 z-50 p-1 bg-white rounded-bl focus:outline-none"
                type="button"
                onClick={() => remove(index)}
              >
                <svg className="w-4 h-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              {file.type.includes('image/') && (
                <Image
                  width={200}
                  height={200}
                  className="absolute inset-0 z-0 object-cover w-full h-full border-4 border-white preview"
                  src={loadFile(file)}
                  alt={file.name}
                />
              )}

              <div className="absolute bottom-0 left-0 right-0 flex flex-col p-2 text-xs bg-white bg-opacity-50">
                <span className="w-full font-bold text-gray-900 truncate">{file.name}</span>
                <span className="text-xs text-gray-900">{humanFileSize(file.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileDnD;