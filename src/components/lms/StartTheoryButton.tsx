"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markTheoryStarted } from "@/app/lms/actions";

interface StartTheoryButtonProps {
  courseId: string;
  theoryPath: string;
  className?: string;
}

export function StartTheoryButton({
  courseId,
  theoryPath,
  className,
}: StartTheoryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await markTheoryStarted(courseId);
      router.push(theoryPath);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className ?? "btn-primary"}
    >
      {isPending ? "Otevírám studium…" : "Začít studium teorie"}
    </button>
  );
}
