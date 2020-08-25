import React from 'react';
import { SvgIconComponent } from '@material-ui/icons';

import './SideNavItem.css';

interface Props {
  Icon: SvgIconComponent;
  active: boolean;
  onClick?:
    | ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void)
    | undefined;
}

const SideNavItem: React.FC<Props> = ({ Icon, active, onClick }) => {
  return (
    <div
      className={`sideNavItem ${active && 'sideNavItem-active'}`}
      onClick={onClick}
    >
      <Icon fontSize='large' />
    </div>
  );
};

export default SideNavItem;
