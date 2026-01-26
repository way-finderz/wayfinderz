import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Button } from "../button";
import { FormError } from "../form-error";
import { Input } from "../input";

describe("Accessibility", () => {
  describe("Button", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations when disabled", async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations when loading", async () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Input", () => {
    it("should not have accessibility violations with label", async () => {
      const { container } = render(
        <Input label="Email" name="email" type="email" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with error state", async () => {
      const { container } = render(
        <Input label="Email" name="email" error="Invalid email" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations when disabled", async () => {
      const { container } = render(
        <Input label="Email" name="email" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("FormError", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <FormError message="Something went wrong" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have role=alert for screen readers", () => {
      const { getByRole } = render(
        <FormError message="Error message" />
      );
      expect(getByRole("alert")).toBeInTheDocument();
    });

    it("should have aria-live=polite for announcements", () => {
      const { getByRole } = render(
        <FormError message="Error message" />
      );
      expect(getByRole("alert")).toHaveAttribute("aria-live", "polite");
    });
  });
});
