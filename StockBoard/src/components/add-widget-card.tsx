"use client";

export function AddWidgetCard({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-card hover:bg-accent/30 transition"
    >
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl">
        +
      </div>

      <h3 className="mt-4 font-semibold">Add a new Widget</h3>
      <p className="text-sm text-muted-foreground text-center">
        Connect to a finance API and create a custom widget
      </p>
    </div>
  );
}
