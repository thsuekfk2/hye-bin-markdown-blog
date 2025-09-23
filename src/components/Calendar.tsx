"use client";

import DatePicker from "react-datepicker";
import { Ref, forwardRef, useEffect, useMemo, useState } from "react";
import { ko } from "date-fns/esm/locale";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "./Icons/CalendarIcon";
import { useParams } from "next/navigation";
import { parseDateStringToDate } from "@/utils/date";
import { useCalendarData } from "@/hooks/useCalendarData";
import { format } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons/ArrowIcons";
import Link from "next/link";

interface CalendarProps {
  filterType?: "post" | "log" | "all";
}

const CalendarButton = forwardRef<
  HTMLButtonElement,
  { onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void }
>(({ onClick, ...rest }, ref) => (
  <button onClick={onClick} ref={ref} {...rest}>
    <CalendarIcon />
  </button>
));

CalendarButton.displayName = "CalendarButton";

export const Calendar = ({ filterType = "all" }: CalendarProps) => {
  const { date } = useParams() as { date?: string };
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const minDate = useMemo(() => new Date("2023-10-09"), []);
  const today = useMemo(() => new Date(), []);

  const { getArticlesForDate, isArticleAvailable } =
    useCalendarData(filterType);

  useEffect(() => {
    if (date) {
      setSelectedDate(parseDateStringToDate(date));
    } else {
      setSelectedDate(null);
    }
  }, [date]);

  const renderCustomHeader = ({ date, decreaseMonth, increaseMonth }: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
  }) => (
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

  const renderDayContents = (day: number, date: Date) => {
    const articles = getArticlesForDate(date);
    
    if (articles.length === 0) {
      return (
        <div className="flex h-full w-full">
          <div className="h-full w-full">{day}</div>
        </div>
      );
    }

    const primaryArticle = articles[0];
    const hasMultiple = articles.length > 1;

    return (
      <div className="relative flex h-full w-full">
        <Link
          className="flex h-full w-full items-center justify-center"
          href={`/${primaryArticle.type}/${primaryArticle.slug}`}
          title={
            hasMultiple
              ? `${articles.length}개 항목: ${articles.map((a) => a.title).join(", ")}`
              : primaryArticle.title
          }
        >
          {day}
        </Link>
        {hasMultiple && (
          <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500"></div>
        )}
      </div>
    );
  };

  return (
    <DatePicker
      locale={ko}
      className="flex rounded-full"
      dateFormat="yyyy.MM.dd"
      shouldCloseOnSelect
      minDate={minDate}
      maxDate={today}
      filterDate={isArticleAvailable}
      selected={selectedDate}
      onChange={setSelectedDate}
      customInput={<CalendarButton />}
      renderCustomHeader={renderCustomHeader}
      renderDayContents={renderDayContents}
    />
  );
};
