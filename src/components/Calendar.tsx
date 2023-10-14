"use client";

import Link from "next/link";
import DatePicker from "react-datepicker";
import { forwardRef, useMemo, useState } from "react";
import { ko } from "date-fns/esm/locale";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

export const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const minDate = useMemo(() => new Date("2023-10-09"), []);
  const today = useMemo(() => new Date(), []);

  const ExampleCustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
    <button className="" onClick={onClick} ref={ref}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
        />
      </svg>
    </button>
  ));

  ExampleCustomInput.displayName = "ExampleCustomInput";

  return (
    <DatePicker
      locale={ko}
      className="flex rounded-full w-10 h-10"
      dateFormat="yyyy.MM.dd"
      shouldCloseOnSelect
      minDate={minDate}
      maxDate={today}
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      customInput={<ExampleCustomInput />}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => {
        return (
          <div className="flex justify-between items-center">
            <button onClick={decreaseMonth}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#ccc"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <div className="text-sm font-bold mb-3">
              {format(date, "yyyy년 MM월")}
            </div>
            <button onClick={increaseMonth}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#ccc"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        );
      }}
      renderDayContents={(day, date: Date) => {
        let formatDate = format(date, "yyMMdd");
        return (
          <div className="w-full h-full flex">
            <Link className="w-full h-full" href={`/log/${formatDate}`}>
              {day}
            </Link>
          </div>
        );
      }}
    />
  );
};
