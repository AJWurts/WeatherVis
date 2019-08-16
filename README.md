# Weather Visualization using METARs

tafDate.setUTCDate(16)
1565970620413
tafDate.setUTCHours(12)
1565959820413
date - tafDate
10746046
diff = new Date(date - tafDate)
Wed Dec 31 1969 21:59:06 GMT-0500 (Eastern Standard Time)
diff.getHours()
21
diff = date - tafDate
10746046
diff / 60 ** 3 // minutes
49.75021296296296
minutes = diff / 60 ** 3
49.75021296296296
seconds = Math.round(minutes)
50