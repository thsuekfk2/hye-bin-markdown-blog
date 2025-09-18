"use client";

import Link from "next/link";
import DatePicker from "react-datepicker";
import { Ref, forwardRef, useEffect, useMemo, useState, useCallback } from "react";
import { ko } from "date-fns/esm/locale";
import { format } from "date-fns";
import { allLogs } from "contentlayer/generated";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "./Icons/CalendarIcon";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons/ArrowIcons";
import { useParams } from "next/navigation";
import { parseDateStringToDate } from "@/utils/date";

export const Calendar = () => {
  const { date } = useParams() as { date?: string }; //231023
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const minDate = useMemo(() => new Date("2023-10-09"), []);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (date) {
      setSelectedDate(parseDateStringToDate(date));
    } else {
      setSelectedDate(null);
    }
  }, [date]);

  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    allLogs.forEach((log) => {
      const formatDate = format(new Date(log.date), "yyMMdd");
      dateSet.add(formatDate);
    });
    return dateSet;
  }, []);

  const isLogAvailable = useCallback((date: Date) => {
    const formatDate = format(date, "yyMMdd");
    return availableDates.has(formatDate);
  }, [availableDates]);

  const CustomInput = forwardRef(
    (
      {
        onClick,
        ...rest
      }: {
        onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
      },
      ref: Ref<HTMLButtonElement>,
    ) => (
      <button className="" onClick={onClick} ref={ref} {...rest}>
        <CalendarIcon />
      </button>
    ),
  );

  CustomInput.displayName = "CustomInput";

  const renderCustomHeader = useCallback(({
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
  }, []);
  const renderDayContents = useCallback((day: number, date: Date) => {
    const formatDate = format(date, "yyMMdd");
    const isFindLog = isLogAvailable(date);

    if (!isFindLog) {
      return (
        <div className="flex h-full w-full">
          <div className="h-full w-full">{day}</div>
        </div>
      );
    }
    return (
      <div className="flex h-full w-full">
        <Link className="h-full w-full" href={`/log/${formatDate}`}>
          {day}
        </Link>
      </div>
    );
  }, [isLogAvailable]);

  return (
    <DatePicker
      locale={ko}
      className="flex rounded-full"
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
