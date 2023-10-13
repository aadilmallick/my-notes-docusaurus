# Dates

Let's take a look at how you can use dates in JavaScript.

Check out [date example](/examples/date) for a working example.

## Date getters

Here are the various time units you can get from a date:

```javascript
const date = new Date();
console.log(date); // 2023-10-12T21:54:19.021Z

console.table({
  fullYear: date.getFullYear(), // YYYY format
  month: date.getMonth(), // 0-11, 0: January, 11: December
  date: date.getDate(), // Gets the day number out of the month, like 12 for 12th of october
  day: date.getDay(), // 0-6, 0: Sunday, 6: Saturday
  hours: date.getHours(), // 0-23
  minutes: date.getMinutes(), // 0-59
  seconds: date.getSeconds(), // 0-59
  milliseconds: date.getMilliseconds(), // 0-999
});
```

Here is the list of all the getters you can use on a date:

- `date.getFullYear()`: Gets the year in YYYY format
- `date.getMonth()`: Gets the month number, 0-11, 0: January, 11: December
- `date.getDate()`: Gets the day number out of the month, like 12 for 12th of october
- `date.getDay()`: Gets the day number, 0-6, 0: Sunday, 6: Saturday
- `date.getHours()`: Gets the hours, 0-23
- `date.getMinutes()`: Gets the minutes, 0-59
- `date.getSeconds()`: Gets the seconds, 0-59
- `date.getMilliseconds()`: Gets the milliseconds, 0-999
- `date.getTime()`: Gets the number of milliseconds since January 1, 1970, 00:00:00 UTC

```ts
// this method returns the difference in hours, minutes, and days between two dates
function getDifferenceInDays(date1: Date, date2: Date) {
  const differenceInMilliseconds = date1.getTime() - date2.getTime();
  const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;
  const demicalPart: number = differenceInDays % 1;
  const numHours = demicalPart * 24;
  const numMinutes = (numHours % 1) * 60;

  const displayDays: number = differenceInDays - demicalPart;
  const displayHours = Math.floor(numHours);
  const displayMinutes = Math.floor(numMinutes);
  return {
    days: displayDays,
    hours: displayHours,
    minutes: displayMinutes,
  };
}
```

## Date setters

Similiarly to the getters, you can change the actual time value of a date through setters, of which there is an appropriate associated setter for each getter:

```ts
function twoWeeksFromNow(date: Date) {
  // 1. creates a new date object with the same time as the date passed in
  const futureDate = new Date(date.getTime());
  // 2. sets the "date" property of a date, 14 days from that date
  futureDate.setDate(date.getDate() + 14);
}
```
