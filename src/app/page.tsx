import TodoWrapper from "./components/TodoWrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Next.js Todoアプリ
        </h1>
        <TodoWrapper />
      </div>
    </div>
  );
}
