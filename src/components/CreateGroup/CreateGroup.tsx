import React from 'react';
import { createPortal } from 'react-dom';

import './CreateGroup.css';

interface Props {}

const CreateGroup = (props: Props) => {
  const portalDiv = document.getElementById('portal');
  return portalDiv
    ? createPortal(
        <>
          <div className='createGroup__backdrop'></div>
          <div className='createGroup__modal'></div>
        </>,
        portalDiv
      )
    : null;
};

export default CreateGroup;
