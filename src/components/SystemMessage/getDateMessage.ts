import moment from 'moment';

const getDateMessage = (dateObject: Date): string => {
  return moment(dateObject).calendar({
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'MM/DD/YYYY'
  });
};

export default getDateMessage;
