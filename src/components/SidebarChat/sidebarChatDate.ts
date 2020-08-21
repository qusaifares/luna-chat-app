import moment from 'moment';

const sidebarChatDate = (dateObject: Date): string => {
  return moment(dateObject).calendar({
    sameDay: 'h:mm A',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'MM/DD/YYYY'
  });
};

export default sidebarChatDate;
