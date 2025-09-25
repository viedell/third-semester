function updateAge() {
  const birthdate = document.getElementById("birthdate").value;
  if (!birthdate) return;

  let birthMoment = moment(birthdate, "YYYY-MM-DD");
  const now = moment();

  const years = now.diff(birthMoment, "years");
  birthMoment.add(years, "years");

  const months = now.diff(birthMoment, "months");
  birthMoment.add(months, "months");

  const days = now.diff(birthMoment, "days");
  birthMoment.add(days, "days");

  const hours = now.diff(birthMoment, "hours");
  birthMoment.add(hours, "hours");

  const minutes = now.diff(birthMoment, "minutes");
  birthMoment.add(minutes, "minutes");

  const seconds = now.diff(birthMoment, "seconds");
  birthMoment.add(seconds, "seconds");

  let nextBirthday = moment(birthdate).year(now.year());
  if (nextBirthday.isBefore(now)) {
    nextBirthday.add(1, "year");
  }

  const diffMonths = nextBirthday.diff(now, "months");
  const diffDays = nextBirthday.clone().subtract(diffMonths, "months").diff(now, "days");

  document.getElementById("result").innerHTML =
    `Umur kamu: ${years} tahun, ${months} bulan, ${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik.<br>` +
    `Ulang tahun berikutnya dalam ${diffMonths} bulan ${diffDays} hari lagi.`;
}

setInterval(updateAge, 100);

document.getElementById("birthdate").addEventListener("change", updateAge);
