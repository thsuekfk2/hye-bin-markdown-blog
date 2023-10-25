export const parseDateStringToDate = (dateString: string) => {
  const [year, month, day] = dateString.match(/\d{2}/g)!.map(Number);
  return new Date(2000 + year, month - 1, day);
};
