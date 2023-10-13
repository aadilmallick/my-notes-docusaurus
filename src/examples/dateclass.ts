class DateClass {
  public static explainToday() {
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
  }

  public static twoWeeksFromNow(date: Date) {
    const futureDate = new Date(date.getTime());
    // sets the "date" property of a date
    futureDate.setDate(date.getDate() + 14);
  }

  public static getDifferenceInDays(date1: Date, date2: Date) {
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

  public chain1() {
    console.log("chain1");
    return this;
  }

  public chain2() {
    console.log("chain2");
    return this;
  }

  public chain3() {
    console.log("chain3");
    return this;
  }
}

console.table(
  DateClass.getDifferenceInDays(new Date(Date.now()), new Date("2023-10-09"))
);
DateClass.explainToday();

const date = new DateClass();
date.chain1().chain2().chain3();
