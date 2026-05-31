"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markTheoryStarted } from "@/app/lms/actions";

interface StartTheoryButtonProps {
  courseId: string;
  className?: string;
}

export function StartTheoryButton({ courseId, className }: StartTheoryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markTheoryStarted(courseId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className ?? "btn-primary"}
    >
      {isPending ? "Ukládám…" : "Začít studium teorie"}
    </button>
  );
}
