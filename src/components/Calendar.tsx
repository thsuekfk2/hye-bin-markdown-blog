"use client";

import Link from "next/link";
import DatePicker from "react-datepicker";
import { Ref, forwardRef, useMemo, useState } from "react";
import { ko } from "date-fns/esm/locale";
import { format } from "date-fns";
import { allLogs } from "contentlayer/generated";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "./Icons/CalendarIcon";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons/ArrowIcons";

export const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const minDate = useMemo(() => new Date("2023-10-09"), []);
  const today = useMemo(() => new Date(), []);

  const isLogAvailable = (date: Date) => {
    const formatDate = format(date, "yyMMdd");
    const isFindLog = allLogs.find(
      (log) => formatDate === format(new Date(log.date), "yyMMdd")
    );
    return !!isFindLog;
  };

  const CustomInput = forwardRef(
    (
      {
        onClick,
        ...rest
      }: {
        onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
      },
      ref: Ref<HTMLButtonElement>
    ) => (
      <button className="" onClick={onClick} ref={ref} {...rest}>
        <CalendarIcon />
      </button>
    )
  );

  CustomInput.displayName = "CustomInput";

  const renderCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
  }: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
  }) => {
    return (
      <div className="flex items-center justify-between">
        <button onClick={decreaseMonth}>
          <ArrowLeftIcon />
        </button>
        <div className="mb-3 text-sm font-bold">
          {format(date, "yyyy년 MM월")}
        </div>
        <button onClick={increaseMonth}>
          <ArrowRightIcon />
        </button>
      </div>
    );
  };
  const renderDayContents = (day: number, date: Date) => {
    const formatDate = format(date, "yyMMdd");
    const isFindLog = isLogAvailable(date);

    if (!isFindLog) {
      return (
        <div className="flex w-full h-full">
          <div className="w-full h-full">{day}</div>
        </div>
      );
    }
    return (
      <div className="flex w-full h-full">
        <Link className="w-full h-full" href={`/log/${formatDate}`}>
          {day}
        </Link>
      </div>
    );
  };

  return (
    <DatePicker
      locale={ko}
      className="flex w-10 h-10 rounded-full"
      dateFormat="yyyy.MM.dd"
      shouldCloseOnSelect
      minDate={minDate}
      maxDate={today}
      filterDate={(date) => isLogAvailable(date)}
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      customInput={<CustomInput />}
      renderCustomHeader={renderCustomHeader}
      renderDayContents={renderDayContents}
    />
  );
};
