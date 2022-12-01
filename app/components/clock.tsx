import { Box, LinearProgress, Typography } from "@mui/material";
import {
  addHours,
  differenceInSeconds,
  secondsInHour,
  startOfToday,
  subHours,
} from "date-fns";
import { isDateInRange, useNow, useDynamicValue } from "~/utils";

export function Clock() {
  const nowFormater = Intl.DateTimeFormat("pl", {
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format;
  const now = useDynamicValue(subHours(useNow(1000), 8).valueOf());
  if (now === undefined) return null;
  const workStartHour = addHours(startOfToday(), 9);
  const workEndHour = addHours(startOfToday(), 17);
  const isAtWork = isDateInRange(now, [workStartHour, workEndHour]);
  const shiftLength = differenceInSeconds(workEndHour, workStartHour);
  const secondsIntoShift = differenceInSeconds(now, workStartHour);
  const shiftProgress = secondsIntoShift / shiftLength;
  const moneyEarned = secondsIntoShift * (69 / secondsInHour);
  const formater = Intl.NumberFormat("pl", {
    currency: "PLN",
    style: "currency",
    maximumFractionDigits: 2,
  }).format;
  return (
    <Box sx={{ margin: 1 }}>
      <Typography sx={{ marginBottom: 1 }} variant="h3">
        {nowFormater(now)}
      </Typography>
      {isAtWork && (
        <>
          <LinearProgress variant="determinate" value={shiftProgress * 100} />
          <Typography variant="body1">
            Dzisiejsze zarobki: {formater(moneyEarned)}
          </Typography>
        </>
      )}
    </Box>
  );
}
