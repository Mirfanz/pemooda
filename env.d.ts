declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "staging";
    DATABASE_URL: string;
    SENDGRID_API_KEY: string;
    SENDGRID_EMAIL_SENDER: string;
    JWT_SECRET: string;
    NEXT_PUBLIC_APP_URL: string;
  }
}
