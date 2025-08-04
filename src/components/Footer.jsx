export default function Footer() {
  return (
    <footer className="w-full h-20 z-50 shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur py-6 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8">
        <div className="mt-2 text-center text-gray-500 dark:text-gray-300 text-xs">
          <p>&copy; {new Date().getFullYear()} DentalCare. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
