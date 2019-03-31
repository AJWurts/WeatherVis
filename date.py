class Date:
    monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    def __init__(self, dateString=None):
        self.dateString = dateString
        if dateString is not None:
            self._parseDateString()
        
        self.year, self.month, self.day, self.hour, self.minute = self._parseDateString()
        self.dayNumber = self._getDayInYear(self.month, self.day, self.year)
        self.dayOfWeek = (self.dayNumber - self._getStartDay(self.year)) % 7
        self.weekNumber = self._getWeekNumber()
        
    def _parseDateString(self):
        ## '2009-01-01 00:56'
        dateSplit = self.dateString.split(' ')
        dateList = dateSplit[0].split('-')
        year = int(dateList[0])
        month = int(dateList[1]) - 1 
        day = int(dateList[2])
        timeList = dateSplit[1].split(':')
        hour = int(timeList[0])
        minute = int(timeList[1])
        return year, month, day, hour, minute
        
    def _getStartDay(self, year):
        baseYear = 2020
        baseDay = 2
        
        diff = year - baseYear
        numLeap = int(diff / 4)
        numNormal = diff - numLeap
        
        baseDay += (numNormal + numLeap * 2)
        if diff > 0:
            baseDay += 1
            
        return baseDay % 7
     
    def _getWeekNumber(self):
        if self.dayNumber == 366:
            return 51
        return int((self.dayNumber - self._getStartDay(self.year)) / 7 )
    
    def _getDayInYear(self, month, day, year):
        dayCount = self.monthDays[:]
        if year % 4 == 0: # Leap Year
            dayCount[1] = 29

        # 0 based month
        return sum(dayCount[:month]) + day

    def __str__(self):
        return str(self.year) + '-' + str(self.month) + '-' + str(self.day) + ' ' + str(self.hour) + ':' + str(self.minute)