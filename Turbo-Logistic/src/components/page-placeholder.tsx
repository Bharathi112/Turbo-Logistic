// components/page-placeholder.tsx
import React from 'react';

interface PagePlaceholderProps {
  pageName: string;
  content?: React.ReactNode;
}

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({ pageName, content }) => {
  return (
    <div>
      <h1>{pageName}</h1>
      {content && (
        <div className="content">
          {content}
        </div>
      )}
    </div>
  );
};

export default PagePlaceholder;
