import React from 'react';

interface Tag {
  id: number;
  title: string;
  color: string;
  border_color: string;
  favicon: string;
  project_id: number;
}

interface TagIconProps {
  tag: Tag;
}

const TagIcon: React.FC<TagIconProps> = ({ tag }) => {
  return (
    <div className="relative group inline-block">
      <img
        src={tag.favicon}
        alt={tag.title}
        className="w-6 h-6 rounded border"
        style={{ borderColor: tag.border_color }}
      />
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
          {tag.title}
        </div>
        <div className="w-3 h-2 bg-gray-900 rotate-45 transform origin-top-left mx-auto" />
      </div>
    </div>
  );
};

export default TagIcon;
