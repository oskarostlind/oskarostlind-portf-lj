export const site = {
  name: "Oskar Östlind",
  domain: "oskarostlind.se",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oskarostlind.se",
  email: "oskarandreassen01@gmail.com",
  github: "https://github.com/oskarostlind",
  linkedin: "https://www.linkedin.com/in/oskar-östlind-8a5b59234/",
  timezone: "Europe/Stockholm",
} as const;
