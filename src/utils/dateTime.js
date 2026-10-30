/**
 * dateTime.js
 * -------------------------------------------------------
 * Date & time utilities for a Saudi dental clinic bot.
 *
 * Supports:
 * - English
 * - Arabic
 * - Saudi/Gulf Arabic expressions
 * - Saudi timezone (Asia/Riyadh)
 * - Natural date expressions
 * - 12/24-hour time formats
 * - Clinic opening-hour validation
 *
 * This module only parses and validates dates/times.
 * User-facing Arabic responses should remain in responses.js.
 * -------------------------------------------------------
 */

const clinic = require("../data/clinic");

const TIME_ZONE = "Asia/Riyadh";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const ARABIC_DAYS = {
  "الاحد": 0,
  "الأحد": 0,

  "الاثنين": 1,
  "الإثنين": 1,

  "الثلاثاء": 2,

  "الاربعاء": 3,
  "الأربعاء": 3,

  "الخميس": 4,

  "الجمعة": 5,

  "السبت": 6,
};

const ARABIC_MONTHS = {
  يناير: 0,
  فبراير: 1,
  مارس: 2,
  ابريل: 3,
  أبريل: 3,
  مايو: 4,
  يونيو: 5,
  يوليو: 6,
  اغسطس: 7,
  أغسطس: 7,
  سبتمبر: 8,
  اكتوبر: 9,
  أكتوبر: 9,
  نوفمبر: 10,
  ديسمبر: 11,
};

const ENGLISH_MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/**
 * -------------------------------------------------------
 * TEXT NORMALIZATION
 * -------------------------------------------------------
 */
function cleanText(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics and tatweel
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    // Normalize Arabic punctuation
    .replace(/[؟،؛]/g, " ")
    // Normalize common punctuation
    .replace(/[!?.,;:()[\]{}'"`]/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ");
}

/**
 * -------------------------------------------------------
 * SAUDI CURRENT DATE
 * -------------------------------------------------------
 *
 * Returns the current date/time components in Riyadh.
 */
function getSaudiNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekday: values.weekday.toLowerCase(),
  };
}

/**
 * Create a local date object representing a Saudi date.
 *
 * Note:
 * JavaScript Date does not store a timezone. This helper is
 * used for date arithmetic and clinic-day calculations.
 */
function createDate(year, month, day) {
  return new Date(year, month, day);
}

/**
 * -------------------------------------------------------
 * DATE FORMATTING
 * -------------------------------------------------------
 */
function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * English date label when needed internally.
 */
function formatDateEnglish(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * -------------------------------------------------------
 * DATE VALIDATION
 * -------------------------------------------------------
 */
function isValidDate(year, month, day) {
  const date = createDate(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

/**
 * -------------------------------------------------------
 * GET NEXT DAY
 * -------------------------------------------------------
 */
function getNextDay(dayName) {
  const normalized = cleanText(dayName);

  let target = DAY_NAMES.indexOf(normalized);

  // Arabic day
  if (target === -1 && Object.prototype.hasOwnProperty.call(ARABIC_DAYS, normalized)) {
    target = ARABIC_DAYS[normalized];
  }

  if (target === -1) {
    return null;
  }

  const today = getSaudiNow();

  const current = DAY_NAMES.indexOf(today.weekday);

  let difference = target - current;

  // "next Monday" should never return today.
  if (difference <= 0) {
    difference += 7;
  }

  return createDate(
    today.year,
    today.month - 1,
    today.day + difference
  );
}

/**
 * -------------------------------------------------------
 * PARSE DATE
 * -------------------------------------------------------
 */
function parseDate(text) {
  const value = cleanText(text);

  if (!value) {
    return null;
  }

  const today = getSaudiNow();

  const todayDate = createDate(
    today.year,
    today.month - 1,
    today.day
  );

  /**
   * TODAY
   */
  if (
    /\btoday\b/.test(value) ||
    /\bاليوم\b/.test(value)
  ) {
    return {
      date: todayDate,
      label: formatDate(todayDate),
    };
  }

  /**
   * TOMORROW
   *
   * Arabic:
   * - بكرة
   * - بكره
   * - غدا
   * - غداً
   */
  if (
    /\btomorrow\b/.test(value) ||
    /\bبكره\b/.test(value) ||
    /\bبكرة\b/.test(value) ||
    /\bغدا\b/.test(value)
  ) {
    const date = createDate(
      today.year,
      today.month - 1,
      today.day + 1
    );

    return {
      date,
      label: formatDate(date),
    };
  }

  /**
   * DAY AFTER TOMORROW
   */
  if (
    /\bday after tomorrow\b/.test(value) ||
    /\bبعد بكره\b/.test(value) ||
    /\bبعد بكرة\b/.test(value) ||
    /\bبعد غد\b/.test(value) ||
    /\bبعد غدا\b/.test(value)
  ) {
    const date = createDate(
      today.year,
      today.month - 1,
      today.day + 2
    );

    return {
      date,
      label: formatDate(date),
    };
  }

  /**
   * NEXT WEEK
   */
  if (
    /\bnext week\b/.test(value) ||
    /\bالاسبوع الجاي\b/.test(value) ||
    /\bالأسبوع الجاي\b/.test(value) ||
    /\bالاسبوع القادم\b/.test(value) ||
    /\bالأسبوع القادم\b/.test(value)
  ) {
    const date = createDate(
      today.year,
      today.month - 1,
      today.day + 7
    );

    return {
      date,
      label: formatDate(date),
    };
  }

  /**
   * DAY NAMES
   *
   * Example:
   * "Monday"
   * "next Monday"
   * "يوم الاثنين"
   * "الخميس الجاي"
   */
  for (const day of DAY_NAMES) {
    const arabicDay = Object.keys(ARABIC_DAYS).find(
      (key) => ARABIC_DAYS[key] === DAY_NAMES.indexOf(day)
    );

    const dayPattern = new RegExp(`\\b${day}\\b`);

    if (
      dayPattern.test(value) ||
      (arabicDay && value.includes(arabicDay))
    ) {
      const date = getNextDay(day);

      if (date) {
        return {
          date,
          label: formatDate(date),
        };
      }
    }
  }

  /**
   * -----------------------------------------------------
   * ENGLISH MONTH + DAY
   *
   * Examples:
   * January 15
   * January 15th
   * March 5
   * -----------------------------------------------------
   */
  const englishMonthPattern =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/;

  const englishMonthMatch = value.match(englishMonthPattern);

  if (englishMonthMatch) {
    const month = ENGLISH_MONTHS[englishMonthMatch[1]];
    const day = Number(englishMonthMatch[2]);

    let year = today.year;

    if (!isValidDate(year, month, day)) {
      return null;
    }

    let date = createDate(year, month, day);

    if (date < todayDate) {
      year += 1;

      if (!isValidDate(year, month, day)) {
        return null;
      }

      date = createDate(year, month, day);
    }

    return {
      date,
      label: formatDate(date),
    };
  }

  /**
   * -----------------------------------------------------
   * ARABIC MONTH + DAY
   *
   * Examples:
   * 15 يناير
   * 5 مارس
   * 20 رمضان
   *
   * Ramadan is intentionally NOT handled because Hijri
   * conversion requires a proper calendar implementation.
   * -----------------------------------------------------
   */
  const arabicMonthPattern =
    /(?:يوم\s+)?(\d{1,2})\s+(يناير|فبراير|مارس|ابريل|أبريل|مايو|يونيو|يوليو|اغسطس|أغسطس|سبتمبر|اكتوبر|أكتوبر|نوفمبر|ديسمبر)\b/;

  const arabicMonthMatch = value.match(arabicMonthPattern);

  if (arabicMonthMatch) {
    const day = Number(arabicMonthMatch[1]);
    const month = ARABIC_MONTHS[arabicMonthMatch[2]];

    let year = today.year;

    if (!isValidDate(year, month, day)) {
      return null;
    }

    let date = createDate(year, month, day);

    if (date < todayDate) {
      year += 1;

      if (!isValidDate(year, month, day)) {
        return null;
      }

      date = createDate(year, month, day);
    }

    return {
      date,
      label: formatDate(date),
    };
  }

  /**
   * -----------------------------------------------------
   * NUMERIC DATE
   *
   * Supports:
   * 12/25
   * 12-25
   * 12/25/2026
   * 12-25-2026
   *
   * Format is assumed to be MM/DD because this bot is
   * designed around explicit appointment dates.
   * -----------------------------------------------------
   */
  const numericPattern =
    /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/;

  const numericMatch = value.match(numericPattern);

  if (numericMatch) {
    const month = Number(numericMatch[1]) - 1;
    const day = Number(numericMatch[2]);

    let year = numericMatch[3]
      ? Number(numericMatch[3])
      : today.year;

    if (year < 100) {
      year += 2000;
    }

    if (!isValidDate(year, month, day)) {
      return null;
    }

    const date = createDate(year, month, day);

    return {
      date,
      label: formatDate(date),
    };
  }

  return null;
}

/**
 * -------------------------------------------------------
 * PARSE TIME
 * -------------------------------------------------------
 *
 * Supports:
 * 9 AM
 * 9:30 AM
 * 14:30
 * 2 PM
 * morning
 * afternoon
 * evening
 * after work
 *
 * Arabic:
 * صباح
 * الصباح
 * الظهر
 * العصر
 * المساء
 * بعد الدوام
 */
function parseTime(text) {
  const value = cleanText(text);

  if (!value) {
    return null;
  }

  /**
   * MORNING
   */
  if (
    /\bmorning\b/.test(value) ||
    /\bالصباح\b/.test(value) ||
    /\bصباح\b/.test(value)
  ) {
    return {
      value: "9:00 AM",
      minutes: 9 * 60,
    };
  }

  /**
   * AFTERNOON
   */
  if (
    /\bafternoon\b/.test(value) ||
    /\bالظهر\b/.test(value) ||
    /\bظهر\b/.test(value)
  ) {
    return {
      value: "2:00 PM",
      minutes: 14 * 60,
    };
  }

  /**
   * EVENING
   */
  if (
    /\bevening\b/.test(value) ||
    /\bafter work\b/.test(value) ||
    /\bالمساء\b/.test(value) ||
    /\bمساء\b/.test(value) ||
    /\bبعد الدوام\b/.test(value)
  ) {
    return {
      value: "5:00 PM",
      minutes: 17 * 60,
    };
  }

  /**
   * TIME FORMAT
   *
   * Examples:
   * 9
   * 9:30
   * 9 AM
   * 9:30 PM
   * 14:30
   */
  const match = value.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/
  );

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3];

  if (minute > 59) {
    return null;
  }

  /**
   * 12-hour format with AM/PM.
   */
  if (period === "pm") {
    if (hour < 1 || hour > 12) {
      return null;
    }

    if (hour !== 12) {
      hour += 12;
    }
  } else if (period === "am") {
    if (hour < 1 || hour > 12) {
      return null;
    }

    if (hour === 12) {
      hour = 0;
    }
  } else {
    /**
     * No AM/PM:
     * Assume 24-hour format for 8-23.
     *
     * For 1-7, assume afternoon/evening because
     * patients commonly type "5" when they mean 5 PM.
     */
    if (hour > 23) {
      return null;
    }

    if (hour >= 1 && hour <= 7) {
      hour += 12;
    }
  }

  const minutes = hour * 60 + minute;

  const formattedHour = ((hour + 11) % 12) + 1;
  const formattedPeriod = hour >= 12 ? "PM" : "AM";

  const formatted = `${formattedHour}:${String(minute).padStart(
    2,
    "0"
  )} ${formattedPeriod}`;

  return {
    value: formatted,
    minutes,
  };
}

/**
 * -------------------------------------------------------
 * GET DAY KEY
 * -------------------------------------------------------
 */
function getDayKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return DAY_NAMES[date.getDay()];
}

/**
 * -------------------------------------------------------
 * GET CLINIC HOURS
 * -------------------------------------------------------
 */
function getClinicHours(date) {
  const day = getDayKey(date);

  if (!day) {
    return null;
  }

  return clinic.timings?.[day] || null;
}

/**
 * -------------------------------------------------------
 * PARSE CLINIC HOURS
 * -------------------------------------------------------
 *
 * Expected examples:
 * "9:00 AM - 6:00 PM"
 * "10 AM - 10 PM"
 * "Closed"
 */
function parseHours(hours) {
  if (!hours || typeof hours !== "string") {
    return null;
  }

  const value = hours.trim();

  if (!value || /^closed$/i.test(value)) {
    return null;
  }

  const match = value.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i
  );

  if (!match) {
    return null;
  }

  function convert(hour, minute = 0, period) {
    hour = Number(hour);
    minute = Number(minute);

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      return null;
    }

    const normalizedPeriod = period.toUpperCase();

    if (normalizedPeriod === "PM" && hour !== 12) {
      hour += 12;
    }

    if (normalizedPeriod === "AM" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minute;
  }

  const open = convert(match[1], match[2], match[3]);
  const close = convert(match[4], match[5], match[6]);

  if (open === null || close === null) {
    return null;
  }

  return {
    open,
    close,
  };
}

/**
 * -------------------------------------------------------
 * CHECK CLINIC HOURS
 * -------------------------------------------------------
 */
function isTimeWithinClinicHours(date, timeMinutes) {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime()) ||
    !Number.isFinite(timeMinutes)
  ) {
    return {
      valid: false,
      reason: "invalid",
      hours: null,
    };
  }

  const hours = getClinicHours(date);
  const parsed = parseHours(hours);

  /**
   * Clinic closed on this day.
   */
  if (!parsed) {
    return {
      valid: false,
      reason: "closed",
      hours,
    };
  }

  /**
   * Requested time is outside clinic hours.
   */
  if (
    timeMinutes < parsed.open ||
    timeMinutes > parsed.close
  ) {
    return {
      valid: false,
      reason: "outside-hours",
      hours,
    };
  }

  return {
    valid: true,
    reason: null,
    hours,
  };
}

/**
 * -------------------------------------------------------
 * EXPORTS
 * -------------------------------------------------------
 */
module.exports = {
  cleanText,
  parseDate,
  parseTime,
  getNextDay,
  getClinicHours,
  isTimeWithinClinicHours,
  formatDate,
  formatDateEnglish,
};