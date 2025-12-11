"use client";

import FormSubmitButton from "@/components/FormSubmitButton";
import { Job } from "@prisma/client";
import { useActionState } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { approveSubmission, deleteJob } from "./actions";

type FormState = { error?: string } | undefined;

interface AdminSidebarProps {
  job: Job;
}

export default function AdminSidebar({ job }: AdminSidebarProps) {
  return (
    <aside className="flex w-[200px] flex-none flex-row items-center gap-2 md:flex-col md:items-stretch">
      <Link
        href={`/admin/jobs/${job.slug}/edit`}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit
      </Link>
      {job.approved ? (
        <span className="text-center font-semibold text-green-500">
          Approved
        </span>
      ) : (
        <ApproveSubmissionButton jobId={job.id} />
      )}
      <DeleteJobButton jobId={job.id} />
    </aside>
  );
}

interface AdminButtonProps {
  jobId: number;
}

function ApproveSubmissionButton({ jobId }: AdminButtonProps) {
  const [formState, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      return approveSubmission(prevState, formData, { jobId });
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-1">
      <FormSubmitButton className="w-full bg-green-500 hover:bg-green-600">
        Approve
      </FormSubmitButton>
      {formState?.error && (
        <p className="text-sm text-red-500">{formState.error}</p>
      )}
    </form>
  );
}

function DeleteJobButton({ jobId }: AdminButtonProps) {
  const [formState, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      return deleteJob(prevState, formData, { jobId });
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-1">
      <FormSubmitButton className="w-full bg-red-500 hover:bg-red-600">
        Delete
      </FormSubmitButton>
      {formState?.error && (
        <p className="text-sm text-red-500">{formState.error}</p>
      )}
    </form>
  );
}
