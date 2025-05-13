import React, { ChangeEvent, RefObject } from 'react';

interface ProfilePhotoInputProps {
  profilePhoto: string;
  userProfilePhoto?: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileSelect: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePhotoInput: React.FC<ProfilePhotoInputProps> = ({
  profilePhoto,
  userProfilePhoto,
  fileInputRef,
  handleFileSelect,
  onFileChange,
}) => {
  return (
    <div className="relative w-56 h-56 mx-auto mb-6">
      <img
        src={profilePhoto || userProfilePhoto || '/images/placeholder.png'}
        alt="Profile Photo Preview"
        className="w-full h-full rounded-full object-contain border border-gray-300"
      />
      <button
        type="button"
        onClick={handleFileSelect}
        className="absolute top-0 right-0 bg-white p-0.5 rounded-full shadow hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536M9 11l3 3 8-8M4 20h4l12-12a2 2 0 10-2-2L6 18v2z"
          />
        </svg>
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoInput;
