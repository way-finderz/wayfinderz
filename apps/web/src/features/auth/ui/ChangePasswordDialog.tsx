"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { FormError } from "@/shared/ui/form-error";
import { Input } from "@/shared/ui/input";

import { authClient } from "../api/auth-client";

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [success, onClose, onSuccess]);

  const validateForm = useCallback((): string | null => {
    if (!currentPassword.trim()) {
      return "Current password is required";
    }
    if (!newPassword.trim()) {
      return "New password is required";
    }
    if (newPassword.length < 8) {
      return "New password must be at least 8 characters";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);

        return;
      }

      setIsSubmitting(true);
      try {
        const { error: apiError } = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });

        if (apiError) {
          setError(apiError.message || "Failed to change password");
        } else {
          setSuccess(true);
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentPassword, newPassword, validateForm]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
        onKeyDown={handleKeyDown}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#6F2AEC] px-6 py-4 text-white">
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <FormError message={error} />}

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center"
              >
                <p className="font-semibold">Password changed successfully!</p>
              </motion.div>
            ) : (
              <>
                <Input
                  ref={inputRef}
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isSubmitting}
                />

                <div>
                  <Input
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isSubmitting}
                    error={
                      newPassword && newPassword.length < 8
                        ? "At least 8 characters"
                        : undefined
                    }
                  />
                  {!newPassword && (
                    <p className="mt-1 text-xs text-gray-500">
                      At least 8 characters
                    </p>
                  )}
                </div>

                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                  error={
                    confirmPassword && confirmPassword !== newPassword
                      ? "Passwords do not match"
                      : undefined
                  }
                />
              </>
            )}

            {/* Actions */}
            <div className={cn("flex gap-3 pt-2", success && "hidden")}>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSubmitting}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="flex-1 bg-[#6F2AEC] hover:bg-[#5B22C4]"
              >
                Save
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
