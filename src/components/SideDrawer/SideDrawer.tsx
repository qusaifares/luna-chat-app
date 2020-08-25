import React, { useState, useEffect } from 'react';

import './SideDrawer.css';

const styles: React.CSSProperties = {};

interface Props {
  open?: any;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const SideDrawer: React.FC<Props> = ({
  open,
  onClose,
  className,
  children
}) => {
  return (
    <div
      className={`sideDrawer ${open ? 'sideDrawer-open' : ''} ${
        className || ''
      }`}
    >
      {children}
    </div>
  );
};

export default SideDrawer;
