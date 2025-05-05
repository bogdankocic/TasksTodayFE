import React from 'react';
import TagIcon from './TagIcon';

interface Tag {
  id: number;
  title: string;
  color: string;
  border_color: string;
  favicon: string;
  project_id: number;
}

interface TaskNote {
  id: number;
  text: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    tags?: Tag[];
  };
}

interface TaskNotesProps {
  notes: TaskNote[];
}

const TaskNotes: React.FC<TaskNotesProps> = ({ notes }) => {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="p-3 border rounded shadow-sm bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold">
              {note.user.first_name} {note.user.last_name}
            </span>
            {/* Render user tags */}
            {note.user.tags && note.user.tags.length > 0 && (
              <div className="flex space-x-1">
                {note.user.tags.map((tag) => (
                  <TagIcon key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-700">{note.text}</p>
        </div>
      ))}
    </div>
  );
};

export default TaskNotes;
