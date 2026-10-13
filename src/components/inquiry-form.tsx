"use client";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { mockService } from "@/lib/mock-service";
import { Select } from "./ui/select";
export function InquiryForm({
  propertyId,
  propertyName,
}: {
  propertyId?: string;
  propertyName?: string;
}) {
  const t = useTranslations();
  const id = useId();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const schema = z.object({
    name: z.string().trim().min(2, t("invalidName")).max(100, t("nameTooLong")),
    phone: z
      .string()
      .trim()
      .refine(
        (v) =>
          /^[+\d\s().-]+$/.test(v) &&
          v.replace(/\D/g, "").length >= 7 &&
          v.replace(/\D/g, "").length <= 15,
        t("invalidPhone"),
      ),
    email: z.email(t("invalidEmail")),
    method: z.enum(["email", "phone"]),
    message: z
      .string()
      .trim()
      .min(10, t("invalidMessage"))
      .max(3000, t("messageTooLong")),
  });
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { method: "email" },
  });
  const submit = async (values: Values) => {
    setError("");
    try {
      mockService.saveInquiry({ ...values, propertyId, propertyName });
      setSuccess(true);
      reset();
    } catch {
      setError(t("saveError"));
    }
  };
  if (success)
    return (
      <div className="form-success" role="status">
        <span className="success-icon">
          <Check size={28} />
        </span>
        <h3>{t("success")}</h3>
        <p>{t("successBody")}</p>
        <p className="demo-note">{t("demoForm")}</p>
        <button className="text-link" onClick={() => setSuccess(false)}>
          {t("anotherInquiry")}
          <ArrowUpRight size={16} />
        </button>
      </div>
    );
  return (
    <form className="inquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        {(["name", "phone", "email"] as const).map((field) => (
          <label className="field" key={field}>
            <span>
              {t(field)} <span aria-hidden="true">*</span>
            </span>
            <input
              maxLength={field === "name" ? 100 : field === "email" ? 254 : 30}
              aria-label={t(field)}
              aria-required="true"
              autoComplete={
                field === "name" ? "name" : field === "phone" ? "tel" : "email"
              }
              type={
                field === "email" ? "email" : field === "phone" ? "tel" : "text"
              }
              {...register(field)}
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? `${id}-${field}` : undefined}
            />
            {errors[field] && (
              <span id={`${id}-${field}`} className="field-error" role="alert">
                {errors[field]?.message}
              </span>
            )}
          </label>
        ))}
        <label className="field">
          <span>{t("method")}</span>
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <Select
                label={t("method")}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                triggerRef={field.ref}
                options={[
                  { value: "email", label: t("email") },
                  { value: "phone", label: t("phone") },
                ]}
              />
            )}
          />
        </label>
      </div>
      {propertyId && (
        <label className="field reference-field">
          <span>{t("reference")}</span>
          <input value={`${propertyId} · ${propertyName}`} readOnly />
        </label>
      )}
      <label className="field">
        <span>
          {t("message")} <span aria-hidden="true">*</span>
        </span>
        <textarea
          maxLength={3000}
          aria-label={t("message")}
          aria-required="true"
          rows={4}
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${id}-message` : undefined}
        />
        {errors.message && (
          <span id={`${id}-message`} className="field-error" role="alert">
            {errors.message.message}
          </span>
        )}
      </label>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button type="submit" className="button dark" disabled={isSubmitting}>
        {isSubmitting ? t("sending") : t("send")}
        {isSubmitting ? (
          <LoaderCircle size={18} className="spin" />
        ) : (
          <ArrowUpRight size={19} />
        )}
      </button>
      <p className="demo-note form-demo-note">{t("demoForm")}</p>
    </form>
  );
}
