import { createTheme, ThemeProvider } from "@mui/material";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const theme = createTheme();
  return (
    <html lang="en">
      <head>
        <Meta />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Outlet />
          <ScrollRestoration />
        </ThemeProvider>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
