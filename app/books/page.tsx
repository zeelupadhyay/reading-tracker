import { Navbar } from "@/components/Navbar";
import { BooksView } from "@/components/BooksView";

export default function BooksPage() {
  return (
    <>
      <Navbar />
      <BooksView
        title="My Books"
        subtitle="Every book in your library, across every status."
      />
    </>
  );
}
