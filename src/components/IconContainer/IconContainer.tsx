import React from 'react';

import './IconContainer.css';

interface Props {
  tooltip: string;
}

const IconContainer: React.FC<Props> = ({ tooltip, children }) => {
  return (
    <div className='iconContainer'>
      {children}
      <div className='iconContainer__tooltip'>{tooltip}</div>
    </div>
  );
};

export default IconContainer;
