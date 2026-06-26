import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-8 sm:px-16 bg-white dark:bg-zinc-950 rounded-2xl shadow-xs border border-zinc-200/50 dark:border-zinc-800/50 text-center sm:text-right">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <span className="text-3xl font-black">پدل چاکسی</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6 w-full my-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-12 tracking-tight text-zinc-900 dark:text-zinc-50 max-w-xl text-center">
            مدیریت هوشمند جلسات و تمرین‌های پدل
          </h1>
          <p className="max-w-lg text-base sm:text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-center">
            با پدل چاکسی جلسات بازی، تمرینات، هزینه‌های زمین و وسایل جانبی خود را ردیابی کنید و آمارهای پیشرفت خود را به راحتی مشاهده کنید.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md my-4">
          <a
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold transition-all shadow-md shadow-primary/10 hover:opacity-90 active:scale-[0.98]"
            href="/login"
          >
            ورود به حساب کاربری
          </a>
          <a
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-solid border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-200 font-bold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-[0.98]"
            href="/signup"
          >
            ایجاد حساب جدید
          </a>
        </div>
        
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-12 text-center w-full">
          تمامی حقوق محفوظ است © ۱۴۰۵
        </div>
      </main>
    </div>
  );
}
