import { LoaderFunction, json, redirect, Response } from "@remix-run/node";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { useLoaderData } from "@remix-run/react";
import { authorize } from "~/google.server";
import { google, calendar_v3 } from "~/googleapis.server";
import { endOfToday, minutesToMilliseconds, startOfToday } from "date-fns";
import { compareDateStrings, isDateInRange, useNow } from "~/utils";
import { useEffect } from "react";
import { Clock } from "~/components/clock";

export const loader: LoaderFunction = async ({ request }) => {
  const auth_status = await authorize(request);
  if (auth_status.type === "action") return auth_status.result;
  // else we have a user!
  const api = auth_status.result;
  const calendar = google.calendar({ version: "v3", auth: api });
  const primaryCalendar = (await calendar.calendarList.list()).data.items?.find(
    (c) => c.primary
  );
  if (!primaryCalendar) throw redirect("/error", 302);
  const events = (
    await calendar.events.list({
      calendarId: primaryCalendar.id,
      timeMin: startOfToday().toISOString(),
      timeMax: endOfToday().toISOString(),
    })
  ).data.items;
  return json({ events });
};

interface IData {
  events: calendar_v3.Schema$Event[];
}

export default function Index() {
  const theme = useTheme();
  const hourFormater = (datestr: string | Date | null | undefined) =>
    datestr &&
    Intl.DateTimeFormat("pl", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(datestr));

  const nowFormater = Intl.DateTimeFormat("pl", {
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format;
  const { events }: IData = useLoaderData();
  const now = useNow(minutesToMilliseconds(1));
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1,
        alignItems: "stretch",
        gridTemplateColumns: "repeat(auto-fit, minmax(8cm, 12cm))",
        gridTemplateRows: "repeat(auto-fit, minmax(4cm, 12cm))",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Clock />
      {events
        .sort((a, b) =>
          compareDateStrings(a.start?.dateTime, b.start?.dateTime)
        )
        .map((e) => (
          <Card
            key={e.id}
            sx={{
              ...(isDateInRange(now, [e.start?.dateTime, e.end?.dateTime]) && {
                backgroundColor: theme.palette.info.light,
                color: theme.palette.info.contrastText,
              }),
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ marginBottom: 1 }}>
                {e.summary}
              </Typography>
              <Divider sx={{ marginBottom: 1 }} />
              <Box sx={{ display: "grid", gridTemplateColumns: "3cm 1fr" }}>
                <Typography variant="body1">Początek:</Typography>
                <Typography variant="body1">
                  {hourFormater(e.start?.dateTime)}
                </Typography>
                <Typography variant="body1">Koniec:</Typography>
                <Typography variant="body1">
                  {hourFormater(e.end?.dateTime)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
    </Box>
  );
}
