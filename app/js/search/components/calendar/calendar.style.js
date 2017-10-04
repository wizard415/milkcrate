import {
  StyleSheet
} from 'react-native';

export default StyleSheet.create({

  //CALENDAR STYLES

  calendarContainer: {
    overflow: 'hidden'
  },
  datesStrip: {
    flexDirection: 'row'
  },
  calendarDates: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  calendarHeader: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },

  //CALENDAR DAY
  dateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: 40,
    height: 40,
    borderRadius: 40 / 2
  },
  dateName: {
    fontSize: 10,
    textAlign: 'center'
  },
  weekendDateName: {
    fontSize: 10,
    color: '#A7A7A7',
    textAlign: 'center'
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  weekendDateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  eventDot: {
    width: 3,
    height: 3,
    borderRadius: 3 / 2,
    backgroundColor: '#f59271'
  }
});
