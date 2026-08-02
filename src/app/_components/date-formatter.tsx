import { parseISO, format } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  dateString: string;
};

const DateFormatter = ({ dateString }: Props) => {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, "yyyy年M月d日", { locale: ja })}</time>;
};

export default DateFormatter;
