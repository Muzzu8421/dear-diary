import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Dear Diary",
  description: "A personal journaling app to capture your thoughts and experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
