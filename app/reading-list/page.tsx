import { Navbar } from "@/components/Navbar";
import { BooksView } from "@/components/BooksView";

export default function ReadingListPage() {
  return (
    <>
      <Navbar />
      <BooksView
        title="Currently Reading"
        subtitle="Books you're actively working through right now."
        fixedStatus="in_progress"
      />
    </>
  );
}
